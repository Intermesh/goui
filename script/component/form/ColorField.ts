/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {createComponent} from "../Component.js";
import {E} from "../../util/Element.js";
import {ColorPicker} from "../picker/ColorPicker.js";
import {Field, FieldConfig} from "./Field.js";
import Button, {btn} from "../Button.js";
import {menu} from "../menu/Menu.js";

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
		const picker = new ColorPicker();
		picker.on('select', ({color}) => {

			this.pickerButton.menu!.hide();
			this.clearInvalid();
			this.focus();

			//important to set value after focus so change event will fire on focusout
			this.value = color;
		});


		const resizeObserver = new ResizeObserver((entries) => {
			this.pickerButton.menu!.align();
		});

		resizeObserver.observe(picker.el);

		this.on("remove", () => {
			// not sure if needed but disconnect the resizeobserver when this component is removed.
			resizeObserver.disconnect();
		})

		return picker;
	}

	set required(required: boolean) {
		super.required = required;
		this.picker.showAuto = !required;
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
		this.control!.style.backgroundColor =  v ? "#" + v : "";
		this.picker.value = v;
	}
}

/**
 * Shorthand function to create {@link ColorField}
 *
 * @link https://goui.io/#form/Select Example
 *
 * @param config
 */
export const colorfield = (config?: FieldConfig<ColorField>) => createComponent(new ColorField(), config);