/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {createComponent} from "../Component.js";
import {Field, FieldConfig, FieldEventMap} from "./Field.js";
import {btn, Button} from "../Button.js";
import {Menu, menu} from "../menu/Menu.js";
import {listpicker} from "../picker/index.js";
import {List} from "../List.js";

export interface ListFieldEventMap extends FieldEventMap {

	/**
	 * Fires when an item is selected from the list
	 */
	select: {record: any}
}



/**
 * ListField component
 *
 * @link https://goui.io/#form/Select Example
 *
 * @see Form
 */
export class ListField<ListType extends List = List> extends Field<ListFieldEventMap> {

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

		this.picker.on("select", ({target, record}) => {

			target.list.findAncestorByType(Menu)!.hide();
			this.focus();

			//set value after focus for change event
			this.value = this.pickerRecordToValue(this, record);

			this.fire('select',  {record});
		});

		this.menu = menu({
				height: 300,
				cls: "scroll",
				listeners: {
					hide: ({target}) => {
						if (target.rendered) {
							const f = target.findAncestorByType(ListField)!;
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


export type ListFieldConfig <T extends List> = FieldConfig<ListField<T>, "list"> &
	Partial<Pick<ListField<T>, "pickerRecordToValue" | "renderValue">>;

/**
 * Shorthand function to create {@link ListField}
 *
 * @link https://goui.io/#form/Select Example
 *
 * @param config
 */
export const listfield = <T extends List> (config: ListFieldConfig<T>) => createComponent(new ListField(config.list), config);