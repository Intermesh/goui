/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Field, FieldConfig, FieldEventMap} from "./Field.js";
import {Component, createComponent} from "../Component.js";
import {Config} from "../Observable";
import {DateTime, Format} from "../../util";

const defaultDisplayFieldRenderer: DisplayFieldRenderer = (v:any, field:DisplayField) => v ?? ""
/**
 * Display field
 *
 * Component used to display data only.
 *
 * A {@see Form} can be used to edit data but also to present data using display fields
 */
export class DisplayField extends Field {


	/**
	 *
	 * @param renderer Renderer function for the value of the field
	 */
	constructor(public renderer: DisplayFieldRenderer = defaultDisplayFieldRenderer) {
		super();
	}

	protected baseCls = 'goui-display-field';

	/**
	 * Escape value HTML
	 *
	 * {@link Format.escapeHTML}
	 */
	public escapeValue = true;


	/**
	 * Hide this field when the value is empty
	 */
	public hideWhenEmpty = true;

	protected createControl(): HTMLElement | undefined {
		return document.createElement("div");
	}

	protected internalSetValue(v?: any) {
		if(this.control) {
			const setFn = (str:string) => {
				if(this.escapeValue) {
					str = Format.escapeHTML(str);
				}
				this.control!.innerHTML = str;
				if(this.hideWhenEmpty)
					this.hidden = str == "";
			}, str = this.renderer(v, this);

			str instanceof Promise ? str.then(setFn) : setFn(str);
		}
	}
}
type DisplayFieldRenderer = (v:any, field:DisplayField) => string|Promise<string>;
type DisplayFieldConfig = FieldConfig<DisplayField, FieldEventMap<DisplayField>> & {

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
export const displayfield = (config: DisplayFieldConfig, ...items: Component[]) => createComponent(new DisplayField(config?.renderer ?? defaultDisplayFieldRenderer), config, items);

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

	return createComponent(new DisplayField(config?.renderer ?? defaultDisplayFieldRenderer), config, items);
}


