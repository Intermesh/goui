import {storeRecordType} from "../../data/index.js";
import {Component, ComponentEventMap, createComponent} from "../Component.js";
import {List, listStoreType} from "../List.js";
import {Config, Listener, ObservableListenerOpts} from "../Observable.js";


export type listPickerListType<ListPickerType> = ListPickerType extends ListPicker<infer ListType> ? ListType : never;


export interface ListPickerEventMap<Type extends ListPicker<List>> extends ComponentEventMap<Type> {
	select: (listPicker: Type, record: storeRecordType<listStoreType<listPickerListType<Type>>>) => false | void
}

export interface ListPicker<ListType extends List = List> extends Component {
	on<K extends keyof ListPickerEventMap<this>, L extends Listener>(eventName: K, listener: Partial<ListPickerEventMap<this>>[K], options?: ObservableListenerOpts): L;
	un<K extends keyof ListPickerEventMap<this>>(eventName: K, listener: Partial<ListPickerEventMap<this>>[K]): boolean
	fire<K extends keyof ListPickerEventMap<this>>(eventName: K, ...args: Parameters<ListPickerEventMap<any>[K]>): boolean
}


export class ListPicker<ListType extends List = List> extends Component {

	constructor(public readonly list: ListType) {
		super();

		this.list.rowSelectionConfig = {multiSelect: false};
		// this.list.fitParent = true;

		this.items.add(list);

		// set value on click and enter
		this.list.on("rowclick", (table, rowIndex, row, ev) => {
			this.onSelect();
		});

		this.list.on("hide", () => {
			this.list.rowSelection!.clear();
		});

		//datachanged fires for each row. With buffer = 0 only fires once at load
		this.list.store.on("datachanged", () => {
			if(this.list.store.count() > 0) {
				this.list.rowSelection!.selected = [0];
			}
		}, {buffer: 0})

		// stop clicks on menu from hiding menu
		this.list.el.addEventListener("mousedown", (ev) => {
			ev.stopPropagation();
		});

		this.list.el.addEventListener('keydown', (ev) => {
			switch (ev.key) {

				case "Enter":
					ev.preventDefault();
					this.onSelect();
					break;
			}
		})


	}

	focus(o?: FocusOptions) {
		this.list.focus(o);
	}

	public onSelect() {
		const selected = this.list.rowSelection!.selected;
		if (selected.length) {
			this.fire("select", this, this.list.store.get(selected[0])!);
		}
	}

}

export type ListPickerConfig<ListType extends List>  =
	Config<
		ListPicker<ListType>,
		ListPickerEventMap<ListPicker<ListType>>,
		"list"
	>

// type ListPickerConfig<ListType extends List>  =
// 	Omit<Config<
// 		ListPicker<ListType>,
// 		ListPickerEventMap<ListPicker<ListType>>
// 	>, "list">
// 	&
// 	{
// 		list: ListType
// 	}


/**
 * Shorthand function to create {@see Table}
 *
 * @param config
 */
export const listpicker = <ListType extends List = List>(config: ListPickerConfig<ListType>) => createComponent(new ListPicker<ListType>(config.list), config);