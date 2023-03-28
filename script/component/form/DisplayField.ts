/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Field} from "./Field.js";
import {Component, Config, createComponent} from "../Component.js";

export class DisplayField extends Field {
	baseCls = ''
	constructor(tagName:keyof HTMLElementTagNameMap = "div") { // default is <label>. but that will trigger click of button inside
		super(tagName);
	}
	protected renderControl() {
		// empty
	}
}

export const displayfield = (config: Config<DisplayField>, ...items: Component[]) => createComponent(new DisplayField(config?.tagName), config, items);