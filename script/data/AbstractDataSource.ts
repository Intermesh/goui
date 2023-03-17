import {Observable, ObservableEventMap} from "../component/index.js";
import {Comparator} from "./Store.js";


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


export interface CommitError {
	type: CommitErrorType
	description?: string
}

export interface Changes<EntityType> {
	created?: Record<EntityID, EntityType>
	updated?: Record<EntityID, EntityType>
	deleted?: EntityID[]
}

export interface CommitResponse<EntityType> extends Changes<EntityType> {

	notCreated?: CommitEntityError
	notUpdated?: CommitEntityError
	notDestroyed?: CommitEntityError
}

export type EntityID = string;

export interface QueryParams {
	limit?: number,
	position?: number,
	calculateTotal?: boolean,
	sort?: Comparator[]
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

export interface AbstractDataSource<EntityType = Record<string, any>> {
	on<K extends keyof DataSourceEventMap<AbstractDataSource<EntityType>, EntityType>>(eventName: K, listener: DataSourceEventMap<AbstractDataSource<EntityType>, EntityType>[K]): void

	fire<K extends keyof DataSourceEventMap<AbstractDataSource<EntityType>, EntityType>>(eventName: K, ...args: Parameters<NonNullable<DataSourceEventMap<AbstractDataSource<EntityType>, EntityType>[K]>>): boolean
}


class DataSourceManager {
	private stores:Record<string, any> = {};

	public get<DataSourceType extends AbstractDataSource>(id:string, dataSourceType: {new (id:string): DataSourceType}): DataSourceType {

		if(!this.stores[id]) {
			this.stores[id] = new dataSourceType(id);
		}
		return this.stores[id];
	}
}

export const dataSources = new DataSourceManager();


export abstract class AbstractDataSource<EntityType = Record<string, any>> extends Observable {

	constructor(public readonly id:string) {
		super();
	}

	protected data: Record<string, EntityType> = {};
	protected creates: EntityType[] = [];
	protected updates: Record<EntityID, EntityType> = {};
	protected deletes: EntityID[] = [];

	/**
	 * Get entities from the store
	 *
	 * @param ids
	 */
	public async get(ids:string[]): Promise<GetResponse<EntityType>> {

		const list = [], unknown = [];
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

	/**
	 * Implements getting entities from a remote source
	 * @param ids
	 * @protected
	 */
	protected abstract internalGet(ids:string[]) : Promise<GetResponse<EntityType>>;

	/**
	 * Save data to the store
	 *
	 * @param data
	 * @param id
	 */
	public save(data:EntityType, id?:EntityID) {
		if(id === undefined) {
			this.creates.push(data);
		} else
		{
			this.updates[id] = data;
		}
	}

	/**
	 * Delete data from the store
	 * @param id
	 */
	public delete(id:EntityID) {
		this.deletes.push(id);
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

		if(changes.deleted) {
			for (let id of changes.deleted) {
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
	 * Implements commit (save and delete) to the remote source
	 * @protected
	 */
	protected abstract internalCommit() : Promise<CommitResponse<EntityType>>

	public abstract query(params:QueryParams): Promise<QueryResponse>;
}