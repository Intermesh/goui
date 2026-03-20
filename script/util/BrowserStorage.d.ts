/**
 * Connection
 *
 * Creates an indexed DB connection
 *
 * @category Utility
 */
declare class Connection {
    private dbName;
    private conn?;
    constructor(dbName?: string);
    enabled: boolean;
    private version?;
    upgrading: boolean;
    /**
     * Workaround safari / webkit bug:
     *
     *  https://bugs.webkit.org/show_bug.cgi?id=226547
     * @return {*|Promise}
     */
    private idbReady;
    /**
     * If upgrade is pending this promise resolves when done.
     */
    upgradeReady(): Promise<unknown>;
    /**
     * Connect to the database
     */
    connect(): Promise<IDBDatabase>;
    /**
     * Prepare database for upgrade.
     *
     * When resolved it MUST set conn.upgrading to false.
     */
    upgrade(): Promise<IDBVersionChangeEvent>;
    /**
     * Disconnect from the database
     */
    disconnect(): void;
    /**
     * Delete the entire database
     */
    deleteDatabase(): Promise<unknown>;
}
/**
 * Singleton connection object
 *
 * @category Utility
 */
export declare const browserStoreConnection: Connection;
/**
 * Browser Store
 *
 * Wrapper around an indexeddb objectstore
 *
 * @category Utility
 */
export declare class BrowserStore {
    storeName: string;
    constructor(storeName: string);
    private getStore;
    private createStore;
    private requestPromise;
    /**
     * Get an item from the store
     * returns undefined if not found.
     *
     * @param key
     */
    getItem(key: IDBValidKey): Promise<any>;
    /**
     * Set an item
     *
     * @param key
     * @param value
     */
    setItem(key: IDBValidKey, value: any): Promise<boolean>;
    /**
     * Remove an item
     *
     * @param key
     */
    removeItem(key: IDBValidKey): Promise<IDBValidKey>;
    /**
     * Clear all data from this store
     */
    clear(): Promise<void | null>;
    keys(): Promise<unknown>;
}
export {};
