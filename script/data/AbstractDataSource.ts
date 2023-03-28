/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Observable, ObservableEventMap} from "../component/index.js";
import {Comparator} from "./Store.js";
import Base = Mocha.reporters.Base;


export interface GetResponse<EntityType> {
	list: EntityType[],
	notFound?: string[]
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

export interface BaseEntity  {
	id: EntityID
}
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
	data: EntityType,
	resolve: (value: EntityType) => void,
	reject: (reason?: any) => void
}

interface Destroyedata  {
	resolve: (value: EntityID) => void,
	reject: (reason?: any) => void
}

export abstract class AbstractDataSource<EntityType extends BaseEntity = DefaultEntity> extends Observable {


	constructor(public readonly id:string) {
		super();
	}

	protected data: Record<EntityID, EntityType> = {};
	protected creates: Record<EntityID, SaveData<EntityType>> = {}
	protected updates: Record<EntityID, SaveData<EntityType>> = {};
	protected destroys: Record<EntityID, Destroyedata> = {};

	/**
	 * Get entities from the store
	 *
	 * @param ids
	 */
	public async get(ids:EntityID[]): Promise<GetResponse<EntityType>> {

		const list = [], unknown:EntityID[] = [];
		for(let id of ids) {
			if(this.data[id]) {
				list.push(this.data[id]);
			} else {
				unknown.push(id);
			}
		}

		const response = await this.internalGet(unknown);
		response.list = response.list.concat(list);
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
		const response = await this.get([id]);
		return response.list[0] || undefined;
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
	 * @param id
	 */
	public save(data:EntityType, id?:EntityID): Promise<EntityType|CommitError> {
		return new Promise((resolve, reject) => {
			if(id === undefined) {
				this.creates[this.createID()] ={
					data: data,
					resolve: resolve,
					reject: reject
				}
			} else
			{
				this.updates[id] = {
					data: data,
					resolve: resolve,
					reject: reject
				};
			}
		})
	}

	private _createId = 1;

	private createID() {
		return "_new_" + this._createId++;
	}

	/**
	 * Destroy data from the store
	 * @param id
	 */
	public destroy(id:EntityID) {
		return new Promise((resolve, reject) => {
			this.destroys[id] = {
				resolve: resolve,
				reject: reject
			}
		})
	}

	/**
	 * Fetch updates from remote
	 */
	public async update() {
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
	public async commit() {
		const response = await this.internalCommit();
		this.fire("change", this, response);
		return response;
	}

	/**
	 * Implements commit (save and destroy) to the remote source
	 * @protected
	 */
	protected abstract internalCommit() : Promise<CommitResponse<EntityType>>

	public abstract query(params:QueryParams): Promise<QueryResponse>;
}