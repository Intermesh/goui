import {Observable, ObservableEventMap, ObservableListenerOpts} from "../component/Observable.js";
/**
 * @inheritDoc
 */
export interface CollectionEventMap<T extends Observable, I> extends ObservableEventMap<T> {
	/**
	 * Fires when the window is closed
	 *
	 * @param window
	 */
	add?: (collection: T, item:I, index:number) => void

	/**
	 * Fires when the window is maximized
	 *
	 * @param window
	 */
	remove?: (collection: T, item:I, index:number) => void
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

	public add(item:T) : T {
		this.items.push(item);
		this.fire("add", this, item, this.items.length -1);
		return item;
	}

	public insert(item:T, index = 0) : T {

		if(index < 0) {
			index = this.items.length + index;
		}

		this.items.splice(index, 0, item);

		this.fire("add", this, item, index);

		return item;
	}

	public get(index:number) : T {
		return this.items[index];
	}

	public indexOf(item:T) {
		return this.items.indexOf(item)
	}

	public remove(item:T) {
		const index = this.indexOf(item);
		if(index == -1) {
			return false;
		} else
		{
			return this.removeAt(index);
		}
	}

	/**
	 * Remove an item
	 *
	 * @param index Item index
	 */
	public removeAt(index: number) {

		const item = this.get(index);

		this.items.splice(index, 1);

		this.fire("remove", this, item, index);

		return true;
	}

	public count() {
		return this.items.length;
	}

	public clear() {
		const l = this.count();
		for(let i = l - 1; i >= 0; i--) {
			this.removeAt(i);
		}
	}


}