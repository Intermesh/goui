import {AutocompleteField} from "./AutocompleteField";
import {AbstractDataSource, DataSourceStore, datasourcestore, Store} from "../../data";
import {column, Table, table} from "../table";
import {Config} from "../Observable";
import {FieldEventMap} from "./Field";
import {createComponent} from "../Component";
import {DateField} from "./DateField";



/**
 * Combo box
 *
 * An extension of the Autocomplete field that simplifies the creation of a simple combobox with a
 * valueProperty and displayProperty.
 */
export class ComboBox<DS extends AbstractDataSource = AbstractDataSource> extends AutocompleteField<Table<DataSourceStore<DS>>> {

	public filterName?:string;

	constructor(public readonly dataSource:DS, public readonly displayProperty = "name", public readonly valueProperty = "id") {

		const dropDownTable = table({
			headers: false,
			fitParent: true,
			store: datasourcestore({
				dataSource: dataSource,
				queryParams: {
					limit: 50
				}

			}),
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

		this.on("autocomplete", async (field, input) => {
			if(!this.list.store.queryParams.filter) {
				this.list.store.queryParams.filter = {};
			}
			this.list.store.queryParams.filter[this.filterName ?? this.displayProperty] = input;
			await this.list.store.load();
		});
	}


	pickerRecordToValue(field: this, record: any): string {
		return record[this.valueProperty];
	}

	async valueToTextField(field: this, value: string): Promise<string> {
		const nb = await this.dataSource.single(value);
		return nb ? nb.name : "?";
	}
}


type ComboBoxConfig = Config<ComboBox, FieldEventMap<ComboBox>, "dataSource">;

/**
 * Shorthand function to create {@see DateField}
 *
 * @param config
 */
export const combobox = (config: ComboBoxConfig) => createComponent(new ComboBox(config.dataSource, config.displayProperty ?? "name", config.valueProperty ?? "id"), config);