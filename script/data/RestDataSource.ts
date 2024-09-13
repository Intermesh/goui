import {
	AbstractDataSource,
	BaseEntity, Changes,
	CommitResponse, DefaultEntity,
	EntityID,
	GetResponse,
	QueryParams, QueryResponse,
	SetRequest
} from "./AbstractDataSource";


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
	 */
	constructor(public readonly uri:string, id?: string, public baseRequestOptions: RequestInit = {
		mode: "cors",
		method: "GET"
	}) {
		id = id || "restDataSource";
		super(id);

		if(uri.substring(-1,1) != "/") {
			this.uri  = uri + "/";
		}
	}

	public limitParamName = "limit";
	public positionParamName = "offset";
	public filterParamName = "searchQuery";

	public sortParamName = "orderColumn";
	public sortDirectionParamName = "orderDirection";

	public read(id :number|number[], path: string="", options: RequestInit={}){
		if(typeof id === "number") {
			path += "/" + id;
		} else {
			if(path != "" && path.substring(-1,1) != "/") {
				// path = path + "/";
			}
		}
		return this.request(path, options);
	}

	public doRequest(path: string="", options: RequestInit={}) {
		return this.request(path, options);
	}

	protected async request(path: string = "", options: RequestInit = {}, queryParams?: URLSearchParams) {
		const opts = structuredClone(this.baseRequestOptions);

		Object.assign(opts, options);

		if (path != "" && path.substring(0, 1) != "") {
			path = "/" + path;
		}

		let url = this.uri + path;

		if (queryParams) {
			url += '?' + queryParams;
		}

		const response = await fetch(url, opts);
		if(!response.ok) {
			throw "Request error: " + response.status + " " + response.statusText;
		}
		return await response.json();
	}

	/**
	 * Transforms the entity to a string to post to the server.
	 *
	 * @param data
	 * @protected
	 */
	protected dataToPostBody(data:any) : string {
		return JSON.stringify(data);
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
						response.updated[id] = data;
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
						response.created[id] = data;
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

	protected async internalGet(ids: EntityID[]): Promise<GetResponse<EntityType>> {

		const promises: Promise<EntityType>[] = [];
		ids.forEach((id) => {
			promises.push(
				this.request(id + "").then((data:any):EntityType => {
					return data.data;
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

	protected convertQueryParams(params: QueryParams) {

		const uriParams = new URLSearchParams();

		if(params.limit)
			uriParams.set(this.limitParamName, params.limit.toString());

		if(params.position) {
			uriParams.set(this.positionParamName, params.position.toString());
		}

		if(params.filter) {
			uriParams.set(this.filterParamName, params.filter);
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
	

	protected async internalQuery(params: QueryParams): Promise<QueryResponse> {

		const response = await this.request("", undefined, this.convertQueryParams(params));

		if(!Array.isArray(response.data)) {
			throw "Invalid query response";
		}
		// immediately add data so we don't have to fetch it when data is retrieved using {@see get()} or {@see single()}
		response.data.forEach((r:EntityType) => {
			if(!this.data[r.id!]) {
				this.add(r);
			}
		});

		const ids = response.data.map((r:EntityType) => r.id);

		return {
			ids: ids,
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

}

