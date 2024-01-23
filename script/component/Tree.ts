import {List, ListEventMap, RowRenderer} from "./List";
import {store, Store, StoreRecord} from "../data";
import {Component, createComponent} from "./Component";
import {E} from "../util";
import {Config, Listener, ObservableListenerOpts} from "./Observable";
import {dragData} from "../DragData";
import {MaterialIcon} from "./MaterialIcon";
import {checkbox} from "./form";


export const TreeRowRenderer: RowRenderer = (record, row, me:Tree, storeIndex) => {

	const node = E("div").cls("node"),
		caret = E("span").cls("caret"),
		icon = E("i").cls("icon"),
		label = E("a");

	icon.innerText = record.icon || "folder";
	label.innerText = record.text;

	if(record.href) {
		label.href = record.href;
	}

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
	 * Fires before a node expands
	 *
	 * You can cancel the expand by returning false.
	 *
	 * Could be useful to populate the tree.
	 *
	 * @param tree The main tree
	 * @param childrenTree The tree component that will load the children of the expanding ndoe
	 * @param record The record of the expanding node
	 * @param storeIndex The index of the record in the store
	 */
	beforeexpand: (tree:Type, childrenTree: Type, record:StoreRecord | undefined, storeIndex: number) => void|boolean;
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
	on<K extends keyof TreeEventMap<this>, L extends Listener>(eventName: K, listener: Partial<TreeEventMap<this>>[K], options?: ObservableListenerOpts): L;
	un<K extends keyof TreeEventMap<this>>(eventName: K, listener: Partial<TreeEventMap<this>>[K]): boolean
	fire<K extends keyof TreeEventMap<this>>(eventName: K, ...args: Parameters<TreeEventMap<any>[K]>): boolean
}

export type TreeRecord = {
	/**
	 * Unique ID of the node
	 */
	id?: string,

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
	check?: boolean,

	/**
	 * Arbitrary node data
	 */
	dataSet?: any

	href?:string
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
				void this._expand(row);
			}
		});

		this.store.on("remove", (collection, item, index) => {
			delete this.subTrees[index];
		});

		if (!(this.parent instanceof Tree)) {

			this.on("beforerender", () => {
				this.fire("beforeexpand", this, this, undefined, -1);
			});

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

		this.store.clear();

		this.fireExpand();

		for(let id in this.subTrees) {
			this.subTrees[id].reload();
		}
	}

	private fireExpand() {
		if(!(this.parent instanceof Tree)) {
			// top level reload
			this.fire("beforeexpand", this, this, undefined, -1)
			this.fire("expand", this, this, undefined, -1)
		} else {
			const record = this.parent.store.get(this.parentStoreIndex), top = this.findTopTree();
			top.fire("beforeexpand", top, this, record, this.parentStoreIndex);
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

	/**
	 * Expand this tree or a child node when index is given
	 *
 	 * @param index
	 */
	public expand(index?:number) {
		if(index === undefined || index == -1) {
			if(this.parent instanceof Tree) {
				this.parent.expand(this.parentStoreIndex);
			}
			return;
		}
		this._expand(this.getRowElements()[index]);
	}

	/**
	 * Collapse this tree or a child node when index is given
	 *
	 * @param index
	 */
	public collapse(index?:number) {
		if(!index || index == -1) {
			if(this.parent instanceof Tree) {
				this.parent.collapse(this.parentStoreIndex);
			}
			return;
		}

		this._collapse(this.getRowElements()[index]);
	}

	private _expand(row: HTMLElement): Tree {

		const storeIndex = this.getRowElements().indexOf(row);

		const record = this.store.get(storeIndex);
		if (!record) {
			debugger;
			throw "Record not found for index: " + storeIndex;
		}

		const tree = this.subTrees[storeIndex] ? this.subTrees[storeIndex] : this.renderSubTree(row, record, storeIndex);
		const top = this.findTopTree();

		if(top.fire("beforeexpand", top, tree, record, storeIndex) === false) {
			return tree;
		}

		row.cls("+expanded");

		//we set the height so we can use an animation
		tree.el.style.height = tree.el.scrollHeight + "px";
		tree.el.addEventListener("transitionend", () => {
			//check if it's still expanded to handle fast clickers
			if(row.has(".expanded")) {
				tree.el.style.height = "auto";
			}
		}, {once: true})



		top.fire("expand", top, tree, record, storeIndex);

		return tree;
	}

	private renderSubTree(row: HTMLElement, record:TreeRecord, storeIndex:number): Tree {

		if(!record.id) {
			if(this.parentStoreIndex > -1) {
				record.id = (this.parent as Tree).store.get(this.parentStoreIndex)!.id + "-" + storeIndex;
			} else {
				record.id = storeIndex + "";
			}
		}

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

		//wrapper is needed for css transition transform to hide overflow
		const wrap = document.createElement("div");
		wrap.classList.add("wrap");
		row.append(wrap);

		sub.render(wrap);



		return sub;
	}

	private _collapse(row: HTMLElement) {
		row.cls("-expanded");
		const storeIndex = this.getRowElements().indexOf(row);


		//we set height 0 for animation
		this.subTrees[storeIndex].el.style.height = this.subTrees[storeIndex].el.offsetHeight + "px";
		requestAnimationFrame(() => {
			this.subTrees[storeIndex].el.style.height = "0";
		})

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
			const sub = this._expand(row);
			sub.reload();
		})

		this.bindDropEvents(row);

		row.getElementsByClassName("caret")[0].on("click", (e) => {

			row.has(".expanded") ? this._collapse(row) : this._expand(row);
			e.preventDefault();
			e.stopPropagation();
		});

		return row;
	}

	protected onRowAppend(row: HTMLElement, record:any, index:number) {
		if(this.findTopTree().expandedIds[record.id]) {
			this._expand(row);
		}
	}


	protected onNodeDragEnterAllowed(e: DragEvent, dropRow: HTMLElement) {
		clearTimeout(this.dragOverTimeout);
		setTimeout(() => {
			//expand tree node if dragging over for 1 second
			this.dragOverTimeout = setTimeout(() => {
				this._expand(dropRow);
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

		const dropTree = this._expand(dropRow);

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