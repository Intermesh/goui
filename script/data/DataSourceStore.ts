/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {Store, StoreRecord} from "../data/Store.js";
import {AbstractDataSource, QueryParams} from "./AbstractDataSource.js";
import {ObjectUtil} from "../util/index.js";
import {Config, createComponent, Table, TableColumn} from "../component/index.js";

type Relation<RecordType> = Record<keyof RecordType, {
	dataSource: AbstractDataSource,
	path: string
}>


export class DataSourceStore<RecordType extends StoreRecord = StoreRecord> extends Store<RecordType> {

	public queryParams: QueryParams = {};

	public hasMore = false;

	public relations?: Relation<RecordType>;

	public properties?: string[] = [];

	/**
	 * True when loaded at least once.
	 */
	private loaded = false;

	constructor(private dataSource:AbstractDataSource) {
		super();

		// very quick and dirty update on changes to the entity store.
		this.dataSource.on('change', async () => {
			if(this.loaded) {
				await this.reload();
			}
		});

	}


	protected async internalLoad(append = false) {

		this.queryParams.sort = this.sort;

		const queryResponse = await this.dataSource.query(this.queryParams);
		const getResponse = await this.dataSource.get(queryResponse.ids);

		const records = await this.fetchRelations(getResponse.list as RecordType[]);

		this.loadData(records, append);
		this.loaded = true;

		return records;
	}

	private async fetchRelations(records: RecordType[]) {
		if(!this.relations) {
			return records;
		}
		let relationName: (keyof RecordType);

		for (relationName in this.relations) {
			const rel = this.relations[relationName]!

			let id;
			for(let i = 0, l = records.length; i > l; i++) {
				id = ObjectUtil.path(records[i], rel.path);
				const getResponse = await rel.dataSource.get([id]);
				records[i][relationName] = getResponse.list[0] as never || undefined;
			}

		}

		return records;
	}

	reload(): Promise<RecordType[]> {
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
}


type DataSourceStoreConfig<RecordType extends StoreRecord = StoreRecord> = Config<DataSourceStore<RecordType>> & {
	/**
	 * Store that provides the data
	 */
	dataSource: AbstractDataSource
}


/**
 * Shorthand function to create a {@see DataSourceStore}
 *
 * @param config
 */
export const datasourcestore = <RecordType extends StoreRecord = StoreRecord>(config: DataSourceStoreConfig<RecordType>) => createComponent(new DataSourceStore<RecordType>(config.dataSource), config);