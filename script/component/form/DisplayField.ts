/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Field, FieldEventMap} from "./Field.js";
import {Component, createComponent} from "../Component.js";
import {Config} from "../Observable";

export class DisplayField extends Field {
	private control?: HTMLDivElement;

	protected baseCls = 'goui-display-field'
	public renderer = (v:any, field:DisplayField) => v ?? "";

	protected createControl(): HTMLElement | undefined {
		this.control = document.createElement("div");
		return this.control;
	}

	protected internalSetValue(v?: any) {
		if(this.control)
			this.control.innerText = this.renderer(v, this);
	}
}

type DisplayFieldConfig = Config<DisplayField, FieldEventMap<DisplayField>> & {
	renderer?: (v:any, field:DisplayField) => string;
}

export const displayfield = (config: DisplayFieldConfig, ...items: Component[]) => createComponent(new DisplayField(config?.tagName), config, items);