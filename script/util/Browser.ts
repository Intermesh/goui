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
class Browser {
	readonly ua: string;

	private cache: Record<string, boolean> = {};


	constructor() {
		this.ua = navigator.userAgent.toLowerCase();
	}

	private check(r: RegExp, cacheKey: string) {
		if (!this.cache[cacheKey]) {
			this.cache[cacheKey] = r.test(this.ua);
		}
		return this.cache[cacheKey];
	}

	isWebkit() {
		return this.check(/webkit/, 'isWebkit');
	}

	isChrome() {
		return this.check(/\bchrome\b/, 'isChrome');
	}

	isSafari() {
		return !this.isChrome() && this.check(/safari/, 'isSafari');
	}

	isFirefox() {

		return this.check(/gecko/, 'isFirefox');
	}

	isMac() {
		return this.check(/macintosh|mac os x/, 'isMac');
	}

	isLinux() {
		return this.check(/linux/, 'isLinux');
	}

	isWindows() {
		return this.check(/windows|win32/, 'isWindows');
	}

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
	public pickLocalFiles(multiple = false, directory = false, accept: string | undefined = undefined): Promise<File[]> {

		return new Promise((resolve, reject) => {
			const input = document.createElement("input");
			input.style.display = "none";
			input.setAttribute("type", "file");
			input.addEventListener("change", (e) => {
				if (input.files) {
					resolve(Array.from(input.files));
				}
				input.value = "";
			});

			// must be added to the DOM for iOS!
			document.body.appendChild(input);

			if (accept) {
				input.setAttribute('accept', accept);
			}

			if (directory) {
				input.setAttribute('webkitdirectory', "true");
				input.setAttribute('directory', "true");
			}
			if (multiple) {
				input.setAttribute('multiple', "true");
			}

			input.click();
			input.remove();
		});

	}

	/**
	 * Copy text to clip board
	 *
	 * @param {string} text
	 */
	public copyTextToClipboard(text: string) {
		const al = <HTMLElement>document.activeElement;
		if (!navigator.clipboard) {
			//fallback on workaround with textarea element
			const textArea = document.createElement("textarea");
			textArea.value = text;
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();

			try {
				const successful = document.execCommand('copy');
				const msg = successful ? 'successful' : 'unsuccessful';
				console.log('Fallback: Copying text command was ' + msg);
			} catch (err) {
				console.error('Fallback: Oops, unable to copy', err);
			}

			document.body.removeChild(textArea);
			if (al && al.focus) {
				al.focus();
			}
			return;
		}

		navigator.clipboard.writeText(text).then(function () {
			console.log('Async: Copying to clipboard was successful!');
			if (al && al.focus) {
				al.focus();
			}
		}, function (err) {
			console.error('Async: Could not copy text: ', err);
		});
	}
}

export const browser = new Browser();