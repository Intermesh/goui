import {Config, createComponent} from "../Component.js";
import {E} from "../../util/Element.js";
import {ColorPicker} from "../picker/ColorPicker.js";
import {Field} from "./Field.js";
import {PickerButton} from "../picker/PickerButton.js";

/**
 * ColorField component
 *
 * @see Form
 */
export class ColorField extends Field {

	protected colorDot: HTMLElement | undefined;
	private static picker = new ColorPicker();

	constructor() {
		super();
		this.buttons = [new PickerButton(ColorField.picker)];
	}

	protected createControl() : undefined | HTMLElement{
		return this.colorDot = E('div', '&nbsp;').cls('+color-dot');
	}

	setInvalid(msg: string) {

		super.setInvalid(msg);

		if(this.rendered) {
			this.applyInvalidMsg();
		}
	}

	clearInvalid() {
		super.clearInvalid();
		this.applyInvalidMsg();
	}

	set value(v: any) {
		if (this.colorDot) {
			this.colorDot.style.backgroundColor = "#"+v;
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
export const colorfield = (config?:Config<ColorField>) => createComponent(new ColorField(), config);