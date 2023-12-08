import {List, ListEventMap, RowRenderer} from "./List";
import {store, Store, StoreRecord} from "../data";
import {Component, createComponent} from "./Component";
import {E} from "../util";
import {Config, ObservableListenerOpts} from "./Observable";
import {dragData} from "../DragData";
import {MaterialIcon} from "./MaterialIcon";
import {checkbox} from "./form";


export const TreeRowRenderer: RowRenderer = (record, row, me:Tree, storeIndex) => {

	const node = E("div").cls("node"),
		caret = E("span").cls("caret"),
		icon = E("i").cls("icon"),
		label = E("label");

	icon.innerText = record.icon || "folder";
	label.innerText = record.text;

	if (record.children && record.children.length == 0) {
		row.cls("+no-children");
	}

	if(record.cls) {
		row.cls("+" + record.cls);
	}

	node.append(caret, icon);

	if(record.check != undefined) {
		const c = checkbox({
			value: record.check,
			listeners: {
				change:(field, newValue, oldValue) => {
					record.check = newValue

					const top = me.findTopTree();
					top.fire("checkchange",  top, this, record, storeIndex, newValue);
				}
			}
		});
		c.render(node);
	}

	node.append(label);

	row.append(node);
}

type extractRecordType<Type> = Type extends Store<infer RecordType> ? RecordType : never

export interface TreeEventMap<Type> extends ListEventMap<Type> {
	/**
	 * Fires when a node expands
	 *
	 * @param tree The main tree
	 * @param childrenTree The tree component that will load the children of the expanding ndoe
	 * @param record The record of the expanding node
	 * @param storeIndex The index of the record in the store
	 */
	expand: (tree:Type, childrenTree: Type, record:StoreRecord | undefined, storeIndex: number) => void;

	/**
	 * Fires when a node collapses
	 *
	 * @param tree The main tree
	 * @param childrenTree The tree component that will load the children of the collapsing ndoe
	 * @param record The record of the collapsing node
	 * @param storeIndex The index of the record in the store
	 */
	collapse: (tree:Type, childrenTree: Type, record:StoreRecord, storeIndex: number) => void;

	/**
	 * Fires when a node collapses
	 *
	 * @param tree The main tree
	 * @param childrenTree The tree component that will load the children of the collapsing ndoe
	 * @param record The record of the collapsing node
	 * @param storeIndex The index of the record in the store
	 */
	checkchange: (tree:Type, childrenTree: Type, record:StoreRecord, storeIndex: number, checked:boolean) => void;
}

export interface Tree extends List<Store<TreeRecord>> {
	on<K extends keyof TreeEventMap<this>, L extends Function>(eventName: K, listener: Partial<TreeEventMap<this>>[K], options?: ObservableListenerOpts): L;

	fire<K extends keyof TreeEventMap<this>>(eventName: K, ...args: Parameters<TreeEventMap<any>[K]>): boolean
}

export type TreeRecord = {
	/**
	 * Unique ID of the node
	 */
	id: string,

	/**
	 * Text of the node
	 */
	text: string

	/**
	 * Child nodes. If not present then it can be populated on the "expand" event.
	 */
	children?: TreeRecord[],

	/**
	 * Icon to display
	 */
	icon?:MaterialIcon

	/**
	 * CSS class for the node
	 */
	cls?:string,

	/**
	 * If set a checkbox will render
	 */
	check?: boolean
}

export class Tree extends List<Store<TreeRecord>> {

	private subTrees: Record<string, any> = {}

	private dragOverTimeout?: any;

	private expandedIds:Record<string, boolean> = {};

	private parentStoreIndex = -1;

	constructor(readonly renderer: RowRenderer = TreeRowRenderer) {

		super(store<TreeRecord>(), renderer);

		this.baseCls = "goui goui-tree";

		this.on("rowclick", (list, storeIndex, row, ev) => {
			if(list == this) {
				void this.expand(row);
			}
		});

		this.store.on("remove", (collection, item, index) => {
			delete this.subTrees[index];
		});

		if (!(this.parent instanceof Tree)) {
			this.on("render", () => {
				this.fire("expand", this, this, undefined, -1);
			});
		}

		this.emptyStateHtml = "";
	}

	public set data(records:TreeRecord[]) {
		this.store.loadData(records);
	}

	/**
	 * The full hierarchical store data of the tree
	 */
	public get data(): TreeRecord[] {
		return this.store.data;
	}

	/**
	 * Reload the tree if loaded via the "expand" event.
	 */
	public reload() {

		// this.store.clear();

		this.fireExpand();

		for(let id in this.subTrees) {
			this.subTrees[id].reload();
		}
	}

	private fireExpand() {
		if(!(this.parent instanceof Tree)) {
			// top level reload
			this.fire("expand", this, this, undefined, -1)
		} else {
			const record = this.parent.store.get(this.parentStoreIndex), top = this.findTopTree();
			top.fire("expand", top, this, record, this.parentStoreIndex);
		}
	}

	/**
	 * Find the first menu in the tree of submenu's
	 */
	public findTopTree(): Tree {

		if (this.parent instanceof Tree) {
			return this.parent.findTopTree();
		} else {
			return this;
		}
	}

	private expand(row: HTMLElement): Tree {

		row.cls("+expanded");

		const storeIndex = this.getRowElements().indexOf(row);

		if (this.subTrees[storeIndex]) {
			return this.subTrees[storeIndex];
		}

		const record = this.store.get(storeIndex);
		if (!record) {
			throw "Record not found";
		}

		return this.renderSubTree(row, record, storeIndex);
	}

	private renderSubTree(row: HTMLElement, record:TreeRecord, storeIndex:number): Tree {

		row.cls("+expanded");

		this.findTopTree().expandedIds[record.id] = true;

		const sub = new Tree(this.renderer);
		sub.dropOn = this.dropOn;
		sub.dropBetween = this.dropBetween;
		sub.draggable = this.draggable;
		sub.parent = this;
		sub.parentStoreIndex = storeIndex;
		if(record.children) {
			sub.data = record.children;
		}

		// set the data on parent if store is loaded by an expand event.
		// this way the data can be retrieved in full using the top tree's data get accessor. eg. tree.data
		sub.store.on("load", (store1, records, append) => {
			record.children = store1.data;
		});

		["rowclick", "rowdblclick", "rowcontextmenu", "rowmousedown"].forEach( (e) => {
			this.relayEvent(sub, e);
		})

		this.subTrees[storeIndex] = sub;

		sub.render(row);

		const top = this.findTopTree();

		top.fire("expand", top, sub, record, storeIndex);

		return sub;
	}

	private collapse(row: HTMLElement) {
		row.cls("-expanded");
		const storeIndex = this.getRowElements().indexOf(row);
		const record = this.store.get(storeIndex);
		if (!record) {
			throw "Record not found";
		}
		const top = this.findTopTree();

		top.expandedIds[record.id!] = true;

		top.fire("collapse", top, this, record, storeIndex);
	}

	protected renderRow(record: any, storeIndex: number): HTMLElement {
		let row = super.renderRow(record, storeIndex);
		row.cls("+data");
		row.id = Component.uniqueID();

		if (this.draggable) {
			row.draggable = true;
			row.ondragstart = this.onNodeDragStart.bind(this);
		}

		row.addEventListener("contextmenu", (e) => {
			e.stopPropagation();
			e.preventDefault();
			const sub = this.expand(row);
			sub.reload();
		})

		this.bindDropEvents(row);

		row.getElementsByClassName("caret")[0].on("click", (e) => {

			row.has(".expanded") ? this.collapse(row) : this.expand(row);
			e.preventDefault();
			e.stopPropagation();
		});

		if(this.findTopTree().expandedIds[record.id]) {
			row.cls("+expanded");
			void this.renderSubTree(row, record, storeIndex);
		}

		return row;
	}


	protected onNodeDragEnterAllowed(e: DragEvent, dropRow: HTMLElement) {
		clearTimeout(this.dragOverTimeout);
		setTimeout(() => {
			//expand tree node if dragging over for 1 second
			this.dragOverTimeout = setTimeout(() => {
				this.expand(dropRow);
			}, 1000);
		});
	}

	protected onNodeDragLeaveAllowed(e: DragEvent, dropRow: HTMLElement) {
		clearTimeout(this.dragOverTimeout);
	}


	protected dropAllowed(e: DragEvent, dropRow: HTMLElement) {
		const topTree = this.findTopTree();
		return (dragData.row && !dragData.row.contains(dropRow));// && topTree.fire("dropallowed", topTree, e, dropRow, dragData);
	}

	protected onNodeDrop(e: DragEvent) {
		const dropPos = this.getDropPosition(e);
		if (!dropPos) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();

		const dropRow = this.findDropRow(e),
			dropIndex = this.getRowElements().indexOf(dropRow);

		this.clearOverClasses(dropRow);
		clearTimeout(this.dragOverTimeout);

		const dropTree = this.expand(dropRow);

		dragData.dropTree = this;
		dragData.childrenTree = dropTree;

		const topTree = this.findTopTree();

		topTree.fire("drop", topTree, e, dropRow, dropIndex, dropPos, dragData);

		return false;
	}

}


type TreeConfig = Omit<Config<Tree, TreeEventMap<Tree>>, "rowSelection">

/**
 * Shorthand function to create {@see Table}
 *
 * @param config
 */
export const tree = (config: TreeConfig) => createComponent(new Tree(), config);