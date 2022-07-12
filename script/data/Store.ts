import {Observable, ObservableListener, ObservableListenerOpts} from "../component/Observable.js";
import {ArrayUtil} from "../util/ArrayUtil.js";
import {Collection, CollectionEventMap} from "../util/Collection.js";
import {Config} from "../component/Component.js";

/**
 * Comparator interface for sorting data
 */
export interface Comparator {
	/**
	 * The property to sort on
	 */
	property: string,

	/**
	 * Sort ascending or not
	 */
	isAscending?: boolean
}

export type StoreRecord = { [key: string]: any };


/**
 * @inheritDoc
 */
export interface StoreEventMap<T extends Observable> extends CollectionEventMap<T, StoreRecord> {
	/**
	 * Fires when data is loaded into the store
	 *
	 * @param store
	 * @param append Whether the records were added to the store.
	 */
	beforeload: <Sender extends T>(store: Sender,  append: boolean) => void
	/**
	 * Fires when data is loaded into the store
	 *
	 * @param store
	 * @param records
	 * @param append Whether the records were added to the store.
	 */
	load: <Sender extends T>(store: Sender, records: StoreRecord[], append: boolean) => void
}

export interface Store {
	on<K extends keyof StoreEventMap<this>>(eventName: K, listener: Partial<StoreEventMap<this>>[K], options?: ObservableListenerOpts): void

	fire<K extends keyof StoreEventMap<this>>(eventName: K, ...args: Parameters<StoreEventMap<this>[K]>): boolean

	set listeners(listeners: ObservableListener<StoreEventMap<this>>)
}

/**
 * Data store
 */
export class Store extends Collection<StoreRecord> {

	// private static stores: Record<string, Store> = {};
	//
	// /**
	//  * If the ID is given the store can be fetched with
	//  */
	// public id?: string;

	private _loading = false;

	/**
	 * Sort the data on field and direction
	 */
	public sort: Comparator[] = [];

	/**
	 * True when the store is loading
	 */
	get loading() {
		return this._loading;
	}

	/**
	 * Load a set of records
	 *
	 * @param records
	 * @param append
	 */
	public loadData(records: StoreRecord[], append = true) {

		append ? this.add(...records) : this.replace(...records);
		this.fire("load", this, records, append);
	}

	/**
	 * Reload the data from the source
	 */
	public reload() {
		return this.load();
	}

	/**
	 * Returns the loaded records. If append is true it only returns the new records.
	 * Override this function for new store types.
	 *
	 * @param append
	 * @protected
	 */
	protected internalLoad(append: boolean): Promise<StoreRecord[]> {
		this.loadData(ArrayUtil.multiSort(this.items, this.sort), append);
		return Promise.resolve(this.items)
	}

	/**
	 * Loads the data from source into the store
	 *
	 * @param append
	 */
	public load(append = false): Promise<StoreRecord[]> {
		this._loading = true;
		this.fire("beforeload", this, append);
		return this.internalLoad(append)
			.finally(() => {
				this._loading = false;
			});
	}

	/**
	 * Load the next set of records when paging.
	 * Doesn't do anything in the array store but can be implemented in async stores.
	 */
	public loadNext(append = false): Promise<StoreRecord[]> {
		return Promise.resolve([]);
	}

	/**
	 * Load the next set of records when paging.
	 * Doesn't do anything in the array store but can be implemented in async stores.
	 */
	public loadPrevious(): Promise<StoreRecord[]> {
		return Promise.resolve([]);
	}

	public hasNext() {
		return false;
	}

	public hasPrevious() {
		return false;
	}

}


/**
 * Shorthand function to create store
 *
 * @param config
 */
export const store = (config?: Config<Store>) => Object.assign(new Store(), config);