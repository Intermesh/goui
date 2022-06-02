import {
	Observable,
	ObservableConfig,
	ObservableEventMap,
	ObservableListener,
	ObservableListenerOpts
} from "./Observable.js";
import {Table} from "./Table.js";
import {ArrayUtil} from "../util/ArrayUtil.js";

/**
 * @inheritDoc
 */
export interface TableRowSelectConfig<T extends Observable> extends ObservableConfig<T> {

	/**
	 * The table component
	 */
	table:Table,

	/**
	 * Allow multi selection with the shift and ctrl keys
	 */
	multiSelect?: boolean,

	/**
	 * @inheritDoc
	 */
	listeners?:ObservableListener<TableRowSelectEventMap<T>>
}

export interface TableRowSelectEventMap<T extends Observable> extends ObservableEventMap<T> {
	/**
	 * Fires when selection changes. When holding arrow on keyboard it will only fire once at key up to prevent
	 * flooding the server with requests
	 *
	 * @example get store record in table config
	 * ```
	 * rowSelection: {
	 * 				multiSelect: true,
	 * 				listeners: {
	 * 					selectionchange: (tableRowSelect) => {
	 * 						if(tableRowSelect.getSelected().length == 1) {
	 * 							const table = tableRowSelect.getTable();
	 * 							const record = table.getStore().getRecordAt(tableRowSelect.getSelected()[0]);
	 * 						}
	 * 					}
	 * 				}
	 * 			}
	 * ```
	 * @param tableRowSelect
	 */
	selectionchange?: (tableRowSelect: TableRowSelect) => void

	/**
	 * Fires when a row is selected
	 * @param tableRowSelect
	 * @param rowIndex
	 */
	rowselect?: (tableRowSelect: TableRowSelect, rowIndex: number) => void

	/**
	 * Fires when a row is deselected
	 *
	 * @param tableRowSelect
	 * @param rowIndex
	 */
	rowdeselect?: (tableRowSelect: TableRowSelect, rowIndex: number) => void
}

export interface TableRowSelect {
	on<K extends keyof TableRowSelectEventMap<TableRowSelect>>(eventName: K, listener: TableRowSelectEventMap<TableRowSelect>[K], options?: ObservableListenerOpts): void

	fire<K extends keyof TableRowSelectEventMap<TableRowSelect>>(eventName: K, ...args: Parameters<NonNullable<TableRowSelectEventMap<TableRowSelect>[K]>>): boolean
}

/**
 * Table row selection model
 */
export class TableRowSelect extends Observable {
	private table!:Table;

	private _selected: number[] = [];

	private lastIndex = 0;
	private shiftStartIndex?: number;

	public multiSelect = true;
	private hasKeyUpListener: Boolean = false;

	public static create<T extends typeof Observable>(this: T, config?: TableRowSelectConfig<InstanceType<T>>) {
		return <InstanceType<T>> super.create(<any> config);
	}

	protected init() {
		super.init();

		this.table.on('render', () =>{
			const tableEl = this.table.getEl();

			tableEl.classList.add('rowSelect');
			tableEl.setAttribute("tabindex", "-1");
			tableEl.addEventListener("keydown", (e) => {
				this.onKeyDown(e);
			})

			this.table.on('rowclick', (table: Table, index: number, e: MouseEvent) => {
				this.onRowClick(table, index, e);
			});
		})
	}

	/**
	 * Get selected indexes
	 */
	public getSelected() {
		return [...this._selected];
	}

	/**
	 * Get the table this selection model belongs to
	 */
	public getTable() {
		return this.table;
	}

	private onRowClick(table: Table, index: number, e: MouseEvent) {
		let selection = this.getSelected();

		if (e.shiftKey && this.multiSelect) {

			const start = Math.min(index, this.lastIndex);
			const end = Math.max(index, this.lastIndex);

			for (let i = start; i <= end; i++) {
				if (selection.indexOf(i) === -1)
					selection.push(i);
			}

		} else if ((e.ctrlKey || e.metaKey) && this.multiSelect) {
			const currentIndex = selection.indexOf(index);
			if (currentIndex > -1) {
				selection.splice(currentIndex, 1);
			} else {
				selection.push(index);
			}
		} else {
			selection = [index];
		}

		this.setSelected(selection);
		this.lastIndex = index;
	}


	/**
	 * Set selected indexes
	 *
	 * @param newSelection
	 * @param silent Suspends 'selectionchange' event
	 */
	public setSelected(newSelection: number[], silent = false) {

		const old = this._selected;

		this._selected = newSelection;

		const deselect = ArrayUtil.diff(old, newSelection);
		const select = ArrayUtil.diff(newSelection, old);

		// console.log(this._selected,old, select, deselect);

		deselect.forEach(i => {
			this.fire('rowdeselect', this, i);
		})
		select.forEach((i, index) => {
			this.fire('rowselect', this, i);
		})

		const change = (select.length > 0 || deselect.length > 0);

		if (!silent && change) {
			this.fire('selectionchange', this);
		}

		return change;
	}

	private onKeyDown(e: KeyboardEvent) {

		if (e.key == "Shift") {

			this.shiftStartIndex = this.lastIndex;
		}

		if (e.key != "ArrowDown" && e.key != "ArrowUp") {
			return;
		}
		e.preventDefault();

		let index = 0, change = false;
		if (e.key == "ArrowDown") {
			if (this.lastIndex == this.table.getStore().getRecords().length - 1) {
				return;
			}

			index = this.lastIndex + 1
		} else if (e.key == "ArrowUp") {
			if (this.lastIndex == 0) {
				return;
			}
			index = this.lastIndex - 1
		}

		if (e.shiftKey && this.multiSelect) {

			const selected = this.getSelected();

			if ((e.key == "ArrowDown" && index > this.shiftStartIndex!) || (e.key == "ArrowUp" && index < this.shiftStartIndex!)) {

				if (selected.indexOf(index) == -1) {
					selected.push(index);
				}
			} else {
				const removeIndex = selected.indexOf(this.lastIndex);
				if (removeIndex > -1) {
					selected.splice(removeIndex, 1);
				}
			}
			change = this.setSelected(selected, true);
		} else {
			change = this.setSelected([index], true);
		}

		if(change && !this.hasKeyUpListener) {
			this.hasKeyUpListener = true;
			this.table.getEl().addEventListener('keyup', () => {
				this.fire('selectionchange', this);
				this.hasKeyUpListener = false;
			}, {once: true});
		}

		this.lastIndex = index;

	}

}
