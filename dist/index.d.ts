import { DefaultTheme, UserConfig } from 'vitepress';

declare namespace Versioned {
    type Version = string;
    type SwitcherConfig = {
        /**
         * The text to display on the version switcher button.
         */
        text?: string;
        /**
         * Should the latest (root) version be included in the version switcher?
         */
        includeLatestVersion?: boolean;
    };
    type RewritesConfig = {
        /**
         * The prefix to add to the locale folders.
         */
        localePrefix?: string;
        /**
         * The function that processes rewrite URLs for locale folders.
         * @param inputFilePath The input file path to process.
         * @param version The version to process the URL for.
         * @param locale The locale to process the URL for.
         * @returns The processed URL.
         * @default (inputFilePath: string, _version: Version, locale: string) => `${locale}/` + inputFilePath.replace("versions/", "").replace(`${locale}/`, "")
         */
        localeRewriteProcessor?: (inputFilePath: string, version: Version, locale: string) => string;
        /**
         * The function that processes rewrite URLs.
         * @param inputFilePath The input file path to process.
         * @param version The version to process the URL for.
         * @returns The processed URL.
         * @default (inputFilePath: string, _version: Version) => inputFilePath.replace("versions/", "")
         * @example // Turns `/versions/1.0.0/index.md` into `/1.0.0/index.md`
         */
        rewriteProcessor?: (inputFilePath: string, version: Version) => string;
    };
    type SidebarConfig = {
        /**
         * Whether or not to process sidebar URLs. Uses the `sidebarUrlProcessor` function.
         * @default true
         */
        processSidebarURLs?: boolean;
        /**
         * The function that resolves the path to the sidebar file for a given version.
         * @param version The version to resolve the sidebar path for.
         * @returns The path to the sidebar file for the given version.
         * @default (version: Version) => `.vitepress/sidebars/versioned/${version}.json`
         */
        sidebarPathResolver?: (version: Version) => string;
        /**
         * The function that processes sidebar URLs.
         * @param url The URL to process.
         * @param version The version to process the URL for.
         * @returns The processed URL.
         * @default (url: string, version: Version) => `/${version}${url}`
         */
        sidebarUrlProcessor?: (url: string, version: Version) => string;
        /**
         * Used to process the sidebar content further after versioning has been applied.
         * @param sidebar Sidebar input.
         * @returns Processed sidebar.
         */
        sidebarContentProcessor?: (sidebar: DefaultTheme.SidebarMulti) => DefaultTheme.SidebarMulti;
    };
    type NavbarConfig = {
        /**
         * Whether or not to process navbar URLs. Uses the `navbarUrlProcessor` function.
         * @default true
         */
        processNavbarURLs?: boolean;
        /**
         * The function that processes navbar URLs.
         * @param url The URL to process.
         * @param version The version to process the URL for.
         * @returns The processed URL.
         * @default (url: string, version: Version) => `/${version}${url}`
         */
        navbarUrlProcessor?: (url: string, version: Version) => string;
        /**
         * The function that resolves the path to the navbar file for a given version.
         * @param version The version to resolve the navbar path for.
         * @returns The path to the navbar file for the given version.
         * @default (version: Version) => `.vitepress/navbars/versioned/${version}.json`
         */
        navbarPathResolver?: (version: Version) => string;
    };
    type SidebarItem = DefaultTheme.SidebarItem & {
        /**
         * Set to `false` to disable versioning of this URL.
         */
        process?: boolean;
    };
    type NavbarItem = DefaultTheme.NavItem & {
        /**
         * Set to `false` to disable versioning of this URL.
         */
        process?: boolean;
        link?: string;
    };
    type Sidebar = {
        [path: string]: SidebarItem[] | {
            items: SidebarItem[];
            base: string;
        };
    };
    interface ThemeConfig extends DefaultTheme.Config {
        /**
         * Configuration relating to the version switcher.
         * Set to false to disable the version switcher.
         */
        versionSwitcher?: SwitcherConfig | false;
        sidebar?: Sidebar;
    }
    interface Config extends UserConfig<ThemeConfig> {
        /**
         * Configuration relating to versioning.
         */
        versioning: {
            /**
             * A string representation of the latest version of the project (root).
             */
            latestVersion?: Version | null;
            /**
             * Configuration relating to versioned sidebar files.
             *
             * Set this to false to disable all sidebar versioning functionality.
             */
            sidebars?: SidebarConfig | false;
            navbars?: NavbarConfig | false;
            /**
             * Configuration relating to versioned rewrites.
             *
             * Set this to false to disable all rewrite versioning functionality.
             */
            rewrites?: RewritesConfig | false;
        };
    }
}

/**
 * Processes the default theme config with versioning config.
 * @param config The default theme config with versioning config.
 * @param dirname The value of __dirname when used from any typescript file in the `.vitepress` folder and ONLY the `.vitepress` folder.
 * @returns The default theme config with versioning config.
 */
declare function defineVersionedConfig(config: Versioned.Config, dirname: string): UserConfig<DefaultTheme.Config>;

export { Versioned, defineVersionedConfig as default };
