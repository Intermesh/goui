import {List, ListEventMap, RowRenderer} from "./List";
import {Store} from "../data";
import {Component, createComponent} from "./Component";
import {E} from "../util";
import {Config, ObservableListenerOpts} from "./Observable";
import {dragData} from "../DragData";


export const TreeRowRenderer: RowRenderer = (record, row, me, storeIndex) => {

	const node = E("div").cls("node"),
		caret = E("span").cls("caret"),
		icon = E("i").cls("icon"),
		label = E("label");

	icon.innerText = record.icon || "folder";
	label.innerText = record[me.labelProperty];

	if (record.children && record.children.length == 0) {
		row.cls("+no-children");
	}

	node.append(caret, icon, label);

	row.append(node);
}

type extractRecordType<Type> = Type extends Store<infer RecordType> ? RecordType : never

export type TreeStoreBuilder<StoreType extends Store = Store> = (record?: extractRecordType<StoreType>) => StoreType;


export interface TreeEventMap<Type> extends ListEventMap<Type> {


}

export interface Tree<StoreType extends Store = Store> extends List {
	on<K extends keyof TreeEventMap<this>>(eventName: K, listener: Partial<TreeEventMap<this>>[K], options?: ObservableListenerOpts): void;

	fire<K extends keyof TreeEventMap<this>>(eventName: K, ...args: Parameters<TreeEventMap<any>[K]>): boolean
}


export class Tree<StoreType extends Store> extends List {

	public labelProperty = "name";

	private static subTrees: Record<string, any> = {}

	private dragOverTimeout?: any;

	constructor(public storeBuilder: TreeStoreBuilder<StoreType>, readonly renderer: RowRenderer = TreeRowRenderer, parentRecord?: any) {

		const store = storeBuilder(parentRecord);

		super(store, renderer);

		this.baseCls = "goui goui-tree";

		this.on("rowclick", (list, storeIndex, row, ev) => {
			this.expand(row);
		});

		this.emptyStateHtml = "";
	}

	/**
	 * Find the first menu in the tree of submenu's
	 */
	private findTopTree(): Tree {

		if (this.parent instanceof Tree) {
			return this.parent.findTopTree();
		} else {
			return this;
		}
	}

	private expand(row: HTMLElement): Promise<Tree<StoreType>> {

		row.cls("+expanded");

		if (Tree.subTrees[row.id]) {
			return Promise.resolve(Tree.subTrees[row.id]);
		}

		const record = this.store.get(parseInt(row.dataset.storeIndex!))
		if (!record) {
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

		sub.store.on("beforeload", () => {
			row.setAttribute("disabled", "");
		})
		sub.store.on("load", () => {
			row.removeAttribute("disabled");
		})

		return sub.store.load().then(() => sub);

	}

	private collapse(row: HTMLElement) {
		row.cls("-expanded");
	}

	protected renderRow(record: any, storeIndex: number): HTMLElement {
		let row = super.renderRow(record, storeIndex);
		row.cls("+data");
		row.id = Component.uniqueID();
		row.dataset.storeIndex = storeIndex + "";

		if (this.draggable) {
			row.draggable = true;
			row.ondragstart = this.onNodeDragStart.bind(this);
		}

		this.bindDropEvents(row);

		row.getElementsByClassName("caret")[0].on("click", (e) => {

			row.has(".expanded") ? this.collapse(row) : this.expand(row);
			e.preventDefault();
			e.stopPropagation();
		});

		return row;
	}


	protected onNodeDragEnterAllowed(e: DragEvent, dropRow: HTMLElement) {
		clearTimeout(this.dragOverTimeout);
		setTimeout(() => {
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

		const dropRow = this.findDropRow(e);

		this.clearOverClasses(dropRow);
		clearTimeout(this.dragOverTimeout);

		this.expand(dropRow).then((dropTree) => {

			dragData.dropTree = dropTree;

			const topTree = this.findTopTree();
			topTree.fire("drop", topTree, e, dropRow, dropPos, dragData);
		});
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