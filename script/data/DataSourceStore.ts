/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {Store, StoreComponent, StoreConfig, StoreEventMap, StoreRecord} from "../data/Store.js";
import {
	AbstractDataSource,
	BaseEntity,
	Changes,
	dataSourceEntityType,
	DefaultEntity,
	QueryParams,
	Filter
} from "./AbstractDataSource.js";
import {ObjectUtil} from "../util/index.js";
import {comp, createComponent, ObservableListener} from "../component/index.js";


/**
 * Entity relation
 */
type Relation<EntityType extends BaseEntity> = Partial<Record<keyof EntityType, {
	/**
	 * Data source to get relation from
	 */
	dataSource: AbstractDataSource<EntityType>,

	/**
	 * JSON pointer to relation key
	 *
	 * @see ObjectUtil.get()
	 */
	path: string
}>>

type RecordBuilder<EntityType, StoreRecord> = (entity: EntityType) => Promise<StoreRecord>;

/**
 * DataSourceStore class
 *
 * Uses an {@see AbstractDataSource} to present data in the view.
 * @category Data
 */
export class DataSourceStore<
	DataSource extends AbstractDataSource = AbstractDataSource,
	RecordType extends StoreRecord = dataSourceEntityType<DataSource>> extends Store<RecordType> {

	public queryParams: Omit<QueryParams, "sort"> = {};

	public hasMore = false;

	/**
	 * En entity relations
	 */
	public relations?: Relation<DefaultEntity>;

	// public properties?: string[] = [];


	/**
	 * Reload when the datasource changes
	 */
	public monitorChanges = true;

	/**
	 * Builds record from entity
	 * @param entity
	 */
	public buildRecord: RecordBuilder<dataSourceEntityType<DataSource>, RecordType> = async (entity) => <RecordType><unknown>entity;
	// private bufferedLoad?: (...args:any[]) => Promise<StoreRecord[]>;

	constructor(public dataSource:DataSource) {
		super();


	}

	private listening = false;

	/**
	 * Reloads the store when the datasource changes
	 *
	 * @protected
	 */
	protected onDSChange(DataSource:DataSource, changes: Changes) {
		if (this.loaded && this.monitorChanges && !this.loading) {
			void this.reload();
		}
	}

	bindComponent(comp: StoreComponent<this>) {
		super.bindComponent(comp);

		if(!this.listening) {
			this.dataSource.on('change', this.onDSChange, {bind: this});
			this.listening = true;
		}

	}

	unbindComponent(comp: StoreComponent<this>) {
		super.unbindComponent(comp);

		if(!this.components.length) {
			this.dataSource.un("change", this.onDSChange);
			this.listening = false;
		}
	}


	protected async internalLoad(append = false) {

		const queryParams:QueryParams = structuredClone(this.queryParams);
		queryParams.sort = this.sort;

		if (queryParams.limit) {
			//to see if the remote has more data we query one ID more.
			queryParams.limit++;
		}

		const queryResponse = await this.dataSource.query(queryParams);

		if (this.queryParams.limit) {
			// check if the server has more data.
			this.hasMore = queryResponse.ids.length > this.queryParams.limit;
			if (this.hasMore) {
				queryResponse.ids.pop();
			}
		}

		const getResponse = await this.dataSource.get(queryResponse.ids);

		const entities = await this.fetchRelations(getResponse.list as dataSourceEntityType<DataSource>[]),
			records = await Promise.all(entities.map(this.buildRecord));

		this.loadData(records, append);

		return records;
	}

	private async fetchRelations(records: dataSourceEntityType<DataSource>[]) {
		if (!this.relations) {
			return records;
		}
		const promises = [];

		for (const relationName in this.relations) {
			const rel = this.relations[relationName as keyof DefaultEntity]!;

			let id;
			for (let i = 0, l = records.length; i < l; i++) {
				id = ObjectUtil.get(records[i], rel.path);

				if (id) {
					promises.push(rel.dataSource.single(id).then((e) => {
						if (e) {
							records[i][relationName as (keyof dataSourceEntityType<DataSource>)] = e as never;
						}
					}));
				}
			}
		}

		return Promise.all(promises).then(() => records);
	}

	private keepPosition = false;

	reload(): Promise<RecordType[]> {
		const limit = this.queryParams.limit, pos = this.queryParams.position ;
		this.queryParams.position = 0;
		if(limit) {
			this.queryParams.limit = Math.max(limit, this.data.length);
		}

		this.keepPosition = true;
		const r = super.reload();
		this.keepPosition = false;
		this.queryParams.limit = limit;
		this.queryParams.position = pos;

		return r;
	}

	load(append: boolean = false): Promise<RecordType[]> {
		if(!this.keepPosition) {
			this.queryParams.position = 0;
		}
		return super.load(append);
	}

	public loadNext(append = false) {
		if (!this.queryParams.limit) {
			throw new Error("Limit must be set for pagination");
		}

		this.queryParams.position = this.queryParams.position || 0;
		this.queryParams.position += this.queryParams.limit;

		this.keepPosition = true;
		const r = this.load(append);
		this.keepPosition = false;
		return r;
	}

	loadPrevious(): Promise<RecordType[]> {
		if (!this.queryParams.limit) {
			throw new Error("Limit and position must be set!");
		}

		this.queryParams.position = this.queryParams.position || 0;
		this.queryParams.position -= this.queryParams.limit;

		return this.load(false);
	}

	public hasNext() {
		return this.hasMore;
	}

	public hasPrevious() {
		return this.queryParams.position! > 0;
	}


	/**
	 * Patch an existing filter with extra filter options
	 *
	 * @param ref
	 * @param filter
	 */
	public patchFilter(ref: string, filter: Filter | undefined) {
		const f = this.getFilter(ref) ?? {};

		return this.setFilter(ref, Object.assign(f, filter));
	}

	private filters: Record<string, any> = {};

	/**
	 * Set a filter for the {@see AbstractDataSource::query()} method
	 *
	 * @param ref A reference name so it can be replaced later by the component.
	 * @param filter
	 */
	public setFilter(ref: string, filter: Filter | undefined) {

		if (filter === undefined) {
			delete this.filters[ref];
		} else {
			this.filters[ref] = filter;
		}

		const conditions = [];
		for (const k in this.filters) {
			conditions.push(this.filters[k]);
		}

		switch (conditions.length) {
			case 0:
				delete this.queryParams.filter;
				break;
			case 1:
				this.queryParams.filter = conditions[0];
				break;
			default:
				this.queryParams.filter = {
					operator: "AND",
					conditions: conditions
				};
				break;
		}

		return this;
	}

	public clearFilter(...names: string[]) {
		names.forEach(n => this.setFilter(n, undefined));
	}

	public getFilter(name: string) {
		return this.filters[name];
	}
}

// Somehow using Config<DataSourceStore...> didn't work because it uses dataSourceEntityType<DataSource>
// that's why we relist the props here.

export type DataSourceStoreConfig<DataSource extends AbstractDataSource, RecordType extends StoreRecord> =

	// Config<DataSourceStore<DataSource, RecordType>, StoreEventMap<DataSourceStore<DataSource, RecordType>, RecordType>,  "dataSource" >
	//
	// &

	Omit<StoreConfig<RecordType>, "listeners"> &

	{
		queryParams?: QueryParams,

		dataSource: DataSource,

		buildRecord?: RecordBuilder<dataSourceEntityType<DataSource>, RecordType>,

		relations?: Relation<DefaultEntity>,

		listeners?: ObservableListener<StoreEventMap<DataSourceStore<DataSource, RecordType>,RecordType>>

		filters?: Record<string, Record<string, any>>
	}


/**
 * Shorthand function to create a {@see DataSourceStore}
 *
 * @param config
 */
export const datasourcestore =
	<DataSource extends AbstractDataSource = AbstractDataSource, RecordType extends StoreRecord = dataSourceEntityType<DataSource>>(config: DataSourceStoreConfig<DataSource, RecordType>) => {

		let f;
		if(config.filters) {
			f = config.filters;
			delete config.filters;
		}
	  const store = createComponent(new DataSourceStore<DataSource, RecordType>(config.dataSource), config);

		if(f) {
			for (const filterName in f) {
        store.setFilter(filterName, f[filterName]);
      }
		}


		return store;
	}