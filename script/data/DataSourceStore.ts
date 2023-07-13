/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {Comparator, Store, StoreEventMap, StoreRecord} from "../data/Store.js";
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

	public relations?: Relation<dataSourceEntityType<DataSource>>;

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

	constructor(public dataSource:DataSource) {
		super();

		this.dataSource.on('change', (dataSource, changes) => {
			this.onChange(dataSource, changes);
		});
	}

	/**
	 * Reloads the store when the datasource changes
	 *
	 * @protected
	 */
	protected async onChange(DataSource:DataSource, changes: Changes<dataSourceEntityType<DataSource>>) {
		if (this.loaded && this.monitorChanges) {
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
			this.queryParams.limit--;
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
		let relationName: (keyof dataSourceEntityType<DataSource>);
		const promises = [];

		for (relationName in this.relations) {
			const rel = this.relations[relationName]!

			let id;
			for (let i = 0, l = records.length; i < l; i++) {
				id = ObjectUtil.path(records[i], rel.path);
				if (id) {
					promises.push(rel.dataSource.single(id).then((e) => {
						if (e) {
							records[i][relationName] = e as never;
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
			throw new Error("Limit and position must be set!");
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
}

// Somehow using Config<DataSourceStore...> didn't work because it uses dataSourceEntityType<DataSource>
// that's why we relist the props here.

type DataSourceStoreConfig<DataSource extends AbstractDataSource, RecordType> =

	// Config<DataSourceStore<DataSource, RecordType>, StoreEventMap<DataSourceStore<DataSource, RecordType>, RecordType>,  "dataSource" >
	//
	// &

	Omit<Config<Store<RecordType>>, "listeners"> &

	{
		queryParams?: QueryParams,

		dataSource: DataSource,

		buildRecord?: RecordBuilder<dataSourceEntityType<DataSource>, RecordType>,

		relations?: Relation<dataSourceEntityType<DataSource>>,

		listeners?: ObservableListener<StoreEventMap<DataSourceStore<DataSource, RecordType>,RecordType>>
	}





/**
 * Shorthand function to create a {@see DataSourceStore}
 *
 * @param config
 */
export const datasourcestore =
	<DataSource extends AbstractDataSource = AbstractDataSource, RecordType = dataSourceEntityType<DataSource>>(config: DataSourceStoreConfig<DataSource, RecordType>) => createComponent(new DataSourceStore<DataSource, RecordType>(config.dataSource), config);