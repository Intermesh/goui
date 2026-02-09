/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Config, Observable, ObservableEventMap} from "../Observable.js";
import {Table} from "./Table.js";
import {Component, createComponent} from "../Component.js";
import {DateTime, Format} from "../../util/index.js";
import {checkbox, CheckboxField} from "../form/index.js";
import {btn} from "../Button.js";
import {Menu, menu} from "../menu/index.js";

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

/**
 * Table column class
 *
 * Contains information to render columns in a {@link Table}
 */
export class TableColumn<EventMap extends TableColumnEventMap = TableColumnEventMap> extends Observable<EventMap> {


	/**
	 * Column constructor
	 *
	 * @param id The column ID. Also used for {@link property}
	 */
	constructor(public id: string) {
		super();

		this.property = id;
	}

	/**
	 * Containst the table this column belongs to.
	 */
	public parent: Table | undefined;

	/**
	 * Path to property. If not given then 'id' is used
	 * If the property is an object you can get a nested 'bar' property with: "foo/bar".
	 * @see ObjectUtil.get()
	 */
	public property: string

	/**
	 * Header in the table
	 */
	public header?: string;

	/**
	 * Renderer function for the display
	 */
	public renderer?: TableColumnRenderer


	/**
	 * Renderer function for the header
	 */
	public headerRenderer?: HeaderRenderer


	/**
	 * Optional Initialize function
	 */
	public init?: (table:Table) => void;

	/**
	 * Make the column resizable by the user
	 */
	public resizable = false

	/**
	 * Make it sortable by the user
	 */
	public sortable = false

	/**
	 * Width in rem units
	 */
	public width?: number

	/**
	 * Text alignment
	 */
	public align: align = "left"

	/**
	 * Hide the column. It can be enabled by the user via the context menu.
	 */
	public hidden = false

	/**
	 * Enable this column in the enabled columns menu
	 */
	public hidable = true

	/**
	 * When rendered this is set to the DOM element.
	 * It's used to update the header width
	 */
	public headerEl?: HTMLTableCellElement;

	/**
	 * Add CSS classes
	 */
	public cls?: string

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
 * @see TableColumn
 * @param config
 */
export const column = (config: TableColumnConfig) => createComponent(new TableColumn(config.id), config);

export class DateTimeColumn extends TableColumn {
	renderer:TableColumnRenderer = (date: string|null, record:any, td:any) => {
		if(!date) return "-";
		const dt = new DateTime(date);
		td.title = dt.format(Format.dateFormat+ " " + Format.timeFormat);
		return Format.smartDateTime(dt);
	}
	align: align = "right"
	width = 190
}

/**
 * Create a column showing date and time
 *
 * @see DateTimeColumn
 * @param config
 */
export const datetimecolumn = (config: TableColumnConfig) => createComponent(new DateTimeColumn(config.id), config);

export class DateColumn extends TableColumn {
	renderer:TableColumnRenderer  = (date: string|null, record, td) => {
		if(!date) return "-";
		const dt = new DateTime(date);
		td.title = dt.format(Format.dateFormat+ " " + Format.timeFormat);

		return Format.smartDateTime(dt, false);
	}
	align: align = "right"
	width = 128
}

/**
 * Create a column showing just a date
 *
 * @see DateColumn
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
 * @see BoolColumn
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

/**
 * A column to show a number
 *
 * @see NumberColumn
 * @param config
 */
export const numbercolumn = (config: TableColumnConfig<NumberColumn>) => createComponent(new NumberColumn(config.id), config);


export class MoneyColumn extends TableColumn {
	renderer: TableColumnRenderer = (v: number|undefined) => {
		return v ? Format.money(v, this.currency) : "";
	}
	align: align = "right"
	width = 64
	/**
	 * Round to this number of decimals
	 */
	decimals = 2

	/**
	 * Override default {@link Format.currency}
	 */
	currency = Format.currency
}

/**
 * A column to show money values
 *
 * @see MoneyColumn
 * @param config
 */
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

/**
 * A column with a checkbox input
 */
export class CheckboxColumn extends TableColumn<CheckboxColumnEventMap> {
	/**
	 * @inheritDoc
	 */
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
 * Create a checkbox input column
 *
 * @see CheckboxColumn
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

/**
 * Create a checkbox that interacts with the row selection model
 *
 * @link Table.rowSelection
 *
 * @param config
 */
export const checkboxselectcolumn = (config?: Config<CheckboxColumn>) => createComponent(new CheckboxSelectColumn(config && config.id ? config.id : "checkboxselect"), config);


/**
 * Creates a menu button
 *
 * It reuses a single menu for each row
 *
 * The menu will have a property dataSet.rowIndex and dataSet.table so you know which record has been clicked on.
 *
 * @example
 * ```
 * menucolumn(
 * 		btn({
 * 			text: t("Open"),
 * 			icon: "open_in_new",
 * 			handler: (b) => {
 * 				this.open(b.parent!.dataSet.rowIndex);
 * 			}
 * 		})
 * 	)
 * ```
 *
 * @param config
 * @param items
 */
export const menucolumn = (config:Config<TableColumn> & {menu: Menu}) => {

	config.menu.isDropdown = true;
	config.menu.removeOnClose = false;


	return column({
		sticky: true,
		width: 40,
		id: "btn",
		init: (tbl) => {
			tbl.on("remove", () => {
				config.menu.remove();
			})
		},
		renderer: (columnValue: any, record, td, table, rowIndex) => {

			return btn({
				icon: "more_vert",
				listeners: {
					click: ({ev, target}) => {

						// to allow click on menu button without firing row click
						ev.stopPropagation();

						config.menu.alignTo = target.el;
						config.menu.dataSet.table = table;
						config.menu.dataSet.rowIndex = rowIndex;
						config.menu.show();
					}
				}
			})
		},
		...config
	});
}