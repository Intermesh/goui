/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { ComponentState } from "../Component.js";
import { Store } from "../../data/Store.js";
import { TableColumn } from "./TableColumns.js";
import { List, ListEventMap } from "../List.js";
import { Config } from "../Observable.js";
/**
 * Table component
 *
 * @link https://goui.io/#table Example
 *
 * @example
 * ```
 * const records:StoreRecord[] = [];
 *
 * 	for(let i = 1; i <= 100; i++) {
 * 		records.push({number: i, description: "Test " + i, createdAt: (new DateTime()).format("c")});
 * 	}
 *
 * 	const table = table({
 * 		store: const store = jmapstore({
 * 			entity: "TaskList",
 * 			properties: ['id', 'name', 'support'],
 * 			queryParams: {
 * 				limit: 20,
 * 				filter: {
 * 					forSupport: true,
 * 					role: "support", //support tasklists
 * 				}
 * 			},
 * 			sort: [{property: "name", isAscending: true}]
 * 		}),
 * 		cls: "fit",
 * 		columns: [
 * 			{
 * 				header: "Index",
 * 				id: "id",
 * 				renderer: (value, record, td, table) => {
 * 					return table.getStore().findRecordIndex(r => record.number == r.number).toString();
 * 				},
 * 				resizable: true,
 * 				width: 60,
 * 				sortable: false
 * 			},
 * 			{
 * 				header: "Number",
 * 				id: "number",
 * 				sortable: true,
 * 				resizable: true,
 * 				width: 200
 * 			},
 * 			{
 * 				header: "Description",
 * 				id: "description",
 * 				sortable: true,
 * 				resizable: true,
 * 				width: 300
 * 			},
 * 			datecolumn({
 * 				header: "Created At",
 * 				id: "createdAt",
 * 				sortable: true
 * 			})
 * 			]
 * 	});
 *  ```
 *
 *
 */
export declare class Table<StoreType extends Store = Store, EventMap extends ListEventMap = ListEventMap> extends List<StoreType, EventMap> {
    private _columns;
    /**
     * The table columns
     *
     * @param columns
     */
    set columns(columns: TableColumn[]);
    get columns(): TableColumn[];
    /**
     *
     * @param store Store to provide data
     * @param columns The table columns
     */
    constructor(store: StoreType, columns: TableColumn[]);
    /**
     * Make the table fits its container in width by setting min-width: 100%
     * Defaults to true
     */
    fitParent: boolean;
    /**
     * Show headers
     */
    headers: boolean;
    protected emptyStateTag: keyof HTMLElementTagNameMap;
    private minCellWidth;
    protected baseCls: string;
    private headersRow?;
    protected itemTag: keyof HTMLElementTagNameMap;
    /**
     * Allow reordering columns by drag and drop
     */
    reorderColumns: boolean;
    protected internalRemove(): void;
    protected restoreState(state: ComponentState): void;
    /**
     * Find column by "property" property.
     *
     * It's the property path of the data linked to the column
     *
     * @param id
     */
    findColumnById(id: string): TableColumn<import("./TableColumns.js").TableColumnEventMap>;
    /**
     * Scroll a column into view
     *
     * Note: If you use sticky columns it might be necessary to use:
     *
     * ```
     * style: {
     * 	scrollPaddingRight: "8rem" // fix for scrollIntoView and sticky column
     * },
     * ```
     * @param id
     * @param opts
     */
    scrollToColumn(id: string, opts?: boolean | ScrollIntoViewOptions): boolean;
    protected buildState(): ComponentState;
    protected columnSort: string[] | undefined;
    private getColumnSort;
    protected renderBody(): void;
    private columnMenu;
    private showColumnMenu;
    private createColumnSplitter;
    private renderColGroup;
    private footerRecord;
    private footerEl;
    /**
     * Set record to be used as footer row
     *
     * @see TableColumn.footerRenderer
     * @param record
     */
    setFooter(record: any): void;
    private renderFooter;
    private renderHeaders;
    protected initSortable(): void;
    private onSort;
    private colsAreFixed;
    /**
     * When resizing columns we must calculate absolute pixel widths
     *
     * @private
     */
    private fixColumnWidths;
    /**
     * Returns the sum of column widths
     *
     * @param untilColumnIndex Calc width until this column
     */
    private calcTableWidth;
    protected groupSelector: string;
    protected renderGroup(record: any): HTMLElement;
    focusRow(index: number): boolean;
    private calcStickyRight;
}
export type TableConfig<TableType extends Table = Table> = Omit<Config<TableType, "store" | "columns">, "rowSelection">;
/**
 * Shorthand function to create {@link Table}
 *
 * @param config
 */
export declare const table: <StoreType extends Store = Store>(config: TableConfig<Table<StoreType>>) => Table<StoreType, ListEventMap>;
