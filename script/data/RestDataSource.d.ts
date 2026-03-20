import { AbstractDataSource, BaseEntity, Changes, CommitResponse, DataSourceEventMap, DefaultEntity, EntityID, GetResponse, QueryParams, QueryResponse, SetRequest } from "./AbstractDataSource.js";
/**
 * REST based data source
 *
 * You probably need to extend this class and implement
 *
 * @category Data
 */
export declare class RestDataSource<EntityType extends BaseEntity = DefaultEntity> extends AbstractDataSource<EntityType, DataSourceEventMap> {
    readonly uri: string;
    baseRequestOptions: RequestInit;
    /**
     * Constructor
     *
     * @param uri The base URI of the REST API. for example https://groupoffice.com/api
     * @param id The Data source ID. Will be appended to the base uri above. for Example
     *  if the ID is "users" the uri will be: "https://groupoffice.com/api/users"
     * @param baseRequestOptions
     */
    constructor(uri: string, id?: string, baseRequestOptions?: RequestInit);
    limitParamName: string;
    positionParamName: string;
    filterParamName: string;
    sortParamName: string;
    sortDirectionParamName: string;
    read(id: number | number[], path?: string, options?: RequestInit): Promise<any>;
    doRequest(path?: string, options?: RequestInit): Promise<any>;
    protected request(path?: string, options?: RequestInit, queryParams?: URLSearchParams): Promise<any>;
    /**
     * Override to create JMAP style errors. Form handles for example:
     *
     * {type:"invalidProperties", validationErrors: {fieldName: {description: "some error description"}}}
     *
     * @param response
     * @protected
     */
    protected createErrorFromResponse(response: Response): Promise<any>;
    /**
     * Transforms the entity to a string to post to the server.
     *
     * @param data
     * @protected
     */
    protected dataToPostBody(data: any): string;
    protected entityFromServerResponse(data: any): any;
    protected internalCommit(params: SetRequest<EntityType>): Promise<CommitResponse<EntityType>>;
    protected internalGet(ids: EntityID[], properties: string[]): Promise<GetResponse<EntityType>>;
    protected queryParamsToUrlParams(params: QueryParams): URLSearchParams;
    protected queryParamsToRequestOptions(params: QueryParams): RequestInit | undefined;
    protected internalQuery(params: QueryParams): Promise<QueryResponse<EntityType>>;
    /**
     * No sync implemented for REST. States are ignored and data must always be refreshed.
     * @param state
     * @protected
     */
    protected internalRemoteChanges(state: string | undefined): Promise<Changes>;
    protected internalMerge(ids: EntityID[]): Promise<never>;
}
