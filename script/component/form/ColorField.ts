/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {createComponent} from "../Component.js";
import {E} from "../../util/Element.js";
import {ColorPicker} from "../picker/index.js";
import {Field, FieldConfig, FieldEventMap} from "./Field.js";
import {btn, Button} from "../Button.js";
import {menu} from "../menu/Menu.js";

let colorPicker: ColorPicker | undefined;

/**
 * ColorField component
 *
 * @see Form
 */
export class ColorField extends Field {

	private readonly picker;
	private readonly pickerButton: Button;

	constructor() {
		super();

		this.picker = this.createPicker();

		this.buttons = [
			this.pickerButton = btn({
				icon: "expand_more",
				menu:
					menu({
							alignTo:  this.el,
							alignToInheritWidth: true
						},
						this.picker
					)
			})];
	}

	private createPicker() {
		if(colorPicker == undefined) {
			colorPicker = new ColorPicker();
			colorPicker.on('select', (colorPicker, val) => {

				this.pickerButton.menu!.hide();
				this.clearInvalid();
				this.focus();

				//important to set value after focus so change event will fire on focusout
				this.value = val;
			});
		}

		return colorPicker;
	}

	protected createControl(): undefined | HTMLElement {
		const ctrl = E('div').cls('+color-dot');
		this.el.cls("+no-floating-label");

		return ctrl;
	}

	setInvalid(msg: string) {

		super.setInvalid(msg);

		if (this.rendered) {
			this.applyInvalidMsg();
		}
	}

	clearInvalid() {
		super.clearInvalid();
		this.applyInvalidMsg();
	}

	protected internalSetValue(v?: any) {
		this.control!.style.backgroundColor = "#" + v;
	}
}

/**
 * Shorthand function to create {@see TextField}
 *
 * @param config
 */
export const colorfield = (config?: FieldConfig<ColorField, FieldEventMap<ColorField>>) => createComponent(new ColorField(), config);