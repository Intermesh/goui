export {};
/**
 * Polyfill for RegExp.escape
 */
declare global {
	/**
	 * @category Utility
	 */
	interface RegExpConstructor {
		/**
		 * Returns a new string that can be safely used as a literal pattern for the RegExp() constructor.
		 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape
		 */
		escape<T extends string>(string: T): T
	}
}

if(!RegExp.hasOwnProperty('escape')) {
	Object.defineProperty(RegExp, 'escape', {
		value: function (str:string) {
			return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
		},
		enumerable: false
	});
}

