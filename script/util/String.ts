
export {};

declare global {
	/**
	 * @category Utility
	 */
	interface String {
		capitalize<T extends string>(this: T) : Capitalize<T>
		uncapitalize<T extends string>(this: T) : Uncapitalize<T>
	}

}


Object.defineProperty(String.prototype, 'capitalize', {
	value: function() {
		return this.charAt(0).toUpperCase() + this.slice(1);
	},
	enumerable: false
});

Object.defineProperty(String.prototype, 'uncapitalize', {
	value: function() {
		return this.charAt(0).toLowerCase() + this.slice(1);
	},
	enumerable: false
});