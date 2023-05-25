/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */

import {comp, Component, ComponentEventMap, createComponent} from "./Component.js";
import {Store} from "../data/Store.js";
import {t} from "../Translate.js";
import {E} from "../util/Element.js";
import {rowselect, RowSelect, RowSelectConfig} from "./table/RowSelect.js";
import {Config, ObservableListenerOpts} from "./Observable.js";
import {BufferedFunction, FunctionUtil} from "../util";
import {dragData} from "../DragData";
import {root} from "./Root";

export type RowRenderer = (record: any, row: HTMLElement, list: any, storeIndex: number) => string | Component[] | void;


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
	 * Fires when the user sorts the list
	 *
	 * @param list
	 * @param dataIndex
	 */
	sort: (list: Type, dataIndex: string) => void

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
	on<K extends keyof ListEventMap<this>>(eventName: K, listener: Partial<ListEventMap<this>>[K], options?: ObservableListenerOpts): void;

	fire<K extends keyof ListEventMap<this>>(eventName: K, ...args: Parameters<ListEventMap<any>[K]>): boolean
}

const dropPin = comp({
	cls: "drop-pin",
	hidden: true
})

root.items.add(dropPin);


export class List<StoreType extends Store = Store> extends Component {
	/**
	 * Shown when the list is empty.
	 */
	public emptyStateHtml = `<div class="goui-empty-state"><i class="icon">article</i><p>${t("Nothing to show")}</p></div>`

	protected loadOnScroll: boolean = false;

	private emptyStateEl?: HTMLElement;

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

	constructor(readonly store: StoreType, readonly renderer: RowRenderer, tagName: keyof HTMLElementTagNameMap = "ul") {
		super(tagName);
		this.tabIndex = 0;

		const bf = new BufferedFunction(100, this.mask.bind(this));

		store.on("beforeload", () => {
			bf.buffer();
		})
		store.on("load", () => {
			if (bf.pending()) {
				bf.cancel();
			} else {
				this.unmask();
			}
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
		});

		// this.renderEmptyState();
		this.renderBody();
		this.initStore();

		return el;
	}

	protected initStore() {
		if (this.loadOnScroll) {
			this.el.on('scroll', () => {
				this.onScroll();
			}, {passive: true});
		}

		const onLoadScroll = FunctionUtil.buffer(10, this.onScroll);

		// // Use unshift = true so that this listener executes first so that other load listeners execute when the list is
		// // rendered and can select rows.
		// this.store.on("load", (store, records, append) => {
		// 	const isEmpty = (!append && records.length == 0);
		//
		// 	//this.el.hidden = isEmpty;
		// 	//this.emptyStateEl!.hidden = !isEmpty;
		//
		// 	if (!append) {
		// 		this.clearRows();
		// 	}
		// 	this.renderRows(records);
		//
		// }, {unshift: true});


		// handling remove and add per items allows a drag and drop action via store.remove and store.add
		this.store.on("remove", (collection, item, index) => {

			const rows = this.getRowElements();
			rows[index].remove();
		});

		this.store.on("add", async (collection, item, index) => {
			const container = this.renderGroup(item)

			if(index == collection.count() -1) {
				container.append(this.renderRow(item, index));
			} else
			{
				const before = container.children[index];
				container.insertBefore(this.renderRow(item, index), before);
			}

			if (this.loadOnScroll) {
				onLoadScroll();
			}
		});


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
		this.emptyStateEl = E('li');
		this.emptyStateEl.hidden = this.store.count() > 0;
		this.emptyStateEl.innerHTML = this.emptyStateHtml;
		this.el.appendChild(this.emptyStateEl);
	}

	protected clearRows() {
		this.el.innerHTML = "";
	}

	protected renderBody() {

		this.renderRows(this.store.items);

		if (this.rowSelect) {
			this.rowSelect.on('rowselect', (rowSelect, storeIndex) => {

				const tr = this.getRowElements()[storeIndex];

				if (!tr) {
					console.error("No row found for selected index: " + storeIndex + ". Maybe it's not rendered yet?");
					return;
				}
				tr.classList.add('selected');
				tr.focus();
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

	protected async renderRows(records: any[]) {

		// this.fragment = new DocumentFragment();

		for(let i = 0, l = records.length; i < l; i++) {
			const container = this.renderGroup(records[i]),
				row = await this.renderRow(records[i], i);
			if (this.rowSelection && this.rowSelection.selected.indexOf(i) > -1) {
				row.cls("+selected");
			}
			container.append(row);
		};

		// this.el.append(this.fragment);

		// this.fragment = undefined;


		this.fire("renderrows", this, records);
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
			r.forEach(c => c.render(row));
		} // else NO-OP renderder will be responsible for appending html to the row @see Table
		return row;
	}

	private onScroll() {
		const el = this.el;
		const pixelsLeft = el.scrollHeight - el.scrollTop - el.offsetHeight;

		if (pixelsLeft < 100) {
			if (!this.store.loading && this.store.hasNext()) {
				this.store.loadNext(true).finally(() => {
					this.fire("scrolleddown", this);
				});
			}
		}
	}

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