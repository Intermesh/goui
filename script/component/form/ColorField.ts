/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {createComponent} from "../Component.js";
import {E} from "../../util/Element.js";
import {ColorPicker} from "../picker/ColorPicker.js";
import {Field, FieldEventMap} from "./Field.js";
import {btn, Button} from "../Button.js";
import {menu} from "../menu/Menu.js";
import {Config} from "../Observable";

/**
 * ColorField component
 *
 * @see Form
 */
export class ColorField extends Field {

	protected colorDot: HTMLElement | undefined;
	private readonly picker;
	private readonly pickerButton: Button;

	constructor() {
		super();
		this.picker = new ColorPicker();
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

	protected createControl(): undefined | HTMLElement {
		this.colorDot = E('div').cls('+color-dot');
		this.el.cls("+no-floating-label");

		this.picker.on('select', (colorPicker, val) => {
			this.value = val;
			this.pickerButton.menu!.hide();
			this.clearInvalid();
			this.focus();
		});

		return this.colorDot;
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

	set value(v: any) {
		if (this.colorDot) {
			this.colorDot.style.backgroundColor = "#" + v;
		}
		super.value = v;
	}

	get value() {
		return super.value;
	}

}

/**
 * Shorthand function to create {@see TextField}
 *
 * @param config
 */
export const colorfield = (config?: Config<ColorField, FieldEventMap<ColorField>>) => createComponent(new ColorField(), config);