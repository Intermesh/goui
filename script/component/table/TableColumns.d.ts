/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Config, Observable, ObservableEventMap } from "../Observable.js";
import { Table } from "./Table.js";
import { Component } from "../Component.js";
import { CheckboxField } from "../form/index.js";
import { Menu } from "../menu/index.js";
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
export type TableColumnRenderer = (columnValue: any, record: any, td: HTMLTableCellElement, table: Table, storeIndex: number, column: TableColumn) => string | Component | undefined | Promise<string | Component | undefined>;
export type HeaderRenderer = (col: TableColumn, headerEl: HTMLTableCellElement, table: Table) => string | Component;
export type FooterRenderer = (columnValue: any, record: any, td: HTMLTableCellElement, table: Table, column: TableColumn) => string | Component | undefined | Promise<string | Component | undefined>;
export type align = "left" | "right" | "center";
export interface TableColumnEventMap extends ObservableEventMap {
    /**
     * Fires when a table column renders
     */
    render: {
        /**
         * The result of the column renderer function
         */
        result: string | Promise<string | Component | undefined> | Component | undefined;
        /**
         * The store record
         */
        record: any;
        /**
         * The record index in the store
         */
        storeIndex: number;
        /**
         * The table's td element
         */
        td: HTMLTableCellElement;
    };
}
/**
 * Table column class
 *
 * Contains information to render columns in a {@link Table}
 */
export declare class TableColumn<EventMap extends TableColumnEventMap = TableColumnEventMap> extends Observable<EventMap> {
    id: string;
    /**
     * Column constructor
     *
     * @param id The column ID. Also used for {@link property}
     */
    constructor(id: string);
    /**
     * Containst the table this column belongs to.
     */
    parent: Table | undefined;
    /**
     * Path to property. If not given then 'id' is used
     * If the property is an object you can get a nested 'bar' property with: "foo/bar".
     * @see ObjectUtil.get()
     */
    property: string;
    /**
     * Header in the table
     */
    header?: string;
    /**
     * Renderer function for the display
     */
    renderer?: TableColumnRenderer;
    /**
     * Renderer function for the header
     */
    headerRenderer?: HeaderRenderer;
    /**
     * Renderer function for the footer
     */
    footerRenderer?: FooterRenderer;
    /**
     * Optional Initialize function
     */
    init?: (table: Table) => void;
    /**
     * Make the column resizable by the user
     */
    resizable: boolean;
    /**
     * Make it sortable by the user
     */
    sortable: boolean;
    /**
     * Width in rem units
     */
    width?: number;
    /**
     * Text alignment
     */
    align: align;
    /**
     * Hide the column. It can be enabled by the user via the context menu.
     */
    hidden: boolean;
    /**
     * Enable this column in the enabled columns menu
     */
    hidable: boolean;
    /**
     * When rendered this is set to the DOM element.
     * It's used to update the header width
     */
    headerEl?: HTMLTableCellElement;
    /**
     * Add CSS classes
     */
    cls?: string;
    /**
     * Makes the column stick when scrolling horizontally
     *
     * All the consecutive sticky columns from the beginning stick to the left side. Others will stick to the right side.
     *
     * Note:  The sticky column needs a background color. It is currently assumed to be on a background with "bg-lowest"
     */
    sticky?: boolean;
    /**
     * HTML encode the value
     */
    htmlEncode: boolean;
}
export type TableColumnConfig<T extends TableColumn = TableColumn> = Config<T> & {
    /**
     * The ID of the column which is also the default for the column 'property'
     */
    id: string;
};
/**
 * Create a table column
 *
 * @see TableColumn
 * @param config
 */
export declare const column: (config: TableColumnConfig) => TableColumn<TableColumnEventMap>;
export declare class DateTimeColumn extends TableColumn {
    renderer: TableColumnRenderer;
    align: align;
    width: number;
}
/**
 * Create a column showing date and time
 *
 * @see DateTimeColumn
 * @param config
 */
export declare const datetimecolumn: (config: TableColumnConfig) => DateTimeColumn;
export declare class DateColumn extends TableColumn {
    renderer: TableColumnRenderer;
    align: align;
    width: number;
}
/**
 * Create a column showing just a date
 *
 * @see DateColumn
 * @param config
 */
export declare const datecolumn: (config: TableColumnConfig) => DateColumn;
export declare class BoolColumn extends TableColumn {
    renderer: (v: string) => "" | "<i class=\"icon\">check</i>";
    align: align;
    width: number;
    htmlEncode: boolean;
}
/**
 * Create a column showing a boolean value as check or empty
 *
 * @see BoolColumn
 * @param config
 */
export declare const boolcolumn: (config: TableColumnConfig) => BoolColumn;
export declare class NumberColumn extends TableColumn {
    renderer: TableColumnRenderer;
    align: align;
    width: number;
    decimals: number;
}
/**
 * A column to show a number
 *
 * @see NumberColumn
 * @param config
 */
export declare const numbercolumn: (config: TableColumnConfig<NumberColumn>) => NumberColumn;
export declare class MoneyColumn extends TableColumn {
    renderer: TableColumnRenderer;
    align: align;
    width: number;
    /**
     * Round to this number of decimals
     */
    decimals: number;
    /**
     * Override default {@link Format.currency}
     */
    currency: string;
}
/**
 * A column to show money values
 *
 * @see MoneyColumn
 * @param config
 */
export declare const moneycolumn: (config: TableColumnConfig<MoneyColumn>) => MoneyColumn;
export interface CheckboxColumnEventMap extends TableColumnEventMap {
    /**
     * Fires when the checkbox is checked by the user
     */
    change: {
        checkbox: CheckboxField;
        checked: boolean;
        record: any;
        storeIndex: number;
    };
}
/**
 * A column with a checkbox input
 */
export declare class CheckboxColumn extends TableColumn<CheckboxColumnEventMap> {
    /**
     * @inheritDoc
     */
    constructor(id: string);
    renderer: TableColumnRenderer;
}
type CheckboxColumnConfig = Config<CheckboxColumn> & {
    /**
     * The ID of the column which is also the default for the column 'property'
     */
    id: string;
};
/**
 * Create a checkbox input column
 *
 * @see CheckboxColumn
 * @param config
 */
export declare const checkboxcolumn: (config: CheckboxColumnConfig) => CheckboxColumn;
export declare class CheckboxSelectColumn extends TableColumn {
    constructor(id?: string);
    headerRenderer: HeaderRenderer;
    renderer: TableColumnRenderer;
}
/**
 * Create a checkbox that interacts with the row selection model
 *
 * @link Table.rowSelection
 *
 * @param config
 */
export declare const checkboxselectcolumn: (config?: Config<CheckboxColumn>) => CheckboxSelectColumn;
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
export declare const menucolumn: (config: Config<TableColumn> & {
    menu: Menu;
}) => TableColumn<TableColumnEventMap>;
export {};
