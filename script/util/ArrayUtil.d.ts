/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Comparator } from "../data/Store.js";
/**
 * Array functions
 *
 * @category Utility
 */
export declare class ArrayUtil {
    /**
     * Get array of all values of array1 that are NOT present in array2
     *
     * Opposite of intersect()
     *
     * @param array1
     * @param array2
     */
    static diff(array1: any[], array2: any[]): any[];
    /**
     * Get array of all values of array1 that are ALSO present in array2
     *
     * @param array1
     * @param array2
     */
    static intersect(array1: any[], array2: any[]): any[];
    /**
     * Sort an array by multiple fields
     *
     * @param array
     * @param comparators
     */
    static multiSort(array: any[], comparators: Comparator[]): any[];
    /**
     * Move element in the array
     *
     * @param array
     * @param from
     * @param to
     */
    static move: <T extends any[]>(array: T, from: number, to: number) => T;
    /**
     * Deduplicate an array
     *
     * @param array
     */
    static unique: <T extends any[]>(array: T) => any[];
}
