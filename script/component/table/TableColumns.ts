/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Config, Observable, ObservableEventMap} from "../Observable.js";
import {Table} from "./Table.js";
import {Component, createComponent} from "../Component.js";
import {Format} from "../../util/index.js";
import {checkbox, CheckboxField} from "../form/index.js";
import {btn} from "../Button.js";
import {menu} from "../menu/index.js";

/**
 * Return HTML or component to render into the table cell. Can also be async.
 *
 * Make sure the HTML it returns is HTML encoded so it's not vulnerable for XSS attacks.
 *
 * To create a multi line cell you can use h3,h4 and h5. For example:
 *
 * ```
 * return `<h3>${record.name.htmlEncode()}</h3><h4>${record.description.htmlEncode()}</h4><h5>${Format.smartDateTime(record.modifiedAt)}</h5>`
 * ```
 *
 * You can also return a component  like a {@link Button} or {@link Toolbar}. On a toolbar the CSS class "compact" is recommended.
 */
export type TableColumnRenderer = (columnValue: any, record: any, td: HTMLTableCellElement, table: Table, storeIndex: number, column: TableColumn) => string | Component | undefined | Promise<string|Component|undefined>;
export type HeaderRenderer = (col: TableColumn, headerEl: HTMLTableCellElement, table: Table) => string | Component;

export type align = "left" | "right" | "center";


export interface TableColumnEventMap extends ObservableEventMap {


	/**
	 * Fires when a table column renders
	 */
	render: {
		/**
		 * The result of the column renderer function
		 */
		result: string | Promise<string|Component|undefined> | Component | undefined,
		/**
		 * The store record
		 */
		record:any,
		/**
		 * The record index in the store
		 */
		storeIndex:number,

		/**
		 * The table's td element
		 */
		td: HTMLTableCellElement
	}
}

export class TableColumn<EventMap extends TableColumnEventMap = TableColumnEventMap> extends Observable<EventMap> {

	public parent: Table | undefined;

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
	 * @see ObjectUtil.get()
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
	 * Width in rem units
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

	/**
	 * Add CSS classes
	 */
	cls?: string

	/**
	 * Makes the column stick when scrolling horizontally
	 *
	 * All the consecutive sticky columns from the beginning stick to the left side. Others will stick to the right side.
	 *
	 * Note:  The sticky column needs a background color. It is currently assumed to be on a background with "bg-lowest"
	 */
	sticky?: boolean


	/**
	 * HTML encode the value
	 */
	htmlEncode: boolean = true
}

export type TableColumnConfig<T extends TableColumn = TableColumn> = Config<T> & {
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
		return Format.smartDateTime(date);
	}
	align: align = "right"
	width = 190
}

/**
 * Create a column showing date and time
 * @param config
 */
export const datetimecolumn = (config: TableColumnConfig) => createComponent(new DateTimeColumn(config.id), config);

export class DateColumn extends TableColumn {
	renderer = (date: string) => {
		return Format.smartDateTime(date, false);
	}
	align: align = "right"
	width = 128
}

/**
 * Create a column showing just a date
 *
 * @param config
 */
export const datecolumn = (config: TableColumnConfig) => createComponent(new DateColumn(config.id), config);

export class BoolColumn extends TableColumn {
	renderer = (v: string) => v ? '<i class="icon">check</i>' : ""
	align: align = "center"
	width = 64
	htmlEncode = false;
}



/**
 * Create a column showing a boolean value as check or empty
 *
 * @param config
 */
export const boolcolumn = (config: TableColumnConfig) => createComponent(new BoolColumn(config.id), config);

export class NumberColumn extends TableColumn {
	renderer: TableColumnRenderer = (v: number|undefined) => {
		return v ? Format.number(v, this.decimals) : "";
	}
	align: align = "right"
	width = 64
	decimals = 2
}

export const numbercolumn = (config: TableColumnConfig<NumberColumn>) => createComponent(new NumberColumn(config.id), config);


export class MoneyColumn extends TableColumn {
	renderer: TableColumnRenderer = (v: number|undefined) => {
		return v ? Format.money(v) : "";
	}
	align: align = "right"
	width = 64
	decimals = 2
}

export const moneycolumn = (config: TableColumnConfig<MoneyColumn>) => createComponent(new MoneyColumn(config.id), config);


export interface CheckboxColumnEventMap extends TableColumnEventMap {

	/**
	 * Fires when the checkbox is checked by the user
	 */
	change: {
		checkbox:CheckboxField,
		checked: boolean,
		record:any,
		storeIndex:number
	}
}

export class CheckboxColumn extends TableColumn<CheckboxColumnEventMap> {
	constructor(id: string) {
		super(id);

		this.cls = "checkbox-select-column";
		this.htmlEncode = false;
	}

	renderer : TableColumnRenderer = (val, record, td, table, rowIndex, column) => {
		return checkbox({
			value: val,
			listeners: {
				change: ({target, newValue}) => {
					record[column.property] = newValue;

					this.fire("change", {checkbox:target, checked:newValue, record, storeIndex: rowIndex});
				},
				render: ({target}) => {

					table.el.addEventListener("keydown", (e) => {
						if(e.key == " " && e.target == td.parentNode) {
							target.value = !target.value;
						}
					});
				},
			}
		});
	}
}



type CheckboxColumnConfig = Config<CheckboxColumn> & {
	/**
	 * The ID of the column which is also the default for the column 'property'
	 */
	id: string
};


/**
 * Create a checkbox column
 *
 * @param config
 */
export const checkboxcolumn = (config: CheckboxColumnConfig) => createComponent(new CheckboxColumn(config && config.id ? config.id : "checkbox"), config);





export class CheckboxSelectColumn extends TableColumn {

	constructor(id = "checkboxselect") {
		super(id);
		this.hidable = false;
		this.sticky = true;
		this.htmlEncode = false;
		this.cls = "checkbox-select-column";
	}

	headerRenderer: HeaderRenderer = (col, headerEl, table) => {

		return checkbox({
			listeners: {
				change: ({newValue}) => {

					if (newValue) {
						table.rowSelection!.selectAll();
					} else {
						table.rowSelection!.clear();
					}

				}
			}
		});
	}

	renderer: TableColumnRenderer = (val: boolean, record, td, table) => {

		// add to selection model if value is true
		if(val && table.rowSelection) {
			table.rowSelection.add(record);
		}

		return checkbox({
			value: val,
			listeners: {
				render: ({target}) => {
					target.el.addEventListener("mousedown", (ev) => {
						ev.stopPropagation()
					});
					target.el.addEventListener("click", (ev) => {
						ev.stopPropagation()
					});

					target.value = table.rowSelection!.isSelected(record);

					table.rowSelection!.on("selectionchange", () => {
						target.value = table.rowSelection!.isSelected(record);
					});

				},
				change: ( {newValue}) => {

					if (newValue) {
						table.rowSelection!.add(record);
					} else {
						table.rowSelection!.remove(record);
					}

				}
			}
		});
	}
}

export const checkboxselectcolumn = (config?: CheckboxColumnConfig) => createComponent(new CheckboxSelectColumn(config && config.id ? config.id : "checkboxselect"), config);


/**
 * Creates a menu button.
 *
 * All items will have a property dataSet.rowIndex and dataSet.table so you know which record has been clicked on.
 *
 * @param items
 */
export const menucolumn = (...items:Component[]) => column({
		width: 48,
		id: "btn",
		renderer: (columnValue: any, record, td, table, rowIndex) => {
			items.forEach(i => {
				i.dataSet.table = table;
				i.dataSet.rowIndex = rowIndex;
			});

			return btn({
				icon: "more_vert",
				menu: menu({}, ...items)
			})
		}
	});