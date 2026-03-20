/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
/**
 * Browser utility to interact with the browser functions
 *
 * @category Utility
 */
declare class Browser {
    readonly ua: string;
    private cache;
    constructor();
    private check;
    isWebkit(): boolean;
    isChrome(): boolean;
    isSafari(): boolean;
    isFirefox(): boolean;
    isMac(): boolean;
    isLinux(): boolean;
    isWindows(): boolean;
    /**
     * Open file upload dialog to get local files
     *
     * @example
     *
     * ```
     * btn({
     * 	type: "button",
     * 	text: t("Attach files"),
     * 	icon: "attach_file",
     * 	handler: async () => {
     *
     * 		const files = await browser.pickLocalFiles(true);
     * 		this.mask();
     * 		const blobs = await client.uploadMultiple(files);
     * 		this.unmask();
     * 	  console.warn(blobs);
     *
     * 	}
     * })
     * ```
     *
     * @param accept eg. "image/*"
     * @param directory Allow directory upload
     * @param multiple Allow multiple files
     */
    pickLocalFiles(multiple?: boolean, directory?: boolean, accept?: string | undefined): Promise<File[]>;
    /**
     * Copy text to clip board
     *
     * @param {string} text
     * @param notify
     */
    copyTextToClipboard(text: string, notify?: boolean): void;
}
export declare const browser: Browser;
export {};
