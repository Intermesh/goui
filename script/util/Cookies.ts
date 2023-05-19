/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

/**
 * Cookie utilities
 */
class Cookies {

	/**
	 * Set a cookie
	 *
	 * @param {string} name
	 * @param {string} value
	 * @param {int} maxAge Maximum age in seconds. Leave empty to clear on browser close
	 * @returns {void}
	 */
	set(name: string, value: string, maxAge?: number) {

		let maxAgeStr = "";
		if (maxAge) {
			maxAgeStr = ";Max-Age=" + maxAge;
		}
		const secure = location.protocol === 'https:' ? ';secure' : '';

		document.cookie = name + "=" + encodeURIComponent(value + "") + maxAgeStr + secure +
			";path=" + document.location.pathname + ';SameSite=Strict';
	}

	/**
	 * Get a cookie
	 *
	 * @param {string} name
	 * @returns {string}
	 */
	get(name: string): string | undefined {
		const nameEQ = name + "=";
		const ca = document.cookie.split(';');
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == ' ')
				c = c.substring(1, c.length);
			if (c.indexOf(nameEQ) == 0)
				return decodeURIComponent(c.substring(nameEQ.length, c.length));
		}
		return undefined;
	}

	/**
	 * Unset a cookie
	 *
	 * @param {string} name
	 * @returns {void}
	 */
	unset(name: string) {
		document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=' +
			document.location.pathname + ';SameSite=Strict';
	}
}


export const cookies = new Cookies();