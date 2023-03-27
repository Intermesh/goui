import {client} from "./Client.js";
import {AbstractDataSource, QueryParams} from "../data/index.js";

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


export class JmapDataSource<EntityType> extends AbstractDataSource<EntityType> {


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