/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

type KeyValue = Record<string, any>

/**
 * Utilities to operate on objects
 * @category Utility
 */
export class ObjectUtil {
	public static isObject = (obj: any) => {
		return Object.prototype.toString.call(obj) === '[object Object]';
	}

	/**
	 * Simple JSON path function
	 *
	 * eg.
	 * const obj = {
	 *   foo : {
	 *     bar: {
	 *       test: 1
	 *     }
	 *   }
	 * }
	 *
	 * Object.path(obj, 'foo.bar.test'); // 1
	 *
	 * @param obj
	 * @param path
	 * @return The value from the path or undefined if not found
	 */
	public static path(obj: KeyValue, path: string): any {

		const dotPos = path.indexOf(".");

		const prop = dotPos > -1 ? path.substr(0, dotPos) : path;

		const next = obj[prop];

		if (!next) {
			return next;
		}
		if (dotPos == -1) {
			return next;
		}

		if (!ObjectUtil.isObject(next)) {
			return undefined;
		}

		return this.path(next, path.substr(dotPos + 1));
	}

	/**
	 * Deep merge two key value objects
	 * @param o1
	 * @param o2
	 */
	public static merge(o1: Record<string, any>, o2: any) {

		if (!this.isObject(o2)) {
			return o2;
		}

		for (let key in o2) {
			if (key in o1 && this.isObject(o1[key])) {
				o1[key] = this.merge(o1[key], o2[key]);
			} else {
				o1[key] = o2[key];
			}
		}

		return o1;
	}

	/**
	 * Clone an object
	 *
	 * @param source
	 */
	public static clone<T>(source: T): T {
		return structuredClone(source);
	}

	//
	// private static deepClone(source: any, hash = new WeakMap()): any {
	// 	if(Array.isArray(source)) {
	// 		return source.map(item => this.deepClone(item));
	// 	}
	//
	// 	if(source instanceof Date) {
	// 		return new Date(source.getTime());
	// 	}
	//
	// 	if(source && typeof source === 'object') {
	//
	// 		if (hash.has(source)) return hash.get(source);
	//
	//
	// 		const copy = Object.getOwnPropertyNames(source).reduce((o, prop) => {
	// 			Object.defineProperty(o, prop, Object.getOwnPropertyDescriptor(source, prop)!);
	// 			o[prop] = this.deepClone((source as { [key: string]: any })[prop]);
	// 			return o;
	// 		}, Object.create(Object.getPrototypeOf(source)));
	//
	// 		hash.set(source, copy);
	//
	// 		return copy;
	// 	}
	//
	// 	return source;
	// }
}