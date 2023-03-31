/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Observable, ObservableEventMap} from "../component/index.js";
import {Comparator} from "./Store.js";
import {FunctionUtil} from "../util/index.js";

export interface GetResponse<EntityType> {
	list: EntityType[],
	notFound?: EntityID[]
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
	destroyed?: EntityID[]
}

export interface CommitResponse<EntityType> extends Changes<EntityType> {

	notCreated?: CommitEntityError
	notUpdated?: CommitEntityError
	notDestroyed?: CommitEntityError
}

export type EntityID = string|number;

export interface QueryParams {
	limit?: number,
	position?: number,
	calculateTotal?: boolean,
	sort?: Comparator[],

	[key:string]: any
}


export interface QueryResponse  {
	ids:EntityID[],
	total?:number
}

export interface DataSourceEventMap<T extends Observable, EntityType> extends ObservableEventMap<T> {
	/**
	 * Fires when data changed in the store
	 */
	change: <Sender extends T>(DataSource: Sender, changes: CommitResponse<EntityType>) => void
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
	private timeout?: number;
	private delayedCommit: (...args: any[]) => void;
	private delayedGet: (...args: any[]) => void;

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
			notFound: []
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
	 * Get a single entity
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
		}). finally(() => {
			delete this.getIds[id];
		})  as Promise<EntityType>;

		this.delayedGet();
		return p;
	}

	protected async doGet() {
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

		if(!unknownIds.length) {
			return;
		}

		// Call class method to fetch additional
		const response = await this.internalGet(unknownIds);

		response.list.forEach((e) => {
			this.add(e);
			this.getIds[e.id].resolves.forEach(r => {
				r.call(this, this.data[e.id]);
			});
			delete this.getIds[e.id];
		});

		response.notFound?.forEach((id) => {
			this.getIds[id].resolves.forEach(r => {
				r.call(this, undefined);
			});
			delete this.getIds[id];
		})

	}

	/**
	 * Implements getting entities from a remote source
	 * @param ids
	 * @protected
	 */
	protected abstract internalGet(ids:EntityID[]) : Promise<GetResponse<EntityType>>;

	/**
	 * Save data to the store
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
	 * Save data to the store
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
	 * Destroy data from the store
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
		const changes = await this.internalUpdate();
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

		this.fire("change", this, changes);
	}

	/**
	 * Implements fetching updates from remote
	 * @protected
	 */
	protected abstract internalUpdate() : Promise<Changes<EntityType>>

	/**
	 * Commit pending changes to remote
	 */
	private commit() {
		const p =  this.internalCommit().then((response) => {
			this.fire("change", this, response);
		});
		return p;
	}


	/**
	 * Implements commit (save and destroy) to the remote source
	 * @protected
	 */
	protected abstract internalCommit() : Promise<CommitResponse<EntityType>>

	public abstract query(params:QueryParams): Promise<QueryResponse>;
}