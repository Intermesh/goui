import {AutocompleteField} from "./AutocompleteField.js";
import {
	AbstractDataSource,
	dataSourceEntityType,
	DataSourceStore,
	datasourcestore,
	DataSourceStoreConfig,
	Filter,
} from "../../data/index.js";
import {column, Table, table, TableConfig} from "../table/index.js";
import {createComponent} from "../Component.js";
import {Format} from "../../util/index.js";
import {FieldConfig} from "./Field.js";
import {t} from "../../Translate";

export type ComboBoxStoreConfig<DS extends AbstractDataSource = AbstractDataSource> = Partial<DataSourceStoreConfig<DS, any>>
export type ComboBoxDS<ComboBoxType> = ComboBoxType extends ComboBox<infer DS> ? DS : never;
export type ComboRenderer = (field:ComboBox, record:any) => string;

export const ComboBoxDefaultRenderer:ComboRenderer = (field,r)=> r ? r[field.displayProperty] : t("Not found");

/**
 * Combo box
 *
 * An extension of the Autocomplete field that simplifies the creation of a simple combobox with a
 * valueProperty and displayProperty.
 *
 * @link https://goui.io/#form/Select Example
 */
export class ComboBox<DS extends AbstractDataSource = AbstractDataSource> extends AutocompleteField<Table<DataSourceStore<DS>>> {

	/**
	 * When autocompleting from the datasource this filter name will be used.
	 */
	public filterName:string = "text";

	/**
	 * Set additional filter properties on the store.
	 */
	public filter?: Filter;

	/**
	 * Constructor
	 * @param dataSource
	 * @param displayProperty
	 * @param valueProperty
	 * @param renderer
	 * @param storeConfig
	 * @param tableConfig
	 * @param selectFirst Selects the first record on render
	 */
	constructor(
		public readonly dataSource:DS,
		public readonly displayProperty = "name",
		public readonly valueProperty = "id",
		protected renderer:ComboRenderer = ComboBoxDefaultRenderer, storeConfig:ComboBoxStoreConfig<DS> = {
			queryParams: {
				limit: 50
			}
		},
		tableConfig?: Partial<TableConfig>,
		protected selectFirst: boolean = false
		) {

		storeConfig.dataSource = dataSource;

		const dropDownTable = table(Object.assign({
			headers: false,
			fitParent: true,
			store: datasourcestore(storeConfig as DataSourceStoreConfig<any, any>),
			columns:[
				column({
					id: displayProperty,
					resizable: true,
					width: 312,
					sortable: true,
					renderer:(_columnValue, record) => {
						return Format.escapeHTML(renderer(this, record));
					}
				})
			]
		}, tableConfig)) as Table<DataSourceStore<DS, dataSourceEntityType<DS>>>

		super(dropDownTable);

		// load next data on scroll
		this.picker.list.store.addScrollLoader(this.menu.el);
		this.picker.list.store.queryParams.limit = 50;

		this.on("autocomplete", async ({input}) => {
			this.list.store.queryParams.position = 0;

			const filterName = (this.filterName ?? this.displayProperty);
			this.list.store.setFilter(filterName, {[filterName] : input});
			this.list.store.setFilter("combo", this.filter);
			await this.list.store.load();
		});

		if(selectFirst) {
			this.on('render', this.selectFirstRecord, {bind: this});
		}
	}

	protected async selectFirstRecord() {
		//auto select first entry if no value set
		if(!this.value) {
			const oldLimit = this.list.store.queryParams.limit;
			this.list.store.queryParams.limit = 1;
			const records = await this.list.store.load()
			this.list.store.queryParams.limit = oldLimit;
			//recheck cmp.value because window may have been loaded simultaneously.
			if(!this.value && records.length) {
				this.value = records[0].id;
				this.trackReset();
			}
		}
	}

	pickerRecordToValue(_field: this, record: any): string {
		return record[this.valueProperty];
	}

	async valueToTextField(_field: this, value: string): Promise<string> {
		if(value === "") {
			return "";
		}
		const record = await this.dataSource.single(value);

		return this.renderer(_field, record);
	}
}

export type ComboBoxConfig<Type extends ComboBox = ComboBox> = FieldConfig<Type, "dataSource"> & {
	/**
	 * Config for the {@link DataSourceStore}
	 */
	storeConfig?:ComboBoxStoreConfig<ComboBoxDS<Type>>,
	/**
	 * Renders the value in the list and input field. Must return plain text.
	 */
	renderer?:ComboRenderer,

	/**
	 * Select the first record on render
	 */
	selectFirst?:boolean

	tableConfig?: Partial<TableConfig>
};

/**
 * Shorthand function to create {@link ComboBox}
 *
 * @link https://goui.io/#form/Select
 * @param config
 */
export const combobox = (config: ComboBoxConfig) => createComponent(
	new ComboBox(
		config.dataSource,
		config.displayProperty ?? "name",
		config.valueProperty ?? "id",
		config.renderer ?? ComboBoxDefaultRenderer,
		config.storeConfig ?? {	queryParams: {limit: 50}},
		config.tableConfig ?? {},
		config.selectFirst ?? false
	),
	config);