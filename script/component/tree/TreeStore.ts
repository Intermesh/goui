import {Store, StoreConfig} from "../../data/Store";
import {Component, createComponent, NodeProvider} from "../../component";
import {TreeRecord} from "./TreeRecord";
import {ArrayUtil} from "../../util";


export class TreeStore extends Store<TreeRecord> {

	private expandedRecordCache:Record<string, true> = {};

	constructor(private nodeProvider:NodeProvider, records?: TreeRecord[]) {
		super(records);

		this.sort = [{isAscending:true, property:'text'}];
	}

	async reload() {

		//remove children
		this.filter(i => !i.level);
		this.forEach(i => i.isExpanded = false);

		return super.reload();
	}

	protected async internalLoad(append: boolean): Promise<TreeRecord[]> {
		const records = await this.nodeProvider(undefined, this);
		for(const record of records) {
			await this.populateChildren(record);
		}

		this.loadData(records, append);
		return records;
	}

	private async populateChildren(record: TreeRecord) {
		if(record.expanded || this.expandedRecordCache[record.id!]) {
			record.expanded = true;
			if(record.children === undefined) {
				record.children = await this.nodeProvider(record, this);
				for(const child of record.children) {
					await this.populateChildren(child);
				}
			}
		}
	}


	protected onAdd(record: TreeRecord) {
		if(!record.id){
			record.id = 'gen-' + Component.uniqueID()
		}
		if(record.expanded  || this.expandedRecordCache[record.id!]) {
			void this.expand(record);
		}
	}

	public async expand(record: TreeRecord) {

		if(record.isExpanded) {
			// this may happen on reloading after sort for example
			return;
		}

		//keeps track of the expanded state and may also be provided by the data store
		record.expanded = true;
		this.expandedRecordCache[record.id!] = true;

		if(record.children === undefined) {
			await this.populateChildren(record);
		}

		if(!record.children || !record.children.length) {
			return;
		}

		//indicates that the records are rendered
		record.isExpanded = true;
		let startIndex = this.findIndex(r => r == record);
		startIndex++;
		const level =  record.level ? record.level + 1 : 1;

		for(let i = 0, l = record.children.length; i < l; i++) {
			const child = record.children[i];
			child.level = level;

			this.insert(startIndex++, child);

			// the node might have gotten sub nodes recursively in onAdded() -> expand(). So we have to fast forward them here.
			let currItem = this.items.at(startIndex);
			while(currItem && currItem.level && currItem.level >= level) {
				currItem = this.items.at(++startIndex);
			}

		}
	}

	public collapse(record: TreeRecord) {
		record.expanded = false;
		record.isExpanded = false;

		delete this.expandedRecordCache[record.id!];

		let startIndex = this.findIndex(r => r == record);
		startIndex++;
		const level =  record.level ? record.level + 1 : 1;

		let curr = this.get(startIndex);
		while(curr && curr.level && curr.level >= level) {
			curr.isExpanded = false;
			this.removeAt(startIndex);
			curr = this.get(startIndex);
		}

	}
}

// export const treestore = (config?: StoreConfig<TreeRecord>) => createComponent(new TreeStore(), config);