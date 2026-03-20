/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Config, Observable, ObservableEventMap } from "../Observable.js";
import { List } from "../List.js";
import { Store, StoreRecord, storeRecordType } from "../../data";
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
    selectionchange: {
        selected: SelectedRow<StoreType, RecordType>[];
    };
    /**
     * Fires before a row is selected.
     *
     * Can be canceled by returning false.
     *
     */
    beforerowselect: {
        row: SelectedRow<StoreType, RecordType>;
        append: boolean;
    };
    /**
     * Fires when a row is deselected.
     *
     * Can be canceled by returning false.
     */
    beforerowdeselect: {
        row: SelectedRow<StoreType, RecordType>;
    };
    /**
     * Fires when a row is selected
     * @param rowSelect
     * @param storeIndex
     */
    rowselect: {
        row: SelectedRow<StoreType, RecordType>;
        append: boolean;
    };
    /**
     * Fires when a row is deselected
     *
     * @param rowSelect
     * @param storeIndex
     */
    rowdeselect: {
        row: SelectedRow<StoreType, RecordType>;
    };
}
/**
 * Represents a row selected from a store. This class provides utilities to interact with the
 * selected row and its associated store, such as retrieving its index or ID.
 */
export declare class SelectedRow<StoreType extends Store, RecordType extends StoreRecord = storeRecordType<StoreType>> {
    readonly store: StoreType;
    readonly record: RecordType;
    /**
     * Constructs a new instance of the class with the provided store and record.
     *
     * @param store - The store associated with this instance.
     * @param record - The record or data associated with this instance.
     */
    constructor(store: StoreType, record: RecordType);
    /**
     * The index in the associated store
     */
    get storeIndex(): number;
    /**
     * The record ID
     */
    get id(): any;
}
/**
 * Row selection model
 */
export declare class RowSelect<StoreType extends Store = Store, RecordType extends StoreRecord = storeRecordType<StoreType>> extends Observable<RowSelectEventMap> {
    readonly list: List;
    private readonly selected;
    /**
     * When trie it behaves like a list of checkboxes
     * A click will add it to the selection instead of clearing the selection.
     */
    clickToAdd: boolean;
    /**
     * Last selected index used for multi selection with shift
     * @private
     */
    lastIndex: number;
    private shiftStartIndex?;
    /**
     * Enable multi selection
     */
    multiSelect: boolean;
    private hasKeyUpListener;
    private readonly fireSelectionChange;
    /**
     * Constructor
     *
     * @param list
     */
    constructor(list: List);
    getSelected(): SelectedRow<StoreType, RecordType>[];
    private _listHasCheckbox?;
    private listHasCheckbox;
    /**
     * Clear the selection
     */
    clear(): void;
    /**
     * Select all
     */
    selectAll(): void;
    selectNext(): number;
    private incrementSelect;
    selectIndex(index: number): void;
    selectPrevious(): number;
    /**
     * Check if a record is selected
     * @param record
     */
    isSelected(record: RecordType): boolean;
    private getSelectedIndex;
    /**
     * When shift or ctrl, meta is used then do this on mousedown
     *
     * @param list
     * @param index
     * @param e
     * @private
     */
    private onRowMouseDown;
    /**
     * Click clears the selection handling this in click allows selections to be dragged
     * @param list
     * @param index
     * @param e
     * @private
     */
    private onRowClick;
    /**
     * Replaces the selected records
     * @param records
     */
    replace(...records: RecordType[]): void;
    /**
     * Adds a selected record.
     *
     * @param record
     * @param append
     */
    add(record: RecordType, append?: boolean): void;
    /**
     * Remove an index from the selection
     *
     * @param record
     * @param silent Don't fire events
     */
    remove(record: RecordType, silent?: boolean): void;
    toggle(record: RecordType): void;
    private onKeyDown;
}
export type RowSelectConfig<StoreType extends Store = Store> = Config<RowSelect<StoreType>, "list">;
/**
 * Shorthand function to create {@link RowSelect}
 *
 * @param config
 */
export declare const rowselect: <StoreType extends Store = Store>(config: RowSelectConfig<StoreType>) => RowSelect<StoreType, storeRecordType<StoreType>>;
