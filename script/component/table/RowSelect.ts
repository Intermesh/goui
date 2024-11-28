/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Config, Listener, Observable, ObservableEventMap, ObservableListenerOpts} from "../Observable.js";
import {List} from "../List.js";
import {FunctionUtil} from "../../util";
import {createComponent} from "../Component.js";
import {Table} from "./Table.js";
import {CheckboxSelectColumn} from "./TableColumns.js";
import {Store, StoreRecord, storeRecordType} from "../../data";

export interface RowSelectEventMap<Type extends Observable, StoreType extends Store = Store, RecordType extends StoreRecord = storeRecordType<StoreType>>  extends ObservableEventMap<Type> {
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
	selectionchange: (rowSelect: Type, selected: SelectedRow<StoreType, RecordType>[]) => void

	/**
	 * Fires when a row is selected
	 * @param rowSelect
	 * @param storeIndex
	 */
	rowselect: (rowSelect: Type, row: SelectedRow<StoreType, RecordType>) => void

	/**
	 * Fires when a row is deselected
	 *
	 * @param rowSelect
	 * @param storeIndex
	 */
	rowdeselect: (rowSelect: Type, row: SelectedRow<StoreType, RecordType>) => void
}

export interface RowSelect<StoreType extends Store = Store, RecordType extends StoreRecord = storeRecordType<StoreType>>{
	on<K extends keyof RowSelectEventMap<this, StoreType, RecordType>, L extends Listener>(eventName: K, listener: Partial<RowSelectEventMap<this, StoreType, RecordType>>[K], options?: ObservableListenerOpts): L

	fire<K extends keyof RowSelectEventMap<this, StoreType, RecordType>>(eventName: K, ...args: Parameters<RowSelectEventMap<any, StoreType, RecordType>[K]>): boolean

}


export class SelectedRow<StoreType extends Store, RecordType extends StoreRecord = storeRecordType<StoreType> > {
	constructor(readonly store:StoreType, readonly record: RecordType) {
	}

	get storeIndex() {
		return this.store.findIndexById(this.id);
	}

	get id() {
		return this.record[this.store.idField];
	}
}


/**
 * Row selection model
 */
export class RowSelect<StoreType extends Store = Store, RecordType extends StoreRecord = storeRecordType<StoreType>> extends Observable {

	private readonly selected: SelectedRow<StoreType, RecordType>[] = [];

	/**
	 * Last selected index used for multi selection with shift
	 * @private
	 */
	public lastIndex = -1;
	private shiftStartIndex?: number;

	public multiSelect = true;
	private hasKeyUpListener: Boolean = false;
	private readonly fireSelectionChange: () => void;

	constructor(readonly list: List) {
		super();

		this.list.el.cls('+rowselect');
		this.list.el.addEventListener("keydown", (e) => {
			this.onKeyDown(e);
		})

		this.list.on('rowmousedown', (table, index, row, e) => {
			this.onRowMouseDown(table, index, e);
		});

		this.list.on('rowclick', (table, index, row, e) => {
			this.onRowClick(table, index, e);
		});

		const fireSelectionChange = () => {
			this.fire('selectionchange', this, this.selected);
		}

		//buffer selection change so it doesn't fire many changes if rowSelection.add is called in a loop.
		this.fireSelectionChange = FunctionUtil.buffer(0, fireSelectionChange);
	}

	public getSelected() {
		return this.selected;
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
		while(this.selected.length) {
			this.remove(this.selected[0].record );
		}
	}

	public selectAll() {
		const store = this.list.store as StoreType;
		for (let i = 0, c = store.count(); i < c; i++) {
			this.add( store.get(i) as RecordType)
		}
	}

	public isSelected(record: RecordType) {
		return this.getSelectedIndex(record) > -1;
	}

	private getSelectedIndex(record: RecordType) {
		const idField = this.list.store.idField;

		const id = record[idField];

		for(let i = 0, l = this.selected.length; i < l; i++) {
			if(this.selected[i].id == id) {
				return i;
			}
		}

		return -1;
	}

	/**
	 * When shift or ctrl, meta is used then do this on mousedown
	 *
	 * @param list
	 * @param index
	 * @param e
	 * @private
	 */
	private onRowMouseDown(list: List, index: number, e: MouseEvent) {

		const store = list.store;

		if (e.shiftKey && this.multiSelect) {

			const start = Math.min(index, this.lastIndex);
			const end = Math.max(index, this.lastIndex);

			for (let i = start; i <= end; i++) {
				this.add(store.get(i) as RecordType);
			}

		} else if ((e.ctrlKey || e.metaKey || this.listHasCheckbox()) && this.multiSelect)  {
			this.toggle(store.get(index) as RecordType)
		} else {

			if(e.ctrlKey || e.metaKey) {
				this.toggle(store.get(index) as RecordType)
				this.lastIndex = index;
				return;
			} else {
				//handled by click instead of mousedown
				return;
			}
		}

		this.lastIndex = index;
	}


	/**
	 * Click clears the selection handling this in click allows selections to be dragged
	 * @param list
	 * @param index
	 * @param e
	 * @private
	 */
	private onRowClick(list: List, index: number, e: MouseEvent|KeyboardEvent) {
			if(e.shiftKey || e.ctrlKey || e.metaKey || this.listHasCheckbox()) {
			return;
		}
		this.clear();
		this.add(list.store.get(index) as RecordType)

		this.lastIndex = index;
	}

	public add(record:RecordType) {
		if(this.isSelected(record)) {
			return;
		}

		const selectedRow = new SelectedRow<StoreType, RecordType>(this.list.store as StoreType, record);

		this.selected.push(selectedRow);

		this.fire('rowselect', this, selectedRow);
		this.fireSelectionChange();
	}

	/**
	 * Remove an index from the selection
	 *
	 * @param record
	 * @param silent Don't fire events
	 */
	public remove(record:RecordType, silent = false) {
		const index = this.getSelectedIndex(record);

		if(index == -1) {
			return;
		}

		const selectedRow = this.selected[index];

		this.selected.splice(index, 1);

		if(!silent) {
			this.fire('rowdeselect', this, selectedRow);
			this.fireSelectionChange();
		}
	}

	public toggle(record:RecordType) {

		if(this.isSelected(record)) {
			if(this.multiSelect) {
				this.remove(record);
			} else {
				this.clear();
			}
		} else {
			if(!this.multiSelect) {
				this.clear();
			}
			this.add(record);
		}
	}


	private onKeyDown(e: KeyboardEvent) {

		if (e.key == "Shift") {
			this.shiftStartIndex = this.lastIndex;
		}

		if(e.key == " ") {
			e.preventDefault();
			e.stopPropagation()
			this.toggle(this.list.store.get(this.lastIndex) as RecordType);
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
			if ((e.key == "ArrowDown" && index > this.shiftStartIndex!) || (e.key == "ArrowUp" && index < this.shiftStartIndex!)) {
				const record = this.list.store.get(index) as RecordType;
				this.add(record);
			} else {
				const record = this.list.store.get(this.lastIndex) as RecordType;
				this.remove(record);
			}
		} else {
			if(!this.listHasCheckbox()) {
				this.clear();
				this.add(this.list.store.get(index) as RecordType)
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

export type RowSelectConfig<StoreType extends Store = Store> = Config<RowSelect<StoreType>, RowSelectEventMap<RowSelect, StoreType>, "list">

/**
 * Shorthand function to create {@see RowSelect}
 *
 * @param config
 */
export const rowselect = <StoreType extends Store = Store>(config: RowSelectConfig<StoreType>) => createComponent(new RowSelect<StoreType>(config.list), config);
