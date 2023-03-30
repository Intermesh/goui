/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {client} from "./Client.js";
import {
	AbstractDataSource,
	CommitResponse,
	DefaultEntity,
	EntityID,
	QueryParams,
	QueryResponse
} from "../data/AbstractDataSource.js";

enum andOrNot {AND, OR, NOT}

// enum SetErrorType {
// 	'forbidden',
// 	'overQuota',
// 	'tooLarge',
// 	'rateLimit',
// 	'notFound',
// 	'invalidPatch',
// 	'willDestroy',
// 	'invalidProperties',
// 	'singleton',
// 	'requestTooLarge',
// 	'stateMismatch'
// }

export interface FilterOperator {
	operator: andOrNot
	conditions: (FilterOperator | FilterCondition)[]
}

export type FilterCondition = Record<string, any>;

export interface JmapQueryParams extends QueryParams {
	filter?: FilterCondition | FilterOperator,
}


export class JmapDataSource<EntityType extends DefaultEntity = DefaultEntity> extends AbstractDataSource<EntityType> {

	private static stores: Record<string, any> = {};

	public static store<EntityType extends DefaultEntity = DefaultEntity>(storeId:string) : JmapDataSource<EntityType> {
		if(!JmapDataSource.stores[storeId]) {
			JmapDataSource.stores[storeId] = new this(storeId);
		}
		return JmapDataSource.stores[storeId];
	}

	/**
	 * Query entity ID's
	 *
	 * @param params
	 */
	query(params: JmapQueryParams) : Promise<QueryResponse> {
		return client.jmap(this.id + "/query", params, this.useCallId());
	}

	/**
	 * Extra parameters to send to the Foo/set
	 */
	public commitBaseParams = {};

	/**
	 * The ID to use when committing
	 */
	protected _nextCallId = 1;

	/**
	 * The call ID of the next JMAP method call. Useful for result references.
	 */
	get nextCallId() {
		return this.id + "_" + this._nextCallId;
	}

	private useCallId() {
		const callId  = this.nextCallId;
		this._nextCallId++;

		return callId;
	}


	protected async internalCommit() {

		interface SetRequest<EntityType> {
			create: Record<EntityID, Partial<EntityType>>
			update: Record<EntityID, Partial<EntityType>>
			destroy: EntityID[]
		}

		const params: SetRequest<EntityType> =  Object.assign({
			create: {},
			update: {},
			destroy: []
		}, this.commitBaseParams);

		for(let id in this.creates) {
			params.create[id] = this.creates[id].data;
		}

		for(let id in this.updates) {
			params.update[id] = this.creates[id].data;
		}

		for(let id in this.destroys) {
			params.destroy.push(id);
		}

		const response = await client.jmap(this.id + "/set", params, this.useCallId()) as CommitResponse<EntityType>;

		if(response.created) {
			for(let clientId in response.created) {
				//merge client data with server defaults.
				let data = Object.assign(params.create ? (params.create[clientId] || {}) : {}, response.created[clientId] || {});
				this.add(data);
				this.creates[clientId].resolve(data);
			}
		}

		if(response.notCreated) {
			for(let clientId in response.notCreated) {
				//merge client data with server defaults.
				this.creates[clientId].reject(response.notCreated[clientId]);
			}
		}

		if(response.updated) {
			for(let serverId in response.updated) {
				//server updated something we don't have
				if(!this.data[serverId]) {
					continue;
				}

				//merge existing data, with updates from client and server
				let data = params.update && params.update[serverId] ? Object.assign(this.data[serverId], params.update[serverId]) : this.data[serverId];
				data = Object.assign(data, response.updated[serverId] || {});
				this.add(data);
				this.updates[serverId].resolve(data);
			}
		}

		if(response.notUpdated) {
			for(let serverId in response.notUpdated) {
				//merge client data with server defaults.
				this.updates[serverId].reject(response.notUpdated[serverId]);
			}
		}

		if(response.destroyed) {
			for(let i =0, l = response.destroyed.length; i < l; i++) {
				this.remove(response.destroyed[i]);
				this.destroys[response.destroyed[i]].resolve(response.destroyed[i]);
			}
		}
		if(response.notDestroyed) {
			for(let serverId in response.notDestroyed) {
				this.destroys[serverId].reject(response.notDestroyed[serverId]);
			}
		}

		return response;
	}



	protected internalGet(ids: string[]){
		return client.jmap(this.id + '/get', {
			ids: ids
		}, this.useCallId());
	}

	protected internalUpdate(){
		return Promise.resolve({});
	}
}
