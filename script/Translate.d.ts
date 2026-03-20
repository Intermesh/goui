type lang = {
    [key: string]: {
        [key: string]: {
            [key: string]: string;
        };
    };
};
export declare class Translate {
    private lang;
    missing: any;
    private defaultPkg;
    private defaultModule;
    setDefaultModule(pkg: string, module: string): void;
    load(lang: lang, pkg?: string, module?: string): void;
    /**
     * Translate a string
     *
     * @param key Translate key. Usually the english text.
     * @param pkg The module package
     * @param module The module name
     */
    static t(key: string, pkg?: string, module?: string): any;
}
export declare const translate: Translate;
export declare const t: typeof Translate.t;
export {};
