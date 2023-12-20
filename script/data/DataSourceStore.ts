/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {store, Store, StoreEventMap} from "../data/Store.js";
import {
	AbstractDataSource,
	BaseEntity,
	Changes,
	dataSourceEntityType,
	DefaultEntity,
	QueryParams
} from "./AbstractDataSource.js";
import {ObjectUtil} from "../util/index.js";
import {Config, createComponent, ObservableListener} from "../component/index.js";
import {config} from "chai";

type Relation<EntityType extends BaseEntity> = Partial<Record<keyof EntityType, {
	dataSource: AbstractDataSource<EntityType>,
	path: string
}>>

type RecordBuilder<EntityType, StoreRecord> = (entity: EntityType) => Promise<StoreRecord>;

/**
 * DataSourceStore class
 *
 * Uses an {@see AbstractDataSource} to present data in the view.
 * @category Data
 */
export class DataSourceStore<DataSource extends AbstractDataSource = AbstractDataSource, StoreRecord = dataSourceEntityType<DataSource>> extends Store<StoreRecord> {

	public queryParams: Omit<QueryParams, "sort"> = {};

	public hasMore = false;

	public relations?: Relation<DefaultEntity>;

	// public properties?: string[] = [];

	/**
	 * True when loaded at least once.
	 */
	private loaded = false;

	/**
	 * Reload when the datasource changes
	 */
	public monitorChanges = true;

	/**
	 * Builds record from entity
	 * @param entity
	 */
	public buildRecord: RecordBuilder<dataSourceEntityType<DataSource>, StoreRecord> = async (entity) => <StoreRecord><unknown>entity;
	// private bufferedLoad?: (...args:any[]) => Promise<StoreRecord[]>;

	constructor(public dataSource:DataSource) {
		super();

		this.dataSource.on('change', (dataSource, changes) => {
			void this.onChange(dataSource, changes);
		});
	}

	/**
	 * Reloads the store when the datasource changes
	 *
	 * @protected
	 */
	protected async onChange(DataSource:DataSource, changes: Changes) {
		if (this.loaded && this.monitorChanges && !this.loading) {
			void this.reload();
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
		this.loaded = true;

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
				id = ObjectUtil.path(records[i], rel.path);

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

	reload(): Promise<StoreRecord[]> {
		this.queryParams.position = 0;
		return super.reload();
	}

	public loadNext(append = false) {
		if (!this.queryParams.limit) {
			throw new Error("Limit must be set for pagination");
		}

		this.queryParams.position = this.queryParams.position || 0;
		this.queryParams.position += this.queryParams.limit;

		return this.load(append);
	}

	loadPrevious(): Promise<StoreRecord[]> {
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
		this.on("load", (store, records, append) => {
			// use set timeout otherwise this.loading is still true
			setTimeout(() => {
				onScroll();
			})
		});

		return onScroll;
	}

	public patchFilter(ref: string, filter:any | undefined) {
		const f = this.getFilter(ref) ?? {};

		return this.setFilter(ref, Object.assign(f, filter));
	}

	private filters: Record<string, any> = {};

	public setFilter(ref: string, filter: any | undefined) {

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

export type DataSourceStoreConfig<DataSource extends AbstractDataSource, RecordType> =

	// Config<DataSourceStore<DataSource, RecordType>, StoreEventMap<DataSourceStore<DataSource, RecordType>, RecordType>,  "dataSource" >
	//
	// &

	Omit<Config<Store<RecordType>>, "listeners"> &

	{
		queryParams?: QueryParams,

		dataSource: DataSource,

		buildRecord?: RecordBuilder<dataSourceEntityType<DataSource>, RecordType>,

		relations?: Relation<DefaultEntity>,

		listeners?: ObservableListener<StoreEventMap<DataSourceStore<DataSource, RecordType>,RecordType>>

		filters?: Record<string, any>
	}





/**
 * Shorthand function to create a {@see DataSourceStore}
 *
 * @param config
 */
export const datasourcestore =
	<DataSource extends AbstractDataSource = AbstractDataSource, RecordType = dataSourceEntityType<DataSource>>(config: DataSourceStoreConfig<DataSource, RecordType>) => {

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