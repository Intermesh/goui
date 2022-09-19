import {Store, StoreRecord} from "../../data/Store.js";
import {Observable} from "../Observable.js";
import {Table} from "./Table.js";
import {Component, Config, createComponent} from "../Component.js";
import {Format} from "../../util/Format.js";
import {checkbox} from "../form/CheckboxField.js";

type TableColumnRenderer = (columnValue: any, record: StoreRecord, td: HTMLTableCellElement, table: Table, rowIndex: number) => string | Promise<string> | Component | Promise<Component>;
type HeaderRenderer = (col:TableColumn, headerEl: HTMLTableCellElement, table: Table) => string | Component;

export type align = "left" | "right" | "center";

export class TableColumn extends Observable {

	/**
	 *
	 * The column ID. Also used for 'property'
	 */
	constructor(public id: string) {
		super();

		this.property = id;
	}

	/**
	 * Path to property. If not given then 'id' is used
	 *
	 * @see ObjectUtil.path()
	 */
	public property: string

	/**
	 * Header in the table
	 */
	header?: string;

	/**
	 * Renderer function for the display
	 */
	renderer?: TableColumnRenderer


	/**
	 * Renderer function for the header
	 */
	headerRenderer?: HeaderRenderer

	/**
	 * Make the column resizable by the user
	 */
	resizable = false

	/**
	 * Make it sortable by the user
	 */
	sortable = false

	/**
	 * Width in pixels
	 */
	width?: number

	/**
	 * Text alignment
	 */
	align: align = "left"

	/**
	 * Hide the column. It can be enabled by the user via the context menu.
	 */
	hidden = false

	/**
	 * Enable this column in the enabled columns menu
	 */
	hidable = true

	/**
	 * When rendered this is set to the DOM element.
	 * It's used to update the header width
	 */
	headerEl?: HTMLTableCellElement;
}

type TableColumnConfig = Config<TableColumn> & {
	/**
	 * The ID of the column which is also the default for the column 'property'
	 */
	id: string
};
/**
 * Create a table column
 *
 * @param config
 */
export const column = (config: TableColumnConfig) => createComponent(new TableColumn(config.id), config);

export class DateTimeColumn extends TableColumn {
	renderer = (date: string) => {
		return Format.dateTime(date);
	}

	//argh!? https://stackoverflow.com/questions/43121661/typescript-type-inference-issue-with-string-literal
	align = "right" as align
	width = 190
}

/**
 * Create a column showing date and time
 * @param config
 */
export const datetimecolumn = (config: TableColumnConfig) => createComponent(new DateTimeColumn(config.id), config);

export class DateColumn extends TableColumn {
	renderer = (date: string) => {
		return Format.date(date);
	}

	//argh!? https://stackoverflow.com/questions/43121661/typescript-type-inference-issue-with-string-literal
	align = "right" as align
	width = 128
}

/**
 * Create a column showing just a date
 *
 * @param config
 */
export const datecolumn = (config: TableColumnConfig) => createComponent(new DateColumn(config.id), config);

export class CheckboxColumn extends TableColumn {
	width = 40
	renderer = (val: boolean) => {
		return checkbox({
			value: val
		});
	}
}

/**
 * Create a checkbox column
 *
 * @param config
 */
export const checkboxcolumn = (config: TableColumnConfig) => createComponent(new CheckboxColumn(config.id), config);


export class CheckboxSelectColumn extends TableColumn {

	constructor() {
		super("checkboxselect");
		this.hidable = false;
	}
	width = 40
	headerRenderer:HeaderRenderer = (col, headerEl,table) => {

		return checkbox({
			listeners: {
				change: (field, newValue, oldValue) => {

					if(newValue) {
						table.rowSelection!.selectAll();
					} else
					{
						table.rowSelection!.clear();
					}

				}
			}
		});
	}

	renderer:TableColumnRenderer = (val: boolean, record, td, table, rowIndex) => {


		return checkbox({
			value: val,
			listeners: {
				render: (field) => {
					field.el.addEventListener("click", (ev) => {
						ev.stopPropagation()
					});

					table.rowSelection!.on("selectionchange", () => {
						field.value = table.rowSelection!.selected.indexOf(rowIndex) > -1;
					});
				},
				change: (field, newValue, oldValue) => {

					const index = table.store.indexOf(record), selected = table.rowSelection!.selected;
					if(newValue) {
						selected.push(index);
						table.rowSelection!.selected = selected;
					} else
					{
						table.rowSelection!.selected = selected.filter(i => i != index);
					}

				}
			}
		});
	}
}

export const checkboxselectcolumn = (config?: TableColumnConfig) => createComponent(new CheckboxSelectColumn(), config);