/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {client} from "./Client.js";
import {AbstractDataSource, DefaultEntity, QueryParams} from "../data/AbstractDataSource.js";

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
		const params = {
			create: this.creates,
			update: this.updates,
			destroy: this.deletes
		}
		const response = await client.jmap(this.id + "/set", params);
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
