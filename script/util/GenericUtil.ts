/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
export class GenericUtil {
	/**
	 * Copy text to clip board
	 *
	 * @param {string} text
	 */
	public static copyTextToClipboard(text: string) {
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