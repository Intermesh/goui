import {Component} from "./Component.js";
import {Config} from "./Observable.js";

export class Avatar extends Component {

	protected baseCls = "avatar";

	static colors = [
		'C62828', 'AD1457', '6A1B9A', '4527A0', '283593', '1565C0', '0277BD', '00838F',
		'00695C', '2E7D32', '558B2F', '9E9D24', 'F9A825', 'FF8F00', 'EF6C00', '424242'
	];

	set displayName(displayName: string) {
		this.html = this.initials(this.displayName);
		this.title = this.displayName;

		let j = 0;
		for(let i = 0, l = this.displayName.length; i < l; i++) {
			j += this.displayName.charCodeAt(i);
		}
		this.el.style.backgroundColor = "#" + Avatar.colors[j % Avatar.colors.length];
	}

	get displayName() {
		return this.title;
	}


	/**
	 * Grabs the first char of the first and last word.
	 *
	 * @param {string} name
	 * @returns {string}
	 */
	private initials(name:string) {
		const parts = name.split(" "), l = parts.length;

		if(l > 2) {
			parts.splice(1, l - 2);
		}

		return parts.map((name) => name.substr(0,1).toUpperCase()).join("");
	}

}


/**
 * Shorthand function to create {@see Avatar}
 *
 * @param config
 */
export const avatar = (config?:Config<Avatar>) => Avatar.create(config);