import {Observable, ObservableEventMap, ObservableListener, ObservableListenerOpts} from "../Observable.js";
import {Table} from "./Table.js";
import {ArrayUtil} from "../../util/ArrayUtil.js";
import {Config} from "../Component.js";


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
	selectionchange:<Sender extends T> (tableRowSelect: Sender) => void

	/**
	 * Fires when a row is selected
	 * @param tableRowSelect
	 * @param storeIndex
	 */
	rowselect:<Sender extends T>  (tableRowSelect: Sender, storeIndex: number) => void

	/**
	 * Fires when a row is deselected
	 *
	 * @param tableRowSelect
	 * @param storeIndex
	 */
	rowdeselect:<Sender extends T>  (tableRowSelect: Sender, storeIndex: number) => void
}

export interface TableRowSelect {
	on<K extends keyof TableRowSelectEventMap<this>>(eventName: K, listener: Partial<TableRowSelectEventMap<this>>[K], options?: ObservableListenerOpts): void
	fire<K extends keyof TableRowSelectEventMap<this>>(eventName: K, ...args: Parameters<TableRowSelectEventMap<this>[K]>): boolean
	set listeners (listeners: ObservableListener<TableRowSelectEventMap<this>>)
}


/**
 * Table row selection model
 */
export class TableRowSelect extends Observable {

	private _selected: number[] = [];

	private lastIndex = -1;
	private shiftStartIndex?: number;

	public multiSelect = true;
	private hasKeyUpListener: Boolean = false;

	constructor(readonly table: Table) {
		super();

		this.table.on('render', () =>{
			const tableEl = this.table.el;

			tableEl.classList.add('rowSelect');
			tableEl.addEventListener("keydown", (e) => {
				this.onKeyDown(e);
			})

			this.table.on('rowmousedown', (table: Table, index: number, e: MouseEvent) => {
				this.onRowMouseDown(table, index, e);
			});

			tableEl.addEventListener("focus", (e) => {
				if(!this.selected.length && this.table.store.get(0)) {
					this.selected = [0];
				}
			})
		})
	}

	public clear() {
		this.selected = [];
	}

	public selectAll() {
		const selected = [];
		for(let i = 0, c = this.table.store.count(); i < c; i ++) {
			selected.push(i);
		}
		this.selected = selected;
	}

	/**
	 * Get selected indexes
	 */
	public get selected() {
		return [...this._selected];
	}

	public set selected(newSelection) {
		this.setSelected(newSelection);
	}


	private onRowMouseDown(table: Table, index: number, e: MouseEvent) {
		let selection = this.selected;

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

		this.selected = selection;



	}


	/**
	 * Set selected indexes
	 *
	 * @param newSelection
	 * @param silent Suspends 'selectionchange' event
	 */
	private setSelected(newSelection: number[], silent = false) {

		const old = this._selected;

		this._selected = newSelection;

		const deselect = ArrayUtil.diff(old, newSelection);
		const select = ArrayUtil.diff(newSelection, old);


		deselect.forEach(i => {
			this.fire('rowdeselect', this, i);
		})
		select.forEach((i, index) => {
			this.fire('rowselect', this, i);
		})

		if(newSelection.length) {
			this.lastIndex = newSelection[0];
		}

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
			if (this.lastIndex == this.table.store.count() - 1) {
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

			const selected = this.selected;

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

		if (change && !this.hasKeyUpListener) {
			this.hasKeyUpListener = true;
			this.table.el.addEventListener('keyup', () => {
				this.fire('selectionchange', this);
				this.hasKeyUpListener = false;
			}, {once: true});
		}

		this.lastIndex = index;

	}

}

export type TableRowSelectConfig = {

	/**
	 * The table component
	 */
	table: Table,

} & Config<TableRowSelect>

/**
 * Shorthand function to create {@see TableRowSelect}
 *
 * @param config
 */
export const rowselect = (config: TableRowSelectConfig) => Object.assign(new TableRowSelect(config.table), config);
