/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Field, FieldEventMap} from "./Field.js";
import {Component, createComponent} from "../Component.js";
import {Config} from "../Observable";
import {Format} from "../../util";

export class DisplayField extends Field {
	private control?: HTMLDivElement;

	protected baseCls = 'goui-display-field'
	public renderer: DisplayFieldRenderer = (v:any, field:DisplayField) => Format.escapeHTML(v) ?? "";

	protected createControl(): HTMLElement | undefined {
		this.control = document.createElement("div");
		return this.control;
	}

	protected internalSetValue(v?: any) {
		if(this.control) {
			const str = this.renderer(v, this);
			if(str instanceof Promise) {
				str.then(r => {
					this.control!.innerHTML = r;
				});
			} else {
				this.control.innerHTML = str;
			}
		}
	}
}
type DisplayFieldRenderer = (v:any, field:DisplayField) => string|Promise<string>;
type DisplayFieldConfig = Config<DisplayField, FieldEventMap<DisplayField>> & {
	renderer?: DisplayFieldRenderer;
}

export const displayfield = (config: DisplayFieldConfig, ...items: Component[]) => createComponent(new DisplayField(config?.tagName), config, items);