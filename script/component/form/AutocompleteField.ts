/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {FunctionUtil} from "../../util/index.js";
import {FieldConfig, FieldEventMap} from "./Field.js";
import {btn, Button} from "../Button.js";
import {createComponent} from "../Component.js";
import {List, listStoreType} from "../List.js";
import {listpicker} from "../picker/index.js";
import {Menu, menu} from "../menu/index.js";
import {storeRecordType} from "../../data/index.js";
import {InputField} from "./InputField.js";

/**
 * @inheritDoc
 */
export interface AutocompleteEventMap extends FieldEventMap {
	/**
	 * Fires when suggestions need to load
	 *
	 * @param form
	 */
	autocomplete: {input: string}
	/**
	 * Fires when an item is selected from the list
	 */
	select: {record: any}
}

export interface AutocompleteField<T extends List = List, EventMap extends AutocompleteEventMap = AutocompleteEventMap> extends InputField<EventMap> {
	get input(): HTMLInputElement
	get value(): string|number|null|undefined
	set value(v: string|number|null|undefined)
}

/**
 * Autocomplete field
 *
 * @link https://goui.io/#form/Select Example
 */
export class AutocompleteField<T extends List = List, EventMap extends AutocompleteEventMap = AutocompleteEventMap> extends InputField<EventMap> {


	public readonly menu: Menu;
	protected readonly menuButton: Button;
	public readonly picker;

	public readonly clearable!: boolean

	/**
	 *
	 * @param list The table to use for suggestions
	 * @param buffer Buffer typing in the input in ms
	 */
	constructor(readonly list: T, private buffer = 300) {
		super();

		this.autocomplete = "off";
		this.baseCls = "goui-form-field text autocomplete";

		this.picker = listpicker({
			list: list
		});

		this.picker.on("select", ( {target,record}) => {

			target.list.findAncestorByType(Menu)!.hide();
			this.focus();

			//set value after focus for change event
			this.value = this.pickerRecordToValue(this, record);

			this.fire('select', {record});
		});


		this.menu = menu({
			height: 300,
			cls: "scroll",
			listeners: {
				hide: ({target}) => {
					if(target.rendered) {
						if(this.name && this.value == undefined) { // @see ParticipantField search
							this.input.value = "";
						}
						const inputField = target.findAncestorByType(InputField)!;
						inputField.focus();
					}
				}
			}
		},
			this.picker
		);

		this.menuButton = btn({
			icon: "expand_more",
			type: "button",
			handler: () => {
				if(this.list.rowSelection) {
					this.list.rowSelection.clear();
				}
				this.fire("autocomplete", {input: ""});

				this.input.focus();
			},
			listeners: {
				render: ({target}) => {
					target.el.addEventListener("keydown", (ev:KeyboardEvent)=> {

						switch (ev.key) {

							case 'ArrowDown':

								ev.preventDefault();
								if(this.list.rowSelection) {
									this.list.rowSelection.clear();
								}
								this.fire("autocomplete", {input: ""});

								this.menuButton.menu!.show();
								this.input.focus();
								break;
						}
					});
				}
			},
			menu: this.menu
		});

		this.fireChangeOnBlur = true;
	}

	protected createInput() : HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement{
		const control = document.createElement("input");

		// select the text so users can type right away
		control.addEventListener("focus", function() {
			this.select();
		})

		if (this.invalidMsg) {
			this.applyInvalidMsg();
		}
		return control;
	}

	/**
	 * Method that transforms a record from the TablePicker store to a value for this field.
	 * This is not necessarily a text value. In conjunction with {@link valueToTextField()} this
	 * could also be an ID of an object for example.
	 */
	public pickerRecordToValue (field: this, record:storeRecordType<listStoreType<T>>) : any {
		return record.id;
	}

	/**
	 * This method transforms the value in to a text representation for the input field
	 */
	public async valueToTextField(field: this, value:any) {
		return value;
	}


	protected internalSetValue(v?: string) {

		if(v == undefined) {
			return super.internalSetValue(v);
		}

		this.valueToTextField(this, v + "").then(textFieldValue => {

			if(v != this.value) {
				//Quick and dirty way to cancel this promise if the value has changed in the mean time
				return;
			}

			if(this.input) {
				super.internalSetValue(textFieldValue);
				this.checkHasValue();
			} else {
				this.on("render", () => {
					super.internalSetValue(textFieldValue);
					this.checkHasValue();
				}, {once: true})
			}
		})
	}

	protected internalGetValue() {
		return this._value;
	}

	protected internalRender(): HTMLElement {

		this.buttons = this.buttons || [];
		if(this.clearable) {
			this.buttons.push(btn({icon:'clear', handler: () => this.value = null}))
		}
		this.buttons.push(this.menuButton);

		const el = super.internalRender();

		this.menu.alignTo = this.wrap;
		this.menu.alignToInheritWidth = true;

		this.input!.addEventListener('input', FunctionUtil.buffer(this.buffer, this.onInput.bind(this)))

		this.input!.addEventListener('keydown', (ev) => {

			switch ((ev as KeyboardEvent).key) {

				case 'Enter':
					if(!this.menu.hidden) {
						ev.preventDefault();
						this.picker.onSelect();
					}
					break;

				case 'ArrowDown':
					ev.preventDefault();
					ev.stopPropagation();
					if(this.menuButton.menu!.hidden) {
						if(!this.list.store.loaded) {
							this.fire("autocomplete", {input: ""});
						}
						this.menuButton.menu!.show();
					} else if(this.list.rowSelection) {
						this.list.rowSelection.selectNext();
					}

					break;

				case 'ArrowUp':
					ev.preventDefault();
					ev.stopPropagation();
					if(this.menuButton.menu!.hidden) {
						this.fire("autocomplete", {input: ""});
						this.menuButton.menu!.show();
					} else if(this.list.rowSelection) {
						this.list.rowSelection.selectPrevious();
					}

					break;

				case 'Escape':
					if (!this.menu.hidden) {
						this.menu.hide();
						ev.preventDefault();
						ev.stopPropagation();
					}
					break;
			}
		});

		return el;
	}

	private onInput(_ev: Event) {
		this.menuButton.menu!.show();
		if(this.list.rowSelection) {
			this.list.rowSelection.clear();
		}
		this.fire("autocomplete", {input: this.input!.value});
	}

	reset() {
		// By clearing the store the arrow down will reload the store and not select the last selected item.
		this.list.store.clear();
		super.reset();
	}

	clear() {
		// By clearing the store the arrow down will reload the store and not select the last selected item.
		this.list.store.clear();
		super.clear();
	}

}

type AutoCompleteConfig<T extends List, Required extends keyof AutocompleteField<T>> = FieldConfig<AutocompleteField<T>, Required> &
// Add the function properties as they are filtered out
	Partial<Pick<AutocompleteField<T>, "pickerRecordToValue" | "valueToTextField">>;



/**
 * Shorthand function to create an {@link AutocompleteField}
 *
 * @link https://goui.io/#form/Select Example
 *
 * @param config
 */
export const autocomplete = <T extends List> (config: AutoCompleteConfig<T, "list">) => createComponent(new AutocompleteField(config.list), config);