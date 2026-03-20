/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Component, Config } from "../component";
import { Collection, CollectionEventMap } from "../util";
/**
 * Comparator interface for sorting data
 */
export interface Comparator {
    /**
     * The property to sort on
     */
    property: string;
    /**
     * Sort ascending or not
     */
    isAscending?: boolean;
}
export type StoreRecord = Record<string, any>;
/**
 * Interface for a component that uses a store to present data
 */
export interface StoreComponent<StoreType extends Store = Store, RecordType extends StoreRecord = StoreRecord> extends Component {
    onStoreLoadException: (ev: StoreEventMap<RecordType>['loadexception'] & {
        target: StoreType;
    }) => void;
    onBeforeStoreLoad: (ev: StoreEventMap<RecordType>['beforeload'] & {
        target: StoreType;
    }) => void;
    onStoreLoad: (ev: StoreEventMap<RecordType>['load'] & {
        target: StoreType;
    }) => void;
    onRecordRemove: (ev: StoreEventMap<RecordType>['remove'] & {
        target: StoreType;
    }) => void;
    onRecordAdd: (ev: StoreEventMap<RecordType>['add'] & {
        target: StoreType;
    }) => void;
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
        append: boolean;
    };
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
        append: boolean;
        /**
         * The loaded records
         */
        records: RecordType[];
    };
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
        reason: any;
    };
}
export type storeRecordType<StoreType> = StoreType extends Store<infer RecordType> ? RecordType : never;
/**
 * Generic data store used by components
 *
 * @category Data
 */
export declare class Store<RecordType extends StoreRecord = StoreRecord> extends Collection<RecordType, StoreEventMap<RecordType>> {
    queryParams: Record<string, any>;
    private _loading?;
    private _loaded;
    /**
     * Sort the data on field and direction
     */
    sort: Comparator[];
    /**
     * Defines the field that holds the record ID
     */
    idField: string;
    /**
     * Find record by ID
     *
     * @param id
     */
    findById(id: any): RecordType | undefined;
    findIndexById(id: any): number;
    /**
     * Register of all components bound to this store using {@link bindStore()}
     * @private
     */
    protected readonly components: Component[];
    /**
     * True when the store is loading
     */
    get loading(): Promise<RecordType[]> | undefined;
    /**
     * True when data has been loaded at least once
     */
    get loaded(): boolean;
    /**
     * Load a set of records
     *
     * @param records
     * @param append
     */
    loadData(records: RecordType[], append?: boolean): void;
    set data(records: RecordType[]);
    get data(): RecordType[];
    /**
     * Binds as component to this store so it can update when the store changes
     * @param comp
     */
    bindComponent(comp: StoreComponent<this, RecordType>): void;
    unbindComponent(comp: StoreComponent<this, RecordType>): void;
    /**
     * Reload the data from the source
     */
    reload(): Promise<RecordType[]>;
    clear(): this;
    /**
     * Pass this to implement custom loading logic
     */
    onLoad?: (store: Store) => Promise<void>;
    /**
     * Returns the loaded records. If append is true it only returns the new records.
     * Override this function for new store types.
     *
     * @param append
     * @protected
     */
    protected internalLoad(append: boolean): Promise<RecordType[]>;
    /**
     * Loads the data from source into the store
     *
     * @param append
     */
    load(append?: boolean): Promise<RecordType[]>;
    /**
     * Load the next set of records when paging.
     * Doesn't do anything in the array store but can be implemented in async stores.
     */
    loadNext(append?: boolean): Promise<RecordType[]>;
    /**
     * Load the next set of records when paging.
     * Doesn't do anything in the array store but can be implemented in async stores.
     */
    loadPrevious(): Promise<RecordType[]>;
    hasNext(): boolean;
    hasPrevious(): boolean;
    /**
     * Load more data when this element is scrolled down
     *
     * @param el
     */
    addScrollLoader(el: HTMLElement): () => void;
}
export type StoreConfig<RecordType extends StoreRecord = StoreRecord> = Omit<Config<Store<RecordType>>, "hasNext" | "loadPrevious" | "hasPrevious" | "loadNext" | "load" | "reload" | "clear" | "loadData" | "[SymbolConstructor.iterator]" | // does not work :(
"add" | "count" | "find" | "findIndex" | "first" | "forEach" | "get" | "getArray" | "has" | "indexOf" | "removeAt" | "remove" | "last" | "replace" | "insert">;
/**
 * Shorthand function to create a {@link Store}
 *
 * @param config
 */
export declare const store: <RecordType extends StoreRecord = StoreRecord>(config?: StoreConfig<RecordType>) => Store<RecordType>;
