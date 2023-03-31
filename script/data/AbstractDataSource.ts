/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Observable, ObservableEventMap} from "../component/index.js";
import {Comparator} from "./Store.js";
import {FunctionUtil} from "../util/index.js";
import {JmapQueryParams} from "../jmap/index.js";

/**
 * The response of the {@see AbstractDataSource.get()} method
 */
export interface GetResponse<EntityType> {

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
	state: string
}


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
 */
export interface BaseEntity  {
	id: EntityID
}

/**
 * Default entity
 *
 * Allows any property.
 */
export interface DefaultEntity extends BaseEntity{
	[key:string]: any
}


export interface CommitError {
	type: CommitErrorType
	description?: string
}

export interface Changes<EntityType> {
	created?: Record<EntityID, EntityType>
	updated?: Record<EntityID, EntityType>
	destroyed?: EntityID[],
	state: string|undefined
}

export interface CommitResponse<EntityType> {

	created?: Record<EntityID, EntityType>
	updated?: Record<EntityID, EntityType>
	destroyed?: EntityID[],

	notCreated?: CommitEntityError
	notUpdated?: CommitEntityError
	notDestroyed?: CommitEntityError,

	newState: string

	oldState: string
}

export type EntityID = string|number;

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

	[key:string]: any
}


export interface QueryResponse  {
	/**
	 * The entity ID's in the correct order
	 */
	ids:EntityID[],

	/**
	 * If calculateTotal was set to true this will show the total number of results
	 */
	total?:number,

	/**
	 * The state of the query on the server
	 */
	queryState: string
}

export interface DataSourceEventMap<T extends Observable, EntityType> extends ObservableEventMap<T> {
	/**
	 * Fires when data changed in the store
	 */
	change: <Sender extends T>(DataSource: Sender, changes: Changes<EntityType>) => void
}

export interface AbstractDataSource<EntityType extends BaseEntity = DefaultEntity> {
	on<K extends keyof DataSourceEventMap<AbstractDataSource<EntityType>, EntityType>>(eventName: K, listener: DataSourceEventMap<AbstractDataSource<EntityType>, EntityType>[K]): void

	fire<K extends keyof DataSourceEventMap<AbstractDataSource<EntityType>, EntityType>>(eventName: K, ...args: Parameters<NonNullable<DataSourceEventMap<AbstractDataSource<EntityType>, EntityType>[K]>>): boolean
}

interface SaveData <EntityType extends BaseEntity> {
	data: Partial<EntityType>,
	resolve: (value: EntityType) => void,
	reject: (reason?: any) => void
}

interface DestroyData  {
	resolve: (value: EntityID) => void,
	reject: (reason?: any) => void
}

interface GetData<EntityType extends BaseEntity>  {
	resolves: ((value: EntityType|undefined) => void)[],
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
 */
export abstract class AbstractDataSource<EntityType extends BaseEntity = DefaultEntity> extends Observable {
	/**
	 * JMAP state
	 *
	 * @private
	 */
	private _state?:string;
	private readonly delayedCommit: (...args: any[]) => void;
	private readonly delayedGet: (...args: any[]) => void;

	get state() {
		return this._state;
	}

	constructor(public readonly id:string) {
		super();

		this.delayedCommit = FunctionUtil.buffer(0, () => {
			this.commit();
		});

		this.delayedGet = FunctionUtil.buffer(0, () => {
			this.doGet();
		})
	}

	protected data: Record<EntityID, EntityType> = {};
	protected creates: Record<EntityID, SaveData<EntityType>> = {}
	protected updates: Record<EntityID, SaveData<EntityType>> = {};
	protected destroys: Record<EntityID, DestroyData> = {};

	protected getIds: Record<EntityID, GetData<EntityType>> = {};

	/**
	 * Get entities from the store
	 *
	 * It will return a list of entities ordered by the requested ID's
	 *
	 * @param ids
	 */
	public async get(ids:EntityID[]): Promise<GetResponse<EntityType>> {

		const promises: Promise<EntityType|undefined>[] = [],  order:Record<EntityID, number> = {};

		//first see if we have it in our data property
		ids.forEach((id, index) => {
			//keep order for sorting the result
			order[id] = index++;
			promises.push(this.single(id));
		})

		// Call class method to fetch additional
		let entities = await Promise.all(promises);

		const response: GetResponse<EntityType> = {
			list:[],
			notFound: [],
			state: this.state!
		};

		entities.forEach((e, index) => {
			if(e === undefined) {
				response.notFound!.push(ids[index]);
			} else {
				response.list.push(e);
			}
		})

		response.list = response.list.sort(function (a, b) {
				return order[a.id] - order[b.id];
			});

		return response;
	}

	protected add(data:EntityType) {
		this.data[data.id] = data;
	}

	protected remove(id:EntityID) {
		delete this.data[id];
	}

	/**
	 * Get a single entity.
	 *
	 * Multiple calls will be buffered and returned together on the next event loop. This way multiple calls can
	 * be joined together in a single HTTP request to the server.
	 *
	 * @param id
	 */
	public async single(id: EntityID): Promise<EntityType|undefined> {

		const p = new Promise((resolve, reject) => {
			if(!this.getIds[id]) {
				this.getIds[id] = {
					resolves: [resolve],
					rejects: [reject]
				}
			} else {
				this.getIds[id].resolves.push(resolve);
				this.getIds[id].rejects.push(reject);
			}
		}) as Promise<EntityType|undefined> ;
		this.delayedGet();
		return p;
	}

	/**
	 * Does the actual getting of entities. First checks if present in this onbject, otherwise it will be requested
	 * from the remote source.
	 *
	 * @protected
	 */
	protected async doGet() {

		if(!this.restored) {
			await this.restore();
		}

		const unknownIds: EntityID[] = [];
		for(let id in this.getIds) {
			if(this.data[id]) {
				this.getIds[id].resolves.forEach(r => {
					r.call(this, this.data[id]);
				});
				delete this.getIds[id];
			} else {
				unknownIds.push(id);
			}
		}

		// Call class method to fetch additional. Even with an empty list we must check the server state,
		this.internalGet(unknownIds)
			.then(response => this.checkState(response.state, response))
			.then(response => {
				response.list.forEach((e) => {
					this.add(e);
					let r;
					while (r = this.getIds[e.id].resolves.shift()) {
						r.call(this, this.data[e.id]);
					}
				});

				response.notFound?.forEach((id) => {
					let r;
					while (r = this.getIds[id].resolves.shift()) {
						r.call(this, undefined);
					};
				});

				this.save();

			})

	}

	/**
	 * Implements getting entities from a remote source
	 *
	 * @param ids
	 * @protected
	 */
	protected abstract internalGet(ids:EntityID[]) : Promise<GetResponse<EntityType>>;

	/**
	 * Create entity
	 *
	 * Multiple calls will be joined together in a single call on the next event loop
	 *
	 * @param data
	 * @param createId The create ID to use when committing this entity to the server
	 */
	public create(data:Partial<EntityType>, createId?: EntityID): Promise<EntityType> {

		if(createId === undefined) {
			createId = this.createID()
		}

		const p = new Promise((resolve, reject) => {
			this.creates[createId!] ={
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
	 * Update an entity
	 *
	 * Multiple calls will be joined together in a single call on the next event loop
	 *
	 * @param data
	 */
	public update(data:Partial<EntityType> & BaseEntity): Promise<EntityType> {
		const p = new Promise((resolve, reject) => {
				this.updates[data.id!] = {
					data: data,
					resolve: resolve,
					reject: reject
				}
		}).finally(() => {
			delete this.updates[data.id!];
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
	public destroy(id:EntityID) {
		const p = new Promise((resolve, reject) => {
			this.destroys[id] = {
				resolve: resolve,
				reject: reject
			}
		}). finally(() => {
			delete this.destroys[id];
		})

		this.delayedCommit();

		return p;
	}

	/**
	 * Fetch updates from remote
	 */
	public async updateFromServer() {
		const changes = await this.internalRemoteChanges();
		if(changes.created) {
			for (let id in changes.created) {
				this.data[id] = changes.created[id];
			}
		}

		if(changes.updated) {
			for (let id in changes.updated) {
				this.data[id] = changes.updated[id];
			}
		}

		if(changes.destroyed) {
			for (let id of changes.destroyed) {
				delete this.data[id];
			}
		}

		//Set the new server state
		this._state = changes.state;

		this.fire("change", this, changes);
	}

	private async save() {
		localStorage.setItem("ds-" + this.id, JSON.stringify({
			state: this.state,
			data: this.data
		}))
	}

	private restored = false;

	private async restore() {
		const saved = localStorage.getItem("ds-" + this.id);
		if(!saved) {
			return;
		}

		const decoded = JSON.parse(saved);

		this.data = decoded.data;
		this._state = decoded.state;
		this.restored = true;
	}

	/**
	 * Implements fetching updates from remote
	 *
	 * @protected
	 */
	protected abstract internalRemoteChanges() : Promise<Changes<EntityType>>

	/**
	 * Commit pending changes to remote
	 */
	private async commit() {

		if(!this.restored) {
			await this.restore();
		}

		this.internalCommit().then((response) => {
			this._state = response.newState;
			this.save();

			this.fire("change", this, {
				created: response.created,
				updated: response.updated,
				destroyed: response.destroyed,
				state: response.newState
			});
		}).finally(() => {
			this.creates = {};
			this.updates = {};
			this.destroys = {};
		})
	}

	/**
	 * Implements commit (save and destroy) to the remote source
	 * @protected
	 */
	protected abstract internalCommit() : Promise<CommitResponse<EntityType>>

	/**
	 * Query the server for a list of entity ID's
	 *
	 * It takes filters and sort parameters.
	 *
	 * @link https://jmap.io/spec-core.html#query
	 */
	public query(params: JmapQueryParams) : Promise<QueryResponse> {
		return this.internalQuery(params).then(r => {
			return this.checkState(r.queryState, r);
		});
	}

	/**
	 * Check's if we are up-to-date with the server and fetches updates if needed
	 *
	 * @param serverState
	 * @param retVal
	 * @private
	 */
	private checkState<T>(serverState:string, retVal: T) : Promise<T> {
		if(!this._state) {
			// We are empty!
			this._state = serverState;
			this.data = {};
		}
		// Check if our data is up-to-date
		if(serverState != this._state) {
			return this.updateFromServer().then(() => retVal);
		} else {
			return Promise.resolve(retVal);
		}
	}

	/**
	 * Handle the query to the remote
	 * @param params
	 */
	protected abstract internalQuery(params:QueryParams): Promise<QueryResponse>;
}