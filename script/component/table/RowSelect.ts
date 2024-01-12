/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Config, Listener, Observable, ObservableEventMap, ObservableListenerOpts} from "../Observable.js";
import {List} from "../List.js";
import {ArrayUtil} from "../../util/ArrayUtil.js";
import {createComponent} from "../Component";
import {Table} from "./Table";
import {FunctionUtil} from "../../util";

export interface RowSelectEventMap<Type extends Observable> extends ObservableEventMap<Type> {
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
	selectionchange: (rowSelect: Type) => void

	/**
	 * Fires when a row is selected
	 * @param rowSelect
	 * @param storeIndex
	 */
	rowselect: (rowSelect: Type, storeIndex: number) => void

	/**
	 * Fires when a row is deselected
	 *
	 * @param rowSelect
	 * @param storeIndex
	 */
	rowdeselect: (rowSelect: Type, storeIndex: number) => void
}

export interface RowSelect{
	on<K extends keyof RowSelectEventMap<this>, L extends Listener>(eventName: K, listener: Partial<RowSelectEventMap<this>>[K], options?: ObservableListenerOpts): L

	fire<K extends keyof RowSelectEventMap<this>>(eventName: K, ...args: Parameters<RowSelectEventMap<any>[K]>): boolean

}


/**
 * Row selection model
 */
export class RowSelect extends Observable {

	private _selected: number[] = [];

	/**
	 * Last selected index used for multi selection with shift
	 * @private
	 */
	private lastIndex = -1;
	private shiftStartIndex?: number;

	public multiSelect = true;
	private hasKeyUpListener: Boolean = false;
	private fireSelectionChange: () => void;

	constructor(readonly list: List) {
		super();

		this.list.on('beforerender', (me: List) => {

			const tableEl = me.el;

			tableEl.cls('+rowselect');
			tableEl.addEventListener("keydown", (e) => {
				this.onKeyDown(e);
			})

			me.on('rowmousedown', (table: List, index: number, row, e: MouseEvent) => {
				this.onRowMouseDown(table, index, e);
			});

			tableEl.addEventListener("focus", (e) => {
				if (!this.selected.length && this.list.store.get(0)) {
					this.selected = [0];
				}
			})
		})

		const fireSelectionChange = () => {
			this.fire('selectionchange', this);
		}

		//buffer selection change so it doesn't fire many changes if rowSelection.add is called in a loop.
		this.fireSelectionChange = FunctionUtil.buffer(0, fireSelectionChange);
	}

	public clear() {
		this.selected = [];
	}

	public selectAll() {
		const selected = [];
		for (let i = 0, c = this.list.store.count(); i < c; i++) {
			selected.push(i);
		}
		this.selected = selected;
	}

	/**
	 * Get selected indexes
	 *
	 * Note that this is a copy and can't be edited directly. You have to set the selected property with a changed array.
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

	public add(index:number) {
		if(this._selected.indexOf(index) > -1) {
			return;
		}

		this._selected.push(index);

		this.fire('rowselect', this, index);
		this.fireSelectionChange();
	}


	/**
	 * Remove an index from the selection
	 *
	 * @param index
	 * @param silent Don't fire events
	 */
	public remove(index:number, silent = false) {
		const selectedIndex = this._selected.indexOf(index);
		if(selectedIndex == -1) {
			return;
		}

		this._selected.splice(selectedIndex, 1);

		if(!silent) {
			this.fire('rowdeselect', this, index);
			this.fireSelectionChange();
		}
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

		if (newSelection.length) {
			this.lastIndex = newSelection[0];
		}

		const change = (select.length > 0 || deselect.length > 0);

		if (!silent && change) {
			this.fireSelectionChange();
		}

		return change;
	}

	private onKeyDown(e: KeyboardEvent) {

		if (e.key == "Escape") {
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
			if (this.lastIndex == this.list.store.count() - 1) {
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
			this.list.focusRow(index);
		}

		if (change && !this.hasKeyUpListener) {
			this.hasKeyUpListener = true;
			this.list.el.addEventListener('keyup', () => {
				this.fire('selectionchange', this);
				this.hasKeyUpListener = false;
			}, {once: true});
		}

		this.lastIndex = index;

	}

}

export type RowSelectConfig = Config<RowSelect, RowSelectEventMap<RowSelect>, "list">

/**
 * Shorthand function to create {@see RowSelect}
 *
 * @param config
 */
export const rowselect = (config: RowSelectConfig) => createComponent(new RowSelect(config.list), config);
