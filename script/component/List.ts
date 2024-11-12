/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */

import {assignComponentConfig, comp, Component, ComponentEventMap, createComponent} from "./Component.js";
import {Store, StoreRecord} from "../data/Store.js";
import {t} from "../Translate.js";
import {E} from "../util/Element.js";
import {rowselect, RowSelect, RowSelectConfig} from "./table/index.js";
import {Config, Listener, ObservableListenerOpts} from "./Observable.js";
import {root} from "./Root.js";
import {Window} from "./Window.js";
import {Sortable} from "./Sortable.js";

export type RowRenderer = (record: any, row: HTMLElement, list: any, storeIndex: number) => string | Component[] | void;

export type listStoreType<ListType> = ListType extends List<infer StoreType> ? StoreType : never;

type DragData = {
	/**
	 * List component it was dragged from
	 */
	cmp: List
	/**
	 * Row being dragged
	 */
	row: HTMLTableRowElement;
	/**
	 * Store index of element being dragged
	 */
	storeIndex:number

	/**
	 * Store record
	 */
	record: any
}
/**
 * @inheritDoc
 */
export interface ListEventMap<Type> extends ComponentEventMap<Type> {
	/**
	 * Fires when the user scrolled to the bottom
	 *
	 * @param list
	 */
	scrolleddown: (list: Type) => void
	/**
	 * Fires when the user sorts the list by a property
	 *
	 * @param list
	 * @param property
	 */
	sort: (list: Type, property: string) => void

	/**
	 * Fires when the user sorts the list by drag and drop
	 *
	 * @param list
	 * @param dataIndex
	 */
	sortchange: (list: Type, record: any, dropIndex: number, oldIndex: number) => void

	/**
	 * Fires when a row is mousedowned
	 *
	 * @param list
	 * @param storeIndex
	 * @param ev
	 */
	rowmousedown: (list: Type, storeIndex: number, row: HTMLElement, ev: MouseEvent) => void

	/**
	 * Fires when a row is clicked
	 *
	 * @param list
	 * @param storeIndex
	 * @param ev
	 */
	rowclick: (list: Type, storeIndex: number, row: HTMLElement, ev: MouseEvent) => void

	/**
	 * Fires when a row is double clicked
	 *
	 * @param list
	 * @param storeIndex
	 * @param ev
	 */
	rowdblclick: (list: Type, storeIndex: number, row: HTMLElement, ev: MouseEvent) => void


	/**
	 * Fires when the delete key is pressed
	 *
	 * @example
	 * ```
	 * delete: async (list) => {
	 * 	const ids = list.rowSelection!.selected.map(index => list.store.get(index)!.id);
	 * 	await jmapds("Foo").confirmDestroy(ids);
	 * }
	 * ```
	 *
	 * @param list
	 */
	delete: (list: Type) => void,

	/**
	 * Fires when a row is right clicked
	 *
	 * @param list
	 * @param storeIndex
	 * @param ev
	 */
	rowcontextmenu: (list: Type, storeIndex: number, row: HTMLElement, ev: MouseEvent) => void

	/**
	 * Fires when records are rendered into rows.
	 *
	 * @param list
	 * @param records
	 */
	renderrows: (list: Type, records: any[]) => void;

	/**
	 * Fires when a row is clicked or navigated with arrows
	 *
	 * @param list
	 * @param storeIndex
	 * @param record
	 */
	navigate: (list: Type, storeIndex: number) => void

	/**
	 * Fires when something was dropped
	 *
	 * @param toComponent The component where it's dropped on. Usually this component but with trees it can be a nested list.
	 * @param fromIndex The index in the fromComponent of the item being dragged
	 * @param toIndex The index where it's dropped in this list
	 * @param droppedOn True if dropped on a node and not between
	 * @param fromComponent The component where the item is dragged from. When the same sort group is used it can be another component
	 * @param dragDataSet Arbitrary drag data components may set. A list adds dragDataSet.selectedRowIndexes: The row indexes when a multiselect is dragged. If the record dragged is not part of the selection then it will contain the single dragged record.
	 */
	drop: (toComponent: Type, toIndex:number, fromIndex: number, droppedOn:boolean, fromComp: Component, dragDataSet: Record<string, any>) => void

	/**
	 * Fires when the items are dragged over this list.
	 *
	 * Return false to disallow dropping
	 *
	 * @param dropComp The component the element was dropped on
	 * @param fromIndex Move from index
	 * @param toIndex To index
	 * @param droppedOn Dropped on the toIndex or moved to this index
	 * @param fromComp The component the element was dragged from if "group" is used to drop to other components
	 * @param dragDataSet Arbitrary drag data components may set. A list adds dragDataSet.selectedRowIndexes: The row indexes when a multiselect is dragged. If the record dragged is not part of the selection then it will contain the single dragged record.
	 */
	dropallowed: (toComponent: Type, toIndex:number, fromIndex: number, droppedOn:boolean, fromComp: Component, dragDataSet: Record<string, any>) => void

}

export type DROP_POSITION = "before" | "after" | "on";

export interface List<StoreType extends Store = Store> extends Component {
	on<K extends keyof ListEventMap<this>, L extends Listener>(eventName: K, listener: Partial<ListEventMap<this>>[K], options?: ObservableListenerOpts): L;
	un<K extends keyof ListEventMap<this>>(eventName: K, listener: Partial<ListEventMap<this>>[K]): boolean
	fire<K extends keyof ListEventMap<this>>(eventName: K, ...args: Parameters<ListEventMap<any>[K]>): boolean
}

/**
 * List component
 *
 * Create a list with a custom item renderer. Also capable of selecting rows.
 */
export class List<StoreType extends Store = Store> extends Component {
	/**
	 * Shown when the list is empty.
	 */
	public emptyStateHtml = `<div class="goui-empty-state"><i class="icon">article</i><p>${t("Nothing to show")}</p></div>`

	protected emptyStateTag: keyof HTMLElementTagNameMap = 'li';
	private emptyEl?: HTMLElement

	private rowSelect?: RowSelect;

	/**
	 * Allow items to be dragged
	 */
	public draggable = false;

	/**
	 * Allow to drop between items
	 */
	public dropBetween = false;

	/**
	 * Allow to drop on items
	 */
	public dropOn = false;

	/**
	 * Group for sortable when drag and drop is used
	 */
	public sortableGroup:string|undefined = undefined;


	/**
	 * When enabled, it will register it's container as scrolling element to the {@see Store}.
	 * @see Store.addScrollLoader();
	 */
	public scrollLoad = false;

	protected itemTag: keyof HTMLElementTagNameMap = 'li'

	// protected fragment?: DocumentFragment;

	/**
	 * Row selection object
	 * @param rowSelectionConfig
	 */
	set rowSelectionConfig(rowSelectionConfig: boolean | Partial<RowSelectConfig>) {
		if (typeof rowSelectionConfig != "boolean") {
			if (!this.rowSelect) {
				(rowSelectionConfig as RowSelectConfig).list = this as never;
				this.rowSelect = rowselect(rowSelectionConfig as RowSelectConfig);
			} else {
				assignComponentConfig(this.rowSelect, rowSelectionConfig);
			}
		} else if (!this.rowSelect) {
			this.rowSelect = rowselect({list: this as never});
		}
	}


	constructor(readonly store: StoreType, readonly renderer: RowRenderer, tagName: keyof HTMLElementTagNameMap = "ul") {
		super(tagName);
		this.tabIndex = 0;

		store.on("beforeload", () => {
			this.mask()
		});
		store.on("load", () => {
			this.unmask();
			if (this.emptyEl) {
				this.emptyEl.hidden = this.store.count() > 0;
			}
		});

		store.on("loadexception", (store, reason) => {
			Window.error(reason);
			this.unmask();
		})
	}

	get rowSelection(): RowSelect | undefined {
		return this.rowSelect;
	}

	get el(): HTMLElement {
		return super.el;
	}

	protected internalRender() {
		const el = super.internalRender();

		this.initNavigateEvent();

		el.on("mousedown", (e) => {
			this.onMouseEvent(e, "rowmousedown");
		}).on("dblclick", (e) => {
			this.onMouseEvent(e, "rowdblclick");
		}).on("click", (e) => {
			this.onMouseEvent(e, "rowclick");
		}).on("contextmenu", (e) => {
			this.onMouseEvent(e, "rowcontextmenu");
		}).on("keydown", (e) => {
			this.onKeyDown(e);
		})

		this.renderEmptyState();
		this.renderBody();
		this.initStore();
		this.initSortable();

		return el;
	}

	protected initSortable() {
		if(!this.dropBetween && !this.dropOn && !this.draggable) {
			return;
		}
		const sortable = new Sortable(this, ".data");
		sortable.dropOn = this.dropOn;
		sortable.dropBetween = this.dropBetween;
		if(!this.sortableGroup) {
			this.sortableGroup = "sortable-" + Component.uniqueID();
		}
		sortable.group = this.sortableGroup;

		sortable.on("sort", (toComp, toIndex, fromIndex , droppedOn, fromComp, dragDataSet) => {
			return this.fire("drop", toComp, toIndex, fromIndex, droppedOn, fromComp, dragDataSet);
		});

		sortable.on("dropallowed", (toComp, toIndex, fromIndex , droppedOn, fromComp, dragDataSet) => {
			return this.fire("dropallowed", this, toIndex, fromIndex, droppedOn, fromComp, dragDataSet);
		});

		sortable.on("dragstart",(sortable1, ev, dragData) => {

			//Multiselect movement support here. Don't move selection if the dragged element wasn't part of the selection
			if(this.rowSelect && this.rowSelect.multiSelect && this.rowSelect.selected.length > 1 && this.rowSelect.selected.indexOf(dragData.fromIndex) > -1) {
				dragData.dataSet.selectedRowIndexes = this.rowSelect.selected;
				ev.setDragComponent(comp({cls: "card pad", html: this.rowSelect.selected.length + " selected rows"}))
			} else {
				dragData.dataSet.selectedRowIndexes = [dragData.fromIndex];
			}
		});

		sortable.on("dragend", (sortable1, ev, dragData1) => {
			delete dragData1.dataSet.selectedRowIndexes;
		})

		//sortable.on("")
	}

	protected onKeyDown(e: KeyboardEvent) {
		if (e.key == "Delete" || e.metaKey && e.key == "Backspace") {
			this.fire("delete", this);
		}
	}

	protected initStore() {
		// handling remove and add per items allows a drag and drop action via store.remove and store.add
		this.store.on("remove", this.onRecordRemove.bind(this));
		this.store.on("add", this.onRecordAdd.bind(this));

		if (this.scrollLoad && this.parent) {
			this.store.addScrollLoader(this.parent.el);
		}
	}

	protected onRecordRemove(collection: StoreType, item: StoreRecord, index: number) {
		const rows = this.getRowElements();
		rows[index]?.remove();

		// Remove row from selection too if it's not caused by a store load. Then we want to maintain the selection.
		if (!this.store.loading && this.rowSelection) {
			this.rowSelection.remove(index, true);
		}
	}

	//todo inserting doesn't work with groups yet. It can only append to the last
	protected onRecordAdd(collection: StoreType, item: StoreRecord, index: number) {

		const container = this.renderGroup(item)

		const row = this.renderRow(item, index);
		if (index == collection.count() - 1) {
			container.append(row);
		} else {
			const before = this.getRowElements()[index];
			before.parentElement!.insertBefore(row, before);
		}

		this.onRowAppend(row, item, index);
	}

	protected getRowElements(): HTMLElement[] {
		return Array.from(this.el.querySelectorAll(":scope > .data"));
	}

	private initNavigateEvent() {
		this.on('rowmousedown', (list, storeIndex, row, ev) => {
			if (!ev.shiftKey && !ev.ctrlKey) {
				this.fire("navigate", this, storeIndex);
			}
		});

		if (this.rowSelection) {

			this.el.addEventListener('keydown', (ev) => {

				if (!ev.shiftKey && !ev.ctrlKey && (ev.key == "ArrowDown" || ev.key == "ArrowUp")) {

					const selected = this.rowSelect!.selected;
					if (selected.length) {
						const storeIndex = selected[0]
						this.fire("navigate", this, storeIndex);
					}
				}
			});

		}
	}

	protected renderEmptyState() {
		this.emptyEl = E(this.emptyStateTag).css({'captionSide': 'bottom', height: '100%'});
		this.emptyEl.hidden = this.store.count() > 0;
		this.emptyEl.innerHTML = this.emptyStateHtml;
		this.el.appendChild(this.emptyEl);
	}

	protected renderBody() {

		this.renderRows(this.store.all());

		if (this.rowSelect) {
			this.rowSelect.on('rowselect', (rowSelect, storeIndex) => {

				const tr = this.getRowElements()[storeIndex];

				if (!tr) {
					//row not rendered (yet?). selected class will also be addded on render
					return;
				}
				tr.classList.add('selected');

				// focus so it scrolls in view
				//tr.focus();
			});

			this.rowSelect.on('rowdeselect', (rowSelect, storeIndex) => {
				const tr = this.getRowElements()[storeIndex];
				if (!tr) {
					console.error("No row found for selected index: " + storeIndex + ". Maybe it's not rendered yet?");
					return;
				}
				tr.classList.remove('selected');
			});
		}
	}

	public focusRow(index: number) {
		const tr = this.getRowElements()[index];
		if (!tr) {
			return false;
		}
		tr.focus();
		return true;

	}

	protected renderRows(records: any[]) {

		for (let i = 0, l = records.length; i < l; i++) {
			const container = this.renderGroup(records[i]),
				row = this.renderRow(records[i], i);

			container.append(row);
			this.onRowAppend(row, records[i], i);
		}

		this.fire("renderrows", this, records);
	}

	protected onRowAppend(row: HTMLElement, record: any, index: number) {

	}

	protected renderGroup(record: any): HTMLElement | DocumentFragment {
		// return this.fragment!;
		return this.el;
	}

	protected renderRow(record: any, storeIndex: number): HTMLElement {

		const row = E(this.itemTag)
			.cls('+data')
			.attr('tabindex', '0');

		if (this.draggable) {
			row.draggable = true;
		}
		const r = this.renderer(record, row, this, storeIndex);
		if (typeof r === "string") {
			row.innerHTML = r;
		} else if (Array.isArray(r)) {
			r.forEach(c => {
				c.parent = this;
				c.render(row)
			});
		} // else NO-OP renderder will be responsible for appending html to the row @see Table

		if (this.rowSelection && this.rowSelection.selected.indexOf(storeIndex) > -1) {
			row.classList.add("selected");
		}
		return row;
	}


	private onMouseEvent(e: UIEvent & { target: HTMLElement }, type: any) {

		const row = this.findRowByEvent(e),
			index = row ? this.getRowElements().indexOf(row) : -1;

		if (index !== -1) {
			this.fire(type, this, index, row, e);
		}
	}


	private findRowByEvent(e: UIEvent & { target: HTMLElement }) {
		return e.target.closest(".data") as HTMLElement;
	}

}



export type ListConfig<StoreType extends Store> = Omit<Config<List<StoreType>, ListEventMap<List<StoreType>>, "store" | "renderer">, "rowSelection">

/**
 * Shorthand function to create {@see Table}
 *
 * @param config
 */
export const list = <StoreType extends Store>(config: ListConfig<StoreType>): List<StoreType> => createComponent(new List(config.store, config.renderer), config);