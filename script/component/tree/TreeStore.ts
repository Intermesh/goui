import {Store, StoreConfig} from "../../data/Store";
import {Component, createComponent, NodeProvider} from "../../component";
import {TreeRecord} from "./TreeRecord";
import {ArrayUtil} from "../../util";


export class TreeStore extends Store<TreeRecord> {

	constructor(private nodeProvider:NodeProvider, records?: TreeRecord[]) {
		super(records);

		this.sort = [{isAscending:true, property:'text'}];
	}

	async reload() {

		//remove children
		this.filter(i => !i.level);
		this.forEach(i => i.expanded = false);

		return super.reload();
	}

	protected async internalLoad(append: boolean): Promise<TreeRecord[]> {
		const records = await this.nodeProvider(undefined, this);
		this.loadData(records, append);
		return records;
	}


	protected onAdd(record: TreeRecord) {
		if(!record.id){
			record.id = 'gen-' + Component.uniqueID()
		}
		if(record.expanded) {
			this.expand(record);
		}
	}

	public async expand(record: TreeRecord) {

		if(record.expanded) {
			// this may happen on reloading after sort for example
			return;
		}

		if(record.children === undefined) {
			record.children = await this.nodeProvider(record, this);
		}

		if(!record.children || !record.children.length) {
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

	public collapse(record: TreeRecord) {

		record.expanded = false;

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

// export const treestore = (config?: StoreConfig<TreeRecord>) => createComponent(new TreeStore(), config);