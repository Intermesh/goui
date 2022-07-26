import {comp, Component, ComponentEventMap, ComponentState, Config, createComponent} from "../Component.js";
import {rowselect, TableRowSelect, TableRowSelectConfig} from "./TableRowSelect.js";
import {Store, StoreRecord} from "../../data/Store.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "../Observable.js";
import {ObjectUtil} from "../../util/ObjectUtil.js";
import {menu, Menu} from "../menu/Menu.js";
import {checkbox} from "../form/CheckboxField.js";
import {Notifier} from "../../Notifier.js";
import {draggable} from "../DraggableComponent.js";
import {t} from "../../Translate.js";
import {TableColumn} from "./TableColumns.js";

/**
 * @inheritDoc
 */
export interface TableEventMap<Sender extends Observable> extends ComponentEventMap<Sender> {
	/**
	 * Fires when the user scrolled to the bottom
	 *
	 * @param table
	 */
	scrolleddown: <T extends Sender> (table: T) => void
	/**
	 * Fires when the user sorts the table
	 *
	 * @param table
	 * @param dataIndex
	 */
	sort: <T extends Sender> (table: T, dataIndex: string) => void

	/**
	 * Fires when a row is clicked
	 *
	 * @param table
	 * @param rowIndex
	 * @param ev
	 */
	rowclick: <T extends Sender> (table: T, rowIndex: number, ev: MouseEvent) => void

	/**
	 * Fires when a row is double clicked
	 *
	 * @param table
	 * @param rowIndex
	 * @param ev
	 */
	rowdblclick: <T extends Sender> (table: T, rowIndex: number, ev: MouseEvent) => void

	/**
	 * Fires when records are rendered into rows.
	 *
	 * @param table
	 * @param records
	 */
	renderrows: <T extends Sender> (table: T, records: StoreRecord[]) => void;

	/**
	 * Fires when a row is clicked or navigated with arrows
	 *
	 * @param table
	 * @param rowIndex
	 * @param ev
	 */
	navigate: <T extends Sender> (table: T, rowIndex: number, record: StoreRecord) => void

}

export interface Table {
	on<K extends keyof TableEventMap<this>>(eventName: K, listener: Partial<TableEventMap<this>>[K], options?: ObservableListenerOpts): void;

	fire<K extends keyof TableEventMap<this>>(eventName: K, ...args: Parameters<TableEventMap<this>[K]>): boolean

	set listeners(listeners: ObservableListener<TableEventMap<this>>)
}

/**
 * Table component
 *
 * @example
 * ```
 * const records:StoreRecord[] = [];
 *
 * 	for(let i = 1; i <= 100; i++) {
 * 		records.push({number: i, description: "Test " + i, createdAt: (new DateTime()).format("c")});
 * 	}
 *
 * 	const table = Table.create({
 * 		store: Store.create({
 * 			records: records,
 * 		  sort: [{property: "number", isAscending: true}]
 * 		}),
 * 		cls: "fit",
 * 		columns: [
 * 			{
 * 				header: "Index",
 * 				property: "id",
 * 				renderer: (value, record, td, table) => {
 * 					return table.getStore().findRecordIndex(r => record.number == r.number).toString();
 * 				},
 * 				resizable: true,
 * 				width: 60,
 * 				sortable: false
 * 			},
 * 			{
 * 				header: "Number",
 * 				property: "number",
 * 				sortable: true,
 * 				resizable: true,
 * 				width: 200
 * 			},
 * 			{
 * 				header: "Description",
 * 				property: "description",
 * 				sortable: true,
 * 				resizable: true,
 * 				width: 300
 * 			},
 * 			DateColumn.create({
 * 				header: "Created At",
 * 				property: "createdAt",
 * 				sortable: true
 * 			})
 * 			]
 * 	});
 *  ```
 */
export class Table<StoreType extends Store = Store> extends Component {

	/**
	 *
	 * @param store Store to provide data
	 * @param columns The table columns
	 */
	constructor(readonly store: StoreType, public columns: TableColumn[]) {
		super();
		this.tabIndex = 0;

		store.on("beforeload", () => {
			this.mask();
		})
		store.on("load", () => {
			this.unmask();
		})
	}

	/**
	 * Show headers
	 */
	public headers = true;

	/**
	 * Shown when the table is empty.
	 */
	public emptyStateHtml = `<div class="goui-empty-state"><i class="icon">article</i><p>${t("Nothing to show")}</p></div>`

	private minCellWidth = 30

	protected baseCls = "goui-table scroll";


	/**
	 *
	 * Row selection object
	 *
	 * @param rowSelectionConfig
	 */
	set rowSelectionConfig(rowSelectionConfig: boolean | Partial<TableRowSelectConfig> ) {
		if (typeof rowSelectionConfig != "boolean") {
			(rowSelectionConfig as TableRowSelectConfig).table = this;
			this.rowSelect = rowselect(rowSelectionConfig as TableRowSelectConfig);
		} else {
			this.rowSelect = rowselect({table: this});
		}
	}

	get rowSelection() : TableRowSelect | undefined {
		return this.rowSelect;
	}

	private tableEl?: HTMLTableElement;
	private headersRow?: HTMLTableRowElement;
	private rowSelect?: TableRowSelect;
	private tbody?: HTMLTableSectionElement;

	/**
	 * Make the table fit it's container in width by setting min-width: 100%
	 * Defaults to true
	 */
	public fitComponent = true;

	private loadOnScroll: boolean = false;

	private emptyStateEl?: HTMLDivElement;

	private initNavigateEvent() {
		this.on('rowclick', (table, rowIndex, ev) => {
			if (!ev.shiftKey && !ev.ctrlKey) {
				const record = this.store.get(rowIndex);

				this.fire("navigate", this, rowIndex, record);
			}
		});

		if (this.rowSelection) {

				this.el.addEventListener('keydown', (ev) => {
				if (!ev.shiftKey && !ev.ctrlKey && (ev.key == "ArrowDown" || ev.key == "ArrowUp")) {

					const selected = this.rowSelect!.selected;
					if (selected.length) {
						const rowIndex = selected[0];
						const record = this.store.get(rowIndex);

						this.fire("navigate", this, rowIndex, record);
					}
				}
			});

		}
	}


	protected internalRemove() {
		if (this.columnMenu) {
			this.columnMenu.remove();
		}
		return super.internalRemove();
	}


	protected restoreState(state: ComponentState) {
		if (state.sort) {
			this.store.sort = state.sort;
		}

		if (state.columns) {
			for (let dataIndex in state.columns) {
				let col = this.findColumnByProperty(dataIndex);
				if (col) {
					Object.assign(col, state.columns[dataIndex]);
				}
			}
		}
	}

	/**
	 * Find column by "property" property.
	 *
	 * It's the property path of the data linked to the column
	 *
	 * @param property
	 */
	public findColumnByProperty(property: string) {
		return this.columns.find((col) => {
			return col.property == property;
		});
	}

	protected buildState(): ComponentState {
		const cols: any = {};

		this.columns.forEach((c) => {
			cols[c.property] = {
				width: c.width,
				hidden: c.hidden
			}
		});

		return {
			sort: this.store.sort,
			columns: cols
		}
	}

	protected internalRender() {
		const el = super.internalRender();

		this.initNavigateEvent();

		el.addEventListener("click", (e) => {
			this.onClick(e);
		});

		el.addEventListener("dblclick", (e) => {
			this.onDblClick(e);
		});

		this.renderEmptyState()
		this.renderTable();
		return el;
	}

	protected renderEmptyState() {
		const el = this.el;
		this.emptyStateEl = document.createElement("div");
		this.emptyStateEl.innerHTML = this.emptyStateHtml;
		this.emptyStateEl.hidden = this.store.count() > 0;
		el.appendChild(this.emptyStateEl);

		this.store.on("load", (store, records, append) => {

			if (!append && records.length == 0) {
				this.tableEl!.hidden = true;
				this.emptyStateEl!.hidden = false;
			} else {
				this.tableEl!.hidden = false;
				this.emptyStateEl!.hidden = true;
			}
		});
	}

	private renderTable() {
		const el = this.el;
		this.tableEl = document.createElement('table');
		this.tableEl.hidden = this.store.count() == 0;

		if (this.fitComponent) {
			this.tableEl.style.minWidth = "100%";
		}

		if(this.headers) {
			this.renderHeaders();
		}

		this.renderRows(this.store.items);

		el.appendChild(this.tableEl);

		if (this.loadOnScroll) {
			el.addEventListener("scroll", () => {
				this.onScroll();
			}, {passive: true});
		}

		// Use unshift = true so that this listener executes first so that other load listners execute when the table is
		// rendered and can select rows.
		this.store.on("load", (store, records, append) => {
			if (!append) {
				this.tbody!.innerHTML = "";
			}
			this.renderRows(records);

			if (this.loadOnScroll) {
				setTimeout(() => {
					this.onScroll();
				});
			}

		}, {unshift: true});

		if (this.rowSelect) {
			this.rowSelect.on('rowselect', (tableRowSelect, rowIndex) => {
				const tr = (<HTMLElement>this.tbody!.childNodes[rowIndex]);
				if (!tr) {
					console.error("No row found for selected index: " + rowIndex + ". Maybe it's not rendered yet?");
					return;
				}
				tr.classList.add('selected');
				tr.focus();
			});

			this.rowSelect.on('rowdeselect', (tableRowSelect, rowIndex) => {
				const tr = (<HTMLElement>this.tbody!.childNodes[rowIndex]);
				if (!tr) {
					console.error("No row found for selected index: " + rowIndex + ". Maybe it's not rendered yet?");
					return;
				}
				tr.classList.remove('selected');
			});
		}
	}

	private rerender() {
		const el = this.el;
		this.tbody = undefined;
		el.innerHTML = "";
		this.renderTable();
	}


	private onClick(e: MouseEvent) {
		const index = this.findRowByEvent(e);

		if (index == -1) {
			//clicked on header row
			return;
		}

		this.fire('rowclick', this, index, e);
	}

	private onDblClick(e: MouseEvent) {
		const index = this.findRowByEvent(e);

		if (index == -1) {
			//clicked on header row
			return;
		}

		this.fire('rowdblclick', this, index, e);
	}

	private findRowByEvent(e: MouseEvent) {
		const target = <HTMLElement>e.target;
		const tr = target.closest("tr")!;

		if (!tr) {
			//clicked outside table
			return -1;
		}

		return Array.from(this.tbody!.children).indexOf(tr);
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

	private columnMenu: Menu | undefined;

	private showColumnMenu(ev: MouseEvent) {
		ev.preventDefault();

		if (!this.columnMenu) {
			this.columnMenu = menu({
				removeOnClose: false
			});

			this.columns.forEach((c) => {
				if(c.header && c.hidable) {
					this.columnMenu!.items.add(checkbox({
						label: c.header,
						name: c.property,
						value: !c.hidden,
						listeners: {
							change: (field) => {
								c.hidden = !field.value;
								this.saveState();
								this.rerender();
							}
						}
					}));
				}
			});
		}

		this.columnMenu.showAt(ev);
	}

	private createColumnSplitter(h: TableColumn, header: HTMLTableCellElement, colIndex: number) {

		if (h.resizable) {
			const splitter = draggable({
				tagName: "hr",
				setPosition: false,
				parent: this
			});

			splitter.on("dragstart", (cmp, dragData) => {
				if (!this.colsAreFixed) {
					this.fixColumnWidths();
				}

				dragData.data.startWidth = header.offsetWidth;

				splitter.dragConstrainTo(this.headersRow!, {
					left: this.calcTableWidth(colIndex) + this.minCellWidth,
					right: -10000
				});
			});

			splitter.on("drag", (cmp, dragData) => {
				const w = dragData.data.startWidth + dragData.x - dragData.startX;
				header.style.width = w + "px"
				h.width = w;
				this.tableEl!.style.width = this.calcTableWidth() + "px";
			});

			splitter.on("drop", () => {
				this.saveState();
			});

			return splitter;

		} else {

			return comp({tagName: "hr"});

		}
	}

	private renderHeaders() {

		const thead = document.createElement('thead');
		this.headersRow = document.createElement("tr");

		this.headersRow.addEventListener('contextmenu', ev => {
			this.showColumnMenu(ev);
		})

		let index = -1;
		for (let h of this.columns) {
			index++;
			if (h.hidden) {
				continue;
			}
			const header = document.createElement("th");

			if (h.width) {
				header.style.width = h.width + "px";
			}

			if (h.align) {
				header.style.textAlign = h.align;
			}

			if (h.headerRenderer) {
				const r = h.headerRenderer(h, header, this);
				if (typeof r === "string") {
					header.innerHTML = r;
				} else if (r instanceof Component) {
					r.render(header);
				}
			} else
			{
				header.innerHTML = h.header || "";
			}

			h.headerEl = header;

			if (h.resizable) {
				const splitter = this.createColumnSplitter(h, header, index);
				splitter.render(header);
			}

			if (h.sortable) {
				header.addEventListener("click", () => {
					this.onSort(h.property, header);
				});
				const sort = this.store.sort;
				if (sort.length) {
					if (h.property == sort[0].property) {
						header.classList.add("sorted");
						header.classList.add(sort[0].isAscending || sort[0].isAscending === undefined ? "asc" : "desc");
					}
				}
			}


			this.headersRow.appendChild(header);
		}

		thead.appendChild(this.headersRow);
		this.tableEl!.appendChild(thead);

		return this.headersRow
	}

	private onSort(dataIndex: string, header: HTMLTableCellElement) {
		this.fire("sort", this, dataIndex);

		const s = this.store.sort;
		let isAscending = true;

		if (s[0]) {
			if (s[0].property == dataIndex) {
				isAscending = !s[0].isAscending;
			}
		}

		this.headersRow!.childNodes.forEach((node) => {
			let th = (<HTMLTableCellElement>node);
			if (th == header) {
				th.classList.add("sorted");
				th.classList.remove(isAscending ? "desc" : "asc");
				th.classList.add(isAscending ? "asc" : "desc");
			} else {
				th.classList.remove("sorted");
				th.classList.remove("asc");
				th.classList.remove("desc");
			}
		})


		this.store.sort = [{
			property: dataIndex,
			isAscending: isAscending
		}];

		this.store.reload().catch((reason) => {
			Notifier.error(reason);
		});

		this.saveState();
	}

	private colsAreFixed = false;

	/**
	 * When resizing columns we must calculate absolute pixel widths
	 *
	 * @private
	 */
	private fixColumnWidths() {

		this.columns.forEach(col => {
			if (!col.hidden) {
				col.width = col.headerEl!.offsetWidth;
				col.headerEl!.style.width = col.width + "px";
			}
		});

		this.tableEl!.style.minWidth = "";
		this.tableEl!.style.width = this.calcTableWidth() + "px";
	}

	/**
	 * Returns the sum of column widths
	 *
	 * @param untilColumnIndex Calc width until this column
	 */
	private calcTableWidth(untilColumnIndex: number = -1) {

		return this.columns.reduce((previousValue: number, nextValue: TableColumn, currentIndex: number) => {
			if (nextValue.hidden || (untilColumnIndex > -1 && currentIndex >= untilColumnIndex)) {
				return previousValue;
			}
			return previousValue + nextValue.width!;

		}, 0);
	}

	private renderRows(records: StoreRecord[]) {

		if (!this.tbody) {
			this.tbody = document.createElement('tbody');
			this.tableEl!.appendChild(this.tbody);
		}

		const frag = document.createDocumentFragment();

		records.forEach((record, index) => {
			const row = this.renderRow(record, frag, index);
			if(this.rowSelection && this.rowSelection.selected.indexOf(index) > -1) {
				row.classList.add("selected");
			}
		})

		this.tbody.appendChild(frag);

		this.fire("renderrows", this, records);
	}

	private renderRow(record: any, tbody: DocumentFragment, rowIndex: number) {
		const row = document.createElement("tr");

		// useful so it scrolls into view
		row.setAttribute('tabindex', '0');

		for (let c of this.columns) {

			if (c.hidden) {
				continue;
			}
			const td = document.createElement("td");

			if (c.align) {
				td.style.textAlign = c.align;
			}

			let value = ObjectUtil.path(record, c.property);

			if (c.renderer) {
				const r = c.renderer(value, record, td, this, rowIndex);
				if (typeof r === "string") {
					td.innerHTML = r;
				} else if (r instanceof Component) {
					r.render(td);
				} else {
					r.then((s) => {
						if (s instanceof Component) {
							s.render(td);
						} else {
							td.innerHTML = s;
						}
					})
				}
			} else {
				td.innerText = value ? value : "";
			}

			row.appendChild(td);
		}

		tbody.appendChild(row);

		return row;
	}
}

type TableConfig = Omit<Config<Table>, "rowSelection"> & {
	/**
	 * Store that provides the data
	 */
	store: Store,

	/**
	 * The table columns
	 */
	columns: TableColumn[]
}

/**
 * Shorthand function to create {@see Table}
 *
 * @param config
 */
export const table = (config: TableConfig) => createComponent(new Table(config.store, config.columns), config);