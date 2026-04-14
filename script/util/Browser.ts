/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */


import {Notifier} from "../Notifier.js";
import {t} from "../Translate.js";

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

	private _isMobile:boolean|undefined;

	/**
	 * Determines if the current device is a mobile device based on the user agent string.
	 *
	 * This method checks the `navigator.userAgent`, `navigator.vendor`, or `window.opera`
	 * properties to identify if the device matches patterns typically associated with mobile devices.
	 * The result is cached for subsequent calls to improve performance.
	 *
	 * @return {boolean} Returns `true` if the current device is detected as a mobile device, otherwise `false`.
	 */
	public isMobile() {
		if(this._isMobile !== undefined) {
			return this._isMobile;
		}

		this._isMobile = (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substring(0, 4)));

		return this._isMobile;
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
	 * @param notify
	 */
	public copyTextToClipboard(text: string, notify = true) {
		const al = <HTMLElement>document.activeElement;
		if (!navigator.clipboard) {
			//fallback on workaround with textarea element
			const textArea = document.createElement("textarea");
			textArea.value = text;
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();

			let successful = false;

			try {
				successful = document.execCommand('copy');
				const msg = successful ? 'successful' : 'unsuccessful';
			} catch (err) {
				console.error('Fallback: Oops, unable to copy', err);
			}

			if(notify) {
				if (successful) {
					Notifier.success(t("Text was copied to the clipboard successfully"));
				} else {
					Notifier.error(t("Sorry, the text could not be copied to the clipboard"));
				}
			}

			document.body.removeChild(textArea);
			if (al && al.focus) {
				al.focus();
			}
			return;
		}

		navigator.clipboard.writeText(text).then(function () {
			console.log('Async: Copying to clipboard was successful!');

			if(notify) {
				Notifier.success(t("Text was copied to the clipboard successfully"));
			}

			if (al && al.focus) {
				al.focus();
			}
		}, function (err) {
			console.error('Async: Could not copy text: ', err);
			if(notify) {
				Notifier.error(t("Sorry, the text could not be copied to the clipboard"));
			}
		});
	}
}

export const browser = new Browser();