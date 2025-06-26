import {Table, TableColumn, TableColumnEventMap} from "../table";
import {a, comp, createComponent, span} from "../Component";
import {checkbox} from "../form";
import {TreeRecord} from "./TreeRecord";
import {Tree} from "./Tree";
import {Config} from "../Observable";

export class TreeColumn extends TableColumn {

	public defaultIcon?: string
	renderer = (columnValue: any, record: TreeRecord, td: HTMLTableCellElement, tree: Table, storeIndex: number, column: TableColumn) => {
		const node = comp({cls: "node"});


		if(record.level) {
			for (let i = 0; i < record.level; i++) {
				node.items.add(comp({cls: "indent"}));
			}
		}

		node.items.add(span({cls: "caret"}));



		if(record.icon || this.defaultIcon) {
			node.items.add(comp({cls: "icon", text: record.icon ??  this.defaultIcon, tagName: "i"}));
		}


		if(record.check !== undefined) {
			const c = checkbox({
				value: record.check,
				listeners: {
					change:( {newValue}) => {
						record.check = newValue;

						(tree as Tree).fire("checkchange", {record, storeIndex, checked:newValue});
					}
				}
			});

			node.items.add(c);

		}

		node.items.add(record.href ? a({href:record.href, text: columnValue, cls: "label"}) : comp({cls: "label", text: columnValue}));

		if(record.expanded) {
			node.el.classList.add("expanded");
		}

		if (record.children && record.children.length == 0) {
			node.el.classList.add("no-children");
		}

		if(record.cls) {
			node.el.classList.add(record.cls);
		}



		return node;
	}
}

export const treecolumn = (config: Config<TreeColumn, "id">) => createComponent(new TreeColumn(config.id), config);
