/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Field, FieldEventMap} from "./Field.js";
import {Component, createComponent} from "../Component.js";
import {Config} from "../Observable";
import {DateTime, Format} from "../../util";

/**
 * Display field
 *
 * Component used to display data only.
 *
 * A {@see Form} can be used to edit data but also to present data using display fields
 */
export class DisplayField extends Field {
	private control?: HTMLDivElement;

	protected baseCls = 'goui-display-field'

	/**
	 * Renderer function for the value of the field
	 *
	 * @param v
	 * @param field
	 */
	public renderer: DisplayFieldRenderer = (v:any, field:DisplayField) => Format.escapeHTML(v) ?? "";

	/**
	 * Hide this field when the value is empty
	 */
	public hideWhenEmpty = true;

	protected createControl(): HTMLElement | undefined {
		this.control = document.createElement("div");
		return this.control;
	}

	protected internalSetValue(v?: any) {
		if(this.control) {
			const setFn = (str:string) => {
				this.control!.innerHTML = str;
				if(this.hideWhenEmpty)
					this.hidden = str == "";
			}, str = this.renderer(v, this);

			str instanceof Promise ? str.then(setFn) : setFn(str);
		}
	}
}
type DisplayFieldRenderer = (v:any, field:DisplayField) => string|Promise<string>;
type DisplayFieldConfig = Config<DisplayField, FieldEventMap<DisplayField>> & {

	/**
	 * Renderer function for the value of the field
	 */
	renderer?: DisplayFieldRenderer;
}

/**
 * Shortcut function to create a {@see DisplayField}
 *
 * @param config
 * @param items
 */
export const displayfield = (config: DisplayFieldConfig, ...items: Component[]) => createComponent(new DisplayField(config?.tagName), config, items);

/**
 * Create display field with date icon and renderer
 *
 * @param config
 * @param items
 */
export const displaydatefield = (config: DisplayFieldConfig, ...items: Component[]) => {
	if(!config.icon)
		config.icon = "today";

	if(!config.renderer)
		config.renderer = (v) => v ? (new DateTime(v)).format(Format.dateFormat) : ""

	return createComponent(new DisplayField(config?.tagName), config, items);
}


