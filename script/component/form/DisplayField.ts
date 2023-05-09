/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Field, FieldEventMap} from "./Field.js";
import {Component, createComponent} from "../Component.js";
import {Config} from "../Observable";

export class DisplayField extends Field {
	baseCls = ''
	constructor(tagName:keyof HTMLElementTagNameMap = "div") { // default is <label>. but that will trigger click of button inside
		super(tagName);
	}
	protected renderControl() {
		// empty
	}
}

export const displayfield = (config: Config<DisplayField, FieldEventMap<DisplayField>>, ...items: Component[]) => createComponent(new DisplayField(config?.tagName), config, items);