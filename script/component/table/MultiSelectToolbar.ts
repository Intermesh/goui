/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {comp, Component} from "../Component.js";
import {tbarItems, Toolbar} from "../Toolbar.js";
import {Table} from "./Table.js";
import {t} from "../../Translate.js";
import {btn, Button} from "../Button.js";
import {Config} from "../Observable.js";

/**
 * A multiselect toolbar that is placed on top over the parent toolbar when a multiselection is made in a {@link Table} component.
 * This toolbar shows the number of selected items, a clear selection button. Typically a delete button is added.
 *
 * @link https://goui.io/#table Example
 */
export class MultiSelectToolbar extends Toolbar {
	private readonly label: Component;
	private readonly backBtn: Button;

	constructor(readonly table: Table) {
		super();

		this.table.rowSelection!.on("selectionchange", ({target}) => {

			const l = target.getSelected().length;

			this.hidden = l < 2;

			if (!this.hidden) {
				this.label.text = l + " " + t("selected");
			}
		});

		this.label = comp({tagName: "h3"});

		this.backBtn = btn({
			title: t("Back"),
			icon: "chevron_left",
			handler: () => {
				this.table.rowSelection!.clear();
			}
		})

		this.items.add(this.backBtn, this.label);

		this.hidden = true;

		this.cls = "multiselect";
	}
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
export const mstbar = (config: Config<MultiSelectToolbar, "table">, ...items: (Component | "->" | "-")[]) => {

	const c = new MultiSelectToolbar(config.table);
	if (config) {
		Object.assign(c, config);
	}

	c.items.add(...tbarItems(items));

	return c;
}
