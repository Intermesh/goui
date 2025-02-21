import {
	AbstractDataSource,
	BaseEntity,
	Changes,
	CommitResponse,
	DefaultEntity,
	EntityID,
	GetResponse,
	QueryParams,
	QueryResponse,
	SetRequest
} from "./AbstractDataSource.js";


/**
 * REST based data source
 *
 * You probably need to extend this class and implement
 *
 * @category Data
 */
export class RestDataSource<EntityType extends BaseEntity = DefaultEntity> extends AbstractDataSource<EntityType> {

	/**
	 * Constructor
	 *
	 * @param uri The base URI of the REST API. for example https://groupoffice.com/api
	 * @param id The Data source ID. Will be appended to the base uri above. for Example
	 *  if the ID is "users" the uri will be: "https://groupoffice.com/api/users"
	 * @param baseRequestOptions
	 */
	constructor(public readonly uri:string, id?: string, public baseRequestOptions: RequestInit = {
		mode: "cors",
		method: "GET"
	}) {
		id = id || "restDataSource";
		super(id);

		// if(uri.slice(-1) != "/") {
		// 	this.uri  = uri + "/";
		// }

		// We can't persist with REST stores as we can't sync data like with JMAP
		this.persist = false;
	}

	public limitParamName = "limit";
	public positionParamName = "offset";
	public filterParamName = "searchQuery";

	public sortParamName = "orderColumn";
	public sortDirectionParamName = "orderDirection";

	public read(id :number|number[], path: string="", options: RequestInit={}){
		if(typeof id === "number") {
			path += "/" + id;
		}
		return this.request(path, options);
	}

	public doRequest(path: string="", options: RequestInit={}) {
		return this.request(path, options);
	}

	protected async request(path: string = "", options: RequestInit = {}, queryParams?: URLSearchParams) {
		const opts = structuredClone(this.baseRequestOptions);

		Object.assign(opts, options);

		// if path does not start with slash or uri does not end with slash
		if (path != '' && path.slice(0,1) !== '/' && this.uri.slice(-1) !== '/') {
			path = "/" + path;
		}

		let url = this.uri + path;

		if (queryParams && queryParams.size) {
			url += '?' + queryParams;
		}

		const response = await fetch(url, opts);
		if(!response.ok) {
			throw await this.createErrorFromResponse(response);
		}
		return await response.json();
	}

	/**
	 * Override to create JMAP style errors. Form handles for example:
	 *
	 * {type:"invalidProperties", validationErrors: {fieldName: {description: "some error description"}}}
	 *
	 * @param response
	 * @protected
	 */
	protected async createErrorFromResponse(response:Response) : Promise<any> {
		const body = await response.text();
		return new Error("Request error: " + response.status + " " + response.statusText + "\n\n" + body);
	}

	/**
	 * Transforms the entity to a string to post to the server.
	 *
	 * @param data
	 * @protected
	 */
	protected dataToPostBody(data:any) : string {
		return JSON.stringify({data: data});
	}

	protected entityFromServerResponse(data:any) {
		return data.data;
	}

	protected internalCommit(params: SetRequest<EntityType>): Promise<CommitResponse<EntityType>> {

		const response:CommitResponse<EntityType> = {
			updated: {},
			created: {},
			destroyed:[]
		}, promises = [];

		for(let id in params.update) {

			promises.push(
				this.request(id, {
					method: "PUT",
					body: this.dataToPostBody(params.update[id])
				})
					.then((data:any) => {

						if(!response.updated) {
							response.updated = {};
						}
						response.updated[id] = this.entityFromServerResponse(data);
					})
					.catch((reason) => {
						if(!response.notUpdated) {
							response.notUpdated = {};
						}
						response.notUpdated[id] = reason;
					})
			)
		}


		for(let id in params.create) {

			promises.push(
				this.request("", {
					method: "POST",
					body: this.dataToPostBody(params.create[id])
				})
					.then((data:any) => {
						if(!response.created) {
							response.created = {};
						}
						response.created[id] = this.entityFromServerResponse(data);
					})
					.catch((reason) => {
						if(!response.notCreated) {
							response.notCreated = {};
						}
						response.notCreated[id] = reason;
					})
			)
		}

		for(let id of params.destroy) {

			promises.push(
				this.request(id + "", {
					method: "DELETE"
				})
					.then(() => {
						if(!response.destroyed) {
							response.destroyed = [];
						}
						response.destroyed.push(id);
					})
					.catch((reason) => {
						if(!response.notDestroyed) {
							response.notDestroyed = {};
						}
						response.notDestroyed[id] = reason;
					})
			)
		}

		return Promise.all(promises).then(() => {
			return response;
		});
	}

	protected async internalGet(ids: EntityID[], properties:string[]): Promise<GetResponse<EntityType>> {

		const promises: Promise<EntityType>[] = [];
		ids.forEach((id) => {
			promises.push(
				this.request(id + "").then((data:any):EntityType => {
					return this.entityFromServerResponse(data);
				})
			)
		})

		const users = await Promise.all(promises);

		const r: GetResponse<EntityType> = {
			list: []
		}
		users.forEach(u => {
			r.list.push(u);
		})

		return r;

	}

	protected queryParamsToUrlParams(params: QueryParams) {

		const uriParams = new URLSearchParams();

		if(params.limit)
			uriParams.set(this.limitParamName, params.limit.toString());

		if(params.position) {
			uriParams.set(this.positionParamName, params.position.toString());
		}

		if(params.sort && params.sort.length) {
			uriParams.set(this.sortParamName, params.sort[0].property);

			uriParams.set(this.sortDirectionParamName, params.sort[0].isAscending ? "ASC" : "DESC");
		}

		if(params.urlQueryParams) {
			for(const k in params.urlQueryParams) {
				uriParams.set(k, params.urlQueryParams[k]);
			}
		}

		return uriParams;

	}

	protected queryParamsToRequestOptions(params: QueryParams) : RequestInit | undefined{
		return undefined;
	}


	protected async internalQuery(params: QueryParams): Promise<QueryResponse<EntityType>> {

		const response = await this.request("", this.queryParamsToRequestOptions(params), this.queryParamsToUrlParams(params));

		if(!Array.isArray(response.data)) {
			throw "Invalid query response";
		}
		// immediately add data so we don't have to fetch it when data is retrieved using {@link get()} or {@link single()}
		this.entityFromServerResponse(response);

		const ids = response.data.map((r:EntityType) => r.id);

		return {
			ids: ids,
			list: response.data,
			total: response.total
		}
	}

	/**
	 * No sync implemented for REST. States are ignored and data must always be refreshed.
	 * @param state
	 * @protected
	 */
	protected async internalRemoteChanges(state: string | undefined): Promise<Changes> {
		return {}
	}

	protected async internalMerge(ids:EntityID[]) {
		return Promise.reject("Not implemented");
	}

}

