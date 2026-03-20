/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { FieldConfig } from "./Field.js";
import { InputField } from "./InputField.js";
export type TextFieldType = ("text" | "password" | "email" | "url" | "tel" | "search");
export interface TextField {
    get input(): HTMLInputElement;
    get value(): string;
    set value(v: string);
}
/**
 * TextField component
 *
 * @link https://goui.io/#form/TextField Examples
 * @see Form
 */
export declare class TextField extends InputField {
    protected baseCls: string;
    constructor();
    /**
     * The input type
     *
     * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/text
     * @param type
     */
    set type(type: TextFieldType);
    get type(): TextFieldType;
    /**
     * Pattern regex for validation
     *
     * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/pattern
     *
     * @param pattern
     */
    set pattern(pattern: HTMLInputElement["pattern"]);
    get pattern(): HTMLInputElement["pattern"];
}
/**
 * Shorthand function to create {@link TextField}
 *
 * @link https://goui.io/#form/TextField Examples
 * @param config
 */
export declare const textfield: (config?: FieldConfig<TextField>) => TextField;
