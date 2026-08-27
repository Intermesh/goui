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
		return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
	}

	/**
	 * Get a nested value by JSON pointer
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
	 * Object.path(obj, 'foo/bar/test'); // 1
	 *
	 * @param obj
	 * @param pointer JSON pointer
	 *
	 * @link https://www.rfc-editor.org/rfc/rfc6901
	 *
	 * @return The value from the path or undefined if not found
	 */
	public static get(obj: KeyValue, pointer: string): any {

		const parts = ObjectUtil.explodePointer(pointer);

		let part, cur= obj;// = structuredClone(obj);

		while(part = parts.shift()) {
			if(!(part in cur) && parts.length) {
				throw "Invalid JSON pointer : " + pointer;
			}
			cur = cur[part];
		}

		return cur;

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

	public static explodePointer(path:string) {
		const parts = path.replace(/^\//, "").split('/');
		// ignore leading / as it is implicit
		for(let i=0; i < parts.length; i++) {
			parts[i].replace('~1', '/')
				.replace('~0', '~');
		}
		return parts;
	}

	private static internalPatch(doc: any, path: string[], v: any): any {

		const part = path.shift()!,
			length = path.length;

		// CalendarItem.ts relies on this when patching participants. It can also patch participants when they are null.
		if(!doc) {
			doc = {}; // server will return null for empty maps
		}

		if(!(part in doc) && length > 0) {
			throw new Error('patching item in non-existing objects')
		}

		if(!length) {
			//remove property by setting null. See https://jmap.io/spec-core.html#set
			if(v === null || v === undefined) {
				delete doc[part]
			} else {
				doc[part] = v;
			}
		} else {
			doc[part] = ObjectUtil.internalPatch(doc[part], path, v);
		}
		return doc;
	}

	/**
	 * Patch an object with a JSON Pointer object following rfc6901 standards
	 *
	 * @link https://www.rfc-editor.org/rfc/rfc6901
	 * @param doc
	 * @param patch
	 */
	public static patch<T>(doc:T, patch:any) : T {

		for(const p in patch) {
			try {
				doc = ObjectUtil.internalPatch(doc, ObjectUtil.explodePointer(p), patch[p]);
			} catch(e) {
				console.warn("Error patching object: ", p, patch, doc)
			}
		}

		return doc;
	}

	/**
	 * Create JMAP PatchObject
	 *
	 * @link https://jmap.io/spec-core.html#set
	 */
	public static diff<T extends Record<string, unknown>>(a: T, b: T) : Partial<T> {

		const diff:Partial<T> = {};

		Object.keys(b).forEach(key => {

			const aVal = a[key as keyof T];
			const bVal = b[key as keyof T];

			if (this.isEqual(aVal, bVal)) {
				return;
			}

			if (this.isObject(aVal) && this.isObject(bVal)) {
				const nestedDiff = this.diff(
					aVal as Record<string, unknown>,
					bVal as Record<string, unknown>
				);
				if (Object.keys(nestedDiff).length > 0) {
					diff[key as keyof T] = nestedDiff  as T[keyof T];
				}
			} else {
				// Arrays, primitives, added/removed keys — take the new value wholesale.
				diff[key as keyof T] = bVal;
			}

		});

		return diff;
	}

	// private static empty(v:any) {
	// 	return v === null || v === undefined || v === "";
	// }

	private static isEqual(a: any, b: any): boolean {
		if (a === b) return true;
		if (typeof a !== typeof b) return false;

		if (Array.isArray(a) && Array.isArray(b)) {
			if (a.length !== b.length) return false;
			return a.every((val, i) => this.isEqual(val, b[i]));
		}

		if (this.isObject(a) && this.isObject(b)) {
			const keysA = Object.keys(a);
			const keysB = Object.keys(b);
			if (keysA.length !== keysB.length) return false;
			return keysA.every((key) => this.isEqual(a[key], b[key]));
		}

		return false;
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