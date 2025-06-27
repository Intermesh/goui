/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Component, createComponent} from "./Component.js";
import {Config} from "./Observable.js";

/**
 * The Avatar class represents a graphical avatar component that displays a user's initials, background color, or an optional image.
 * It is configurable with a display name, image URL, and will dynamically generate background colors based on the display name.
 *
 * @extends Component
 */
export class Avatar extends Component {

	protected baseCls = "goui-avatar";

	public static colors = [
		'C62828', 'AD1457', '6A1B9A', '4527A0', '283593', '1565C0', '0277BD', '00838F',
		'00695C', '2E7D32', '558B2F', '9E9D24', 'F9A825', 'FF8F00', 'EF6C00', '424242'
	];

	set displayName(displayName: string) {

		this.text = Avatar.initials(displayName);
		this.title = displayName;

		let j = 0;
		for (let i = 0, l = this.displayName.length; i < l; i++) {
			j += displayName.charCodeAt(i);
		}
		this.el.style.backgroundColor = "#" + Avatar.colors[j % Avatar.colors.length];
	}

	get displayName() {
		return this.title;
	}

	set backgroundImage(imgUrl: string | undefined) {
		this.el.style.backgroundImage = imgUrl ? "url("+imgUrl+")" : "none";
		if(imgUrl) {
			this.text = "";
		}
	}

	get backgroundImage() :string {
		return this.el.style.backgroundImage;
	}


	/**
	 * Grabs the first char of the first and last word.
	 *
	 * @param {string} name
	 * @returns {string}
	 */
	public static initials(name: string): string {
		const parts = name.split(" "), l = parts.length;
		if (l > 2) {
			parts.splice(1, l - 2);
		}

		return parts.map((name) => name.substr(0, 1).toUpperCase()).join("");
	}

}


/**
 * Shorthand function to create {@link Avatar}
 *
 * @param config
 */
export const avatar = (config?: Config<Avatar>) => createComponent(new Avatar(), config);