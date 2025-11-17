/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {comp, Component, ComponentState, createComponent} from "../Component.js";
import {Store} from "../../data/Store.js";
import {ArrayUtil, ObjectUtil} from "../../util/index";
import {menu, Menu} from "../menu/Menu.js";
import {checkbox} from "../form/index";
import {Notifier} from "../../Notifier.js";
import {draggable} from "../DraggableComponent.js";
import {TableColumn} from "./TableColumns.js";
import {List, ListEventMap} from "../List.js";
import {Config} from "../Observable.js";
import {Sortable} from "../Sortable";


/**
 * Table component
 *
 * @link https://goui.io/#table Example
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
 *
 *
 */
export class Table<StoreType extends Store = Store, EventMap extends ListEventMap = ListEventMap> extends List<StoreType, EventMap > {
	private _columns!: Record<string,TableColumn>;

	/**
	 * The table columns
	 *
	 * @param columns
	 */
	public set columns(columns:TableColumn[]) {
		this._columns = {};
		columns.forEach(c => {
			this._columns[c.id] = c;

			if(c.init) {
				c.init.call(c, this);
			}
		})
		if(this.rendered) {
			this.rerender();
		}
	}

	public get columns() {
		return Object.values(this._columns);
	}
	/**
	 *
	 * @param store Store to provide data
	 * @param columns The table columns
	 */
	constructor(store: StoreType,  columns: TableColumn[]) {

		super(store, (record, row, me, storeIndex) => {

			let left = 0, stickyLeft = true, index = -1;
			for (let id of this.getColumnSort()) {
				const c = this._columns[id];
				index++

				c.parent = this;

				if (c.hidden) {
					continue;
				}
				const td = document.createElement("td");
				row.append(td);

				let value = undefined;
				try {
					value = c.property ? ObjectUtil.get(record, c.property) : undefined;
				} catch (e)
				{
					//ignore invalid pointers.
				}

				const strToTd = (str:string) => {
					if(c.htmlEncode) {
						td.innerText = str;
					} else {
						td.innerHTML = str;
					}
				}

				if (c.renderer) {
					const r = c.renderer(value, record, td, this, storeIndex, c);

					c.fire("render", {result:r, record, storeIndex, td});

					if (r) {

						if (typeof r === "string") {
							strToTd(r);
						} else if (r instanceof Component) {
							r.parent = this;
							r.render(td);
						} else if(r instanceof Promise) {
							r.then((s) => {
								if (!s) {
									return;
								}
								if (s instanceof Component) {
									s.parent = this;
									s.render(td);
								} else {
									strToTd(s);
								}
							})
						} else {
							strToTd(r + "");
						}
					}
				} else {

					strToTd(value != undefined && value != null ? value : "");
				}

				if (c.align) {
					td.style.textAlign = c.align;
				}

				if (c.cls) {
					td.classList.add(...c.cls.split(" "));
				}

				if (c.sticky) {
					td.classList.add("sticky-col");
					if (stickyLeft)
						td.style.left = left / 10 + "rem";
					else
						td.style.right = this.calcStickyRight(index) / 10 + "rem";
				} else {
					stickyLeft = false;
				}

				if (c.width)
					left += c.width;
			}

		}, "table");

		this.columns = columns;
	}

	/**
	 * Make the table fits its container in width by setting min-width: 100%
	 * Defaults to true
	 */
	public fitParent = false;

	/**
	 * Show headers
	 */
	public headers = true;


	protected emptyStateTag: keyof HTMLElementTagNameMap = 'caption'

	private minCellWidth = 30

	protected baseCls = "goui-table";

	private headersRow?: HTMLTableRowElement;

	protected itemTag: keyof HTMLElementTagNameMap = 'tr';

	/**
	 * Allow reordering columns by drag and drop
	 */
	public reorderColumns = true;

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

		if(state.columnSort) {
			this.columnSort = state.columnSort;
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
		return this._columns[id] ?? undefined;
	}

	/**
	 * Scroll a column into view
	 *
	 * Note: If you use sticky columns it might be necessary to use:
	 *
	 * ```
	 * style: {
	 * 	scrollPaddingRight: "8rem" // fix for scrollIntoView and sticky column
	 * },
	 * ```
	 * @param id
	 * @param opts
	 */
	public scrollToColumn(id: string, opts?: boolean | ScrollIntoViewOptions) {
		if(!this.headersRow) {
			return false;
		}
		const index = this.getColumnSort().indexOf(id)

		if(index === -1) {
			return false;
		}

		const header = this.headersRow.childNodes.item(index) as HTMLElement
		header.scrollIntoView(opts);

		return true;
	}

	protected buildState(): ComponentState {
		const cols: any = {};

		for(const id in this._columns) {
			cols[id] = {
				width: this._columns[id].width,
				hidden: this._columns[id].hidden
			}
		}

		return {
			sort: this.store.sort,
			columns: cols,
			columnSort: this.columnSort
		}
	}

	protected columnSort: string[]|undefined;

	private getColumnSort() {
		if(this.columnSort) {
			if(this.columnSort.length != this.columns.length) {
				// add missing id's
				for(const id in this._columns) {
					if(!this._columns[id].hidden && this.columnSort!.indexOf(id) === -1) {
						this.columnSort!.push(id);
					}
				}
			}
			return this.columnSort.filter(id => id in this._columns);
		} else {
			return this.columns.filter(c => !c.hidden).map(c => c.id);
		}
	}

	protected renderBody() {

		if (this.fitParent) {
			this.el.style.minWidth = "100%";
		}

		if (this.headers) {
			this.renderHeaders();
		} else {
			this.renderColGroup();
		}

		super.renderBody();
	}

	private columnMenu: Menu | undefined;

	private showColumnMenu(ev: MouseEvent) {
		ev.preventDefault();

		if (!this.columnMenu) {
			this.columnMenu = menu({
				isDropdown: true,
				removeOnClose: false
			});

			for (let id in this._columns) {
				const c = this._columns[id];

				if (c.header && c.hidable) {
					this.columnMenu!.items.add(checkbox({
						label: c.header,
						name: c.id,
						value: !c.hidden,
						listeners: {
							change: ({target}) => {
								c.hidden = !target.value;
								this.saveState();
								this.rerender();
							}
						}
					}));
				}
			};
		}

		this.columnMenu.showAt(ev);
	}

	private createColumnSplitter(h: TableColumn, header: HTMLTableCellElement, colIndex: number) {

		if (h.resizable) {
			const splitter = draggable({
				tagName: "hr",
				setPosition: false
			});

			splitter.parent = this;

			splitter.on("dragstart", ({dragData}) => {
				if (!this.colsAreFixed) {
					this.fixColumnWidths();
				}

				dragData.data.startWidth = header.offsetWidth;

				splitter.dragConstrainTo(this.headersRow!, {
					left: this.calcTableWidth(colIndex) + this.minCellWidth,
					right: -10000
				});
			});

			splitter.on("drag", ( {dragData}) => {
				const w = dragData.data.startWidth + dragData.x - dragData.startX;
				header.style.width = Table.pxToRem(w) / 10 + "rem"
				h.width = w;
				this.el!.style.width = this.calcTableWidth() / 10 + "rem";
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
		for (let id of this.getColumnSort()) {
			const h = this._columns[id];
			index++;
			if (h.hidden) {
				continue;
			}
			const col = document.createElement("col");

			if (h.width) {
				col.style.width = h.width / 10 + "rem";
			}

			if (h.align) {
				col.style.textAlign = h.align;
			}

			if (h.cls) {
				col.classList.add(...h.cls.split(" "));
			}

			colGroup.appendChild(col);
		}

		this.el!.appendChild(colGroup);

		return colGroup;
	}

	private renderHeaders() {

		const thead = document.createElement('thead');
		this.headersRow = document.createElement("tr");

		this.headersRow.addEventListener('contextmenu', ev => {
			this.showColumnMenu(ev);
		})

		let index = -1, left = 0,  stickyLeft = true;
		for (let id of this.getColumnSort()) {
			const h = this._columns[id];
			index++;
			if (h.hidden) {
				continue;
			}
			const header = document.createElement("th");

			if (h.headerRenderer) {
				const r = h.headerRenderer(h, header, this);
				if (typeof r === "string") {
					header.innerHTML = r;
				} else if (r instanceof Component) {
					r.render(header);
				}
			} else {
				header.innerHTML = h.header || "";
			}

			if (h.width) {
				header.style.width = (h.width / 10) + "rem";
			}

			if (h.align) {
				header.style.textAlign = h.align;
			}

			if (h.cls) {
				header.classList.add(...h.cls.split(" "));
			}

			if(h.sticky) {
				header.classList.add("sticky-col");

				if(stickyLeft) {
					header.style.left = (left / 10) + "rem";
				}else{
					header.style.right = (this.calcStickyRight(index) / 10) + "rem";
				}
				if(h.width)
					left += h.width;

			} else {
				stickyLeft = false;

				if(this.reorderColumns) {
					header.draggable = true;
				}
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
					this.onSort(h.id, header);
				});
				const sort = this.store.sort;
				if (sort.length) {
					sort.forEach((comparator) => {
						if (h.id == comparator.property) {
							header.classList.add("sorted");
							header.classList.add(comparator.isAscending || comparator.isAscending === undefined ? "asc" : "desc");
						}
					})
				}
			}
			this.headersRow.appendChild(header);
		}

		thead.appendChild(this.headersRow);
		this.el!.appendChild(thead);

		return this.headersRow
	}

	protected initSortable() {
		super.initSortable();

		if(this.reorderColumns) {
			const headerSorter = new Sortable(this, 'th');
			headerSorter.dropOn = false;
			headerSorter.dropBetween = true;
			headerSorter.horizontal = true;
			headerSorter.group = "header-sortable-" + Component.uniqueID();

			headerSorter.on("sort", ({toIndex, fromIndex}) => {
				this.columnSort = ArrayUtil.move(this.getColumnSort(), fromIndex, toIndex);
				this.saveState();
				this.rerender();
			});

			headerSorter.on("dropallowed",( {toIndex}) => {
				const cols = this.columns;

				if(!cols[toIndex]) {
					return false;
				} else {
					return !cols[toIndex].sticky;
				}

			})
		}
	}

	private onSort(dataIndex: string, header: HTMLTableCellElement) {
		this.fire("sort", {property: dataIndex});

		const s = this.store.sort;

		let sortIndex = Math.max(0, s.length - 1); // when multiple sorts are given we edit the last. Useful when groupBy is used.

		if (s[sortIndex]) {
			if (s[sortIndex].property == dataIndex) {
				s[sortIndex].isAscending = !s[sortIndex].isAscending;
			} else {
				s[sortIndex].property = dataIndex;
			}
		} else {
			s[sortIndex] = {
				isAscending: true,
				property: dataIndex
			}
		}

		this.headersRow!.childNodes.forEach((node) => {
			let th = (<HTMLTableCellElement>node);
			if (th == header) {
				th.classList.add("sorted");
				th.classList.remove(s[sortIndex].isAscending ? "desc" : "asc");
				th.classList.add(s[sortIndex].isAscending ? "asc" : "desc");
			} else {
				th.classList.remove("sorted");
				th.classList.remove("asc");
				th.classList.remove("desc");
			}
		})

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

		for (let id of this.getColumnSort()) {
			const col = this._columns[id];
			if (!col.hidden) {
				col.width = Table.pxToRem(col.headerEl!.offsetWidth);
				col.headerEl!.style.width = col.width / 10 + "rem";
			}
		};

		this.el!.style.minWidth = "";
		this.el!.style.width = this.calcTableWidth() / 10 + "rem";
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

	protected groupSelector = "tbody";

	protected renderGroup(record: any): HTMLElement {

		if (!this.groupBy) {
			this.lastGroup = JSON.stringify("");
			return document.createElement('tbody');
		}

		const tr = document.createElement("tr");
		tr.classList.add("group");

		const th = document.createElement("th");
		th.colSpan = this.columns.length;

		this.renderGroupToEl(record, th);

		tr.append(th);

		const groupEl = document.createElement('tbody');
		groupEl.append(tr);
		return groupEl;
	}


	focusRow(index: number): boolean {
		if(this.rowSelection) {
			this.rowSelection.lastIndex = index;
		}
		return super.focusRow(index);
	}

	private calcStickyRight(index: number) {
		let r = 0;

		const sort = this.getColumnSort();

		for(let i = index + 1, l = sort.length; i < l; i++) {
			const id = sort[i];
			if(this._columns[id].width) {
				r += this._columns[id].width!;
			}
		}
		return r;
	}
}

export type TableConfig<TableType extends Table = Table> = Omit<Config<TableType, "store" | "columns">, "rowSelection">

/**
 * Shorthand function to create {@link Table}
 *
 * @param config
 */
export const table = <StoreType extends Store = Store>

	(config: TableConfig<Table<StoreType>>) => {
		const tbl = new Table<StoreType>(config.store, config.columns);

		const cfg:any = config;
		delete cfg.columns;
		delete cfg.store;

		return createComponent(tbl, cfg, []);
	};