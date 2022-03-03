import {
	Observable,
	ObservableConfig,
	ObservableEventMap,
	ObservableListener,
	ObservableListenerOpts
} from "../component/Observable.js";
import {ArrayUtil} from "../util/ArrayUtil.js";

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
	isAscending: boolean
}

export type StoreRecord = { [key: string]: any };

/**
 * @inheritDoc
 */
export interface StoreConfig<T extends Observable> extends ObservableConfig<T> {

	/**
	 * The store records
	 */
	records?: StoreRecord[],

	/**
	 * Sort field and direction
	 */
	sort?: Comparator[],

	/**
	 * @inheritDoc
	 */
	listeners?: ObservableListener<StoreEventMap<T>>
}

/**
 * @inheritDoc
 */
export interface StoreEventMap<T extends Observable> extends ObservableEventMap<T> {
	/**
	 * Fires when data is loaded into the store
	 *
	 * @param store
	 * @param records
	 * @param append Wheter the records were added to the store.
	 */
	load?: (store: Store, records: StoreRecord[], append: boolean) => void
}

export interface Store {
	on<K extends keyof StoreEventMap<Store>>(eventName: K, listener: StoreEventMap<Store>[K], options?: ObservableListenerOpts): void
	fire<K extends keyof StoreEventMap<Store>>(eventName: K, ...args: Parameters<NonNullable<StoreEventMap<Store>[K]>>): boolean
}

/**
 * Data store
 */
export class Store extends Observable {

	protected records: StoreRecord[] = [];
	protected loading = false;

	/**
	 * Sort the data
	 */
	public sort: Comparator[] = [];

	public static create<T extends typeof Observable>(this: T, config?: StoreConfig<InstanceType<T>>) {
		return <InstanceType<T>> super.create(<any> config);
	}

	/**
	 * Get all records in this store
	 */
	getRecords() {
		return this.records;
	}

	/**
	 * Get record at index
	 *
	 * @param index
	 */
	getRecordAt(index:number) {
		return this.records[index]
	}

	/**
	 * Find a record by given function
	 * When the function returns true it's returned as result
	 *
	 * @example Find by id property
	 * ```
	 * const id = 1;
	 * store.findRecord( r => r.id == id);
	 * ```
	 * @param fn
	 */
	findRecord(fn:(record:StoreRecord) => unknown) {
		return this.records.find(fn);
	}

	/**
	 * Find a record index by given function
	 * When the function returns true it's returned as result
	 *
	 * @example Find by id property
	 * ```
	 * const id = 1;
	 * store.findRecordIndex( r => r.id == id);
	 * ```
	 *
	 * @param fn
	 */
	findRecordIndex(fn: (record:StoreRecord) => unknown) {
		return this.records.findIndex(fn);
	}

	/**
	 * True when the store is loading
	 */
	isLoading() {
		return this.loading;
	}

	/**
	 * Load a set of records
	 *
	 * @param records
	 * @param append
	 */
	public loadData(records: StoreRecord[], append = true) {
		this.records = append ? this.records.concat(records) : records;
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
	protected internalLoad(append:boolean): Promise<StoreRecord[]> {
		this.loadData(ArrayUtil.multiSort(this.records, this.sort), append);
		return Promise.resolve(this.records)
	}

	/**
	 * Loads the data from source into the store
	 *
	 * @param append
	 */
	public load(append = false): Promise<StoreRecord[]> {
		this.loading = true;

		return this.internalLoad(append)
			.finally(() => {
				this.loading = false;
			});
	}

	/**
	 * Load the next set of records when paging.
	 * Doesn't do anything in the array store but can be implemented in async stores.
	 */
	public loadNext(append = false): Promise<StoreRecord[]>  {
		return Promise.resolve([]);
	}

	/**
	 * Load the next set of records when paging.
	 * Doesn't do anything in the array store but can be implemented in async stores.
	 */
	public loadPrevious(): Promise<StoreRecord[]>  {
		return Promise.resolve([]);
	}

	public hasNext() {
		return false;
	}

	public hasPrevious() {
		return false;
	}

}