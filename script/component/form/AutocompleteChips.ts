import {ChipsField} from "./ChipsField.js";
import {List, listStoreType} from "../List.js";
import {Menu, menu} from "../menu/index.js";
import {Button, btn} from "../Button.js";
import {FieldConfig, FieldEventMap} from "./Field.js";
import {createComponent} from "../Component.js";
import {FunctionUtil} from "../../util/index.js";
import {storeRecordType} from "../../data/index.js";

export interface AutocompleteChipsEventMap extends FieldEventMap {
	/**
	 * Fires when suggestions need to load
	 *
	 * @param form
	 */
	autocomplete: {input: string}
}


/**
 * Chips component that auto completes user input
 *
 * @link https://goui.io/#form/ChipsField Example
 */
export class AutocompleteChips<T extends List = List, EventMap extends AutocompleteChipsEventMap = AutocompleteChipsEventMap> extends ChipsField<EventMap> {
	protected menu?: Menu;
	protected menuButton?: Button;


	/**
	 * @inheritDoc
	 *
	 * This disables the creation of new items.
	 *
	 * @param _text
	 */
	public textInputToValue = async  (_text: string) :Promise<any> => {
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
	}

	protected createMenu() {
		return menu({
				cls: "goui-dropdown scroll",
				style: {padding: "0", maxHeight: "40rem"},
				removeOnClose: false
			},
			this.list
		);
	}

	private initList() {

		if(!this.list.rowSelection) {
			this.list.rowSelectionConfig = {multiSelect: false};
		}

		if(!this.list.rowSelection!.multiSelect) {

			this.list.on("rowclick", () => {
				this.addSelected();
				this.menu!.hide();
			});

			this.list.store.on("datachanged", () => {
				this.list.rowSelection!.selectIndex(0);
			}, {buffer: 0});

		} else {

			this.menu!.on("show", () => {
				this.syncSelection()
			}, {buffer: 0});
			this.list.store.on("datachanged", () => {
				this.syncSelection()
			}, {buffer: 0});

			this.menu!.on("hide", () => {
				this.addSelected()
			})
		}

	}

	private syncSelection() {
		this.list.rowSelection!.clear();
		if(!this.value || !this.value.length) {
			return false;
		}
		const valueKeys = this.value.map((i: any) => this.valueToKey(i));
		this.list.store.data.forEach((record) => {
			const key = this.valueToKey(this.pickerRecordToValue(this, record as storeRecordType<listStoreType<T>>));
			if(valueKeys.includes(key)) {
				this.list.rowSelection!.add(record);
			}
		})
	}

	/**
	 * The returned key is used to check if the list contains a record that is already in this field's value.
	 * When changing the value, the key is used to find what to add/remove exists/not-exists
	 * override when needed. JSON.stringify() might not work if properties are in a different order.
	 * @see patchValue() and syncSelection()
	 * @param value the value pickerRecordToValue() returns
	 * @returns a unique key to know which records are already in the field value
	 */
	public valueToKey(value: any) {
		return typeof value === 'string' ? value : JSON.stringify(value);
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

		this.menu = this.createMenu();

		this.menuButton = btn({
			icon: "expand_more",
			type: "button",
			handler: () => {
				this.fire("autocomplete", {input: ""});
			},
			menu: this.menu
		});

		this.initList();

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
				ev.stopPropagation();

				if(this.menuButton!.menu!.hidden) {
					if(!this.list.store.loaded) {
						this.fire("autocomplete", {input:""});
					}
					this.menuButton!.menu!.show();
				} else if(this.list.rowSelection) {
					this.list.rowSelection.selectNext();
				}

				break;

			case 'ArrowUp':
				ev.preventDefault();
				ev.stopPropagation();
				if(this.menuButton!.menu!.hidden) {
					this.fire("autocomplete", {input: ""});
					this.menuButton!.menu!.show();
				} else if(this.list.rowSelection) {
					this.list.rowSelection.selectPrevious();
				}

				break;

			case 'Escape':
				if (!this.menu!.hidden) {
					this.menu!.hide();
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

		if(!this.menu!.hidden) {
			ev.preventDefault();
			this.menu!.hide();
		}
	}

	/**
	 * Compare the new values with the current value.
	 * - add what is selected but not in the current value
	 * - remove what is not selected but in the current value
	 * - Leave the rest if the value as is.
	 * @param newValues selected picker values
	 * @returns the new value
	 */
	private patchValue(newValues: any[]) {
		// patch = {key => value|null}
		const newKeys = newValues.map(this.valueToKey.bind(this));
		const patch = this.list.store.data.reduce((acc: any, record) => {
			const value = this.pickerRecordToValue(this, record as storeRecordType<listStoreType<T>>);
			const key = this.valueToKey(value);
			acc[key] = newKeys.includes(key) ? value : null;
			return acc;
		}, {});

		const v = this.value || [];
		const valueKeys = v.map(this.valueToKey.bind(this));
		for(const key in patch) {
			if(patch[key]) {
				if(!valueKeys.includes(key))
					v.push(patch[key]);
			} else {
				const idx = valueKeys.indexOf(key);
				if (idx !== -1) {
					v.splice(idx, 1);
				}
			}
		}
		return v
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
			this.value = this.patchValue(newValues);
		} else {
			this.value = (this.value || []).concat(newValues);
		}
	}

	private onInput(_ev: Event) {
		this.menuButton!.menu!.show();
		this.fire("autocomplete", {input: this.editor.el.innerText});
	}


}

type AutoCompleteChipsConfig<ListType extends List = List> = FieldConfig<AutocompleteChips<ListType>, "list"> &
	// Add the function properties as they are filtered out
	Partial<Pick<AutocompleteChips<ListType>, "textInputToValue" | "chipRenderer" | "pickerRecordToValue" | "valueToKey">>
/**
 * Shorthand function to create {@link AutocompleteChips}
 *
 * @link https://goui.io/#form/ChipsField Example
 *
 * @param config
 */
export const autocompletechips = <ListType extends List = List>(config: AutoCompleteChipsConfig<ListType>) => createComponent(new AutocompleteChips<ListType>(config.list), config);