/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {client} from "./Client.js";
import {AbstractDataSource, CommitResponse, DefaultEntity, EntityID, QueryParams} from "../data/AbstractDataSource.js";

export interface ResultReference {
	resultOf: string
	path: string
}

enum andOrNot {AND, OR, NOT}

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
			// @ts-ignore
			JmapDataSource.stores[storeId] = new this(storeId);
		}
		return JmapDataSource.stores[storeId];
	}


	/**
	 * Query entity ID's
	 *
	 * @param params
	 */
	query(params: JmapQueryParams) {
		return client.jmap(this.id + "/query", params);
	}

	protected async internalCommit() {

		interface SetRequest<EntityType> {
			create: Record<EntityID, EntityType>
			update: Record<EntityID, EntityType>
			destroy: EntityID[]
		}

		const params: SetRequest<EntityType> = {
			create: {},
			update: {},
			destroy: []
		}

		for(let id in this.creates) {
			params.create[id] = this.creates[id].data;
		}

		for(let id in this.updates) {
			params.update[id] = this.creates[id].data;
		}

		for(let id in this.destroys) {
			params.destroy.push(id);
		}

		const response = await client.jmap(this.id + "/set", params) as CommitResponse<EntityType>;

		if(response.created) {
			for(let clientId in response.created) {
				//merge client data with server defaults.
				let data = Object.assign(params.create ? (params.create[clientId] || {}) : {}, response.created[clientId] || {});
				this.add(data);
				this.creates[clientId].resolve(data);
				delete this.creates[clientId];
			}
		}

		if(response.notCreated) {
			for(let clientId in response.notCreated) {
				//merge client data with server defaults.
				this.creates[clientId].reject(response.notCreated[clientId]);
				delete this.creates[clientId];
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
				delete this.updates[serverId];
			}
		}

		if(response.notUpdated) {
			for(let serverId in response.notUpdated) {
				//merge client data with server defaults.
				this.updates[serverId].reject(response.notUpdated[serverId]);
				delete this.updates[serverId];
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
				delete this.destroys[serverId];
			}
		}

		return response;
	}



	protected internalGet(ids: string[]){
		return client.jmap(this.id + '/get', {
			ids: ids
		});
	}

	protected internalUpdate(){
		return Promise.resolve({});
	}
}
