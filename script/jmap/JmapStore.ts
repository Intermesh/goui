import {EntityStore, QueryParams} from "./EntityStore.js";
import {Store, StoreRecord} from "../data/Store.js";
import {client} from "./Client.js";
import {Config} from "../component/Component.js";

type Relation = Record<string, {
	entity: string,
	path: string,
	properties?: string[]
}>

/**
 * Data store for loading data via a JMAP API
 *
 * @example
 * ```
 * const store = jmapstore({
 * 		entity: "TaskList",
 * 		properties: ['id', 'name', 'support'],
 * 		queryParams: {
 * 			limit: 20,
 * 			filter: {
 * 				forSupport: true,
 * 				role: "support", //support tasklists
 * 			}
 * 		},
 * 		sort: [{property: "name", isAscending: true}]
 * 	});
 * ```
 */
export class JmapStore extends Store {
	private entityStore: EntityStore;

	private entity: string;

	public queryParams: QueryParams = {};

	public hasMore = false;

	public relations?: Relation;

	public properties?: string[] = []

	constructor(entity:string) {
		super();

		this.entity = entity;

		this.entityStore = client.store(this.entity);

		// very quick and dirty update on changes to the entity store.
		this.entityStore.on('change', async () => {
			await this.reload();
		});

	}


	protected internalLoad(append = false) {

		this.queryParams.sort = this.sort;
		this.queryParams.calculateHasMore = true;

		let records: StoreRecord[] = [];

		const promises = [
			this.entityStore.query(this.queryParams).then((response) => {
				this.hasMore = response.hasMore!;
			}),

			this.entityStore.get({
				resultOf: this.entityStore.client.lastCallId,
				path: "/ids"
			}, this.properties).then((response) => {
				records = response.list;
			})
		];

		const mainCallId = this.entityStore.client.lastCallId;

		for (let relationName in this.relations) {
			const r = this.relations[relationName];
			promises.push(client.store(r.entity).get({
				resultOf: mainCallId,
				path: "/list/*/" + r.path
			}, r.properties || []).then((response) => {

				for (let i = 0, l = records.length; i < l; i++) {
					const id = records[i][r.path];
					if (id) {
						const related = response.list.find((e) => {
							return e.id == id;
						});

						if (related) {
							records[i][relationName] = related;
						}
					}
				}

			}))
		}

		return Promise.all(promises).then(() => {
			this.loadData(records, append);
			return records;
		});
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

/**
 * Shorthand function to create store
 *
 * @param config
 */
export const jmapstore = (config: Config<JmapStore> & {entity: string}) => {
	const s = new JmapStore(config.entity)
	Object.assign(s, config);

	return s;
};