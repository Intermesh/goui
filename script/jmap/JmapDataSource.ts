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
	QueryResponse, SetRequest
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


/**
 * JMAP Data source
 *
 * Single Source Of Truth for JMAP entities
 *
 */
export class JmapDataSource<EntityType extends DefaultEntity = DefaultEntity> extends AbstractDataSource<EntityType> {

	protected internalQuery(params: JmapQueryParams) : Promise<QueryResponse> {
		return client.jmap(this.id + "/query", params, this.useCallId());
	}

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


	protected async internalCommit(params: SetRequest<EntityType>) : Promise<CommitResponse<EntityType>> {

		try {
			return client.jmap(this.id + "/set", params, this.useCallId());
		} catch(error:any) {
			if(error.type && error.type == 'stateMismatch') {
				await this.updateFromServer();

				throw error;
			}

			throw error;
		}
	}

	protected internalGet(ids: string[]){
		return client.jmap(this.id + '/get', {
			ids: ids
		}, this.useCallId());
	}

	protected internalRemoteChanges() {

		console.warn("Out of state! Clearing all data for now.");
		//TODO
		this.data = {};

		return Promise.resolve({
			state: undefined
		});
	}
}


const stores: Record<string, any> = {};

/**
 * Get a single instance of a store by ID
 *
 * @param storeId
 */
export const jmapds = <EntityType extends DefaultEntity = DefaultEntity>(storeId:string) : JmapDataSource<EntityType> => {
	if(!stores[storeId]) {
		stores[storeId] = new JmapDataSource(storeId);
	}
	return stores[storeId];
}