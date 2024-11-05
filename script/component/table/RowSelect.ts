/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Config, Listener, Observable, ObservableEventMap, ObservableListenerOpts} from "../Observable.js";
import {List} from "../List.js";
import {ArrayUtil} from "../../util/ArrayUtil.js";
import {createComponent} from "../Component.js";
import {Table} from "./Table.js";
import {FunctionUtil} from "../../util/index.js";
import {CheckboxSelectColumn} from "./TableColumns.js";

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
	selectionchange: (rowSelect: Type, selected: number[]) => void

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
	public lastIndex = -1;
	private shiftStartIndex?: number;

	public multiSelect = true;
	private hasKeyUpListener: Boolean = false;
	private fireSelectionChange: () => void;

	constructor(readonly list: List) {
		super();


		this.list.el.cls('+rowselect');
		this.list.el.addEventListener("keydown", (e) => {
			this.onKeyDown(e);
		})

		this.list.on('rowmousedown', (table: List, index: number, row, e: MouseEvent) => {
			this.onRowMouseDown(table, index, e);
		});

		this.list.on('rowclick', (table: List, index: number, row, e: MouseEvent) => {
			this.onRowClick(table, index, e);
		});

		const fireSelectionChange = () => {
			this.fire('selectionchange', this, this.selected);
		}

		//buffer selection change so it doesn't fire many changes if rowSelection.add is called in a loop.
		this.fireSelectionChange = FunctionUtil.buffer(0, fireSelectionChange);
	}

	private _listHasCheckbox?:boolean;

	private listHasCheckbox() {

		if(this._listHasCheckbox !== undefined) {
			return this._listHasCheckbox;
		}

		if(!(this.list instanceof Table)) {
			this._listHasCheckbox = false;
		} else {
			this._listHasCheckbox = this.list.columns.findIndex((c) => {
				return c instanceof CheckboxSelectColumn;
			}) > -1;
		}

		return this._listHasCheckbox;
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


	/**
	 * When shift or ctrl, meta is used then do this on mousedown
	 *
	 * @param _list
	 * @param index
	 * @param e
	 * @private
	 */
	private onRowMouseDown(_list: List, index: number, e: MouseEvent) {
		let selection = this.selected;

		if (e.shiftKey && this.multiSelect) {
			const start = Math.min(index, this.lastIndex);
			const end = Math.max(index, this.lastIndex);

			for (let i = start; i <= end; i++) {
				if (selection.indexOf(i) === -1)
					selection.push(i);
			}

		} else if ((e.ctrlKey || e.metaKey || this.listHasCheckbox()) && this.multiSelect) {
			const currentIndex = selection.indexOf(index);
			if (currentIndex > -1) {
				selection.splice(currentIndex, 1);
			} else {
				selection.push(index);
			}
		} else {

			if(e.ctrlKey || e.metaKey) {
				this.toggle(index);
				this.lastIndex = index;
				return;
			} else {
				//handled by click instead of mousedown
				return;
			}
		}

		this.lastIndex = index;

		this.selected = selection;
	}


	/**
	 * Click clears the selection handling this in click allows selections to be dragged
	 * @param _list
	 * @param index
	 * @param e
	 * @private
	 */
	private onRowClick(_list: List, index: number, e: MouseEvent) {
		let selection = this.selected;

		if(e.shiftKey || e.ctrlKey || e.metaKey || this.listHasCheckbox()) {
			return;
		}

		selection = [index];

		this.lastIndex = index;

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

	public toggle(index:number) {

		const currentIndex = this._selected.indexOf(index);
		if (currentIndex > -1) {
			if(this.multiSelect) {
				this._selected.splice(currentIndex, 1);
				this.fire('rowdeselect', this, index);
			} else {
				this._selected = [];
				this.fire('rowdeselect', this, index);
			}
		} else {
			if(this.multiSelect) {
				this._selected.push(index);
				this.fire('rowselect', this, index);
			}else {

				this._selected.forEach(i => {
					this.fire('rowdeselect', this, i);
				})
				this._selected = [index];
				this.fire('rowselect', this, index);
			}

		}
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

		if (newSelection.length && this.lastIndex == -1) {
			this.lastIndex = newSelection[0];
		}

		const change = (select.length > 0 || deselect.length > 0);

		if (!silent && change) {
			// fire immediately here. Only buffer when using add() and remove()
			this.fire('selectionchange', this, this.selected);
		}

		return change;
	}

	private onKeyDown(e: KeyboardEvent) {

		if (e.key == "Shift") {
			this.shiftStartIndex = this.lastIndex;
		}

		if(e.key == " ") {
			e.preventDefault();
			e.stopPropagation()
			this.toggle(this.lastIndex);
			return;
		}

		if (e.key != "ArrowDown" && e.key != "ArrowUp") {
			return;
		}

		e.preventDefault();
		e.stopPropagation();

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
			if(!this.listHasCheckbox()) {
				change = this.setSelected([index], true);
			}

			this.list.focusRow(index);
		}


		if (change && !this.hasKeyUpListener) {
			this.hasKeyUpListener = true;
			this.list.el.addEventListener('keyup', () => {
				this.fire('selectionchange', this, this.selected);
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
