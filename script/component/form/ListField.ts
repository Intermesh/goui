/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Component, createComponent} from "../Component.js";
import {Field, FieldConfig, FieldEventMap} from "./Field.js";
import {btn, Button} from "../Button.js";
import {Menu, menu} from "../menu/Menu.js";
import {Listener, ObservableListenerOpts} from "../Observable.js";
import {listpicker} from "../picker/index.js";
import {List} from "../List.js";

export interface ListFieldEventMap<Type> extends FieldEventMap<Type> {

	/**
	 * Fires when an item is selected from the list
	 */
	select: (field: Type, record: any) => any
}

export interface ListField<ListType extends List> extends Field {
	on<K extends keyof ListFieldEventMap<this>, L extends Listener>(eventName: K, listener: Partial<ListFieldEventMap<this>>[K], options?: ObservableListenerOpts): L
	un<K extends keyof ListFieldEventMap<this>>(eventName: K, listener: Partial<ListFieldEventMap<this>>[K]): boolean
	fire<K extends keyof ListFieldEventMap<this>>(eventName: K, ...args: Parameters<ListFieldEventMap<Component>[K]>): boolean
}

/**
 * ColorField component
 *
 * @see Form
 */
export class ListField<ListType extends List = List> extends Field {

	public readonly menu: Menu;
	protected readonly menuButton: Button;
	public readonly picker;
	private container?: HTMLDivElement;

	protected baseCls = "goui-form-field listfield";

	constructor(public readonly list: ListType, public readonly valueProperty = "id") {
		super();

		this.picker = listpicker({
			list: this.list,


		});

		this.picker.on("select", (tablePicker, record) => {

			tablePicker.list.findAncestorByType(Menu)!.hide();
			this.focus();

			//set value after focus for change event
			this.value = this.pickerRecordToValue(this, record);

			this.fire('select', this, record);
		});

		this.menu = menu({
				height: 300,
				cls: "scroll",
				listeners: {
					hide: (menu) => {
						if (menu.rendered) {
							const f = menu.findAncestorByType(ListField)!;
							f.focus();
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
				//this.fire("autocomplete", this, "");
				void this.list.store.load();
				this.picker.show();

			},
			menu: this.menu
		});
	}

	protected internalRender(): HTMLElement {
		this.buttons = this.buttons || [];
		this.buttons.push(this.menuButton);

		const el = super.internalRender();

		this.menu.alignTo = this.wrap;
		this.menu.alignToInheritWidth = true;

		return el;
	}

	pickerRecordToValue(_field: this, record: any): string {
		return record[this.valueProperty];
	}

	protected createControl() {
		this.container = document.createElement("div");
		return this.container;
	}

	protected internalSetValue(v?: string) {

		if(v == undefined) {
			return super.internalSetValue(v);
		}

		this.renderValue(this, v+"").then(v => {

			if(this.container)
				this.container.innerHTML = v;
		})
	}

	/**
	 * This method transforms the value in to a HTML representation
	 *
	 * @param field
	 * @param value
	 */
	public async renderValue(field: this, value:any) {
		return "";
	}
}


export type ListFieldConfig <T extends List> = FieldConfig<ListField<T>, ListFieldEventMap<ListField<T>>, "list"> &
	Partial<Pick<ListField<T>, "pickerRecordToValue" | "renderValue">>;

/**
 * Shorthand function to create {@link ListField}
 *
 * @param config
 */
export const listfield = <T extends List> (config: ListFieldConfig<T>) => createComponent(new ListField(config.list), config);