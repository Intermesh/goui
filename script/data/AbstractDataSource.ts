/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Observable, ObservableEventMap, ObservableListenerOpts, root, Window} from "../component/index.js";
import {Comparator} from "./Store.js";
import {FunctionUtil} from "../util/index.js";
import {BrowserStore} from "../util/BrowserStorage.js";
import {t} from "../Translate.js";
import {RouterEventMap} from "../Router.js";

/**
 * The response of the {@see AbstractDataSource.get()} method
 * @category Data
 */
export interface GetResponse<EntityType extends BaseEntity> {

	/**
	 * The list of entities in the order they were requested
	 */
	list: EntityType[],

	/**
	 * If an ID is not found on the server it will be in this list
	 */
	notFound?: EntityID[],

	/**
	 * The state of the server
	 */
	state?: string
}

/**
 * @category Data
 */
export interface SetRequest<EntityType> {
	[key:string]: any
	create: Record<EntityID, Partial<EntityType>>
	update: Record<EntityID, Partial<EntityType>>
	destroy: EntityID[],
	ifInstate?: string
}

/**
 * @category Data
 */
export enum CommitErrorType {
	'forbidden',
	'overQuota',
	'tooLarge',
	'rateLimit',
	'notFound',
	'invalidPatch',
	'willDestroy',
	'invalidProperties',
	'singleton',
	'requestTooLarge',
	'stateMismatch'
}

export type CommitEntityError = Record<EntityID, CommitError>

/**
 * The base of an entity. It should at lease have an "id" property.
 * @category Data
 */
export interface BaseEntity {
	id: EntityID
}

/**
 * Default entity
 *
 * Allows any property.
 * @category Data
 */
export interface DefaultEntity extends BaseEntity {
	[key: string]: any
}

export type NewEntity<Type> = Omit<Type, "id">
/**
 * @category Data
 */
export interface CommitError {
	type: CommitErrorType
	description?: string
}

/**
 * @category Data
 */
export interface Changes {
	created?: EntityID[]
	updated?: EntityID[]
	destroyed?: EntityID[],
	newState?: string,
	oldState?: string,
	hasMoreChanges?: boolean
}

/**
 * @category Data
 */
export interface CommitResponse<EntityType extends BaseEntity> {

	created?: Record<EntityID, EntityType>
	updated?: Record<EntityID, EntityType>
	destroyed?: EntityID[],

	notCreated?: CommitEntityError
	notUpdated?: CommitEntityError
	notDestroyed?: CommitEntityError,

	newState?: string

	oldState?: string
}

/**
 * @category Data
 */
export type EntityID = string;

/**
 * @category Data
 */
export type QueryFilter = Record<string, any>;// TODO

enum AndOrNot {AND, OR, NOT}
export interface FilterOperator {
	operator: AndOrNot
	conditions: (FilterOperator | FilterCondition)[]
}

export type FilterCondition = Record<string, any>;

export interface JmapQueryParams extends QueryParams {
	filter?: FilterCondition | FilterOperator,
}

/**
 * @category Data
 */
export interface QueryParams {

	/**
	 * The maximum number of ID's to return
	 */
	limit?: number,

	/**
	 * Start at this position
	 */
	position?: number,

	/**
	 * Return a "total" number of entities in the response.
	 */
	calculateTotal?: boolean,

	/**
	 * Sort the results
	 */
	sort?: Comparator[],

	/**
	 * Extra URL parameters
	 */
	urlQueryParams?: Record<string, string>

	/**
	 * Filters for the query operation
	 */
	filter?: FilterCondition | FilterOperator

	// [key:string]: any
}


export interface QueryResponse {
	/**
	 * The entity ID's in the correct order
	 */
	ids: EntityID[],

	/**
	 * If calculateTotal was set to true this will show the total number of results
	 */
	total?: number,

	/**
	 * The state of the query on the server
	 */
	queryState?: string
}

/**
 * @category Data
 */
export interface DataSourceEventMap<Type extends Observable> extends ObservableEventMap<Type> {
	/**
	 * Fires when data changed in the store
	 */
	change: (dataSource: Type, changes: Changes) => void
}

export type dataSourceEntityType<DS> = DS extends AbstractDataSource<infer EntityType> ? EntityType : never;


export interface AbstractDataSource<EntityType extends BaseEntity = DefaultEntity>  extends Observable {
	on<K extends keyof DataSourceEventMap<this>>(eventName: K, listener: DataSourceEventMap<this>[K], options?: ObservableListenerOpts): DataSourceEventMap<this>[K]
	un<K extends keyof DataSourceEventMap<this>>(eventName: K, listener: RouterEventMap<this>[K]): boolean
	fire<K extends keyof DataSourceEventMap<this>>(eventName: K, ...args: Parameters<DataSourceEventMap<this>[K]>): boolean
}

type SaveData<EntityType extends BaseEntity> = {
	data: Partial<EntityType>,
	resolve: (value: any) => void, //changing this to EntityType somehow breaks!?
	reject: (reason?: any) => void
}

interface DestroyData {
	resolve: (value: EntityID) => void,
	reject: (reason?: any) => void
}

type GetData = {
	resolves: ((value: any | undefined) => void)[],
	rejects: ((reason?: any) => void)[]
}

/**
 * Abstract DataSource class
 *
 * A DataSource collection is a single source of truth for all types of data.
 * When the DataSource changes it fires an event. All components and stores listen to the
 * 'change' event to update themselves. This approach reduces the amount of code that has
 * to be written and maintained.
 *
 * Use a {@see DataSourceStore} in components to list data from datasources.
 * The {@see Form} component can also load from a datasource.
 *
 * @category Data
 */
export abstract class AbstractDataSource<EntityType extends BaseEntity = DefaultEntity> extends Observable {
	/**
	 * JMAP state
	 *
	 * @private
	 */
	private _state?: string;
	private readonly delayedCommit: (...args: any[]) => void;
	private readonly delayedGet: (...args: any[]) => void;
	private _browserStore?: BrowserStore;

	/**
	 * Store data in the browser storage so it will persist across sessions
	 */
	public persist = true;

	/**
	 * Extra parameters to send to the Foo/set
	 */
	public commitBaseParams = {};
	/**
	 * Extra /set parameters that will reset after commit
	 */
	public setParams: {[key:string]: any} = {};
	/**
	 * Get the local server state ID of the store
	 * @protected
	 */
	public async getState() {
		if (!this._state && this.persist) {
			this._state = await this.browserStore.getItem("__state__");
		}

		return this._state;
	}

	/**
	 * Set's the local server state ID
	 *
	 * Setting it to undefined will reset the store.
	 *
	 * @param state
	 * @protected
	 */
	protected async setState(state: string | undefined) {
		this._state = state;
		if(!this.persist) {
			return;
		}
		return this.browserStore.setItem("__state__", state);
	}

	public clearCache() {
		this.data = {};
		return this.browserStore.clear();
	}

	/**
	 * Get the browser storage object to save state to the browser
	 * @private
	 */
	private get browserStore() {
		if (!this._browserStore) {
			this._browserStore = new BrowserStore("ds-" + this.id);
		}

		return this._browserStore;
	}

	public constructor(public readonly id: string) {
		super();

		this.delayedCommit = FunctionUtil.buffer(0, () => {
			void this.commit();
		});

		this.delayedGet = FunctionUtil.buffer(0, () => {
			void this.doGet();
		})
	}

	protected data: Record<EntityID, EntityType> = {};
	protected creates: Record<EntityID, SaveData<EntityType>> = {};
	protected updates: Record<EntityID, SaveData<EntityType>> = {};
	protected destroys: Record<EntityID, DestroyData> = {};

	protected getIds: Record<EntityID, GetData> = {};

	/**
	 * Get entities from the store
	 *
	 * It will return a list of entities ordered by the requested ID's
	 *
	 * @param ids
	 */
	public async get(ids?: EntityID[]): Promise<GetResponse<EntityType>> {

		const promises: Promise<EntityType | undefined>[] = [], order: Record<EntityID, number> = {};

		if(ids == undefined) {
			ids = (await this.query()).ids;
		}

		//first see if we have it in our data property
		ids.forEach((id, index) => {
			//keep order for sorting the result
			order[id] = index++;
			promises.push(this.single(id));
		})

		// Call class method to fetch additional
		let entities = await Promise.all(promises);

		const response: GetResponse<EntityType> = {
			list: [],
			notFound: [],
			state: await this.getState()
		};

		entities.forEach((e, index) => {
			if (e === undefined) {
				response.notFound!.push(ids![index]);
			} else {
				response.list.push(e);
			}
		})

		response.list = response.list.sort(function (a, b) {
			return order[a.id!] - order[b.id!];
		});

		return response;
	}

	protected async add(data: EntityType) {

		this.data[data.id!] = data;

		if (!this.persist) {
			return Promise.resolve(data);
		}
		await this.browserStore.setItem(data.id!, data);
		return data;
	}

	protected async remove(id: EntityID) {

		console.debug("Removing " + this.id + ": " + id);
		delete this.data[id];

		if (!this.persist) {
			return Promise.resolve(id);
		}
		await this.browserStore.removeItem(id);
		return id;
	}

	/**
	 * Get a single entity.
	 *
	 * Multiple calls will be buffered and returned together on the next event loop. This way multiple calls can
	 * be joined together in a single HTTP request to the server.
	 *
	 * @param id
	 */
	public async single(id: EntityID): Promise<EntityType | undefined> {
		if(!id) {
			return Promise.resolve(undefined);
		}
		const p = new Promise((resolve, reject) => {
			if (!this.getIds[id]) {
				this.getIds[id] = {
					resolves: [resolve],
					rejects: [reject]
				}
			} else {
				this.getIds[id].resolves.push(resolve);
				this.getIds[id].rejects.push(reject);
			}
		}) as Promise<EntityType | undefined>;
		this.delayedGet();
		return p;
	}

	private returnGet(id: EntityID) {
		let r;
		if(!this.getIds[id]) {
			return;
		}
		while (r = this.getIds[id].resolves.shift()) {
			// this.getIds[id].rejects.shift();
			r.call(this, structuredClone(this.data[id]));
		}
		delete this.getIds[id];
	}

	/**
	 * Does the actual getting of entities. First checks if present in this onbject, otherwise it will be requested
	 * from the remote source.
	 *
	 * @protected
	 */
	protected async doGet() {

		const unknownIds: EntityID[] = [];
		for (let id in this.getIds) {
			if (this.data[id]) {
				this.returnGet(id);
			} else if(this.persist) {
				const data = await this.browserStore.getItem(id);
				if (data) {
					this.data[id] = data;
					this.returnGet(id);
				} else {
					unknownIds.push(id);
				}
			} else {
				unknownIds.push(id);
			}
		}

		if (!unknownIds.length) {
			// Can we return without a server call? State won't be checked.
			// In the detail view we call an additional validateState() function to do this to
			// save a lot of empty calls.
			return;
		}

		this.internalGet(unknownIds)
			.then(response => this.checkState(response.state, response))
			.then(response => {
				response.list.forEach((e) => {
					this.add(e);
					this.returnGet(e.id!);
				});

				response.notFound?.forEach((id) => {
					let r;
					while (r = this.getIds[id].resolves.shift()) {
						r.call(this, undefined);
					}
					delete this.getIds[id];
				});
			}).catch((e)=>{
				//reject all
				unknownIds.forEach((id) => {
					if(this.getIds[id]) {
						let r;
						while (r = this.getIds[id].rejects.shift()) {
							r.call(this, e);
						}
						delete this.getIds[id];
					}
				})
			});

	}

	/**
	 * Implements getting entities from a remote source
	 *
	 * @param ids
	 * @protected
	 */
	protected abstract internalGet(ids: EntityID[]): Promise<GetResponse<EntityType>>;

	/**
	 * Create entity
	 *
	 * Multiple calls will be joined together in a single call on the next event loop
	 *
	 * @param data
	 * @param createId The create ID to use when committing this entity to the server
	 */
	public create(data: Partial<EntityType>, createId?: EntityID): Promise<EntityType> {

		if (createId === undefined) {
			createId = this.createID()
		}

		const p = new Promise((resolve, reject) => {
			this.creates[createId!] = {
				data: data,
				resolve: resolve,
				reject: reject
			}
		}).finally(() => {
			delete this.creates[createId!];
		}) as Promise<EntityType>;

		this.delayedCommit();

		return p;
	}

	/**
	 * Reset the data source.
	 *
	 * Clears all data and will resync
	 */
	public async reset() {
		await this.setState(undefined);

		return await this.clearCache();
	}

	/**
	 * Update an entity
	 *
	 * Multiple calls will be joined together in a single call on the next event loop
	 *
	 * @param id
	 * @param data
	 */
	public update(id:EntityID, data: Partial<EntityType>): Promise<EntityType> {
		const p = new Promise((resolve, reject) => {
			this.updates[id] = {
				data: data,
				resolve: resolve,
				reject: reject
			}
		}).finally(() => {
			delete this.updates[id];
		}) as Promise<EntityType>;

		this.delayedCommit();

		return p;
	}

	private _createId = 0;

	private createID() {
		return "_new_" + (++this._createId);
	}

	/**
	 * Destroy an entity
	 *
	 * Multiple calls will be joined together in a single call on the next event loop
	 *
	 * @param id
	 */
	public destroy(id: EntityID) {
		const p = new Promise((resolve, reject) => {
			this.destroys[id] = {
				resolve: resolve,
				reject: reject
			}
		}).finally(() => {
			delete this.destroys[id];
		})

		this.delayedCommit();

		return p;
	}


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
	public async confirmDestroy(ids:EntityID[]) {

		const count = ids.length;

		if(!count) {
			return false;
		}

		let msg;
		if(count == 1) {
			msg = t("Are you sure you want to delete the selected item?");
		} else {
			msg = t("Are you sure you want to delete {count} items?").replace('{count}', count);
		}

		const confirmed = await Window.confirm(msg);
		if(!confirmed) {
			return false;
		}

		root.mask(300);

		return Promise.all(ids.map(id => {
			return this.destroy(id);
		})).finally(() => {
			root.unmask();
		}).catch((e:any) => {
			Window.error(e);
		})

	}

	/**
	 * Fetch updates from remote
	 */
	public async updateFromServer() {

		let hasMoreChanges = true, hasAChange = false;

		const allChanges: Changes = {
			created: [],
			updated: [],
			destroyed: [],
			oldState: "",
			newState: "",
		}, promises = [];

		try {
			while (hasMoreChanges) {
				const state = await this.getState();
				if (state === undefined) {
					// no state so nothing to update
					return;
				}

				if (!allChanges.oldState) {
					allChanges.oldState = state!;
				}
				const changes = await this.internalRemoteChanges(state);

				if (changes.created) {
					for (let id of changes.created) {
						promises.push(this.remove(id));
						allChanges.created!.push(id + "");

						hasAChange = true;
					}
				}

				if (changes.updated) {
					for (let id of changes.updated) {
						promises.push(this.remove(id));
						allChanges.updated!.push(id + "");

						hasAChange = true;
					}
				}

				if (changes.destroyed) {
					for (let id of changes.destroyed) {
						promises.push(this.remove(id));
						allChanges.destroyed!.push(id + "");

						hasAChange = true;
					}
				}

				//Set the new server state
				await Promise.all(promises);
				await this.setState(changes.newState);

				allChanges.newState = changes.newState;

				hasMoreChanges = !!changes.hasMoreChanges;
			}
		} catch (e) {
			console.error(this.id + " Error while updating from server. Resetting data source.");
			console.error(e);
			await this.reset();
		}
		if (hasAChange) {
			this.fire("change", this, allChanges);
		}

	}


	/**
	 * Implements fetching updates from remote
	 *
	 * @protected
	 */
	protected abstract internalRemoteChanges(state: string | undefined): Promise<Changes>

	/**
	 * Commit pending changes to remote
	 */
	private async commit() {

		const params: SetRequest<EntityType> = Object.assign({
			create: {},
			update: {},
			destroy: [],
			ifInState: await this.getState(),
		}, this.commitBaseParams, this.setParams);
		this.setParams = {}; // unset after /set is sent

		for (let id in this.creates) {
			params.create[id] = this.creates[id].data;
		}

		for (let id in this.updates) {
			params.update[id] = this.updates[id].data;
		}

		for (let id in this.destroys) {
			params.destroy.push(id);
		}

		// copy these so we have the resolve() and reject() functions in this scope and we clear them in the "this" scope
		// so it's guaranteed that they will never commit more than once.
		const creates = this.creates,
			updates = this.updates,
			destroys = this.destroys;

		this.creates = {};
		this.updates = {};
		this.destroys = {};

		this.internalCommit(params).then(async (response) => {

			if (response.created) {
				for (let clientId in response.created) {
					//merge client data with server defaults.
					let data = Object.assign(params.create ? (params.create[clientId] || {}) : {}, response.created[clientId] || {});
					this.add(data).then(() => creates[clientId].resolve(data));
				}
			}

			if (response.notCreated) {
				for (let clientId in response.notCreated) {
					//merge client data with server defaults.
					creates[clientId].reject(response.notCreated[clientId]);
				}
			}

			if (response.updated) {
				for (let serverId in response.updated) {

					const onUpdated = (data:EntityType|undefined) => {
						// In some cases the server may return other entities that have been updated. For example related calendar
						// events that are in other calendars
						if(updates[serverId]) {
							updates[serverId].resolve(data)
						}
					};
					if (!this.data[serverId]) {
						//server updated something we don't have. We'll get it in that case.
						this.single(serverId).then(onUpdated);
					} else {

						//merge existing data, with updates from client and server
						let data = params.update && params.update[serverId] ? Object.assign(this.data[serverId], params.update[serverId]) : this.data[serverId];
						data = Object.assign(data, response.updated[serverId] || {});
						this.add(data).then(onUpdated);
					}
				}
			}

			if (response.notUpdated) {
				for (let serverId in response.notUpdated) {
					//merge client data with server defaults.
					updates[serverId].reject(response.notUpdated[serverId]);
				}
			}

			if (response.destroyed) {
				for (let i = 0, l = response.destroyed.length; i < l; i++) {
					this.remove(response.destroyed[i]).then((id) => destroys[id].resolve(id));
				}
			}
			if (response.notDestroyed) {
				for (let serverId in response.notDestroyed) {
					destroys[serverId].reject(response.notDestroyed[serverId]);
				}
			}

			await this.setState(response.newState);

			this.fire("change", this, {
				created: response.created ? Object.keys(response.created) : [],
				updated: response.updated ? Object.keys(response.updated) : [],
				destroyed: response.destroyed || [],
				oldState: response.oldState,
				newState: response.newState
			});
		})
			.catch(e => {
				for (let clientId in creates) {
					creates[clientId].reject(e);
				}
				for (let clientId in updates) {
					updates[clientId].reject(e);
				}
				for (let clientId in destroys) {
					destroys[clientId].reject(e);
				}

				throw e;
			})


	}

	/**
	 * Implements commit (save and destroy) to the remote source
	 * @protected
	 */
	protected abstract internalCommit(params: SetRequest<EntityType>): Promise<CommitResponse<EntityType>>

	/**
	 * Query the server for a list of entity ID's
	 *
	 * It takes filters and sort parameters.
	 *
	 * @link https://jmap.io/spec-core.html#query
	 */
	public async query(params: QueryParams = {}): Promise<QueryResponse> {
		let r = await this.internalQuery(params);
		return this.checkState(r.queryState, r);
	}

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
	protected async checkState<T>(serverState: string | undefined, retVal: T): Promise<T> {
		let state = await this.getState()
		if (!state && serverState) {
			// // We are empty!
			// if(this.persist) {
			// 	console.warn("Emptying store as there's no server state")
			// 	this.data = {};
			// 	await this.browserStore.clear();
			// }
			await this.setState(serverState!);
			state = serverState;
		}
		// Check if our data is up-to-date
		if (serverState != state) {
			return this.updateFromServer().then(() => retVal);
		} else {
			return Promise.resolve(retVal);
		}
	}

	/**
	 * Handle the query to the remote
	 * @param params
	 */
	protected abstract internalQuery(params: QueryParams): Promise<QueryResponse>;
}