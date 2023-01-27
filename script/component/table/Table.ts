import {comp, Component, ComponentState, Config, createComponent} from "../Component.js";
import {Store, StoreRecord} from "../../data/Store.js";
import {ObjectUtil} from "../../util/ObjectUtil.js";
import {menu, Menu} from "../menu/Menu.js";
import {checkbox} from "../form/CheckboxField.js";
import {Notifier} from "../../Notifier.js";
import {draggable} from "../DraggableComponent.js";
import {TableColumn } from "./TableColumns.js";
import {List} from "../List.js";


type GroupByRenderer = (groupBy:any, record: StoreRecord, thEl: HTMLTableCellElement, table: Table) => string | Promise<string> | Component | Promise<Component>;


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
 * 	const table = table({
 * 		store: const store = jmapstore({
 * 			entity: "TaskList",
 * 			properties: ['id', 'name', 'support'],
 * 			queryParams: {
 * 				limit: 20,
 * 				filter: {
 * 					forSupport: true,
 * 					role: "support", //support tasklists
 * 				}
 * 			},
 * 			sort: [{property: "name", isAscending: true}]
 * 		}),
 * 		cls: "fit",
 * 		columns: [
 * 			{
 * 				header: "Index",
 * 				id: "id",
 * 				renderer: (value, record, td, table) => {
 * 					return table.getStore().findRecordIndex(r => record.number == r.number).toString();
 * 				},
 * 				resizable: true,
 * 				width: 60,
 * 				sortable: false
 * 			},
 * 			{
 * 				header: "Number",
 * 				id: "number",
 * 				sortable: true,
 * 				resizable: true,
 * 				width: 200
 * 			},
 * 			{
 * 				header: "Description",
 * 				id: "description",
 * 				sortable: true,
 * 				resizable: true,
 * 				width: 300
 * 			},
 * 			datecolumn({
 * 				header: "Created At",
 * 				id: "createdAt",
 * 				sortable: true
 * 			})
 * 			]
 * 	});
 *  ```
 */
export class Table<StoreType extends Store = Store> extends List {

	/**
	 *
	 * @param store Store to provide data
	 * @param columns The table columns
	 */
	constructor(readonly store: StoreType, public columns: TableColumn[]) {
		super(store, (record: any, row: HTMLElement, me: List, storeIndex: number) => {
			for (let c of this.columns) {

				if (c.hidden) {
					continue;
				}
				const td = document.createElement("td");

				if (c.align) {
					td.style.textAlign = c.align;
				}

				if(c.cls) {
					td.classList.add(...c.cls.split(" "));
				}

				let value = c.property ? ObjectUtil.path(record, c.property) : undefined;

				if (c.renderer) {
					const r = c.renderer(value, record, td, this, storeIndex);
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

				row.append(td);
			}

		});
	}

	/**
	 * Make the table fits its container in width by setting min-width: 100%
	 * Defaults to true
	 */
	public fitComponent = true;

	/**
	 * Show headers
	 */
	public headers = true;

	/**
	 * Group the table by this property.
	 */
	public groupBy?:string;

	/**
	 * Group renderer function
	 */
	public groupByRenderer: GroupByRenderer = groupBy => groupBy

	private minCellWidth = 30

	protected baseCls = "goui-table scroll";


	protected bodyEl?: HTMLTableElement;
	private headersRow?: HTMLTableRowElement;

	protected itemTag: keyof HTMLElementTagNameMap = 'tr'

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
			for (let id in state.columns) {
				let col = this.findColumnById(id);
				if (col) {
					Object.assign(col, state.columns[id]);
				}
			}
		}
	}

	/**
	 * Find column by "property" property.
	 *
	 * It's the property path of the data linked to the column
	 *
	 * @param id
	 */
	public findColumnById(id: string) {
		return this.columns.find((col) => {
			return col.id == id;
		});
	}

	protected buildState(): ComponentState {
		const cols: any = {};

		this.columns.forEach((c) => {
			cols[c.id] = {
				width: c.width,
				hidden: c.hidden
			}
		});

		return {
			sort: this.store.sort,
			columns: cols
		}
	}

	protected renderBody() {
		this.bodyEl = document.createElement('table');

		if (this.fitComponent) {
			this.bodyEl.style.minWidth = "100%";
		}

		if(this.headers) {
			this.renderHeaders();
		} else {
			this.renderColGroup();
		}

		super.renderBody();
	}

	private rerender() {
		const el = this.el;
		this.groupEl = undefined;
		el.innerHTML = "";
		this.renderBody();
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
						name: c.id,
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
				this.bodyEl!.style.width = this.calcTableWidth() + "px";
			});

			splitter.on("drop", () => {
				this.saveState();
			});

			return splitter;

		} else {

			return comp({tagName: "hr"});

		}
	}

	private renderColGroup() {

		const colGroup = document.createElement("colgroup");

		let index = -1;
		for (let h of this.columns) {
			index++;
			if (h.hidden) {
				continue;
			}
			const col = document.createElement("col");

			if (h.width) {
				col.style.width = h.width + "px";
			}

			if (h.align) {
				col.style.textAlign = h.align;
			}

			if(h.cls) {
				col.classList.add(...h.cls.split(" "));
			}

			colGroup.appendChild(col);
		}


		this.bodyEl!.appendChild(colGroup);

		return colGroup;
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

			if(h.cls) {
				header.classList.add(...h.cls.split(" "));
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
			} else {
				comp({tagName: "hr"}).render(header);
			}

			if (h.sortable && h.property) {
				header.addEventListener("click", () => {
					this.onSort(h.property!, header);
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
		this.bodyEl!.appendChild(thead);

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

		this.bodyEl!.style.minWidth = "";
		this.bodyEl!.style.width = this.calcTableWidth() + "px";
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

	private lastGroup?:string;
	private groupEl?: HTMLTableSectionElement;

	protected renderGroup(record:StoreRecord): HTMLElement {
		if(!this.groupBy) {
			if (!this.groupEl) {
				this.groupEl = document.createElement('tbody');
				this.bodyEl!.append(this.groupEl);
			}
			return this.groupEl;
		}

		if(!this.groupEl || record[this.groupBy] != this.lastGroup) {
			const tr = document.createElement("tr");
			tr.classList.add("group");

			const th = document.createElement("th");
			th.colSpan = this.columns.length;

			const r = this.groupByRenderer(record[this.groupBy], record, th, this);

			if (typeof r === "string") {
				th.innerHTML = r;
			} else if (r instanceof Component) {
				r.render(th);
			} else if(r instanceof Promise) {
				r.then((s) => {
					if (s instanceof Component) {
						s.render(th);
					} else {
						th.innerHTML = s;
					}
				})
			} else {
				console.warn("Renderer returned invalid value: ", r);
			}

			tr.append(th);

			this.groupEl = document.createElement('tbody');
			this.groupEl!.append(tr);

			this.bodyEl!.append(this.groupEl);


			this.lastGroup = record[this.groupBy];
		}
		return this.groupEl;
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