/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {Store, StoreRecord} from "../data/Store.js";
import {AbstractDataSource, BaseEntity, DefaultEntity, QueryParams} from "./AbstractDataSource.js";
import {ObjectUtil} from "../util/index.js";
import {Config, createComponent, Table, TableColumn} from "../component/index.js";

type Relation<EntityType extends BaseEntity> = Record<keyof EntityType, {
	dataSource: AbstractDataSource,
	path: string
}>


/**
 * DataSourceStore class
 *
 * Uses an {@see AbstractDataSource} to present data in the view.
 */
export class DataSourceStore<EntityType extends BaseEntity = DefaultEntity> extends Store<EntityType> {

	public queryParams: QueryParams = {};

	public hasMore = false;

	public relations?: Relation<EntityType>;

	public properties?: string[] = [];

	/**
	 * True when loaded at least once.
	 */
	private loaded = false;

	constructor(private dataSource:AbstractDataSource<EntityType>) {
		super();

		// very quick and dirty update on changes to the entity store.
		this.dataSource.on('change', async () => {
			if(this.loaded) {
				this.reload();
			}
		});
	}


	protected async internalLoad(append = false) {

		this.queryParams.sort = this.sort;

		if(this.queryParams.limit) {
			//to see if the remote has more data we query one ID more.
			this.queryParams.limit++;
		}

		const queryResponse = await this.dataSource.query(this.queryParams);

		if(this.queryParams.limit) {
			// check if the server has more data.
			this.queryParams.limit--;
			this.hasMore = queryResponse.ids.length > this.queryParams.limit;
			if(this.hasMore) {
				queryResponse.ids.pop();
			}
		}

		const getResponse = await this.dataSource.get(queryResponse.ids);

		const records = await this.fetchRelations(getResponse.list);

		this.loadData(records, append);
		this.loaded = true;

		return records;
	}

	private async fetchRelations(records: EntityType[]) {
		if(!this.relations) {
			return records;
		}
		let relationName: (keyof EntityType);
		const promises = [];

		for (relationName in this.relations) {
			const rel = this.relations[relationName]!

			let id;
			for(let i = 0, l = records.length; i < l; i++) {
				id = ObjectUtil.path(records[i], rel.path);
				if(id) {
					promises.push(rel.dataSource.single(id).then((e) => {
						if(e) {
							records[i][relationName] = e as never;
						}
					}));
				}
			}
		}

		return Promise.all(promises).then(() => records);
	}

	reload(): Promise<EntityType[]> {
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

	loadPrevious(): Promise<EntityType[]> {
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


type DataSourceStoreConfig<EntityType extends BaseEntity = DefaultEntity> = Config<DataSourceStore<EntityType>> & {
	/**
	 * Store that provides the data
	 */
	dataSource: AbstractDataSource<EntityType>
}


/**
 * Shorthand function to create a {@see DataSourceStore}
 *
 * @param config
 */
export const datasourcestore =
	<EntityType extends BaseEntity = DefaultEntity>(config: DataSourceStoreConfig<EntityType>) => createComponent(new DataSourceStore<EntityType>(config.dataSource), config);