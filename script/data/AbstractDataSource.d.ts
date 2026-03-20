/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Observable, ObservableEventMap } from "../component/index.js";
import { Comparator } from "./Store.js";
/**
 * The response of the {@link AbstractDataSource.get()} method
 * @category Data
 */
export interface GetResponse<EntityType extends BaseEntity> {
    /**
     * The list of entities in the order they were requested
     */
    list: EntityType[];
    /**
     * If an ID is not found on the server it will be in this list
     */
    notFound?: EntityID[];
    /**
     * The state of the server
     */
    state?: string;
}
/**
 * @category Data
 */
export interface SetRequest<EntityType> {
    [key: string]: any;
    create: Record<EntityID, Partial<EntityType>>;
    update: Record<EntityID, Partial<EntityType>>;
    destroy: EntityID[];
    ifInstate?: string;
}
/**
 * @category Data
 */
export declare enum CommitErrorType {
    'forbidden' = 0,
    'overQuota' = 1,
    'tooLarge' = 2,
    'rateLimit' = 3,
    'notFound' = 4,
    'invalidPatch' = 5,
    'willDestroy' = 6,
    'invalidProperties' = 7,
    'singleton' = 8,
    'requestTooLarge' = 9,
    'stateMismatch' = 10
}
export type CommitEntityError = Record<EntityID, CommitError>;
/**
 * The base of an entity. It should at lease have an "id" property.
 * @category Data
 */
export interface BaseEntity {
    id: EntityID;
}
/**
 * Default entity
 *
 * Allows any property.
 * @category Data
 */
export interface DefaultEntity extends BaseEntity {
    [key: string]: any;
}
export type NewEntity<Type> = Omit<Type, "id">;
/**
 * @category Data
 */
export interface CommitError {
    type: CommitErrorType;
    description?: string;
}
/**
 * @category Data
 */
export interface Changes {
    /**
     * Created entity ID's given by the server.
     */
    created?: EntityID[];
    /**
     * Updated entity ID's
     */
    updated?: EntityID[];
    /**
     * Destroyed entity ID's
     */
    destroyed?: EntityID[];
    /**
     * New server state
     */
    newState?: string;
    /**
     * Old state before these changes
     */
    oldState?: string;
    /**
     * True if there are more changes to follow from the server
     */
    hasMoreChanges?: boolean;
}
/**
 * @category Data
 */
export interface CommitResponse<EntityType extends BaseEntity> {
    created?: Record<EntityID, EntityType>;
    updated?: Record<EntityID, EntityType>;
    destroyed?: EntityID[];
    notCreated?: CommitEntityError;
    notUpdated?: CommitEntityError;
    notDestroyed?: CommitEntityError;
    newState?: string;
    oldState?: string;
}
export interface MergeResponse<EntityType extends BaseEntity> {
    destroyed: EntityID[];
    id: EntityID;
    newState: string;
    oldState: string;
    updated: Record<EntityID, EntityType>;
}
/**
 * @category Data
 */
export type EntityID = string;
export type Filter = {
    operator?: "AND" | "OR" | "NOT";
    conditions?: Filter[];
    [key: string]: any;
};
/**
 * Paramaters for the query() method
 * @category Data
 */
export interface QueryParams {
    /**
     * The maximum number of ID's to return
     */
    limit?: number;
    /**
     * Start at this position
     */
    position?: number;
    /**
     * Return a "total" number of entities in the response.
     */
    calculateTotal?: boolean;
    /**
     * Sort the results
     */
    sort?: Comparator[];
    /**
     * Extra URL parameters
     */
    urlQueryParams?: Record<string, string>;
    /**
     * Filters for the query operation
     */
    filter?: Filter;
}
export interface QueryResponse<EntityType> {
    /**
     * The entity ID's in the correct order
     */
    ids: EntityID[];
    /**
     * If calculateTotal was set to true this will show the total number of results
     */
    total?: number;
    /**
     * The state of the query on the server
     */
    queryState?: string;
    /**
     * Some data sources may return full data objects because not all backends support sync like JMAP.
     *
     * For REST it makes more sense to return the full objects with query.
     */
    list?: EntityType[];
}
/**
 * @category Data
 */
export interface DataSourceEventMap extends ObservableEventMap {
    /**
     * Fires when data changed in the store
     */
    change: {
        changes: Changes;
    };
}
export type dataSourceEntityType<DS> = DS extends AbstractDataSource<infer EntityType> ? EntityType : never;
type SaveData<EntityType extends BaseEntity> = {
    data: Partial<EntityType>;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
    promise?: Promise<EntityType>;
};
interface DestroyData {
    resolve: (value: EntityID) => void;
    reject: (reason?: any) => void;
}
type GetData = {
    resolves: ((value: any | undefined) => void)[];
    rejects: ((reason?: any) => void)[];
    properties: string[];
};
/**
 * Abstract DataSource class
 *
 * A DataSource collection is a single source of truth for all types of data.
 * When the DataSource changes it fires an event. All components and stores listen to the
 * 'change' event to update themselves. This approach reduces the amount of code that has
 * to be written and maintained.
 *
 * Use a {@link DataSourceStore} in components to list data from datasources.
 * The {@link Form} component can also load from a datasource.
 *
 * @link https://goui.io/#data Examples
 *
 * @category Data
 */
export declare abstract class AbstractDataSource<EntityType extends BaseEntity = DefaultEntity, EventMap extends DataSourceEventMap = DataSourceEventMap> extends Observable<EventMap> {
    readonly id: string;
    /**
     * JMAP state
     *
     * @private
     */
    private _state?;
    private readonly delayedCommit;
    private readonly delayedGet;
    private _browserStore?;
    /**
     * Store data in the browser storage so it will persist across sessions
     */
    persist: boolean;
    /**
     * Extra parameters to send to the Foo/set
     */
    commitBaseParams: {};
    /**
     * Extra /set parameters that will reset after commit
     */
    setParams: {
        [key: string]: any;
    };
    /**
     * Get the local server state ID of the store
     * @protected
     */
    getState(): Promise<string | undefined>;
    /**
     * Set's the local server state ID
     *
     * Setting it to undefined will reset the store.
     *
     * @param state
     * @protected
     */
    protected setState(state: string | undefined): Promise<boolean | undefined>;
    clearCache(): Promise<void | null>;
    /**
     * Get the browser storage object to save state to the browser
     * @private
     */
    private get browserStore();
    constructor(id: string);
    protected data: Record<EntityID, EntityType>;
    protected creates: Record<EntityID, SaveData<EntityType>>;
    protected updates: Record<EntityID, SaveData<EntityType>>;
    protected destroys: Record<EntityID, DestroyData>;
    protected getIds: Record<EntityID, GetData>;
    private allIds?;
    /**
     * Get entities from the store
     *
     * It will return a list of entities ordered by the requested ID's
     *
     * @param ids
     * @param properties
     */
    get(ids?: EntityID[], properties?: string[]): Promise<GetResponse<EntityType>>;
    protected add(data: EntityType): Promise<EntityType>;
    protected remove(id: EntityID): Promise<string>;
    /**
     * Get a single entity.
     *
     * Multiple calls will be buffered and returned together on the next event loop. This way multiple calls can
     * be joined together in a single HTTP request to the server.
     *
     * @param id
     * @param properties
     */
    single(id: EntityID, properties?: string[]): Promise<EntityType>;
    protected returnGet(data: EntityType): void;
    private hasData;
    /**
     * Does the actual getting of entities. First checks if present in this object, otherwise it will be requested
     * from the remote source.
     *
     * @protected
     */
    protected doGet(): Promise<void>;
    /**
     * Implements getting entities from a remote source
     *
     * @param ids
     * @param properties
     * @protected
     */
    protected abstract internalGet(ids: EntityID[], properties: string[]): Promise<GetResponse<EntityType>>;
    /**
     * Create entity
     *
     * Multiple calls will be joined together in a single call on the next event loop
     *
     * @param data
     * @param createId The create ID to use when committing this entity to the server
     */
    create(data: Partial<EntityType>, createId?: EntityID): Promise<EntityType>;
    /**
     * Reset the data source.
     *
     * Clears all data and will resync
     */
    reset(): Promise<void | null>;
    /**
     * Update an entity
     *
     * Multiple calls will be joined together in a single call on the next event loop
     *
     * @param id
     * @param data
     */
    update(id: EntityID, data: Partial<EntityType>): Promise<EntityType>;
    private _createId;
    private createID;
    /**
     * Destroy an entity
     *
     * Multiple calls will be joined together in a single call on the next event loop
     *
     * @param id
     */
    destroy(id: EntityID): Promise<EntityID>;
    /**
     * Ask for confirmation and delete entities by ID
     *
     * @example
     * ```
     * const tbl = this.projectTable!,
     * 	ids = tbl.rowSelection!.selected.map(index => tbl.store.get(index)!.id);
     *
     * const result = await jmapds("Project3")
     * 	.confirmDestroy(ids);
     *
     * if(result != false) {
     * 	btn.parent!.hide();
     * }
     * ```
     * @param ids The ID's to delete
     */
    confirmDestroy(ids: EntityID[]): Promise<false | string[]>;
    /**
     * Fetch updates from remote
     */
    updateFromServer(): Promise<void>;
    /**
     * Implements fetching updates from remote
     *
     * @protected
     */
    protected abstract internalRemoteChanges(state: string | undefined): Promise<Changes>;
    /**
     * Commit pending changes to remote
     */
    private commit;
    /**
     * Implements commit (save and destroy) to the remote source
     * @protected
     */
    protected abstract internalCommit(params: SetRequest<EntityType>): Promise<CommitResponse<EntityType>>;
    /**
     * Query the server for a list of entity ID's
     *
     * It takes filters and sort parameters.
     *
     * @link https://jmap.io/spec-core.html#query
     */
    query(params?: QueryParams): Promise<QueryResponse<EntityType>>;
    /**
     * Check's if we are up-to-date with the server and fetches updates if needed.
     *
     * If no state is returned by the data source this function will ignore states and the data source should then
     * always refresh data.
     *
     * @param serverState
     * @param retVal
     * @private
     */
    protected checkState<T>(serverState: string | undefined, retVal: T): Promise<T>;
    /**
     * Handle the query to the remote
     * @param params
     */
    protected abstract internalQuery(params: QueryParams): Promise<QueryResponse<EntityType>>;
    /**
     * Merge duplicated entities into one
     *
     * @param ids
     */
    merge(ids: EntityID[]): Promise<MergeResponse<EntityType>>;
    protected abstract internalMerge(ids: EntityID[]): Promise<MergeResponse<EntityType>>;
}
export {};
