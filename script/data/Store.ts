/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {Component, Config, createComponent} from "../component";
import {ArrayUtil, Collection, CollectionEventMap} from "../util";

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
 * Interface for a component that uses a store to present data
 */
export interface StoreComponent<StoreType extends Store = Store,RecordType extends StoreRecord = StoreRecord> extends Component {
	onStoreLoadException: (ev:StoreEventMap<RecordType>['loadexception'] & {target: StoreType}) => void;
 	onBeforeStoreLoad: (ev:StoreEventMap<RecordType>['beforeload'] & {target: StoreType}) => void
	onStoreLoad: (ev:StoreEventMap<RecordType>['load'] & {target: StoreType}) => void;
	onRecordRemove: (ev:StoreEventMap<RecordType>['remove'] & {target: StoreType}) => void;
  onRecordAdd: (ev:StoreEventMap<RecordType>['add'] & {target: StoreType}) => void
}



/**
 * @inheritDoc
 */
export interface StoreEventMap<RecordType extends StoreRecord = StoreRecord> extends CollectionEventMap<RecordType> {
	/**
	 * Fires when data is loaded into the store
	 *
	 * @param store
	 * @param append Whether the records were added to the store.
	 */
	beforeload: {
		/**
		 * Whether the records were added to the store.
		 */
		append: boolean
	}
	/**
	 * Fires when data is loaded into the store
	 *
	 * @param store
	 * @param records
	 * @param append Whether the records were added to the store.
	 */
	load: {
		/**
		 * Whether the records were added to the store.
		 */
		append: boolean,

		/**
		 * The loaded records
		 */
		records: RecordType[]
	}

	/**
	 * Fires when data load failed
	 *
	 * @param store
	 * @param reason
	 */
	loadexception: {
		/**
		 * Whether the records were added to the store.
		 */
		reason: any
	}
}


export type storeRecordType<StoreType> = StoreType extends Store<infer RecordType> ? RecordType : never;

/**
 * Generic data store used by components
 *
 * @category Data
 */
export class Store<RecordType extends StoreRecord  = StoreRecord> extends Collection<RecordType, StoreEventMap<RecordType>> {

	// private static stores: Record<string, Store> = {};
	//
	// /**
	//  * If the ID is given the store can be fetched with
	//  */
	// public id?: string;

	public queryParams: Record<string, any> = {};

	private _loading?: Promise<RecordType[]>;
	private _loaded = false;

	/**
	 * Sort the data on field and direction
	 */
	public sort: Comparator[] = [];

	/**
	 * Defines the field that holds the record ID
	 */
	public idField: string = "id";

	/**
	 * Find record by ID
	 *
	 * @param id
	 */
	public findById(id: any) {
		return this.find((r => r[this.idField] == id));
	}

	public findIndexById(id: any) {
		return this.findIndex((r => r[this.idField] == id));
	}

	/**
	 * Register of all components bound to this store using {@link bindStore()}
	 * @private
	 */
	protected readonly components: Component[] = [];

	/**
	 * True when the store is loading
	 */
	get loading() {
		return this._loading;
	}

	/**
	 * True when data has been loaded at least once
	 */
	get loaded() {
		return this._loaded;
	}

	/**
	 * Load a set of records
	 *
	 * @param records
	 * @param append
	 */
	public loadData(records: RecordType[], append = true) {
		append ? this.add(...records) : this.replace(...records);
		this._loaded = true;
		this.fire("load", {records, append});

	}

	set data(records: RecordType[]) {
		this.loadData(records);
	}

	get data() {
		return this.getArray();
	}

	/**
	 * Binds as component to this store so it can update when the store changes
	 * @param comp
	 */
	public bindComponent(comp: StoreComponent<this, RecordType>) {

		this.components.push(comp);
// handling remove and add per items allows a drag and drop action via store.remove and store.add
		this.on("remove", comp.onRecordRemove, {bind: comp});
		this.on("add", comp.onRecordAdd, {bind: comp});
		this.on("beforeload", comp.onBeforeStoreLoad, {bind: comp});
		this.on("load",comp.onStoreLoad, {bind: comp});
		this.on("loadexception", comp.onStoreLoadException, {bind: comp})

		comp.on("remove", () => {
			this.unbindComponent(comp);
		})
	}

	public unbindComponent(comp: StoreComponent<this, RecordType>) {
		this.un("remove", comp.onRecordRemove);
		this.un("add", comp.onRecordAdd);
		this.un("beforeload", comp.onBeforeStoreLoad);
		this.un("load",comp.onStoreLoad);
		this.un("loadexception", comp.onStoreLoadException);

		const i = this.components.indexOf(comp);
		this.components.splice(i, 1);
	}

	/**
	 * Reload the data from the source
	 */
	public async reload() {
		this._loaded = false;
		return this.load();
	}

	clear() {
		this._loaded = false;
		return super.clear();
	}

	/**
	 * Pass this to implement custom loading logic
	 */
	public onLoad?:(store:Store)=> Promise<void> = undefined

	/**
	 * Returns the loaded records. If append is true it only returns the new records.
	 * Override this function for new store types.
	 *
	 * @param append
	 * @protected
	 */
	protected async internalLoad(append: boolean): Promise<RecordType[]> {
		// async so it works the same as data source stores. This way this.loading is true wghen loadData() is called
		if(this.onLoad) {

			if(!append) {
				this.clear();
			}

			await this.onLoad(this);
		}
		const sorted = ArrayUtil.multiSort(this.items, this.sort);
		this.loadData(sorted, append);
		return this.items;
	}

	/**
	 * Loads the data from source into the store
	 *
	 * @param append
	 */
	public load(append = false): Promise<RecordType[]> {
		this.fire("beforeload",  {append});
		this._loading = this.internalLoad(append)
			.catch(reason => {
				console.error(reason)
				this.fire("loadexception", {reason});
				throw reason;
			})
			.finally(() => {
				this._loading = undefined;
			});
		return this._loading;
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

	/**
	 * Load more data when this element is scrolled down
	 *
	 * @param el
	 */
	public addScrollLoader(el: HTMLElement) {

		const onScroll = () => {
			const pixelsLeft = el.scrollHeight - el.scrollTop - el.offsetHeight;

			if (pixelsLeft < 100) {
				if (!this.loading && this.hasNext()) {
					void this.loadNext(true);
				}
			}
		}

		el.addEventListener("scroll", onScroll, {passive: true});

		// this will fill the empty space on firt load.
		this.on("load", () => {
			// use set timeout otherwise this.loading is still true
			setTimeout(() => {
				onScroll();
			})
		});

		return onScroll;
	}

}

export type StoreConfig<RecordType extends StoreRecord = StoreRecord> =

	Omit<Config<Store<RecordType>>,

		"hasNext" |
		"loadPrevious" |
		"hasPrevious" |
		"loadNext" |
		"load" |
		"reload" |
		"clear" |
		"loadData"|

		"[SymbolConstructor.iterator]" | // does not work :(
		"add" |
		"count" |
		"find" |
		"findIndex" |
		"first" |
		"forEach" |
		"get" |
		"getArray" |
		"has" |
		"indexOf" |
		"removeAt" |
		"remove" |
		"last" |
		"replace" |
		"insert"

	>;

/**
 * Shorthand function to create a {@link Store}
 *
 * @param config
 */
export const store = <RecordType extends StoreRecord = StoreRecord>(config?: StoreConfig<RecordType>) => createComponent(new Store<RecordType>(), config);