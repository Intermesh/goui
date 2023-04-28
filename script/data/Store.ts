/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {Observable, ObservableListener, ObservableListenerOpts} from "../component/Observable.js";
import {ArrayUtil} from "../util/ArrayUtil.js";
import {Collection, CollectionEventMap} from "../util/Collection.js";
import {Config, createComponent} from "../component/Component.js";

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

export type StoreRecord = Record<string, any>


/**
 * @inheritDoc
 */
export interface StoreEventMap<Type, RecordType> extends CollectionEventMap<Type, RecordType> {
	/**
	 * Fires when data is loaded into the store
	 *
	 * @param store
	 * @param append Whether the records were added to the store.
	 */
	beforeload: <Sender extends Type>(store: Sender, append: boolean) => void
	/**
	 * Fires when data is loaded into the store
	 *
	 * @param store
	 * @param records
	 * @param append Whether the records were added to the store.
	 */
	load: <Sender extends Type, SenderRecordType extends RecordType>(store: Sender, records: SenderRecordType[], append: boolean) => void
}

export interface Store<RecordType extends StoreRecord = StoreRecord> {
	on<K extends keyof StoreEventMap<this, RecordType>>(eventName: K, listener: Partial<StoreEventMap<this, RecordType>>[K], options?: ObservableListenerOpts): void

	fire<K extends keyof StoreEventMap<this, RecordType>>(eventName: K, ...args: Parameters<NonNullable<StoreEventMap<this, RecordType>[K]>>): boolean

	set listeners(listeners: ObservableListener<StoreEventMap<this, RecordType>>)
}

export type storeRecordType<StoreType> = StoreType extends Store<infer RecordType> ? RecordType : never;
/**
 * Generic data store used by components
 */
export class Store<RecordType  extends StoreRecord = StoreRecord> extends Collection<RecordType> {

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
	public loadData(records: RecordType[], append = true) {

		append ? this.add(...records) : this.replace(...records);
		this.fire("load", this, records, append);
	}

	/**
	 * Reload the data from the source
	 */
	public async reload() {
		return this.load();
	}

	/**
	 * Returns the loaded records. If append is true it only returns the new records.
	 * Override this function for new store types.
	 *
	 * @param append
	 * @protected
	 */
	protected internalLoad(append: boolean): Promise<RecordType[]> {
		this.loadData(ArrayUtil.multiSort(this.items, this.sort), append);
		return Promise.resolve(this.items)
	}

	/**
	 * Loads the data from source into the store
	 *
	 * @param append
	 */
	public load(append = false): Promise<RecordType[]> {
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
	public loadNext(append = false): Promise<RecordType[]> {
		return Promise.resolve([]);
	}

	/**
	 * Load the next set of records when paging.
	 * Doesn't do anything in the array store but can be implemented in async stores.
	 */
	public loadPrevious(): Promise<RecordType[]> {
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
 * Shorthand function to create a {@see Store}
 *
 * @param config
 */
export const store = <RecordType extends StoreRecord = StoreRecord>(config?: Config<Store>) => createComponent(new Store<RecordType>(), config);