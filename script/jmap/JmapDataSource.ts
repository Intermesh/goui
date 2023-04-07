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
	QueryParams,
	QueryResponse,
	SetRequest
} from "../data/AbstractDataSource.js";
import {Config, createComponent} from "../component/Component.js";

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

	/**
	 * The controller route
	 *
	 * By default, the store ID is used as route. Eg. id = "Contact" then get request will be Contact/get
	 *
	 * If you set this to "SpecialContact" it will be "SpecialContact/get"
	 */
	public controllerRoute:string|undefined;

	protected internalQuery(params: JmapQueryParams) : Promise<QueryResponse> {
		return client.jmap((this.controllerRoute ?? this.id) + "/query", params, this.useCallId());
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
			return client.jmap((this.controllerRoute ?? this.id) + "/set", params, this.useCallId());
		} catch(error:any) {
			if(error.type && error.type == 'stateMismatch') {
				await this.updateFromServer();

				throw error;
			}

			throw error;
		}
	}

	protected internalGet(ids: string[]){
		return client.jmap((this.controllerRoute ?? this.id) + '/get', {
			ids: ids
		}, this.useCallId());
	}

	protected async internalRemoteChanges(state: string|undefined) {

			return client.jmap((this.controllerRoute ?? this.id) + "/changes", {
				sinceState: state
			}, this.useCallId());

	}
}


const stores: Record<string, any> = {};

/**
 * Get a single instance of a store by ID
 *
 * @param storeId
 */
export const jmapds = <EntityType extends DefaultEntity = DefaultEntity>(storeId:string, config?: Config<JmapDataSource>) : JmapDataSource<EntityType> => {
	if(!stores[storeId]) {
		stores[storeId] = createComponent(new JmapDataSource(storeId), config);

	}
	return stores[storeId];
}