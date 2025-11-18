/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */

import {assignComponentConfig, comp, Component, ComponentEventMap, createComponent} from "./Component.js";
import {Store, StoreComponent, StoreEventMap, storeRecordType} from "../data";
import {t} from "../Translate.js";
import {E, ObjectUtil} from "../util";
import {rowselect, RowSelect, RowSelectConfig, SelectedRow, Table} from "./table";
import {Config} from "./Observable.js";
import {Window} from "./Window.js";
import {Sortable} from "./Sortable.js";

export type RowRenderer = (record: any, row: HTMLElement, list: any, storeIndex: number) => string | Component[] | void;
export type GroupByRenderer = (groupBy: any, record: any, list: List) => string | Promise<string> | Component | Promise<Component>;
export type listStoreType<ListType> = ListType extends List<infer StoreType> ? StoreType : never;

/**
 * @inheritDoc
 */
export interface ListEventMap extends ComponentEventMap {
	/**
	 * Fires when the user scrolled to the bottom.
	 */
	scrolleddown: {};

	/**
	 * Fires when the user sorts the list by a property.
	 */
	sort: {
		/** The property being sorted by. */
		property: string;
	};

	/**
	 * Fires when the user sorts the list by drag and drop.
	 */
	sortchange: {
		/** The record being moved. */
		record: any;
		/** The new index after dropping. */
		dropIndex: number;
		/** The previous index before moving. */
		oldIndex: number;
	};

	/**
	 * Fires when a row is mousedowned.
	 */
	rowmousedown: {
		/** The index in the store. */
		storeIndex: number;
		/** The row element. */
		row: HTMLElement;
		/** The mouse event. */
		ev: MouseEvent;
	};

	/**
	 * Fires when a row is clicked.
	 */
	rowclick: {
		/** The index in the store. */
		storeIndex: number;
		/** The row element. */
		row: HTMLElement;
		/** The mouse or keyboard event. */
		ev: MouseEvent | KeyboardEvent;
	};

	/**
	 * Fires when a row is double clicked.
	 */
	rowdblclick: {
		/** The index in the store. */
		storeIndex: number;
		/** The row element. */
		row: HTMLElement;
		/** The mouse event. */
		ev: MouseEvent;
	};

	/**
	 * Fires when the delete key is pressed.
	 *
	 * @example
	 * ```
	 * delete: async (list) => {
	 *   const ids = list.rowSelection!.selected.map(index => list.store.get(index)!.id);
	 *   await jmapds("Foo").confirmDestroy(ids);
	 * }
	 * ```
	 */
	delete: {};

	/**
	 * Fires when a row is right clicked.
	 */
	rowcontextmenu: {
		/** The index in the store. */
		storeIndex: number;
		/** The row element. */
		row: HTMLElement;
		/** The mouse event. */
		ev: MouseEvent;
	};

	/**
	 * Fires when records are rendered into rows.
	 */
	renderrows: {
		/** The records rendered into rows. */
		records: any[];
	};

	/**
	 * Fires when a row is clicked or navigated with arrows.
	 */
	navigate: {
		/** The index in the store. */
		storeIndex: number;
	};

	/**
	 * Fires when something was dropped.
	 *
	 * @remarks
	 * - `dragDataSet.selectedRowIndexes`: The row indexes when a multiselect is dragged.
	 *   If the record dragged is not part of the selection then it will contain the single dragged record.
	 */
	drop: {
		/** The index where it's dropped in this list. */
		toIndex: number;
		/** The index in the source component of the item being dragged. */
		fromIndex: number;
		/** True if dropped on a node and not between. */
		droppedOn: boolean;
		/** The component where the item is dragged from. */
		source: Component;
		/** Arbitrary drag data components may set. */
		dragDataSet: Record<string, any>;
	};

	/**
	 * Fires when the items are dragged over this list.
	 *
	 * Return false to disallow dropping.
	 *
	 * @remarks
	 * - `dragDataSet.selectedRowIndexes`: The row indexes when a multiselect is dragged.
	 *   If the record dragged is not part of the selection then it will contain the single dragged record.
	 */
	dropallowed: {
		/** The index where it's dropped in this list. */
		toIndex: number;
		/** The index in the source component of the item being dragged. */
		fromIndex: number;
		/** True if dropped on a node and not between. */
		droppedOn: boolean;
		/** The component where the item is dragged from. */
		source: Component;
		/** Arbitrary drag data components may set. */
		dragDataSet: Record<string, any>;
	};
}



/**
 * List component
 *
 * Create a list with a custom item renderer. Also capable of selecting rows.
 *
 * @link https://goui.io/#list Examples
 */
export class List<StoreType extends Store = Store, EventMapType extends ListEventMap = ListEventMap> extends Component<EventMapType> implements StoreComponent<StoreType> {
	/**
	 * Shown when the list is empty.
	 */
	public emptyStateHtml = `<div class="goui-empty-state"><i class="icon">article</i><p>${t("No items found")}</p></div>`

	protected emptyStateTag: keyof HTMLElementTagNameMap = 'div';
	private emptyEl?: HTMLElement

	private rowSelect?: RowSelect<StoreType, storeRecordType<StoreType>>;

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
	 * When enabled, it will register it's container as scrolling element to the {@link Store}.
	 * @see Store.addScrollLoader();
	 */
	public scrollLoad = false;


	/**
	 * Group the table by this property.
	 */
	public groupBy?: string;

	/**
	 * Makes the groups collapsible
	 */
	public groupByCollapsible = true;

	/**
	 * Group renderer function
	 */
	public groupByRenderer: GroupByRenderer = groupBy => groupBy ?? t("None")


	protected itemTag: keyof HTMLElementTagNameMap = 'li'


	protected lastGroup: string = JSON.stringify("");

	/**
	 * Row selection object
	 * @param rowSelectionConfig
	 */
	set rowSelectionConfig(rowSelectionConfig: boolean | Partial<RowSelectConfig>) {
		if (typeof rowSelectionConfig != "boolean") {
			if (!this.rowSelect) {
				(rowSelectionConfig as RowSelectConfig).list = this as never;
				this.rowSelect = rowselect(rowSelectionConfig as RowSelectConfig<StoreType>);
			} else {
				assignComponentConfig(this.rowSelect, rowSelectionConfig);
			}
		} else if (!this.rowSelect) {
			this.rowSelect = rowselect({list: this as never});
		}
	}
	constructor(readonly store: StoreType, readonly renderer: RowRenderer, tagName: keyof HTMLElementTagNameMap = "div") {
		super(tagName);
		this.tabIndex = 0;
	}
	get rowSelection() {
		return this.rowSelect;
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

		sortable.on("sort", (ev) => {
			return this.fire("drop", ev);
		});

		sortable.on("dropallowed", (ev) => {
			return this.fire("dropallowed", ev);
		});

		sortable.on("dragstart",(ev) => {

			//Multiselect movement support here. Don't move selection if the dragged element wasn't part of the selection
			if(this.rowSelect && this.rowSelect.multiSelect && this.rowSelect.getSelected().length > 1 && this.rowSelect.isSelected(this.store.get(ev.dragData.fromIndex) as storeRecordType<StoreType>)) {
				ev.dragData.dataSet.selectedRowIndexes = this.rowSelect.getSelected();
				ev.ev.setDragComponent(comp({cls: "card pad", html: this.rowSelect.getSelected().length + " selected rows"}))
			} else {
				ev.dragData.dataSet.selectedRowIndexes = [new SelectedRow(this.store, this.store.get(ev.dragData.fromIndex)!)];
			}
		});

		sortable.on("dragend", (ev) => {
			delete ev.dragData.dataSet.selectedRowIndexes;
		})
	}

	protected onKeyDown(e: KeyboardEvent) {
		if (e.key == "Delete" || e.metaKey && e.key == "Backspace") {
			e.preventDefault();
			this.fire("delete", {});
		}

		if(e.key == "Enter") {
			const r = this.getFocussedRow();
			if(r) {
				e.preventDefault();
				this.fire("rowclick", {storeIndex: r.index, row: r.rowEl, ev:e});
			}
		}
	}

	protected initStore() {
		this.store.bindComponent(this);

		if (this.scrollLoad && this.parent) {
			this.store.addScrollLoader(this.parent.el);
		}
	}

	public onStoreLoadException(ev:StoreEventMap['loadexception']) {
		void Window.error(ev.reason);
		this.unmask();
	}


	public onBeforeStoreLoad(ev:StoreEventMap['beforeload']) {
		this.mask()

		if(this.store.loaded && !ev.append) {
			// when loading (not reloading, then this.store.loaded is false) we want to reset the parent's scrolltop
			if(this.parent && this.parent.el.scrollTop) {
				this.parent.el.scrollTop = 0;
			}
		}
	}

	public onStoreLoad() {
		this.unmask();
		if (this.emptyEl) {
			this.emptyEl.hidden = this.store.count() > 0;
		}
	}

	public onRecordRemove(ev:StoreEventMap<any>['remove']) {

		let groupEl;
		const rows = this.getRowElements();
		if(this.groupBy) {
			groupEl = rows[ev.index]?.parentElement;
		}

		rows[ev.index]?.remove();

		// Remove row from selection too if it's not caused by a store load. Then we want to maintain the selection.
		if (!this.store.loading && this.rowSelection) {
			this.rowSelection.remove(ev.item, true);
		}

		//cleanup group if only group header is left
		if(groupEl && groupEl.children.length == 1) {
			groupEl.remove();
			if(this.groupEl == groupEl) {
				this.groupEl = undefined;
				this.lastGroup = JSON.stringify("");
			}
		}
	}

	//todo inserting doesn't work with groups yet. It can only append to the last
	public onRecordAdd(ev:any) {

		const newGroup = this.isNewGroup(ev.item);
		if(!this.groupEl || newGroup !== false) {
			this.groupEl = this.renderGroup(ev.item);
			this.el.append(this.groupEl);
		}

		const row = this.renderRow(ev.item, ev.index);

		// if this is the last row just appended we can append here too. Otherwise we must insert.
		if (ev.index == ev.target.count() - 1) {
			this.groupEl.append(row);
		} else {
			const before = this.getRowElements()[ev.index];
			before.parentElement!.insertBefore(row, before);
		}
	}

	protected getRowElements() : HTMLElement[] {
		return Array.from(this.el.getElementsByClassName("data"))  as HTMLElement[];
	}

	private initNavigateEvent() {
		this.on('rowmousedown', ({ev, storeIndex}) => {
			if (!ev.shiftKey && !ev.ctrlKey && !ev.metaKey) {
				this.fire("navigate", {storeIndex: storeIndex});
			}
		});

		if (this.rowSelection) {

			this.el.addEventListener('keydown', (ev) => {

				if (!ev.shiftKey && !ev.ctrlKey && !ev.metaKey && (ev.key == "ArrowDown" || ev.key == "ArrowUp")) {

					const selected = this.rowSelect!.getSelected();
					if (selected.length) {
						this.fire("navigate", {storeIndex: selected[0].storeIndex});
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
			this.rowSelect.on('rowselect', (ev) => {

				const tr = this.getRowElements()[ev.row.storeIndex];

				if (!tr) {
					//row not rendered (yet?). selected class will also be added on render
					return;
				}
				tr.classList.add('selected');

				tr.scrollIntoView({block: "nearest", inline: "nearest"});
			});

			this.rowSelect.on('rowdeselect', (ev) => {
				const tr = this.getRowElements()[ev.row.storeIndex];
				if (!tr) {
					console.error("No row found for selected index: " + ev.row.storeIndex + ". Maybe it's not rendered yet?");
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

	public getFocussedRow() {
		if(!document.activeElement) {
			return undefined;
		}
		const rows = this.getRowElements();
		const index = rows.indexOf(document.activeElement as HTMLElement);
		if (index == -1) {
			return undefined;
		}

		return {rowEl: rows[index], index: index};
	}

	protected rerender() {
		const el = this.el;
		this.groupEl = undefined;
		this.lastGroup = JSON.stringify("");
		el.innerHTML = "";
		this.renderBody();
	}

	protected groupEl: HTMLElement | undefined;

	protected renderRows(records: any[]) {

		for (let i = 0, l = records.length; i < l; i++) {
			const newGroup = this.isNewGroup(records[i]);
			if(!this.groupEl || newGroup !== false) {

				this.groupEl = this.renderGroup(records[i]);
				this.el.append(this.groupEl);
			}

			const row = this.renderRow(records[i], i);
			this.groupEl.append(row);
		}

		this.fire("renderrows", {records});
	}

	protected isNewGroup(record:any) {
		const groupBy = JSON.stringify(this.groupBy ? ObjectUtil.get(record, this.groupBy) : "");

		return this.lastGroup !== groupBy;
	}


	protected renderGroup(record: any): HTMLElement {

		const ul = document.createElement("ul");

		if(this.groupBy) {
			const groupTitle = document.createElement("li");
			groupTitle.classList.add("group");

			this.renderGroupToEl(record, groupTitle);

			ul.append(groupTitle);
		} else {
			this.lastGroup = JSON.stringify("");
		}
		return ul;
	}

	private wrapGroupByCollapsible(groupDisplayEl:HTMLElement) {

		// this component will replace the original
		const groupDisplayComp = comp();

		const groupRow = comp({
				cls: "hbox"
			},
			comp({
				tagName: "i",
				itemId: "expander",
				cls: "icon",
				text: "expand_more"
			}),
			groupDisplayComp
		);

		groupRow.render(groupDisplayEl);

		groupRow.el.addEventListener("click", (ev) => {
			this.toggleGroup(groupRow);
		});

		return groupDisplayComp.el;
	}

	protected groupSelector = "ul";

	private toggleGroup(groupRow:Component) {
		const groupContainer = groupRow.el.closest(this.groupSelector);
		if (!groupContainer) {
			return
		}

		const icon = groupRow.findChild("expander")!;
		icon.text == "expand_more" ? icon.text = "chevron_right" : icon.text = "expand_more";

		const dataRows = groupContainer.querySelectorAll(".data");

		dataRows.forEach((row) => {
			const tableRow = row as HTMLTableRowElement;

			tableRow.style.display == "none" ? tableRow.style.display = "" : tableRow.style.display = "none";
		});
	}


	protected renderGroupToEl(record: any, groupDisplayEl:HTMLElement) {

		if(this.groupByCollapsible) {
			groupDisplayEl = this.wrapGroupByCollapsible(groupDisplayEl);
		}

		const groupBy = ObjectUtil.get(record, this.groupBy!);

		this.lastGroup = JSON.stringify(groupBy);

		const r = this.groupByRenderer(groupBy, record, this);

		if(r) {
			if (typeof r === "string") {
				groupDisplayEl.innerHTML = r;
			} else if (r instanceof Component) {
				r.render(groupDisplayEl);
			} else if (r instanceof Promise) {
				r.then((s) => {

					if (!s) {
						return;
					}

					if (s instanceof Component) {
						s.render(groupDisplayEl);
					} else {
						groupDisplayEl.innerHTML = s;
					}
				})
			} else {
				console.warn("Renderer returned invalid value: ", r);
			}
		}
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

		if (this.rowSelection && this.rowSelection.isSelected(record)) {
			row.classList.add("selected");
		}
		return row;
	}

	private onMouseEvent(e: UIEvent & { target: HTMLElement }, type: any) {

		const row = this.findRowByEvent(e),
			index = row ? this.getRowElements().indexOf(row) : -1;

		if (index !== -1) {
			this.fire(type, {storeIndex: index, row, ev: e});
		}
	}


	private findRowByEvent(e: UIEvent & { target: HTMLElement }) {
		return e.target.closest(".data") as HTMLElement;
	}
}

export type ListConfig<EventMapType extends ListEventMap, StoreType extends Store> = Omit<Config<List<StoreType, EventMapType>, "store" | "renderer">, "rowSelection">

/**
 * Shorthand function to create {@link List}
 *
 * @link https://goui.io/#list Examples
 *
 * @param config
 */
export const list = <StoreType extends Store>(config: ListConfig<ListEventMap, StoreType>): List<StoreType, ListEventMap> => createComponent(new List(config.store, config.renderer), config);