import {client, Client} from "./Client.js";
import {Observable, ObservableConfig, ObservableEventMap, ObservableListener} from "../component/Observable.js";
import {Comparator} from "../data/Store.js";

export interface ResultReference {
	resultOf: string
	path: string
}

enum andOrNot {AND, OR, NOT}

type Id = string | number;

enum SetErrorType {
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


export interface SetError {
	type: SetErrorType
	description?: string
}

type SetEntity = Record<string, Entity>
type SetResponseError = Record<string, SetError>

interface SetResponse {
	accountId: string
	oldState: string | null
	newState: string
	created: SetEntity | null
	updated: SetEntity | null
	destroyed: string[] | null
	notCreated: SetResponseError | null
	notUpdated: SetResponseError | null
	notDestroyed: SetResponseError | null
}

interface GetResponse {
	list: Entity[],
	notFound?: string[]
}

export interface FilterOperator {
	operator: andOrNot
	conditions: (FilterOperator | FilterCondition)[]
}

export type FilterCondition = Record<string, any>;

export interface QueryParams {
	filter?: FilterCondition | FilterOperator,
	limit?: number,
	position?: number,
	calculateTotal?: boolean,
	calculateHasMore?: boolean,
	sort?: Comparator[]
}

export type Entity = Record<string, any>;


export interface EntityStoreEventMap<T extends Observable> extends ObservableEventMap<T> {
	/**
	 * Fires when data is loaded into the store
	 *
	 * @param store
	 * @param records
	 * @param append Wheter the records were added to the store.
	 */
	change?: (store: EntityStore, changes: SetResponse) => void
}

export interface EntityStore {
	on<K extends keyof EntityStoreEventMap<EntityStore>>(eventName: K, listener: EntityStoreEventMap<EntityStore>[K]): void

	fire<K extends keyof EntityStoreEventMap<EntityStore>>(eventName: K, ...args: Parameters<NonNullable<EntityStoreEventMap<EntityStore>[K]>>): boolean
}


export class EntityStore extends Observable {

	constructor(public name:string, public client:Client) {
		super();
	}

	get(ids: Id[] | ResultReference = [], properties: string[] = []): Promise<GetResponse> {

		return this.client.jmap(this.name + '/get', {
			[(ids as ResultReference).resultOf ? "#ids" : "ids"]: ids, //Support for {resultOf: "...} jmap spec
			properties: properties
		});
		// 	.then((response:GetResponse) => {
		//
		// 	const order:{[key:string]:number} = {};
		//
		// 	ids.forEach((id, index) => {
		// 		order[id] = index;
		// 	});
		//
		// 	response.list.sort(function (a, b) {
		// 		return order[a.id] - order[b.id];
		// 	});
		//
		// 	return response;
		//
		//
		// });
	}

	single(id: Id, properties: string[] = []): Promise<Entity> {
		return this.get([id], properties).then(response => {
			return response.list[0];
		})
	}

	set(params: { create?: SetEntity, update?: SetEntity, destroy?: string[], [key: string]: any }): Promise<SetResponse> {
		return this.client.jmap(this.name + "/set", params).then((response: SetResponse) => {

			this.fire('change', this, response);

			return response;
		})
	}

	query(params: QueryParams): Promise<{ ids: Id[], hasMore?: boolean, total?: number }> {
		return this.client.jmap(this.name + "/query", params);
	}

	/**
	 * Save an entity
	 *
	 * @param data The entity data
	 * @param id The entity ID
	 * @param setParams Additional paramaters for Foo/set
	 */
	save(data: Entity, id?: Id, setParams: { [key: string]: any } = {}): Promise<Entity> {

		if (!id) {
			id = "_new_"
		}

		// const p = {
		// 	[id != "_new_" ? 'update' : 'create']: {
		// 		[id]: data
		// 	}
		// }

		setParams[id != "_new_" ? 'update' : 'create'] = {
			[id]: data
		};

		return this.set(setParams).then((response) => {
			let o = id != "_new_" ? response.updated : response.created;

			if (o && id! in o) {
				return o[id!];
			} else {
				let msg = "Failed to save";
//
// 				let not = id ? response.notUpdated : response.notCreated;
// debugger;
// 				if(not && id in not) {
// 					msg = not[id].description;
// 				}
				throw new Error(msg);
			}

		});

	}

}