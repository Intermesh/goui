/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Field, FieldEventMap} from "./Field.js";
import {createComponent} from "../Component.js";
import {Config} from "../Observable";
import {InputField} from "./InputField";


export type TextFieldType = ("text" | "password" | "email" | "url" | "tel" | "search" );

/**
 * TextField component
 *
 * @see Form
 */
export class TextField extends InputField {

	protected baseCls = 'goui-form-field text';

	constructor() {
		super();

		this.type = "text";
	}

	public set type(type:TextFieldType) {
		super.type = type;
	}

	get type(): TextFieldType {
		return super.type as TextFieldType;
	}

	protected input: HTMLInputElement | undefined;

	/**
	 * Pattern regex for validation
	 *
	 * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/pattern
	 *
	 * @param pattern
	 */
	set pattern(pattern: HTMLInputElement["pattern"]) {
		this.input!.pattern = pattern;
	}

	get pattern() {
		return this.input!.pattern
	}
}

/**
 * Shorthand function to create {@see TextField}
 *
 * @param config
 */
export const textfield = (config?: Config<TextField, FieldEventMap<TextField>>) => createComponent(new TextField(), config);