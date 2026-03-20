/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Component } from "../Component.js";
import { Toolbar } from "../Toolbar.js";
import { Table } from "./Table.js";
import { Config } from "../Observable.js";
type TableRef = Table | ((mstb: MultiSelectToolbar) => Table);
/**
 * A multiselect toolbar that is placed on top over the parent toolbar when a multiselection is made in a {@link Table} component.
 * This toolbar shows the number of selected items, a clear selection button. Typically a delete button is added.
 *
 * @link https://goui.io/#table Example
 */
export declare class MultiSelectToolbar extends Toolbar {
    private readonly label;
    private readonly backBtn;
    private table?;
    constructor(table: TableRef);
}
/**
 * Create a {@link MultiSelectToolbar} component
 *
 * A multiselect toolbar that is placed on top over the parent toolbar when a multiselection is made in a {@link Table} component.
 * This toolbar shows the number of selected items, a clear selection button. Typically a delete button is added.
 *
 * You can add this to a {@link Toolbar}
 *
 * @link https://goui.io/#table Example
 *
 * @example
 * ```
 * tbar({},
 *    mstbar({
 * 			table: usrTbl.table
 * 		},
 * 	    '->',
 * 			btn({
 * 				icon: "delete",
 * 				handler: async (btn) => {
 * 					const msTB = btn.parent as MultiSelectToolbar, ids = msTB.table.rowSelection!.getSelected().map((row) => row.id);
 * 					const result = await userDS.confirmDestroy(ids);
 * 					if (result != false) {
 * 						msTB.hide();
 * 					}
 * 				}
 * 			})
 * 		)
 * );
 *
 *
 * @param config
 * @param items
 */
export declare const mstbar: (config: Config<MultiSelectToolbar> & {
    table: TableRef;
}, ...items: (Component | "->" | "-")[]) => MultiSelectToolbar;
export {};
