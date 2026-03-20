/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Store, StoreComponent, StoreConfig, StoreEventMap, StoreRecord } from "../data/Store.js";
import { AbstractDataSource, BaseEntity, dataSourceEntityType, DataSourceEventMap, DefaultEntity, Filter, QueryParams } from "./AbstractDataSource.js";
import { ListenersConfig } from "../component/index.js";
/**
 * Entity relation
 */
type Relation<EntityType extends BaseEntity> = Partial<Record<keyof EntityType, {
    /**
     * Data source to get relation from
     */
    dataSource: AbstractDataSource<EntityType, DataSourceEventMap>;
    /**
     * JSON pointer to relation key
     *
     * @see ObjectUtil.get()
     */
    path: string;
}>>;
type RecordBuilder<EntityType, StoreRecord> = (entity: EntityType) => Promise<StoreRecord> | StoreRecord;
/**
 * DataSourceStore class
 *
 * Uses an {@link AbstractDataSource} to present data in the view.
 * @category Data
 */
export declare class DataSourceStore<DataSource extends AbstractDataSource = AbstractDataSource, RecordType extends StoreRecord = dataSourceEntityType<DataSource>> extends Store<RecordType> {
    dataSource: DataSource;
    queryParams: Omit<QueryParams, "sort">;
    hasMore: boolean;
    /**
     * En entity relations
     */
    relations?: Relation<DefaultEntity>;
    /**
     * The server properties required
     */
    properties: string[];
    /**
     * Reload when the datasource changes
     */
    monitorChanges: boolean;
    /**
     * Builds record from entity
     * @param entity
     */
    buildRecord: RecordBuilder<dataSourceEntityType<DataSource>, RecordType>;
    onBeforeLoad?: <T extends RecordType>(records: T[]) => Promise<T[]>;
    constructor(dataSource: DataSource);
    private listening;
    /**
     * Reloads the store when the datasource changes
     *
     * @protected
     */
    protected onDSChange(): void;
    bindComponent(comp: StoreComponent<this, RecordType>): void;
    private listen;
    unbindComponent(comp: StoreComponent<this, RecordType>): void;
    protected internalLoad(append?: boolean): Promise<(Awaited<RecordType> | Awaited<RecordType>)[]>;
    protected buildRecords(entities: dataSourceEntityType<DataSource>[]): Promise<(Awaited<RecordType> | Awaited<RecordType>)[]>;
    private fetchRelations;
    private keepPosition;
    reload(): Promise<RecordType[]>;
    load(append?: boolean): Promise<RecordType[]>;
    loadNext(append?: boolean): Promise<RecordType[]>;
    loadPrevious(): Promise<RecordType[]>;
    hasNext(): boolean;
    hasPrevious(): boolean;
    /**
     * Patch an existing filter with extra filter options
     *
     * @param ref
     * @param filter
     */
    patchFilter(ref: string, filter: Filter | undefined): this;
    private filters;
    /**
     * Set a filter for the {@link AbstractDataSource::query()} method
     *
     * @param ref A reference name so it can be replaced later by the component.
     * @param filter
     */
    setFilter(ref: string, filter: Filter | undefined): this;
    clearFilter(...names: string[]): void;
    getFilter(name: string): any;
}
export type DataSourceStoreConfig<DataSource extends AbstractDataSource, RecordType extends StoreRecord> = Omit<StoreConfig<RecordType>, "listeners"> & {
    /**
     * The server properties required
     */
    properties?: string[];
    /**
     * Query parameters to send
     */
    queryParams?: QueryParams;
    /**
     * Data source
     */
    dataSource: DataSource;
    /**
     * Function to build a record from the entity.
     * Defaults to returning just the entity
     */
    buildRecord?: RecordBuilder<dataSourceEntityType<DataSource>, RecordType>;
    /**
     * Can be provided so you can alter the records from the API
     *
     * @param records
     */
    onBeforeLoad?: <T extends RecordType>(records: T[]) => Promise<T[]>;
    /**
     * Fetch relations of the entity
     */
    relations?: Relation<DefaultEntity>;
    /**
     * Event listeners
     */
    listeners?: ListenersConfig<DataSourceStore<DataSource, RecordType>, StoreEventMap<RecordType>>;
    /**
     * Filters for the query
     */
    filters?: Record<string, Record<string, any>>;
};
/**
 * Shorthand function to create a {@link DataSourceStore}
 *
 * @param config
 */
export declare const datasourcestore: <DataSource extends AbstractDataSource = AbstractDataSource, RecordType extends StoreRecord = dataSourceEntityType<DataSource>>(config: DataSourceStoreConfig<DataSource, RecordType>) => DataSourceStore<DataSource, RecordType>;
export {};
