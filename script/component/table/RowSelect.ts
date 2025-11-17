/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Config, Observable, ObservableEventMap} from "../Observable.js";
import {List} from "../List.js";
import {FunctionUtil} from "../../util";
import {createComponent} from "../Component.js";
import {Table} from "./Table.js";
import {CheckboxSelectColumn} from "./TableColumns.js";
import {Store, StoreRecord, storeRecordType} from "../../data";

export interface RowSelectEventMap<StoreType extends Store = Store, RecordType extends StoreRecord = storeRecordType<StoreType>> extends ObservableEventMap {
	/**
	 * Fires when selection changes.
	 * This function is buffered. So when adding/removing selected items or when holding arrow on keyboard it
	 * will only fire once at key up to prevent flooding the server with requests.
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
	 */
	selectionchange: {selected: SelectedRow<StoreType, RecordType>[]}

	/**
	 * Fires before a row is selected.
	 *
	 * Can be canceled by returning false.
	 *
	 */
	beforerowselect: {row: SelectedRow<StoreType, RecordType>, append: boolean}

	/**
	 * Fires when a row is deselected.
	 *
	 * Can be canceled by returning false.
	 */
	beforerowdeselect: {row: SelectedRow<StoreType, RecordType>}

	/**
	 * Fires when a row is selected
	 * @param rowSelect
	 * @param storeIndex
	 */
	rowselect: {row: SelectedRow<StoreType, RecordType>, append: boolean}

	/**
	 * Fires when a row is deselected
	 *
	 * @param rowSelect
	 * @param storeIndex
	 */
	rowdeselect: {row: SelectedRow<StoreType, RecordType>}
}


/**
 * Represents a row selected from a store. This class provides utilities to interact with the
 * selected row and its associated store, such as retrieving its index or ID.
 */
export class SelectedRow<StoreType extends Store, RecordType extends StoreRecord = storeRecordType<StoreType> > {
	/**
	 * Constructs a new instance of the class with the provided store and record.
	 *
	 * @param store - The store associated with this instance.
	 * @param record - The record or data associated with this instance.
	 */
	constructor(readonly store:StoreType, readonly record: RecordType) {
	}

	/**
	 * The index in the associated store
	 */
	get storeIndex() {
		return this.store.findIndex((r => r == this.record || (r[this.store.idField]!= undefined && r[this.store.idField] == this.id)));
	}

	/**
	 * The record ID
	 */
	get id() {
		return this.record[this.store.idField];
	}
}


/**
 * Row selection model
 */
export class RowSelect<StoreType extends Store = Store, RecordType extends StoreRecord = storeRecordType<StoreType>> extends Observable<RowSelectEventMap> {

	private readonly selected: SelectedRow<StoreType, RecordType>[] = [];


	/**
	 * When trie it behaves like a list of checkboxes
	 * A click will add it to the selection instead of clearing the selection.
	 */
	public clickToAdd = false;

	/**
	 * Last selected index used for multi selection with shift
	 * @private
	 */
	public lastIndex = -1;
	private shiftStartIndex?: number;

	/**
	 * Enable multi selection
	 */
	public multiSelect = true;

	private hasKeyUpListener: Boolean = false;
	private readonly fireSelectionChange: () => Promise<void>;

	/**
	 * Constructor
	 *
	 * @param list
	 */
	constructor(readonly list: List) {
		super();

		this.list.el.cls('+rowselect');
		this.list.el.addEventListener("keydown", (e) => {
			this.onKeyDown(e);
		})

		this.list.on('rowmousedown', (ev) => {
			this.onRowMouseDown(ev.target, ev.storeIndex, ev.ev);
		});

		this.list.on('rowclick', (ev) => {
			this.onRowClick(ev.target, ev.storeIndex, ev.ev);
		});

		const fireSelectionChange = () => {
			this.fire('selectionchange', {selected: this.selected});
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

	/**
	 * Clear the selection
	 */
	public clear() {
		while(this.selected.length) {
			this.remove(this.selected[0].record );
		}

		this.lastIndex = -1;
	}

	/**
	 * Select all
	 */
	public selectAll() {
		const store = this.list.store as StoreType;
		for (let i = 0, c = store.count(); i < c; i++) {
			this.add( store.get(i) as RecordType)
		}
	}

	public selectNext() {
		return this.incrementSelect(1);
	}

	private incrementSelect(inc = 1) {

		const index = this.lastIndex + inc;
		if(index < 0 || index > this.list.store.count() - 1) {
			return this.lastIndex;
		}

		this.selectIndex(index);

		this.lastIndex = index;
		return index;
	}

	public selectIndex(index:number) {
		this.clear();
		const r = this.list.store.get(index);
		if(r) {
			this.add(r as RecordType);
		}
	}

	public selectPrevious() {
		return this.incrementSelect(-1);
	}

	/**
	 * Check if a record is selected
	 * @param record
	 */
	public isSelected(record: RecordType) {
		return this.getSelectedIndex(record) > -1;
	}

	private getSelectedIndex(record: RecordType) {
		const idField = this.list.store.idField;

		const id = record[idField];

		for(let i = 0, l = this.selected.length; i < l; i++) {
			if((id != undefined && this.selected[i].id == id) || this.selected[i].record == record) {
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

		// e.preventDefault();

		if (e.shiftKey && this.multiSelect) {

			const start = Math.min(index, this.lastIndex);
			const end = Math.max(index, this.lastIndex);

			console.log(list.store.data, start, end);

			for (let i = start; i <= end; i++) {
				const record = store.get(i);
				if(record) {
					this.add(record as RecordType, true);
				}
			}

		} else if ((e.ctrlKey || e.metaKey ) && this.multiSelect)  {
			const record = store.get(index);
			if(record) {
				this.toggle(record as RecordType)
			}
		} else {

			if(e.ctrlKey || e.metaKey) {
				const record = store.get(index);
				if(record) {
					this.toggle(record as RecordType)
				}
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

		if(e.shiftKey || e.ctrlKey || e.metaKey) {
			return;
		}

		if(!this.clickToAdd) {
			this.clear();
		}

		this.add(list.store.get(index) as RecordType)

		this.lastIndex = index;
	}

	/**
	 * Replaces the selected records
	 * @param records
	 */
	public replace(...records: RecordType[]) {
		this.clear();
		for(let i = 0, l = records.length; i < l; i++) {
			this.add(records[i]);
		}
	}

	/**
	 * Adds a selected record.
	 *
	 * @param record
	 * @param append
	 */
	public add(record:RecordType, append = false) {
		if(this.isSelected(record)) {
			return;
		}

		if(!this.multiSelect) {
			this.clear();
		}

		const row = new SelectedRow<StoreType, RecordType>(this.list.store as StoreType, record);

		if(this.fire("beforerowselect", {row, append}) === false) {
			return;
		}

		this.selected.push(row);

		this.fire('rowselect',  {row, append});
		this.fireSelectionChange();

		this.lastIndex = row.storeIndex;
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

		const row = this.selected[index];

		if(this.fire("beforerowdeselect", {row}) === false) {
			return;
		}

		this.selected.splice(index, 1);

		if(!silent) {

			if(row.storeIndex ==  -1) {
				//record is not in store anymore.
				return;
			}
			this.fire('rowdeselect', {row});
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
			this.add(record, true);
		}
	}


	private onKeyDown(e: KeyboardEvent) {

		if (e.key == "Shift") {
			this.shiftStartIndex = this.lastIndex;
		}

		if (e.key != "ArrowDown" && e.key != "ArrowUp") {
			return;
		}

		e.preventDefault();
		e.stopPropagation();

		let index = 0, change = false;
		if (e.key == "ArrowDown") {
			index = this.lastIndex + 1
		} else if (e.key == "ArrowUp") {
			index = this.lastIndex - 1
		}

		// check if index is out of bounds
		if(index < 0 || index > this.list.store.count() - 1) {
			return;
		}

		if (e.shiftKey && this.multiSelect) {
			if ((e.key == "ArrowDown" && index > this.shiftStartIndex!) || (e.key == "ArrowUp" && index < this.shiftStartIndex!)) {
				const record = this.list.store.get(index) as RecordType;
				this.add(record, true);
			} else {
				const record = this.list.store.get(this.lastIndex) as RecordType;
				this.remove(record);
			}
		} else {
			if(!this.listHasCheckbox()) {

				if(!this.clickToAdd) {
					this.clear();
				}
				this.add(this.list.store.get(index) as RecordType)
			}

			this.list.focusRow(index);
		}


		if (change && !this.hasKeyUpListener) {
			this.hasKeyUpListener = true;
			this.list.el.addEventListener('keyup', () => {
				this.fire('selectionchange', {selected: this.selected});
				this.hasKeyUpListener = false;
			}, {once: true});
		}

		this.lastIndex = index;
	}

}

export type RowSelectConfig<StoreType extends Store = Store> = Config<RowSelect<StoreType>, "list">

/**
 * Shorthand function to create {@link RowSelect}
 *
 * @param config
 */
export const rowselect = <StoreType extends Store = Store>(config: RowSelectConfig<StoreType>) => createComponent(new RowSelect<StoreType>(config.list), config);
