import {List, ListEventMap, RowRenderer} from "./List";
import {Store} from "../data";
import {Component, ComponentEventMap, createComponent} from "./Component";
import {E, FunctionUtil} from "../util";
import {Config, ObservableListenerOpts} from "./Observable";
import {dragData} from "../DragData";
import {root} from "./Root";


export const TreeRowRenderer:RowRenderer = (record, row, me, storeIndex) => {

	const node = E("div").cls("node"),
		caret = E("span").cls("caret"),
		icon = E("i").cls("icon"),
		label = E("label");

	icon.innerText = record.icon || "folder";
	label.innerText = record[me.labelProperty];

	if(record.children && record.children.length == 0) {
		row.cls("+no-children");
	}

	node.append(caret, icon, label);

	row.append(node);
}

type extractRecordType<Type> = Type extends Store<infer RecordType> ? RecordType : never

export type TreeStoreBuilder<StoreType extends Store = Store> = (record?:extractRecordType<StoreType>) => StoreType;

type DROP_POSITION = "before" | "after" | "on";
export interface TreeEventMap<Type> extends ListEventMap<Type> {


	/**
	 * Fires when something was dropped
	 *
	 * @param tree The tree that contains the node that is dropped on
	 * @param e The draag event
	 * @param dropTree The tree of the node that is dropped on
	 * @param dropRow The row element that is dropped on
	 * @param dragData The arbitrary drag data that is set
	 */
	drop:  (tree: Type, e: DragEvent, dropTree: Type, dropRow: HTMLElement, position: DROP_POSITION, dragData: any) => void

	dropallowed:  (tree: Type, e: DragEvent, dropRow: HTMLElement, dragData: any) => void

}

export interface Tree<StoreType extends Store = Store> extends List {
	on<K extends keyof TreeEventMap<this>>(eventName: K, listener: Partial<TreeEventMap<this>>[K], options?: ObservableListenerOpts): void;
	fire<K extends keyof TreeEventMap<this>>(eventName: K, ...args: Parameters<TreeEventMap<any>[K]>): boolean
}


export class Tree<StoreType extends Store> extends List {

	public labelProperty = "name";

	public draggable = true;
	public dropBetween = true;
	public dropOn = true;

	private static subTrees: Record<string, any> = {}
	private enterTarget?: EventTarget;
	private dragOverTimeout?: any;

	constructor(public storeBuilder:TreeStoreBuilder<StoreType>, readonly renderer: RowRenderer = TreeRowRenderer, parentRecord?:any) {

		const store = storeBuilder(parentRecord);

		super(store, renderer);

		this.baseCls = "goui goui-tree";

		this.on("rowclick", (list, storeIndex, row,  ev) => {
			this.expand(row);
		});

		this.emptyStateHtml = "";
	}

	/**
	 * Find the first menu in the tree of submenu's
	 */
	private findTopTree(): Tree {

		if(this.parent instanceof Tree) {
			return this.parent.findTopTree();
		} else
		{
			return this;
		}
	}

	private expand(row:HTMLElement) : Tree<StoreType> {

		row.cls("+expanded");

		if(Tree.subTrees[row.id]) {
			return Tree.subTrees[row.id];
		}

		const record = this.store.get(parseInt(row.dataset.storeIndex!))
		if(!record) {
			throw "Record not found";
		}

		const sub = new Tree<StoreType>(this.storeBuilder, this.renderer, record);
		sub.labelProperty = this.labelProperty;
		sub.dropOn = this.dropOn;
		sub.dropBetween = this.dropBetween;
		sub.draggable = this.draggable;
		sub.parent = this;
		sub.render(row);

		Tree.subTrees[row.id] = sub;

		return sub;

	}

	private collapse(row:HTMLElement) {
		row.cls("-expanded");
	}

	protected renderRow(record: any, storeIndex: number): HTMLElement {
		let row =  super.renderRow(record, storeIndex);
		row.id = Component.uniqueID();
		row.dataset.storeIndex = storeIndex + "";
		if(this.draggable) {
			row.draggable = true;
			row.ondragstart = this.onNodeDragStart.bind(this);
		}

		row.ondrop = this.onNodeDrop.bind(this);
		row.ondragend = this.onNodeDragEnd.bind(this);
		row.ondragover = FunctionUtil.buffer(10,this.onNodeDragOver.bind(this));
		row.ondragenter = this.onNodeDragEnter.bind(this);
		row.ondragleave = this.onNodeDragLeave.bind(this);

		row.getElementsByClassName("caret")[0].on("click", (e) => {

			row.has(".expanded") ? this.collapse(row) : this.expand(row);
			e.preventDefault();
			e.stopPropagation();
		});

		return row;
	}

	protected onNodeDragStart(e:DragEvent) {
		const row = e.target as HTMLDivElement;
		dragData.treeRow = row;
		dragData.tree = this;
		dragData.record = this.store.get(parseInt(row.dataset.storeIndex!));

		// had to add this class because otherwise dragleave fires immediately on child nodes: https://stackoverflow.com/questions/7110353/html5-dragleave-fired-when-hovering-a-child-element
		root.el.cls("+dragging");
	}

	protected onNodeDragEnd(e:DragEvent) {
		root.el.cls("-dragging");
		delete dragData.treeRow;
	}

	protected onNodeDragEnter(e:DragEvent) {

		const dropRow = this.findDropRow(e);
		if(this.dropAllowed(e, dropRow)) {

			e.stopPropagation();
			e.preventDefault();

			dropRow.cls("+drag-over");

			clearTimeout(this.dragOverTimeout);
			setTimeout(() => {
				this.dragOverTimeout = setTimeout(() => {
					this.expand(dropRow);
				}, 1000);
			})

		}

		return false;
	}

	protected onNodeDragLeave(e:DragEvent) {
		const dropRow = this.findDropRow(e);
		if(this.dropAllowed(e, dropRow)) {

			e.stopPropagation();
			e.preventDefault();
			this.clearOverClasses(dropRow);
			clearTimeout(this.dragOverTimeout);
		}
	}

	private findDropRow(e:DragEvent) {
		return (e.target as HTMLDivElement).closest("LI") as HTMLElement;
	}


	private clearOverClasses(dropRow: HTMLElement) {
		dropRow.cls("-drag-over");
		dropRow.classList.remove("before");
		dropRow.classList.remove("after");
		dropRow.classList.remove("on");
	}

	protected onNodeDragOver(e:DragEvent) {

		const dropRow = this.findDropRow(e);

		if(this.dropAllowed(e, dropRow)) {
			e.stopPropagation();
			e.preventDefault();

			const pos = this.getDropPosition(e);
			dropRow.classList.toggle("before", "before" == pos);
			dropRow.classList.toggle("after", "after" == pos);
			dropRow.classList.toggle("on", "on" == pos);
		}
	}

	protected dropAllowed(e:DragEvent,dropRow:HTMLElement) {
		const topTree = this.findTopTree();
		return (dragData.treeRow &&!dragData.treeRow.contains(dropRow)) || topTree.fire("dropallowed", topTree, e, dropRow, dragData);
	}
	private getDropPosition(e:DragEvent): DROP_POSITION | undefined {

		if(!this.dropBetween) {
			return this.dropOn ? "on" : undefined;
		}

		const betweenZone = 6;

		if(e.offsetY < betweenZone) {
			return "before";
		} else if(e.offsetY > (e.target as HTMLElement).offsetHeight - betweenZone) {
			return "after";
		} else
		{
			return this.dropOn ? "on" : undefined;
		}
	}

	protected onNodeDrop(e:DragEvent) {

		const dropPos = this.getDropPosition(e);
		if(!dropPos) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();


		const dropRow = this.findDropRow(e);
		const dropTree = this.expand(dropRow);
		this.clearOverClasses(dropRow);
		clearTimeout(this.dragOverTimeout);

		const topTree = this.findTopTree()

		topTree.fire("drop", topTree, e, dropTree, dropRow, dropPos, dragData);
		return false;
	}
}


type TreeConfig<StoreType extends Store = Store> = Omit<Config<Tree<StoreType>, TreeEventMap<Tree<StoreType>>, "storeBuilder">, "rowSelection" | "store">

/**
 * Shorthand function to create {@see Table}
 *
 * @param config
 */
export const tree = <StoreType extends Store = Store>(config: TreeConfig<StoreType>) => createComponent(new Tree<StoreType>(config.storeBuilder), config);