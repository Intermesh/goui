import {Table, TableColumn} from "./../table";
import {createComponent} from ".././Component";
import {Config, Listener, ObservableListenerOpts} from "./../Observable.js";
import {ListEventMap} from "../List";
import {TreeStore} from "./TreeStore";
import {TreeColumn} from "./TreeColumn";
import {TreeRecord} from "./TreeRecord";


export interface TreeEventMap<Type> extends ListEventMap<Type> {
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
	beforeexpand: (tree:Type, record:TreeRecord, storeIndex: number) => void|false;
	/**
	 * Fires when a node expands
	 *
	 * @param tree The  tree
	 * @param record The record of the expanding node
	 * @param storeIndex The index of the record in the store
	 */
	expand: (tree:Type, record:TreeRecord, storeIndex: number) => void;


	/**
	 * Fires when a node collapses
	 *
	 * @param tree The main tree
	 * @param record The record of the collapsing node
	 * @param storeIndex The index of the record in the store
	 */
	beforecollapse: (tree:Type, record:TreeRecord, storeIndex: number) => void|false;

	/**
	 * Fires when a node collapses
	 *
	 * @param tree The main tree
	 * @param record The record of the collapsing node
	 * @param storeIndex The index of the record in the store
	 */
	collapse: (tree:Type, record:TreeRecord, storeIndex: number) => void;

	/**
	 * Fires when a node collapses
	 *
	 * @param tree The main tree
	 * @param record The record of the collapsing node
	 * @param storeIndex The index of the record in the store
	 */
	checkchange: (tree:Type, record:TreeRecord, storeIndex: number, checked:boolean) => void;
}

export interface Tree extends Table<TreeStore> {
	on<K extends keyof TreeEventMap<this>, L extends Listener>(eventName: K, listener: Partial<TreeEventMap<this>>[K], options?: ObservableListenerOpts): L;
	un<K extends keyof TreeEventMap<this>>(eventName: K, listener: Partial<TreeEventMap<this>>[K]): boolean
	fire<K extends keyof TreeEventMap<this>>(eventName: K, ...args: Parameters<TreeEventMap<any>[K]>): boolean
}

export type NodeProvider = (record:TreeRecord | undefined, store: TreeStore) => TreeRecord[] | Promise<TreeRecord[]>;

export class Tree extends Table<TreeStore> {
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
				this.collapse(record, node, storeIndex);
			} else {
				void this.expand(record, storeIndex, node);
			}

			e.preventDefault();
			e.stopPropagation();
		});

		this.setupExpandOnDragOver(row, record, storeIndex);



		return row;
	}




	private async expand(record: any, storeIndex: number, node: Element) {


		if(this.fire("beforeexpand", this,  record, storeIndex) === false) {
			return;
		}

		await this.store.expand(record);
		node.classList.add("expanded");
		this.fire("expand", this, record, storeIndex);

	}

	private collapse(record: any, node: Element, storeIndex: number) {

		if(this.fire("beforecollapse", this,  record, storeIndex) === false) {
			return;
		}


		this.store.collapse(record);
		node.classList.remove("expanded");

		this.fire("collapse", this, record, storeIndex);
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
						void this.expand(record, storeIndex, node);
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

export const tree = (config: Config<Tree, TreeEventMap<Tree>> & {nodeProvider: NodeProvider}) => createComponent(new Tree(config.nodeProvider, config.columns ?? [new TreeColumn("text")]), config);
