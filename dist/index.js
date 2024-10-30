var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

// src/index.ts
import clc from "cli-color";
import _ from "lodash";
import fs4 from "fs";
import path4 from "path";
import { createLogger } from "vite";

// src/rewrites.ts
import fs from "fs";
import path from "path";
function getFilesRecursively(dirname, locales) {
  let files = [];
  for (const entry of fs.readdirSync(dirname, { withFileTypes: true })) {
    const entryPath = `${dirname}/${entry.name}`;
    if (entry.isDirectory()) {
      if (locales.includes(entry.name)) {
        continue;
      }
      files = [...files, ...getFilesRecursively(entryPath, locales)];
    } else {
      files.push(entryPath);
    }
  }
  return files;
}
function generateVersionRewrites(config, dirname, versions, locales = []) {
  const versionRewrites = {};
  if (config === false) return versionRewrites;
  const versionsDir = path.resolve(dirname, "..", "versions");
  for (const version of versions) {
    const files = getFilesRecursively(
      path.posix.join(versionsDir, version),
      locales
    );
    for (const rewriteSource of files.map(
      (filePath) => filePath.replace(versionsDir, "versions")
    )) {
      versionRewrites[rewriteSource] = config.rewriteProcessor(
        rewriteSource,
        version
      );
    }
    for (const locale of locales) {
      const versionLocalePath = path.resolve(
        versionsDir,
        version,
        config.localePrefix,
        locale
      );
      if (!fs.existsSync(versionLocalePath)) continue;
      const localeFiles = getFilesRecursively(
        path.resolve(versionsDir, version, config.localePrefix, locale),
        locales
      );
      const localeRewriteSources = localeFiles.map(
        (filePath) => filePath.replace(versionsDir, "versions")
      );
      for (const rewriteSource of localeRewriteSources) {
        versionRewrites[`${rewriteSource}`] = config.localeRewriteProcessor(
          rewriteSource,
          version,
          locale
        ).replace(`/${config.localePrefix}`, "");
      }
    }
  }
  return versionRewrites;
}

// src/sidebars.ts
import JSON5 from "json5";
import fs2 from "fs";
import path2 from "path";
function replaceLinksRecursive(sidebar, config, version) {
  return sidebar.map((item) => {
    if (item.process === false) {
      return item;
    }
    if (item.link) {
      item.link = config.sidebarUrlProcessor(item.link, version);
    }
    if (item.items) {
      item.items = replaceLinksRecursive(item.items, config, version);
    }
    return item;
  });
}
function getSidebar(config, dirname, version, locale) {
  const sidebarPath = path2.resolve(
    dirname,
    "..",
    config.sidebarPathResolver(
      version + (locale === "root" ? "" : `-${locale}`)
    )
  );
  if (fs2.existsSync(sidebarPath)) {
    const sidebar = JSON5.parse(fs2.readFileSync(sidebarPath, "utf-8"));
    if (Array.isArray(sidebar)) {
      return replaceLinksRecursive(
        sidebar,
        config,
        (locale === "root" ? "" : `${locale}/`) + version
      );
    } else {
      const multiSidebar = sidebar;
      Object.keys(multiSidebar).forEach((key) => {
        multiSidebar[key] = replaceLinksRecursive(
          multiSidebar[key],
          config,
          (locale === "root" ? "" : `${locale}/`) + version
        );
      });
      return multiSidebar;
    }
  }
  return [];
}
function generateVersionSidebars(config, dirname, versions, locales) {
  const versionSidebars = {};
  if (config === false) return versionSidebars;
  for (const version of versions) {
    for (const locale of locales) {
      const sidebar = getSidebar(config, dirname, version, locale);
      if (Array.isArray(sidebar)) {
        versionSidebars[(locale === "root" ? "" : `/${locale}`) + `/${version}`] = sidebar;
      } else {
        Object.keys(sidebar).forEach((key) => {
          versionSidebars[(locale === "root" ? "" : `/${locale}`) + `/${version}${key}`] = sidebar[key];
        });
      }
    }
  }
  return versionSidebars;
}

// src/switcher.ts
function generateVersionSwitcher(config, versions, latestVersion) {
  if (config === false) {
    return null;
  }
  const versionSwitcher = {
    text: config.text,
    items: []
  };
  if (config.includeLatestVersion) {
    versionSwitcher.items.push({
      text: latestVersion === null ? "Latest" : `${latestVersion} (latest)`,
      link: "/"
    });
  }
  for (const version of versions) {
    versionSwitcher.items.push({
      text: version,
      link: `/${version}/`
    });
  }
  return versionSwitcher;
}

// src/defaults.ts
var defaultThemeConfig = {
  versionSwitcher: {
    text: "Switch Version",
    includeLatestVersion: true
  }
};
var defaultConfig = {
  versioning: {
    latestVersion: null,
    sidebars: {
      processSidebarURLs: true,
      sidebarPathResolver: (version) => `.vitepress/sidebars/versioned/${version}.json`,
      sidebarUrlProcessor: (url, version) => `/${version}${url}`
    },
    navbars: {
      processNavbarURLs: true,
      navbarUrlProcessor: (url, version) => `/${version}${url}`,
      navbarPathResolver: (version) => `.vitepress/navbars/versioned/${version}.json`
    },
    rewrites: {
      localePrefix: "",
      localeRewriteProcessor: (inputFilePath, _version, locale) => `${locale}/` + inputFilePath.replace("versions/", "").replace(`${locale}/`, ""),
      rewriteProcessor: (inputFilePath, _version) => inputFilePath.replace("versions/", "")
    }
  }
};

// src/navbars.ts
import path3 from "path";
import fs3 from "fs";
import JSON52 from "json5";
function processNavbarItemRecursive(navbarItem, config, version) {
  if (Array.isArray(navbarItem)) {
    return navbarItem.map(
      (item) => processNavbarItemRecursive(item, config, version)
    );
  }
  if (navbarItem.process === false) return navbarItem;
  if (navbarItem.link) {
    navbarItem.link = config.navbarUrlProcessor(navbarItem.link, version);
  }
  if (navbarItem.items) {
    navbarItem.items = navbarItem.items.map(
      (item) => processNavbarItemRecursive(item, config, version)
    );
  }
  if (!navbarItem.activeMatch) {
    navbarItem.activeMatch = `/${version}/.*$`;
  }
  return navbarItem;
}
function getNavbar(config, dirname, version, locale) {
  const navbarPath = path3.resolve(
    dirname,
    "..",
    config.navbarPathResolver(
      version + (locale === "root" ? "" : `-${locale}`)
    )
  );
  console.log(navbarPath);
  let navbars = [];
  if (fs3.existsSync(navbarPath)) {
    let navbar = JSON52.parse(fs3.readFileSync(navbarPath, "utf-8"));
    navbar = processNavbarItemRecursive(navbar, config, version);
    console.log(navbar, version);
    navbars.push(navbar);
  }
  return navbars;
}
function generateVersionedNavbars(config, dirname, versions, locales) {
  if (config === false) return [];
  let versionedItems = [];
  for (const version of versions) {
    for (const locale of locales) {
      const navbar = getNavbar(config, dirname, version, locale);
      versionedItems.push(...navbar);
    }
  }
  return versionedItems;
}

// src/index.ts
function defineVersionedConfig(config, dirname) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const logger = createLogger();
  const configBackup = __spreadValues({}, config);
  config = _.defaultsDeep(config, defaultConfig);
  const versions = [];
  const versionsFolder = path4.resolve(dirname, "..", "versions");
  if (!fs4.existsSync(versionsFolder)) {
    fs4.mkdirSync(versionsFolder);
    fs4.writeFileSync(path4.resolve(versionsFolder, ".gitkeep"), "");
  }
  const versionFolders = fs4.readdirSync(versionsFolder, { withFileTypes: true }).filter((dirent) => dirent.isDirectory());
  versions.push(...versionFolders.map((dirent) => dirent.name));
  for (let themeConfig of [
    config.themeConfig,
    ...Object.values((_a = config.locales) != null ? _a : {}).map((locale) => locale.themeConfig)
  ]) {
    if (!themeConfig) continue;
    themeConfig = _.defaultsDeep(
      themeConfig,
      defaultThemeConfig
    );
    themeConfig.nav = [
      ...(_b = themeConfig.nav) != null ? _b : [],
      ...generateVersionedNavbars(
        config.versioning.navbars,
        dirname,
        versions,
        Object.keys((_c = config.locales) != null ? _c : {})
      ).flat()
    ];
    const versionSwitcher = generateVersionSwitcher(
      themeConfig.versionSwitcher,
      versions,
      config.versioning.latestVersion
    );
    if (versionSwitcher) {
      (_d = themeConfig.nav) != null ? _d : themeConfig.nav = [];
      themeConfig.nav.push(versionSwitcher);
    }
    if (themeConfig.nav) {
      themeConfig.nav = themeConfig.nav.map((item) => {
        var _a2;
        if (item.component) {
          (_a2 = item.props) != null ? _a2 : item.props = {};
          item.props.versioningPlugin = {
            versions,
            latestVersion: config.versioning.latestVersion
          };
        }
        return item;
      });
    }
    if (Array.isArray(themeConfig.sidebar)) {
      logger.error(
        clc.red(`[vitepress-plugin-versioning]`) + " The sidebar cannot be an array. Please use a DefaultTheme.MultiSidebar object where the root ('/') is your array."
      );
      logger.info(
        clc.yellow(`[vitepress-plugin-versioning]`) + " Versioned sidebar preperation failed, disabling versioning."
      );
      return configBackup;
    } else {
      themeConfig.sidebar = __spreadValues(__spreadValues({}, themeConfig.sidebar), generateVersionSidebars(
        config.versioning.sidebars,
        dirname,
        versions,
        Object.keys((_e = config.locales) != null ? _e : {})
      ));
    }
  }
  config.rewrites = __spreadValues(__spreadValues({}, config.rewrites), generateVersionRewrites(
    config.versioning.rewrites,
    dirname,
    versions,
    Object.keys((_f = config.locales) != null ? _f : {})
  ));
  try {
    if (config.versioning.sidebars) {
      if (config.versioning.sidebars.sidebarContentProcessor) {
        for (const locale of Object.keys((_g = config.locales) != null ? _g : {})) {
          if ((_i = (_h = config.locales) == null ? void 0 : _h[locale]) == null ? void 0 : _i.themeConfig) {
            config.locales[locale].themeConfig.sidebar = config.versioning.sidebars.sidebarContentProcessor(config.locales[locale].themeConfig.sidebar);
          }
        }
      }
    }
  } catch (e) {
    logger.error("Something went wrong when processing the sidebar content.");
    logger.error(e);
    logger.info("Reverting to pre-processed sidebar configs.");
  }
  return config;
}
export {
  defineVersionedConfig as default
};
//# sourceMappingURL=index.js.map