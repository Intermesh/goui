import {AbstractDataSource} from "./AbstractDataSource.js";

/**
 * Collection of DataSource instances.
 *
 * Makes sure there is only one instance of each ID.
 */
class DataSourceManager {
	private stores:Record<string, any> = {};

	/**
	 * Get the single instance of a data source by id.
	 *
	 * @example
	 * ```
	 * const ds = dataSources.get("User", JmapDataSource<UserType>);
	 * const user = await ds.single(1);
	 * ```
	 *
	 * @param id
	 * @param dataSourceType
	 */
	public get<DataSourceType extends AbstractDataSource>(id:string, dataSourceType: {new (id:string): DataSourceType}): DataSourceType {

		if(!this.stores[id]) {
			this.stores[id] = new dataSourceType(id);
		}
		return this.stores[id];
	}
}

/**
 * Collection of DataSource instances.
 *
 * Makes sure there is only one instance of each ID.
 */
export const dataSources = new DataSourceManager();