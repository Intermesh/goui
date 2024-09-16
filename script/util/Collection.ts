/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Listener, Observable, ObservableEventMap, ObservableListenerOpts} from "../component/Observable.js";

/**
 * @inheritDoc
 * @category Utility
 */
export interface CollectionEventMap<Type, CollectionItem> extends ObservableEventMap<Type> {

	/**
	 * Fires before adding an item. Return false to abort.
	 *
	 * @param window
	 */
	beforeadd: (collection: Type, item: CollectionItem, index: number) => void | false

	/**
	 * Fires after adding an item.
	 *
	 * @param window
	 */
	add: (collection: Type, item: CollectionItem, index: number) => void

	/**
	 * Fires after removing an item.
	 *
	 * @param window
	 */
	remove: (collection: Type, item: CollectionItem, index: number) => void

	/**
	 * Fires before removing an item. Return false to abort.
	 *
	 * @param window
	 */
	beforeremove: (collection: Type, item: CollectionItem, index: number) => void | false

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
	datachanged: (collection: Type) => void
}

/**
 *
 * @category Utility
 */
export interface Collection<CollectionItem> extends Observable {
	on<K extends keyof CollectionEventMap<this, CollectionItem>, L extends Listener>(eventName: K, listener: Partial<CollectionEventMap<this, CollectionItem>>[K], options?: ObservableListenerOpts): L;
	un<K extends keyof CollectionEventMap<this, CollectionItem>>(eventName: K, listener: Partial<CollectionEventMap<this, CollectionItem>>[K]): boolean
	fire<K extends keyof CollectionEventMap<this, CollectionItem>>(eventName: K, ...args: Parameters<CollectionEventMap<Collection<CollectionItem>, CollectionItem>[K]>): boolean
}

/**
 * Collection of items
 *
 * @category Utility
 */
export class Collection<CollectionItem> extends Observable implements Iterable<CollectionItem> {
	protected readonly items: CollectionItem[];

	constructor(items: CollectionItem[] = []) {
		super();
		this.items = items;
	}

	[Symbol.iterator](): Iterator<CollectionItem> {
		return this.items[Symbol.iterator]();
	}

	/**
	 * Add items at the end
	 *
	 * @returns the index of the last added item
	 */
	public add(...items: CollectionItem[]): number {
		let index = -1;
		items.forEach((item) => {
			index = this.items.length;

			if (!this.fire("beforeadd", this, item, index)) {
				return -1;
			}
			this.items.push(item);

			this.fire("add", this, item, index);
			this.fire("datachanged", this);
		});

		return index;
	}

	/**
	 * Insert items at the given index
	 *
	 * @param index Use negative indexes to insert from the end. For example -1 inserts before the last item.
	 */
	public insert(index: number, ...items: CollectionItem[]) {

		if (index < 0) {
			index = this.count() + index;
		}

		items.forEach((item) => {

			if (!this.fire("beforeadd", this, item, index)) {
				return -1;
			}
			this.items.splice(index, 0, item);

			this.fire("add", this, item, index);
			this.fire("datachanged", this);

			index++;
		});

		return index;
	}

	/**
	 * Get an item at the given index
	 * @param index
	 */
	public get(index: number): CollectionItem | undefined {
		return this.items[index];
	}

	/**
	 * Return first item
	 */
	public first() {
		return this.get(0);
	}

	/**
	 * return the last item
	 */
	public last() {
		return this.get(this.count() - 1);
	}

	/**
	 * Find the index of an item. Returns -1 if not found.
	 * @param item
	 */
	public indexOf(item: CollectionItem) {
		return this.items.indexOf(item)
	}

	/**
	 * Remove items
	 */
	public remove(...items: CollectionItem[]) {
		items.forEach((item) => {
			const index = this.indexOf(item);
			if (index == -1) {
				return false;
			} else {
				return this.removeAt(index);
			}
		});
	}

	/**
	 * Remove an item
	 *
	 * @param index Item index
	 */
	public removeAt(index: number) {

		const item = this.get(index);
		if(!item) {
			return false;
		}

		if (!this.fire("beforeremove", this, item, index)) {
			return false;
		}

		this.items.splice(index, 1);

		this.fire("remove", this, item, index);
		this.fire("datachanged", this);

		return true;
	}

	/**
	 * Count the number of items
	 */
	public count() {
		return this.items.length;
	}

	/**
	 * Clears all items
	 */
	public clear() {
		while(this.count()) {
			this.removeAt(0);
		}

		return this;
	}

	/**
	 * Replace the collection with an array
	 *
	 * @param items
	 */
	public replace(...items: CollectionItem[]) {
		this.clear().add(...items);
	}

	/**
	 * Performs the specified action for each element in an array.
	 * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
	 * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
	 */
	public forEach(callbackfn: (value: CollectionItem, index: number, array: CollectionItem[]) => void, thisArg?: any) {
		return this.items.forEach(callbackfn, thisArg);
	}

	public getArray() {
		return this.items;
	}

	/**
	 * Return all items
	 */
	public all() {
		return this.items;
	}


	/**
	 * Returns the value of the first element in the array where predicate is true, and undefined
	 * otherwise.
	 * @param predicate find calls predicate once for each element of the array, in ascending
	 * order, until it finds one where predicate returns true. If such an element is found, find
	 * immediately returns that element value. Otherwise, find returns undefined.
	 *
	 * @returns CollectionItem | undefined
	 */
	public find(predicate: (value: CollectionItem, index: number, obj: CollectionItem[]) => unknown): CollectionItem | undefined {
		return this.items.find(predicate) as CollectionItem;
	}

	/**
	 * The filter() method creates a new array with all elements that pass the test implemented by the provided function.
	 *
	 * @param predicate find calls predicate once for each element of the array, in ascending
	 * order, until it finds one where predicate returns true. If such an element is found, find
	 * immediately returns that element value. Otherwise, find returns undefined.
	 *
	 * @returns CollectionItem | undefined
	 */
	public filter(predicate: (value: CollectionItem, index: number, obj: CollectionItem[]) => unknown): CollectionItem[] {
		return this.items.filter(predicate) as CollectionItem[];
	}

	/**
	 * Check if the given item is present
	 *
	 * @param item
	 */
	public has(item: CollectionItem): boolean {
		return this.findIndex((v) => v == item) > -1;
	}

	/**
	 * Returns the index of the first element in the array where predicate is true, and -1
	 * otherwise.
	 * @param predicate find calls predicate once for each element of the array, in ascending
	 * order, until it finds one where predicate returns true. If such an element is found,
	 * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
	 */
	public findIndex(predicate: (value: CollectionItem, index: number, obj: CollectionItem[]) => unknown): number {
		return this.items.findIndex(predicate);
	}


}