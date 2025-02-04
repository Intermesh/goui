/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {comp, Component, ComponentEventMap} from "../Component.js";
import {tbarItems, Toolbar} from "../Toolbar.js";
import {Table} from "./Table.js";
import {t} from "../../Translate.js";
import {btn, Button} from "../Button.js";
import {Config} from "../Observable.js";

export class MultiSelectToolbar extends Toolbar {
	private label: Component;
	private backBtn: Button;

	constructor(readonly table: Table) {
		super();

		this.table.rowSelection!.on("selectionchange", (tableRowSelect) => {

			const l = tableRowSelect.getSelected().length;

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
 * You can add this to a Toolbar
 *
 * @param config
 * @param items
 */
export const mstbar = (config: Config<MultiSelectToolbar, ComponentEventMap<MultiSelectToolbar>, "table">, ...items: (Component | "->" | "-")[]) => {

	const c = new MultiSelectToolbar(config.table);
	if (config) {
		Object.assign(c, config);
	}

	c.items.add(...tbarItems(items));

	return c;
}
