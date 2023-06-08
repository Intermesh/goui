import {Table, TableColumn} from "../table";
import {Store, storeRecordType} from "../../data";
import {createComponent} from "../Component";
import {ListEventMap} from "../List";
import {Config, ObservableListenerOpts} from "../Observable";

export type tablePickerStoreType<ListType> = ListType extends TablePicker<infer StoreType> ? StoreType : never;


export interface TablePickerEventMap<Type extends TablePicker<Store>> extends ListEventMap<Type> {
	select: (tablePicker: Type, record: storeRecordType<tablePickerStoreType<Type>>) => false | void
}

export interface TablePicker<StoreType extends Store = Store> extends Table<StoreType> {
	on<K extends keyof TablePickerEventMap<this>>(eventName: K, listener: Partial<TablePickerEventMap<this>>[K], options?: ObservableListenerOpts): void;
	fire<K extends keyof TablePickerEventMap<this>>(eventName: K, ...args: Parameters<TablePickerEventMap<any>[K]>): boolean
}


export class TablePicker<StoreType extends Store> extends Table<StoreType> {
	constructor(readonly store: StoreType, public columns: TableColumn[]) {
		super(store, columns);

		this.rowSelectionConfig = {multiSelect: false};
		this.fitParent = true;


		// set value on click and enter
		this.on("rowclick", (table, rowIndex, row, ev) => {
			this.onSelect();
		});

		this.on("hide", () => {
			this.rowSelection!.clear();
		});

		//datachanged fires for each row. With buffer = 0 only fires once at load
		this.store.on("datachanged", () => {
			this.rowSelection!.selected = [0];
		}, {buffer: 0})

		// stop clicks on menu from hiding menu
		this.el.addEventListener("mousedown", (ev) => {
			ev.stopPropagation();
		});

		this.el.addEventListener('keydown', (ev) => {
			switch (ev.key) {

				case "Enter":
					ev.preventDefault();
					this.onSelect();
					break;
			}
		})


	}

	public onSelect() {
		const selected = this.rowSelection!.selected;
		if (selected.length) {
			this.fire("select", this, this.store.get(selected[0])!);
		}

	}





}

type TablePickerConfig<StoreType extends Store = Store> = Omit<Config<TablePicker<StoreType>, TablePickerEventMap<TablePicker<StoreType>>, "store" | "columns">, "rowSelection">

/**
 * Shorthand function to create {@see Table}
 *
 * @param config
 */
export const tablepicker = <StoreType extends Store = Store>(config: TablePickerConfig<StoreType>) => createComponent(new TablePicker<StoreType>(config.store, config.columns), config);