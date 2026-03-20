/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
/**
 * Cookie utilities
 *
 * @category Utility
 */
declare class Cookies {
    /**
     * Set a cookie
     *
     * @param {string} name
     * @param {string} value
     * @param {int} maxAge Maximum age in seconds. Leave empty to clear on browser close
     * @param {string} path
     * @returns {void}
     */
    set(name: string, value: string, maxAge?: number, path?: string): void;
    /**
     * Get a cookie
     *
     * @param {string} name
     * @returns {string}
     */
    get(name: string): string | undefined;
    /**
     * Unset a cookie
     *
     * @param {string} name
     * @returns {void}
     */
    unset(name: string, path?: string): void;
}
export declare const cookies: Cookies;
export {};
