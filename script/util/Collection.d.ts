/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Observable } from "../component";
/**
 * @inheritDoc
 * @category Utility
 */
export type CollectionEventMap<CollectionItem> = {
    /**
     * Fires before adding an item. Return false to abort.
     *
     * @param window
     */
    beforeadd: {
        item: CollectionItem;
        index: number;
    };
    /**
     * Fires after adding an item.
     *
     * @param window
     */
    add: {
        item: CollectionItem;
        index: number;
    };
    /**
     * Fires after removing an item.
     *
     * @param window
     */
    remove: {
        item: CollectionItem;
        index: number;
    };
    /**
     * Fires before removing an item. Return false to abort.
     *
     * @param window
     */
    beforeremove: {
        item: CollectionItem;
        index: number;
    };
    /**
     * Fires when a row is removed or added.
     * On a store load this fires lots of times. You can use buffer = 0 to do an action once after load and on add and remove
     * of a single row:
     *
     * ```
     * this.store.on("datachanged", () => {
     * 	  this.rowSelection!.selected = [0];
     * }, {buffer: 0})
     * ```
     *
     * @param collection
     */
    datachanged: {};
};
/**
 * Collection of items
 *
 * @category Utility
 */
export declare class Collection<CollectionItem, MapType extends CollectionEventMap<CollectionItem> = CollectionEventMap<CollectionItem>> extends Observable<MapType> implements Iterable<CollectionItem> {
    protected readonly items: CollectionItem[];
    constructor(items?: CollectionItem[]);
    [Symbol.iterator](): Iterator<CollectionItem>;
    /**
     * Add items at the end
     *
     * @returns the index of the last added item
     */
    add(...items: CollectionItem[]): number;
    /**
     * Insert items at the given index
     *
     * @param index Use negative indexes to insert from the end. For example -1 inserts before the last item.
     */
    insert(index: number, ...items: CollectionItem[]): number;
    /**
     * Get an item at the given index
     * @param index
     */
    get(index: number): CollectionItem | undefined;
    /**
     * Return first item
     */
    first(): CollectionItem | undefined;
    /**
     * return the last item
     */
    last(): CollectionItem | undefined;
    /**
     * Pop the last item off the collection
     */
    pop(): CollectionItem | undefined;
    /**
     * Shift the first item off the collection
     */
    shift(): (CollectionItem & ({} | null)) | undefined;
    /**
     * Find the index of an item. Returns -1 if not found.
     * @param item
     */
    indexOf(item: CollectionItem): number;
    /**
     * Remove items
     */
    remove(...items: CollectionItem[]): void;
    move(from: number, to: number): void;
    /**
     * Remove an item
     *
     * @param index Item index
     */
    removeAt(index: number): false | NonNullable<CollectionItem>;
    /**
     * Replace an item with new items
     *
     * @param index
     * @param items
     */
    replaceAt(index: number, ...items: CollectionItem[]): void;
    /**
     * Count the number of items
     */
    count(): number;
    /**
     * Clears all items
     */
    clear(): this;
    /**
     * Replace the collection with an array
     *
     * @param items
     */
    replace(...items: CollectionItem[]): void;
    /**
     * Performs the specified action for each element in an array.
     * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
     * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    forEach(callbackfn: (value: CollectionItem, index: number, array: CollectionItem[]) => void, thisArg?: any): void;
    getArray(): CollectionItem[];
    /**
     * Return all items
     */
    all(): CollectionItem[];
    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     *
     * @returns CollectionItem | undefined
     */
    find(predicate: (value: CollectionItem, index: number, obj: CollectionItem[]) => unknown): CollectionItem | undefined;
    /**
     * The filter() method creates a new array with all elements that pass the test implemented by the provided function.
     *
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     *
     */
    filter(predicate: (value: CollectionItem, index: number, obj: CollectionItem[]) => unknown): void;
    /**
     * Check if the given item is present
     *
     * @param item
     */
    has(item: CollectionItem): boolean;
    /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     */
    findIndex(predicate: (value: CollectionItem, index: number, obj: CollectionItem[]) => unknown): number;
    protected onAdd(item: CollectionItem, index: number): void;
    protected onRemove(item: CollectionItem, index: number): void;
}
