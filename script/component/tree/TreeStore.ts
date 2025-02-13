import {Store, StoreConfig} from "../../data/Store";
import {createComponent} from "../../component";
import {TreeRecord} from "./TreeRecord";


export class TreeStore extends Store<TreeRecord> {

	constructor(records?: TreeRecord[]) {
		super(records);

	}

	protected onAdd(record: TreeRecord) {
		if(record.expanded) {
			this.expand(record);
		}
	}

	expand(record: TreeRecord) {

		if(!record.children) {
			return;
		}

		record.expanded = true;

		let startIndex = this.findIndex(r => r == record);
		startIndex++;
		const level =  record.level ? record.level + 1 : 1;

		for(let i = 0, l = record.children.length; i < l; i++) {
			const child = record.children[i];
			child.level = level;

			// the node might have gotten sub nodes recursively in onAdded() -> expand(). So we have to fast forward them here.
			let currItem = this.items.at(startIndex);
			while(currItem && currItem.level && currItem.level >= level) {
				currItem = this.items.at(++startIndex);
			}

			this.insert(startIndex++, child);
		}

	}


	collapse(record: TreeRecord) {
		let startIndex = this.findIndex(r => r == record);
		startIndex++;
		const level =  record.level ? record.level + 1 : 1;

		let curr = this.get(startIndex);
		while(curr && curr.level && curr.level >= level) {
			this.removeAt(startIndex);
			curr = this.get(startIndex);
		}

	}
}

export const treestore = (config?: StoreConfig<TreeRecord>) => createComponent(new TreeStore(), config);