/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Field, FieldEventMap} from "./Field.js";
import {createComponent} from "../Component.js";
import {Store} from "../../data/index.js";
import {Config} from "../Observable";

/**
 * Select field
 *
 * @see Form
 */
export class SelectField extends Field {

	public baseCls = "goui-form-field select"

	protected input: HTMLSelectElement | undefined;

	public options: { [key: string]: any }[] = [];
	public store?: Store

	public valueField = 'value';
	protected fireChangeOnBlur = false;
	public textRenderer?: (record: { [key: string]: any }) => string = (record: { [key: string]: any }) => record.name;

	protected createControl(): undefined | HTMLElement {
		//grab value before creating this.input otherwise it will return the input value
		const v = this.value;

		this.input = document.createElement("select")
			.on('change', _ => {this.fireChange();});
		this.input.name = this.name;
		if (this.required) {
			this.input.setAttribute("required", "");
		}

		this.drawOptions();

		this.el.appendChild(this.input);

		return this.input;
	}

	// turned off fireChangeOnBlur but override onFocusIn() to get the oldValue
	protected onFocusIn(e:FocusEvent) {
		//if(this.fireChangeOnBlur) {
			this.captureValueForChange();
		//}
	}

	getInput() {
		return this.input;
	}

	drawOptions() {
		if (!this.input) return;
		this.input.innerHTML = ''; // redraw
		(this.store ? this.store.items : this.options).forEach((o: any) => {
			const opt = new Option();
			if (o[this.valueField]) {
				opt.value = o[this.valueField];
			}
			opt.innerHTML = this.textRenderer!(o);

			this.input?.appendChild(opt);
		});
		if (this._value) {
			// for updating this.input.selectIndex
			this.value = this._value;
		}
	}

	set value(v: string) {

		if (this.input) {
			this.input.value = v;
		}

		super.value = v;
	}


	get value() : any {
		if (!this.input) {
			let v = super.value;
			if(v == undefined) {
				// HTML select fields return the first option value as value when no value is set.
				// We need to be consistent otherwise the value result will modify after render.
				const opts = (this.store ? this.store.items : this.options)
				if(opts.length) {
					v = opts[0][this.valueField];
				}
			}
			return v;
		} else if(this.store) {
			return this.input.value;
		} else {
			const v = this.options[this.input.selectedIndex];
			return v ? v[this.valueField] : null;
		}
	}


	set name(name: string) {
		super.name = (name);

		if (this.input) {
			this.input.name = this.name
		}
	}

	get name() {
		return super.name;
	}

	protected validate() {
		super.validate();

		//this implements the native browser validation

		if(this.input)
			this.setValidityState(this.input);

	}


}

/**
 * Shorthand function to create {@see SelectField}
 *
 * @param config
 */
export const select = (config?: Config<SelectField, FieldEventMap<SelectField>>) => createComponent(new SelectField(), config);