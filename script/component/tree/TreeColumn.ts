import {Table, TableColumn} from "../table";
import {a, comp, span} from "../Component";
import {checkbox} from "../form";
import {TreeRecord} from "./TreeRecord";
import {Tree} from "./Tree";

export class TreeColumn extends TableColumn {
	renderer = (columnValue: any, record: TreeRecord, td: HTMLTableCellElement, tree: Table, storeIndex: number, column: TableColumn) => {
		const node = comp({cls: "node"},
			span({cls: "caret"}),
			comp({cls: "icon", text: record.icon ?? "folder", tagName: "i"}),
			record.href ? a({href:record.href, text: columnValue, cls: "label"}) : comp({cls: "label", text: columnValue}) ,
		);

		if(record.expanded) {
			node.el.classList.add("expanded");
		}

		if (record.children && record.children.length == 0) {
			node.el.classList.add("no-children");
		}

		if(record.cls) {
			node.el.classList.add(record.cls);
		}
		if(record.check !== undefined) {
			const c = checkbox({
				value: record.check,
				listeners: {
					change:(field, newValue, oldValue) => {
						record.check = newValue;

						(tree as Tree).fire("checkchange",  this, record, storeIndex, newValue);
					}
				}
			});

			node.items.insert(2, c);

		}

		if(record.level) {
			for (let i = 0; i < record.level; i++) {
				node.items.insert(0, comp({cls: "indent"}));
			}
		}

		return node;
	}
}