import {AutocompleteEventMap, AutocompleteField} from "./AutocompleteField";
import {
	AbstractDataSource,
	DataSourceStore,
	datasourcestore,
	DataSourceStoreConfig,
	QueryFilter,
} from "../../data";
import {column, Table, table} from "../table";
import {Config} from "../Observable";
import {createComponent} from "../Component";

export type ComboBoxStoreConfig<DS extends AbstractDataSource = AbstractDataSource> = Partial<DataSourceStoreConfig<DS, any>>

/**
 * Combo box
 *
 * An extension of the Autocomplete field that simplifies the creation of a simple combobox with a
 * valueProperty and displayProperty.
 */
export class ComboBox<DS extends AbstractDataSource = AbstractDataSource> extends AutocompleteField<Table<DataSourceStore<DS>>> {

	/**
	 * When autocompleting from the datasource this filter name will be used.
	 */
	public filterName:string = "text";

	/**
	 * Set additional filter properties on the store.
	 */
	public filter?: QueryFilter;

	constructor(public readonly dataSource:DS, public readonly displayProperty = "name", public readonly valueProperty = "id", storeConfig:ComboBoxStoreConfig<DS> = {
		queryParams: {
			limit: 50
		}
	}) {

		storeConfig.dataSource = dataSource;

		const dropDownTable = table({
			headers: false,
			fitParent: true,
			store: datasourcestore(storeConfig as DataSourceStoreConfig<any, any>),
			columns:[
				column({
					id:displayProperty,
					resizable: true,
					width: 312,
					sortable: true
				})
			]
		})

		super(dropDownTable);

		// load next data on scroll
		this.picker.list.store.addScrollLoader(this.menu.el);

		this.on("autocomplete", async (_field, input) => {
			this.list.store.queryParams.position = 0;
			if(!this.list.store.queryParams.filter) {
				this.list.store.queryParams.filter = {};
			}

			if(this.filter) {
				Object.assign(this.list.store.queryParams.filter, this.filter);
			}
			this.list.store.queryParams.filter[this.filterName ?? this.displayProperty] = input;
			await this.list.store.load();
		});
	}

	pickerRecordToValue(_field: this, record: any): string {
		return record[this.valueProperty];
	}

	async valueToTextField(_field: this, value: string): Promise<string> {
		if(value === "") {
			return "";
		}
		const nb = await this.dataSource.single(value);
		return nb ? nb[this.displayProperty] : "?";
	}
}

export type ComboBoxConfig<Type extends ComboBox = ComboBox> = Config<Type, AutocompleteEventMap<Type>, "dataSource"> & {
	storeConfig?:ComboBoxStoreConfig
};

/**
 * Shorthand function to create {@see DateField}
 *
 * @param config
 */
export const combobox = (config: ComboBoxConfig) => createComponent(new ComboBox(config.dataSource, config.displayProperty ?? "name", config.valueProperty ?? "id", config.storeConfig ?? {
	queryParams: {
		limit: 50
	}
}), config);