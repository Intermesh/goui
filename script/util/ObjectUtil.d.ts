/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
type KeyValue = Record<string, any>;
/**
 * Utilities to operate on objects
 * @category Utility
 */
export declare class ObjectUtil {
    static isObject: (obj: any) => boolean;
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
    static get(obj: KeyValue, pointer: string): any;
    /**
     * Deep merge two key value objects
     * @param o1
     * @param o2
     */
    static merge(o1: Record<string, any>, o2: any): any;
    /**
     * Clone an object
     *
     * @param source
     */
    static clone<T>(source: T): T;
    private static explodePointer;
    private static internalPatch;
    /**
     * Patch an object with a JSON Pointer object following rfc6901 standards
     *
     * @link https://www.rfc-editor.org/rfc/rfc6901
     * @param doc
     * @param patch
     */
    static patch<T>(doc: T, patch: any): T;
    /**
     * Create JMAP PatchObject
     *
     * @link https://jmap.io/spec-core.html#set
     */
    static diff(a: any, b: any): {};
    private static empty;
    private static internalDiff;
}
export {};
