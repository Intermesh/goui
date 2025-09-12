import {Format} from "./Format";

export {};

declare global {
	/**
	 * @category Utility
	 */
	interface String {
		capitalize<T extends string>(this: T) : Capitalize<T>
		uncapitalize<T extends string>(this: T) : Uncapitalize<T>,

		/**
		 * Convert characters to their HTML character equivalents for safe display in web pages.
		 */
		htmlEncode<T extends string>(this: T) : T,

		/**
		 * Remove HTML tags
		 */
		stripTags<T extends string>(this: T) : T,

	}

}

if(!String.hasOwnProperty('capitalize')) {
	Object.defineProperty(String.prototype, 'capitalize', {
		value: function () {
			return this.charAt(0).toUpperCase() + this.slice(1);
		},
		enumerable: false
	});
}

if(!String.hasOwnProperty('uncapitalize')) {
	Object.defineProperty(String.prototype, 'uncapitalize', {
		value: function () {
			return this.charAt(0).toLowerCase() + this.slice(1);
		},
		enumerable: false
	});
}

if(!String.hasOwnProperty('htmlEncode')) {
	Object.defineProperty(String.prototype, 'htmlEncode', {
		value: function () {
			return Format.htmlEncode(this);
		},
		enumerable: false
	});
}

if(!String.hasOwnProperty('stripTags')) {
	Object.defineProperty(String.prototype, 'stripTags', {
		value: function () {
			const p = document.createElement('div');
			p.innerHTML = this;
			return p.textContent;
		},
		enumerable: false
	});
}