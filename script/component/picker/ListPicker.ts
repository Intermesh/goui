import {storeRecordType} from "../../data/index.js";
import {Component, ComponentEventMap, createComponent} from "../Component.js";
import {List, listStoreType} from "../List.js";
import {Config, Listener, ObservableListenerOpts} from "../Observable.js";


export type listPickerListType<ListPickerType> = ListPickerType extends ListPicker<infer ListType> ? ListType : never;


export interface ListPickerEventMap extends ComponentEventMap {
	select: {record: any}
}

export class ListPicker<ListType extends List = List> extends Component<ListPickerEventMap> {

	constructor(public readonly list: ListType) {
		super();

		this.list.rowSelectionConfig = {multiSelect: false};
		// this.list.fitParent = true;

		this.items.add(list);

		// set value on click and enter
		this.list.on("rowclick", () => {
			this.onSelect();
		});

		this.list.on("hide", () => {
			this.list.rowSelection!.clear();
		});

		//datachanged fires for each row. With buffer = 0 only fires once at load
		this.list.store.on("datachanged", () => {
			if(this.list.store.count() > 0) {
				this.list.rowSelection!.clear();
				this.list.rowSelection!.add(this.list.store.first()!)
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
		const selected = this.list.rowSelection!.getSelected();
		if (selected.length) {
			this.fire("select", {record: selected[0].record});
		}
	}

}

export type ListPickerConfig<ListType extends List>  =
	Config<
		ListPicker<ListType>,
		"list"
	>

/**
 * Shorthand function to create {@link Table}
 *
 * @param config
 */
export const listpicker = <ListType extends List = List>(config: ListPickerConfig<ListType>) => createComponent(new ListPicker<ListType>(config.list), config);