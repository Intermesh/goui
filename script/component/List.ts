/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */

import {comp, Component, ComponentEventMap, createComponent} from "./Component.js";
import {Store, StoreRecord} from "../data/Store.js";
import {t} from "../Translate.js";
import {E} from "../util/Element.js";
import {rowselect, RowSelect, RowSelectConfig} from "./table/RowSelect.js";
import {Config, Listener, ObservableListenerOpts} from "./Observable.js";
import {BufferedFunction, FunctionUtil} from "../util";
import {dragData} from "../DragData";
import {root} from "./Root";
import {Window} from "./Window";
import {HtmlFieldEventMap} from "./form";
import {Type} from "typedoc";

export type RowRenderer = (record: any, row: HTMLElement, list: any, storeIndex: number) => string | Component[] | void;

export type listStoreType<ListType> = ListType extends List<infer StoreType> ? StoreType : never;


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
	 * @param tree The tree that contains the node that is dropped on
	 * @param e The draag event
	 * @param dropRow The row element that is dropped on
	 * @param dropIndex Store index
	 * @param position
	 * @param dragData The arbitrary drag data that is set
	 */
	drop: (list: Type, e: DragEvent, dropRow: HTMLElement, dropIndex:number, position: DROP_POSITION, dragData: any) => void

	dropallowed: (list: Type, e: DragEvent, dropRow: HTMLElement, dragData: any) => void

}

export type DROP_POSITION = "before" | "after" | "on";

export interface List<StoreType extends Store = Store> extends Component {
	on<K extends keyof ListEventMap<this>, L extends Listener>(eventName: K, listener: Partial<ListEventMap<this>>[K], options?: ObservableListenerOpts): L;
	un<K extends keyof ListEventMap<this>>(eventName: K, listener: Partial<ListEventMap<this>>[K]): boolean
	fire<K extends keyof ListEventMap<this>>(eventName: K, ...args: Parameters<ListEventMap<any>[K]>): boolean
}

const dropPin = comp({
	cls: "drop-pin",
	hidden: true
})

root.items.add(dropPin);

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

	protected itemTag: keyof HTMLElementTagNameMap = 'li'
	// protected fragment?: DocumentFragment;

	/**
	 * Row selection object
	 * @param rowSelectionConfig
	 */
	set rowSelectionConfig(rowSelectionConfig: boolean | Partial<RowSelectConfig>) {
		if (typeof rowSelectionConfig != "boolean") {
			(rowSelectionConfig as RowSelectConfig).list = this as never;
			this.rowSelect = rowselect(rowSelectionConfig as RowSelectConfig);
		} else {
			this.rowSelect = rowselect({list: this as never});
		}
	}

	set sortable(sortable: boolean) {
		this.draggable = true;
		this.dropBetween = true;
		this.dropOn = false;

		const ref = this.on("drop", (list, e, dropRow, dropIndex, position, dragData) => {
			const store = dragData.cmp.store;

			// remove the dragged record from the store
			store.removeAt(dragData.storeIndex);
			if(dragData.storeIndex < dropIndex) {
				// if inserting in the same store we need to substract 1 from the index as we took one off.
				dropIndex--;
			}

			//add the record to the new position
			switch(position) {
				case "before":
					// reorder in the tree where it's dropped
					store.insert(dropIndex, dragData.record);
					break;

				case "after":
					store.insert(++dropIndex, dragData.record);
					break;
			}

			this.fire("sortchange", this, dragData.record, dropIndex, dragData.storeIndex);
		});

	}



	constructor(readonly store: StoreType, readonly renderer: RowRenderer, tagName: keyof HTMLElementTagNameMap = "ul") {
		super(tagName);
		this.tabIndex = 0;

		store.on("beforeload", () => {
			this.mask()
		});
		store.on("load", () => {
			this.unmask();
			if(this.emptyEl) {
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

		return el;
	}

	protected onKeyDown(e:KeyboardEvent) {
		if(e.key == "Delete" || e.metaKey && e.key =="Backspace") {
			this.fire("delete", this);
		}
	}

	protected initStore() {
		// handling remove and add per items allows a drag and drop action via store.remove and store.add
		this.store.on("remove", this.onRecordRemove.bind(this));
		this.store.on("add", this.onRecordAdd.bind(this));
	}

	protected onRecordRemove(collection:StoreType, item:StoreRecord, index:number) {
		const rows = this.getRowElements();
		rows[index]?.remove();

		if(this.rowSelection) {
			this.rowSelection.remove(index, true);
		}
	}

	//todo inserting doesn't work with groups yet. It can only append to the last
	protected onRecordAdd(collection:StoreType, item:StoreRecord, index:number) {

		const container = this.renderGroup(item)

		const row = this.renderRow(item, index);
		if(index == collection.count() -1) {
			container.append(row);
		} else
		{
			const before = container.children[index];
			container.insertBefore(row, before);
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
		this.emptyEl = E(this.emptyStateTag).css({'captionSide': 'bottom', height:'100%'});
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

	public focusRow(index:number) {
		const tr = this.getRowElements()[index];
		if(tr) {
			tr.focus();
		}
	}

	protected renderRows(records: any[]) {

		for(let i = 0, l = records.length; i < l; i++) {
			const container = this.renderGroup(records[i]),
				row = this.renderRow(records[i], i);
			if (this.rowSelection && this.rowSelection.selected.indexOf(i) > -1) {
				row.cls("+selected");
			}
			container.append(row);
			this.onRowAppend(row, records[i], i);
		}

		this.fire("renderrows", this, records);
	}

	protected onRowAppend(row:HTMLElement, record: any, index:number) {

	}

	protected renderGroup(record: any): HTMLElement|DocumentFragment {
		// return this.fragment!;
		return this.el;
	}

	protected renderRow(record: any, storeIndex: number): HTMLElement {

		const row = E(this.itemTag)
			.cls('+data')
			.attr('tabindex', '0');

		if (this.draggable) {
			row.draggable = true;
			row.ondragstart = this.onNodeDragStart.bind(this);
		}

		this.bindDropEvents(row);

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

	// private onScroll() {
	// 	const el = this.el;
	// 	const pixelsLeft = el.scrollHeight - el.scrollTop - el.offsetHeight;
	//
	// 	if (pixelsLeft < 100) {
	// 		if (!this.store.loading && this.store.hasNext()) {
	// 			this.store.loadNext(true).finally(() => {
	// 				this.fire("scrolleddown", this);
	// 			});
	// 		}
	// 	}
	// }

	private onMouseEvent(e: MouseEvent & { target: HTMLElement }, type: any) {

		const row = this.findRowByEvent(e),
			index = row ? this.getRowElements().indexOf(row) : -1;

		if (index !== -1) {
			this.fire(type, this, index, row, e);
		}
	}


	private findRowByEvent(e: MouseEvent & { target: HTMLElement }) {
		return e.target.closest(".data") as HTMLElement;
	}


	protected bindDropEvents(row: HTMLElement) {
		row.ondrop = this.onNodeDrop.bind(this);
		row.ondragend = this.onNodeDragEnd.bind(this);
		row.ondragover = this.onNodeDragOver.bind(this);
		row.ondragenter = this.onNodeDragEnter.bind(this);
		row.ondragleave = this.onNodeDragLeave.bind(this);
	}

	protected onNodeDragStart(e: DragEvent) {
		e.stopPropagation();
		const row = e.target as HTMLDivElement;

		//needed for iOS
		e.dataTransfer!.setData('text/plain', 'goui');

		dragData.row = row;
		dragData.cmp = this;
		dragData.storeIndex = this.getRowElements().indexOf(row);
		dragData.record = this.store.get(dragData.storeIndex);

		// had to add this class because otherwise dragleave fires immediately on child nodes: https://stackoverflow.com/questions/7110353/html5-dragleave-fired-when-hovering-a-child-element
		root.el.cls("+dragging");
	}

	protected onNodeDragEnd(e: DragEvent) {
		root.el.cls("-dragging");
	}

	protected onNodeDragEnter(e: DragEvent) {

		const dropRow = this.findDropRow(e);
		if (this.dropAllowed(e, dropRow)) {
			e.stopPropagation();
			e.preventDefault();

			dropRow.cls("+drag-over");

			this.onNodeDragEnterAllowed(e, dropRow);
		}
	}

	protected onNodeDragEnterAllowed(e: DragEvent, dropRow: HTMLElement) {

	}

	protected onNodeDragLeave(e: DragEvent) {
		const dropRow = this.findDropRow(e);
		if (this.dropAllowed(e, dropRow)) {
			e.stopPropagation();
			e.preventDefault();
			this.clearOverClasses(dropRow);
			this.onNodeDragLeaveAllowed(e, dropRow);
		}
	}

	protected onNodeDragLeaveAllowed(e: DragEvent, dropRow: HTMLElement) {

	}

	protected findDropRow(e: DragEvent) {
		return (e.target as HTMLDivElement).closest("LI") as HTMLElement;
	}


	protected clearOverClasses(dropRow: HTMLElement) {
		dropRow.cls("-drag-over");
		dropRow.classList.remove("before");
		dropRow.classList.remove("after");
		dropRow.classList.remove("on");

		dropPin.hidden = true;
	}

	protected onNodeDragOver(e: DragEvent) {

		if(!this.dropOn && !this.dropBetween) {
			return;
		}

		const dropRow = this.findDropRow(e);

		if (this.dropAllowed(e, dropRow)) {
			e.stopPropagation();
			e.preventDefault();

			const pos = this.getDropPosition(e);
			dropRow.classList.toggle("before", "before" == pos);
			dropRow.classList.toggle("after", "after" == pos);
			dropRow.classList.toggle("on", "on" == pos);

			dropPin.hidden = pos == "on" || pos == undefined;
			const dropRowRect = dropRow.getBoundingClientRect();
			dropPin.el.style.top = (pos == "before" ? dropRowRect.y : dropRowRect.y + dropRowRect.height - 1) + "px";
			dropPin.el.style.left = dropRowRect.x + "px";
			dropPin.el.style.width = dropRowRect.width + "px";
		}
	}

	protected dropAllowed(e: DragEvent, dropRow: HTMLElement) {
		return this.fire("dropallowed", this, e, dropRow, dragData);
	}

	protected getDropPosition(e: DragEvent): DROP_POSITION | undefined {

		if (!this.dropBetween) {
			return this.dropOn ? "on" : undefined;
		}

		const betweenZone = 6;

		if (e.offsetY < betweenZone) {
			return "before";
		} else if (e.offsetY > (e.target as HTMLElement).offsetHeight - betweenZone) {
			return "after";
		} else {
			return this.dropOn ? "on" : undefined;
		}
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

		this.fire("drop", this, e, dropRow, dropIndex, dropPos, dragData);

	}

}


export type ListConfig<StoreType extends Store> = Omit<Config<List<StoreType>, ListEventMap<List<StoreType>>, "store" | "renderer">, "rowSelection">

/**
 * Shorthand function to create {@see Table}
 *
 * @param config
 */
export const list = <StoreType extends Store>(config: ListConfig<StoreType>): List<StoreType> => createComponent(new List(config.store, config.renderer), config);