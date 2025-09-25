import {Table, TableColumn} from "./../table";
import {createComponent} from ".././Component";
import {Config} from "./../Observable.js";
import {ListEventMap} from "../List";
import {TreeStore} from "./TreeStore";
import {TreeColumn} from "./TreeColumn";
import {TreeRecord} from "./TreeRecord";


/**
 * @inheritDoc
 */
export interface TreeEventMap extends ListEventMap {
	/**
	 * Fires before a node expands
	 *
	 * You can cancel the expand by returning false.
	 *
	 * Could be useful to populate the tree.
	 *
	 * @param tree The  tree
	 * @param record The record of the expanding node
	 * @param storeIndex The index of the record in the store
	 */
	beforeexpand: {record:TreeRecord, storeIndex: number}
	/**
	 * Fires when a node expands
	 *
	 * @param tree The  tree
	 * @param record The record of the expanding node
	 * @param storeIndex The index of the record in the store
	 */
	expand: {record:TreeRecord, storeIndex: number}


	/**
	 * Fires when a node collapses
	 *
	 * @param tree The main tree
	 * @param record The record of the collapsing node
	 * @param storeIndex The index of the record in the store
	 */
	beforecollapse: {record:TreeRecord, storeIndex: number}

	/**
	 * Fires when a node collapses
	 *
	 * @param tree The main tree
	 * @param record The record of the collapsing node
	 * @param storeIndex The index of the record in the store
	 */
	collapse: {record:TreeRecord, storeIndex: number}

	/**
	 * Fires when a node collapses
	 *
	 * @param tree The main tree
	 * @param record The record of the collapsing node
	 * @param storeIndex The index of the record in the store
	 */
	checkchange: {record:TreeRecord, storeIndex: number, checked:boolean}
}

export type NodeProvider = (record:TreeRecord | undefined, store: TreeStore) => TreeRecord[] | Promise<TreeRecord[]>;

/**
 * Tree component
 *
 * @link https://goui.io/#tree Examples
 */
export class Tree<EventMap extends TreeEventMap = TreeEventMap> extends Table<TreeStore, EventMap> {
	constructor(protected nodeProvider: NodeProvider, columns:TableColumn[] = [new TreeColumn("text")]) {
		super(new TreeStore(nodeProvider), columns);

		this.headers = columns.length > 1;

		this.baseCls = this.baseCls + " tree";

		this.cls = "no-row-lines";

		this.on("render", async () => {
			void this.store.load();
		})
	}

	protected renderRow(record: any, storeIndex: number): HTMLElement {
		let row = super.renderRow(record, storeIndex);

		row.getElementsByClassName("caret")[0].on("click", (e) => {

			const node = row.getElementsByClassName("node")[0];
			const isExpanded = node.has(".expanded");

			if(isExpanded) {
				this.internalCollapse(record, storeIndex, node);
			} else {
				void this.internalExpand(record, storeIndex, node);
			}

			e.preventDefault();
			e.stopPropagation();
		});

		this.setupExpandOnDragOver(row, record, storeIndex);

		return row;
	}

	/**
	 * Expand a tree node
	 *
	 * @param record
	 */
	public expand(record: any) {
		const index = this.store.findIndex(i => i == record);
		const row = this.getRowElements()[index];

		return this.internalExpand(record, index, row);
	}

	/**
	 * Collapse a tree node
	 *
	 * @param record
	 */
	public collapse(record: any) {
		const index = this.store.findIndex(i => i == record);
		const row = this.getRowElements()[index];

		return this.internalCollapse(record, index, row);
	}

	private async internalExpand(record: any, storeIndex: number, node: Element) {

		if(this.fire("beforeexpand", {record, storeIndex}) === false) {
			return;
		}

		await this.store.expand(record);
		node.classList.add("expanded");
		this.fire("expand", {record, storeIndex});

	}

	private internalCollapse(record: any, storeIndex: number, node: Element ) {

		if(this.fire("beforecollapse", {record, storeIndex}) === false) {
			return;
		}

		this.store.collapse(record);
		node.classList.remove("expanded");

		this.fire("collapse", {record, storeIndex});
	}

	/**
	 * Expands a node after 1s when dragging something over it
	 *
	 * @param row
	 * @param record
	 * @param storeIndex
	 * @private
	 */
	private setupExpandOnDragOver(row: HTMLElement, record: any, storeIndex: number) {

		if(!this.dropOn && !this.dropBetween) {
			return
		}

		let dragOverTimeout: any;

		row.addEventListener("dragenter", (e) => {
			if(dragOverTimeout) {
				clearTimeout(dragOverTimeout);
			}

			// this first setTimeout is needed otherwise dragleave will fire immediately. The .dragging class is assed
			// by sortable to the GOUI root el to set pointer-event = none on the children https://stackoverflow.com/questions/7110353/html5-dragleave-fired-when-hovering-a-child-element
			setTimeout(() => {
				//expand tree node if dragging over for 1 second
				dragOverTimeout = setTimeout(() => {
					const node = row.getElementsByClassName("node")[0];
					if(!node.has(".expanded")) {
						void this.internalExpand(record, storeIndex, node);
					}
				}, 1000);
			});

		})

		row.addEventListener("dragleave", (e)=>{
			if(dragOverTimeout) {
				clearTimeout(dragOverTimeout);
			}
		})

		this.on("drop", () => {
			if(dragOverTimeout) {
				clearTimeout(dragOverTimeout);
			}
		})

	}
}

/**
 * Generator function for a {@link Tree} component
 *
 * @param config
 */
export const tree = (config: Config<Tree> & {nodeProvider: NodeProvider}) => createComponent(new Tree(config.nodeProvider, config.columns ?? [new TreeColumn("text")]), config);
