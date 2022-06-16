import {Observable, ObservableEventMap, ObservableListenerOpts} from "../component/Observable.js";
import {Component} from "../component/Component.js";
/**
 * @inheritDoc
 */
export interface CollectionEventMap<T extends Observable, I> extends ObservableEventMap<T> {

	/**
	 * Fires before adding an item. Return false to abort.
	 *
	 * @param window
	 */
	beforeadd?: (collection: T, item:I, index:number) => void|false

	/**
	 * Fires after adding an item.
	 *
	 * @param window
	 */
	add?: (collection: T, item:I, index:number) => void

	/**
	 * Fires after removing an item.
	 *
	 * @param window
	 */
	remove?: (collection: T, item:I, index:number) => void

	/**
	 * Fires before removing an item. Return false to abort.
	 *
	 * @param window
	 */
	beforeremove?: (collection: T, item:I, index:number) => void|false
}

export interface Collection<T> {
	on<K extends keyof CollectionEventMap<Collection<T>, T>>(eventName: K, listener: CollectionEventMap<Collection<T>, T>[K], options?: ObservableListenerOpts): void;

	fire<K extends keyof CollectionEventMap<Collection<T>, T>>(eventName: K, ...args: Parameters<NonNullable<CollectionEventMap<Collection<T>, T>[K]>>): boolean
}

/**
 * Collection of items
 */
export class Collection<T> extends Observable implements Iterable<T>{
	readonly items: T[];

	constructor(items:T[] = []) {
		super();
		this.items = items;
	}

	[Symbol.iterator](): Iterator<T> {
		return this.items[Symbol.iterator]();
	}

	/**
	 * Add items at the end
	 *
	 * @returns the index of the last added item
	 */
	public add(...items:T[]) : number {
		let index = -1;
		items.forEach((item) => {
			index = this.items.length;

			if (!this.fire("beforeadd", this, item, index)) {
				return -1;
			}
			this.items.push(item);

			this.fire("add", this, item, index);
		});

		return index;
	}

	/**
	 * Insert items at the given index
	 *
	 * @param index Use negative indexes to insert from the end. For example -1 inserts before the last item.
	 */
	public insert(index:number, ...items:T[])  {

		if(index < 0) {
			index = this.count() + index;
		}

		items.forEach((item) => {

			if (!this.fire("beforeadd", this, item, index)) {
				return -1;
			}
			this.items.splice(index, 0, item);

			this.fire("add", this, item, index);

			index++;
		});

		return index;
	}

	/**
	 * Get an item at the given index
	 * @param index
	 */
	public get(index:number) : T {
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
	public indexOf(item:T) {
		return this.items.indexOf(item)
	}

	/**
	 * Remove items
	 */
	public remove(...items:T[]) {
		items.forEach((item) => {
			const index = this.indexOf(item);
			if(index == -1) {
				return false;
			} else
			{
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

		if(!this.fire("beforeremove", this, item, index)) {
			return false;
		}

		this.items.splice(index, 1);

		this.fire("remove", this, item, index);

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
		const l = this.count();
		for(let i = l - 1; i >= 0; i--) {
			this.removeAt(i);
		}
	}

	/**
	 * Replace the collection with an array
	 *
	 * @param items
	 */
	public replace(items:T[]) {
		this.clear();
		items.forEach(item => this.add(item));
	}

	/**
	 * Performs the specified action for each element in an array.
	 * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
	 * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
	 */
	public forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any) {
		return this.items.forEach(callbackfn, thisArg);
	}

	public getArray() {
		return this.items;
	}


	/**
	 * Returns the value of the first element in the array where predicate is true, and undefined
	 * otherwise.
	 * @param predicate find calls predicate once for each element of the array, in ascending
	 * order, until it finds one where predicate returns true. If such an element is found, find
	 * immediately returns that element value. Otherwise, find returns undefined.
	 *
	 */
	public find(predicate: (value: T, index: number, obj: T[]) => unknown): T|undefined {
		return this.items.find(predicate) as T;
	}

	/**
	 * Returns the index of the first element in the array where predicate is true, and -1
	 * otherwise.
	 * @param predicate find calls predicate once for each element of the array, in ascending
	 * order, until it finds one where predicate returns true. If such an element is found,
	 * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
	 */
	public findIndex(predicate: (value: T, index: number, obj: T[]) => unknown): number {
		return this.items.findIndex(predicate);
	}



}