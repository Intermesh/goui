import { Observable } from "../component/Observable.js";
import { ArrayUtil } from "../util/ArrayUtil.js";
/**
 * Data store
 */
export class Store extends Observable {
    constructor() {
        super(...arguments);
        this.records = [];
        this.loading = false;
        /**
         * Sort the data
         */
        this.sort = [];
    }
    static create(config) {
        return super.create(config);
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
    getRecordAt(index) {
        return this.records[index];
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
    findRecord(fn) {
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
    findRecordIndex(fn) {
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
    loadData(records, append = true) {
        this.records = append ? this.records.concat(records) : records;
        this.fire("load", this, records, append);
    }
    /**
     * Reload the data from the source
     */
    reload() {
        return this.load();
    }
    /**
     * Returns the loaded records. If append is true it only returns the new records.
     * Override this function for new store types.
     *
     * @param append
     * @protected
     */
    internalLoad(append) {
        this.loadData(ArrayUtil.multiSort(this.records, this.sort), append);
        return Promise.resolve(this.records);
    }
    /**
     * Loads the data from source into the store
     *
     * @param append
     */
    load(append = false) {
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
    loadNext(append = false) {
        return Promise.resolve([]);
    }
    /**
     * Load the next set of records when paging.
     * Doesn't do anything in the array store but can be implemented in async stores.
     */
    loadPrevious() {
        return Promise.resolve([]);
    }
    hasNext() {
        return false;
    }
    hasPrevious() {
        return false;
    }
}
//# sourceMappingURL=Store.js.map