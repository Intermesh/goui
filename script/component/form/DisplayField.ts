/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Field, FieldConfig} from "./Field.js";
import {Component, createComponent} from "../Component.js";
import {DateTime, Format} from "../../util";
import {t} from "../../Translate";

const defaultDisplayFieldRenderer: DisplayFieldRenderer = (v:any, _field:DisplayField) => v ?? ""
/**
 * Display field
 *
 * Component used to display data only.
 *
 * Use cls: "pit" to style as an editable form field.
 *
 * A {@link Form} can be used to edit data but also to present data using display fields
 *
 * @link https://goui.io/#form/DisplayField Examples
 */
export class DisplayField extends Field {

	/**
	 *
	 * @param tagName Tagname defaults to ="label". If you pass another tag like h3 for example it will render a simple tag: <h3>{renderedValue}</h3>
	 * @param renderer Renderer function for the value of the field
	 */
	constructor(public tagName: keyof HTMLElementTagNameMap = "label", public renderer: DisplayFieldRenderer = defaultDisplayFieldRenderer) {
		super(tagName);

		if(tagName != "label") {
			this.renderTagOnly = true;
		}
	}

	protected baseCls = 'goui-display-field';

	/**
	 * Escape value HTML
	 *
	 * @deprecated Use htmlEncode
	 * {@link Format.escapeHTML}
	 */
	public set escapeValue(v:boolean){
		this.htmlEncode = v;
	}

	/**
	 * Encod HTML entities
	 *
	 * {@link Format.escapeHTML}
	 */
	public htmlEncode = true;


	/**
	 * Hide this field when the value is empty
	 */
	public hideWhenEmpty = true;


	protected renderTagOnly = false;

	protected createControl(): HTMLElement | undefined {
		return document.createElement("div");
	}

	protected internalSetValue(v?: any) {

		// if(this.control) {
			const setFn = (str:number|string|Component) => {
				if(str instanceof Component) {

					if (!this.renderTagOnly) {
						this.control!.innerHTML = "";
						str.render(this.control);
					} else {
						this.el.innerHTML = "";
						str.render(this.el);
					}

					this.on("remove", ()=> {
						(str as Component).remove();
					})
				} else {
					str = str + "";

					const el = this.renderTagOnly ? this.el : this.control!;

					if(this.htmlEncode) {
						el.innerText = str;
					} else {
						el.innerHTML = str;
					}

					if (this.hideWhenEmpty) {
						this.hidden = str == "";
					}
				}
			}, str = this.renderer(v, this);

			if(str instanceof Promise) {
				setFn(t("Loading..."));
				str.then(setFn)
			} else {
				setFn(str);
			}
	}

	protected renderControl() {

		if(!this.renderTagOnly ) {
			super.renderControl();
		}
	}
}
type DisplayFieldRenderer = (v:any, field:DisplayField) => Component|string|Promise<string|Component>;
type DisplayFieldConfig = FieldConfig<DisplayField> & {

	/**
	 * Renderer function for the value of the field
	 */
	renderer?: DisplayFieldRenderer;
}

/**
 * Shortcut function to create a {@link DisplayField}
 *
 * @link https://goui.io/#form/DisplayField Examples
 *
 * @param config
 * @param items
 */
export const displayfield = (config: DisplayFieldConfig, ...items: Component[]) => createComponent(new DisplayField(config?.tagName ?? "label", config?.renderer ?? defaultDisplayFieldRenderer), config, items);

/**
 * Create display field with date icon and renderer
 *
 * @link https://goui.io/#form/DisplayField Examples
 *
 * @param config
 * @param items
 */
export const displaydatefield = (config: DisplayFieldConfig & {
	/**
	 * Render field with date and time
	 */
	withTime?: boolean
}, ...items: Component[]) => {
	if(!("icon" in config))
		config.icon = "today";

	let format = Format.dateFormat;
	if(config.withTime) {
		format += " " + Format.timeFormat;
	}

	if(!config.renderer)
		config.renderer = (v) => v ? (new DateTime(v)).format(format) : ""

	return createComponent(new DisplayField(config?.tagName ?? "label", config?.renderer ?? defaultDisplayFieldRenderer), config, items);
}


export const displaycheckboxfield = (config: Omit<DisplayFieldConfig, "renderer">, ...items: Component[]) => {
	return createComponent(new DisplayField(config?.tagName ?? "label", (v: string) => v ? '<i class="icon">check</i>' : ""), {...config, htmlEncode: false}, items);
}

