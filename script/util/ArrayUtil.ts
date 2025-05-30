/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Comparator} from "../data/Store.js";

/**
 * Array functions
 *
 * @category Utility
 */
export class ArrayUtil {
	/**
	 * Get array of all values of array1 that are NOT present in array2
	 *
	 * Opposite of intersect()
	 *
	 * @param array1
	 * @param array2
	 */
	public static diff(array1: any[], array2: any[]) {
		return array1.filter((i) => {
			return array2.indexOf(i) === -1;
		});
	}

	/**
	 * Get array of all values of array1 that are ALSO present in array2
	 *
	 * @param array1
	 * @param array2
	 */
	public static intersect(array1: any[], array2: any[]) {
		return array1.filter((i) => {
			return array2.indexOf(i) !== -1;
		});
	}

	/**
	 * Sort an array by multiple fields
	 *
	 * @param array
	 * @param comparators
	 */
	public static multiSort(array: any[], comparators: Comparator[]) {

		if (!comparators.length) {
			return array;
		}

		const keySort = (a: any, b: any, isAscending: boolean) => {
			const direction = isAscending ? 1 : -1;

			if (a === b) { // If the values are the same, do not switch positions.
				return 0;
			}
			if(a == undefined) {
				a = "";
			}

			if(b == undefined) {
				b = "";
			}

			// If b > a, multiply by -1 to get the reverse direction.
			return a > b ? direction : -1 * direction;
		};

		return array.sort((a, b) => {
			let sorted = 0;
			let index = 0;

			// Loop until sorted (-1 or 1) or until the sort keys have been processed.
			while (sorted === 0 && index < comparators.length) {
				const key = comparators[index].property;

				if (key) {
					sorted = keySort(a[key], b[key], comparators[index].isAscending || comparators[index].isAscending === undefined);
					index++;
				}
			}

			return sorted;
		});
	}


	/**
	 * Move element in the array
	 *
	 * @param array
	 * @param from
	 * @param to
	 */
	public static move = function <T extends any[]>(array:T, from:number, to:number) {
		// because we remove it from the array the to should be 1 less
		if(to > from) {
			to--;
		}
		array.splice(to, 0, array.splice(from, 1)[0]);
		return array;
	};

	/**
	 * Deduplicate an array
	 *
	 * @param array
	 */
	public static unique = function <T extends any[]>(array:T) {
		// A set is unique: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
		let s = new Set(array);
		return [...s]
	};
}
