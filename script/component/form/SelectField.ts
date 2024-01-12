/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Field, FieldEventMap} from "./Field.js";
import {createComponent} from "../Component.js";
import {Store} from "../../data/index.js";
import {Config} from "../Observable";
import {InputField} from "./InputField";

type SelectOption = { [key: string]: any };

export interface SelectField {
	get input(): HTMLSelectElement
}
/**
 * Select field
 *
 * @see Form
 */
export class SelectField extends InputField {

	public baseCls = "goui-form-field select";


	public valueField = 'value';
	protected fireChangeOnBlur = false;
	public textRenderer?: (record: { [key: string]: any }) => string = (record: { [key: string]: any }) => record.name;
	private _store?: Store;
	private _options?: SelectOption[];

	protected createInput() {
		return document.createElement("select")
			.on('change', _ => this.fireChange());
	}

	// turned off fireChangeOnBlur but override onFocusIn() to get the oldValue
	protected onFocusIn(e:FocusEvent) {
		this.captureValueForChange();
	}
	/**
	 * Redraw the options. Can be useful when this.textRenderer() produces another result
	 */
	public drawOptions() {
		const v = this.value;
		this.options = this.options;
		this.value = v;
	}

	public set options(opts:SelectOption[]) {
		this._options = opts;
		this.input!.empty();
		opts.forEach((o: any) => {
			const opt = new Option();
			if (o[this.valueField]) {
				opt.value = o[this.valueField];
			}
			opt.innerHTML = this.textRenderer!(o);

			this.input!.appendChild(opt);
		});
	}

	public get options() {
		return this._options ?? [];
	}

	public set store(store: Store) {
		this._store = store;
		this.options = store.items;
		store.on("datachanged", () => this.options = store.items);
	}

	public get store(): Store|undefined {
		return this._store;
	}

	set value(v: string|undefined) {
		super.value = v;
	}

	get value() : string | undefined {
		const opts = (this.store ? this.store.items : this.options);

		let index = this.input!.selectedIndex;

		let v;
		if(opts[index]) {
			v = opts[index][this.valueField]
		} else {
			v = undefined;
		}
		return v;
	}
}

/**
 * Shorthand function to create {@see SelectField}
 *
 * @param config
 */
export const select = (config?: Config<SelectField, FieldEventMap<SelectField>>) => createComponent(new SelectField(), config);