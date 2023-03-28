/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {comp, Component, Config} from "../Component.js";
import {tbarItems, Toolbar} from "../Toolbar.js";
import {Table} from "./Table.js";
import {t} from "../../Translate.js";
import {btn, Button} from "../Button.js";

export class MultiSelectToolbar extends Toolbar {
	private label: Component;
	private backBtn: Button;

	constructor(private table: Table) {
		super();

		this.table.rowSelection!.on("selectionchange", (tableRowSelect) => {

			const l = tableRowSelect.selected.length;

			this.hidden = l < 2;

			if(!this.hidden) {
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
 * Create a {@see MultiSelectToolbar} component
 *
 * {@see Toolbar} for an example
 *
 * @param config
 * @param items
 */
export const mstbar = (config: Config<MultiSelectToolbar> & {table: Table}, ...items: (Component | "->" | "-")[]) => {

	const c = new MultiSelectToolbar(config.table);
	if (config) {
		Object.assign(c, config);
	}

	c.items.add(...tbarItems(items));

	return c;
}
