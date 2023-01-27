import {Observable, ObservableEventMap, ObservableListener, ObservableListenerOpts} from "../Observable.js";
import {List} from "../List.js";
import {ArrayUtil} from "../../util/ArrayUtil.js";
import {Config} from "../Component.js";


export interface RowSelectEventMap<T extends Observable> extends ObservableEventMap<T> {
	/**
	 * Fires when selection changes. When holding arrow on keyboard it will only fire once at key up to prevent
	 * flooding the server with requests
	 *
	 * @example get store record in list config
	 * ```
	 * rowSelection: {
	 * 				multiSelect: true,
	 * 				listeners: {
	 * 					selectionchange: (rowSelect) => {
	 * 						if(rowSelect.getSelected().length == 1) {
	 * 							const table = rowSelect.getTable();
	 * 							const record = table.getStore().getRecordAt(rowSelect.getSelected()[0]);
	 * 						}
	 * 					}
	 * 				}
	 * 			}
	 * ```
	 * @param rowSelect
	 */
	selectionchange:<Sender extends T> (rowSelect: Sender) => void

	/**
	 * Fires when a row is selected
	 * @param rowSelect
	 * @param storeIndex
	 */
	rowselect:<Sender extends T>  (rowSelect: Sender, storeIndex: number) => void

	/**
	 * Fires when a row is deselected
	 *
	 * @param rowSelect
	 * @param storeIndex
	 */
	rowdeselect:<Sender extends T>  (rowSelect: Sender, storeIndex: number) => void
}

export interface RowSelect {
	on<K extends keyof RowSelectEventMap<this>>(eventName: K, listener: Partial<RowSelectEventMap<this>>[K], options?: ObservableListenerOpts): void
	fire<K extends keyof RowSelectEventMap<this>>(eventName: K, ...args: Parameters<RowSelectEventMap<this>[K]>): boolean
	set listeners (listeners: ObservableListener<RowSelectEventMap<this>>)
}


/**
 * Row selection model
 */
export class RowSelect extends Observable {

	private _selected: number[] = [];

	private lastIndex = -1;
	private shiftStartIndex?: number;

	public multiSelect = true;
	private hasKeyUpListener: Boolean = false;

	constructor(readonly table: List) {
		super();

		this.table.on('beforerender', (me: List) => {

			const tableEl = me.el;

			tableEl.cls('+rowselect');
			tableEl.addEventListener("keydown", (e) => {
				this.onKeyDown(e);
			})

			me.on('rowmousedown', (table: List, index: number, e: MouseEvent) => {
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


	private onRowMouseDown(_list: List, index: number, e: MouseEvent) {
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

		if(e.key == "Escape") {
			this.clear();
			return;
		}

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

		console.warn("rowselectkeydown",index);

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

export type RowSelectConfig = {

	/**
	 * The list component
	 */
	list: List,

} & Config<RowSelect>

/**
 * Shorthand function to create {@see RowSelect}
 *
 * @param config
 */
export const rowselect = (config: RowSelectConfig) => Object.assign(new RowSelect(config.list), config);
