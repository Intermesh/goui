import {ChipsField} from "./ChipsField.js";
import {List, listStoreType} from "../List.js";
import {Menu, menu} from "../menu/index.js";
import {btn, Button} from "../Button.js";
import {FieldConfig, FieldEventMap} from "./Field.js";
import {Listener, ObservableListenerOpts} from "../Observable.js";
import {Component, createComponent} from "../Component.js";
import {FunctionUtil} from "../../util/index.js";
import {storeRecordType} from "../../data/index.js";

export interface AutocompleteChipsEventMap<Type> extends FieldEventMap<Type> {
	/**
	 * Fires when suggestions need to load
	 *
	 * @param form
	 */
	autocomplete: (field: Type, input: string) => any
}

export interface AutocompleteChips<T extends List> extends ChipsField {
	on<K extends keyof AutocompleteChipsEventMap<this>, L extends Listener>(eventName: K, listener: Partial<AutocompleteChipsEventMap<this>>[K], options?: ObservableListenerOpts): L
	un<K extends keyof AutocompleteChipsEventMap<this>>(eventName: K, listener: Partial<AutocompleteChipsEventMap<this>>[K]): boolean
	fire<K extends keyof AutocompleteChipsEventMap<this>>(eventName: K, ...args: Parameters<AutocompleteChipsEventMap<Component>[K]>): boolean
}

/**
 * Chips component that auto completes user input
 */
export class AutocompleteChips<T extends List = List> extends ChipsField {
	private readonly menu: Menu;
	private readonly menuButton: Button;
	private valuesToCompare?: string[];

	//disable create
	public textInputToValue = async  (text: string) :Promise<any> => {
		return false;
	}

	/**
	 * Constructor
	 *
	 * @param list The drop down list or {@link Table}.
	 * @param buffer
	 */
	constructor(readonly list: T, private buffer = 300) {
		super();

		this.menu = menu({
				cls: "goui-dropdown scroll",
				removeOnClose: false,
				height: 300
			},
			list
		);

		this.menuButton = btn({
			icon: "expand_more",
			type: "button",
			handler: (button, ev) => {
				this.fire("autocomplete", this, "");
			},
			menu: this.menu
		});

		this.initList();

	}

	private initList() {

		if(!this.list.rowSelection) {
			this.list.rowSelectionConfig = {multiSelect: false};
		}

		if(!this.list.rowSelection!.multiSelect) {

			this.list.on("rowclick", () => {
				this.menu.hide();
			});

			this.list.store.on("datachanged", () => {
				this.list.rowSelection!.selectIndex(0);
			}, {buffer: 0});
		} else {
			const syncSelection = () => {
				this.list.rowSelection!.clear();
				this.list.store.data.forEach((record, index) => {
					if(this.isPickerRecordInValue(record)) {
						this.list.rowSelection!.add(record)
					}
				})
			}
			this.menu.on("show", () => {
				syncSelection()
			}, {buffer: 0});
			this.list.store.on("datachanged", () => {
				syncSelection()
			}, {buffer: 0});
		}


	}

	private isPickerRecordInValue(record: any) {

		if(!this.value || !this.value.length) {
			return false;
		}
		if(!this.valuesToCompare) {
			this.valuesToCompare = this.value.map((i: any) => JSON.stringify(i));
			// clear cache after event loop
			setTimeout(() => {
				this.valuesToCompare = undefined;
			});
		}

		const v = JSON.stringify(this.pickerRecordToValue(this, record));

		return this.valuesToCompare!.indexOf(v) > -1;

	}

	/**
	 * Method that transforms a record from the TablePicker store to a value for this field.
	 * This is not necessarily a text value. In conjunction with {@link valueToTextField()} this
	 * could also be an ID of an object for example.
	 *
	 * @param field
	 * @param record
	 */
	public pickerRecordToValue (field: this, record:storeRecordType<listStoreType<T>>) : any {
		return record.id;
	}

	protected internalRender(): HTMLElement {

		this.buttons = this.buttons || [];
		this.buttons.push(this.menuButton);

		const el = super.internalRender();

		this.menu.alignTo = this.wrap;
		this.menu.alignToInheritWidth = true;

		this.editor.el.addEventListener('input', FunctionUtil.buffer(this.buffer, this.onInput.bind(this)))


		return el;
	}

	protected onEditorKeyDown(ev: KeyboardEvent) {
		super.onEditorKeyDown(ev);

		switch ((ev as KeyboardEvent).key) {

			case 'ArrowDown':
				ev.preventDefault();
				this.menuButton.menu!.show();

				this.list.focusRow(0);
				break;

			case 'Escape':
				if (!this.menu.hidden) {
					this.menu.hide();
					ev.preventDefault();
					ev.stopPropagation();
					this.focus();
				}
				break;
		}

	}

	protected onEnter(ev: KeyboardEvent) {
		if(!this.list.rowSelection!.getSelected().length) {
			super.onEnter(ev);
		} else {
			this.addSelected();
		}

		if(!this.menu.hidden) {
			ev.preventDefault();
			this.menu.hide();
		}
	}


	private addSelected() {
		const newValues = this.list.rowSelection!.getSelected().map((row) => {
			return this.pickerRecordToValue(this, row.record as storeRecordType<listStoreType<T>>);
		});

		this.list.rowSelection!.clear();
		this.editor.el.innerText = "";
		this.focus();

		// set value after focus as this will start tracking for the change event
		if(this.list.rowSelection!.multiSelect) {
			this.value = newValues;
		} else
		{

			if(!this.value) {
				this.value = [];
			}
			this.value = this.value.concat(newValues);
		}
	}

	private onInput(_ev: Event) {
		this.menuButton.menu!.show();
		this.fire("autocomplete", this, this.editor.el.innerText);
	}


}

type AutoCompleteChipsConfig<ListType extends List = List> = FieldConfig<AutocompleteChips<ListType>, AutocompleteChipsEventMap<AutocompleteChips<ListType>>, "list"> &
	// Add the function properties as they are filtered out
	Partial<Pick<AutocompleteChips<ListType>, "textInputToValue" | "chipRenderer" | "pickerRecordToValue">>
/**
 * Shorthand function to create {@link AutocompleteChips}
 *
 * @param config
 */
export const autocompletechips = <ListType extends List = List>(config: AutoCompleteChipsConfig<ListType>) => createComponent(new AutocompleteChips<ListType>(config.list), config);