/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */
import { Field, FieldConfig } from "./Field.js";
import { MaterialIcon } from "../MaterialIcon.js";
interface RadioOption {
    value?: string | number | null;
    text: string;
    icon?: MaterialIcon;
}
export type RadioType = 'box' | 'button' | 'list';
export interface Radiofield extends Field {
    set value(v: string | number | null);
    get value(): string | number | null;
}
/**
 * Radio field
 *
 * @link @link https://goui.io/#form/ChecksAndRadios Example
 *
 * @example
 * ```
 * radio({
 * 		type: "button",
 * 		value: "option1",
 * 	  name: "radio",
 * 		options: [
 * 			{text: "Option 1", value: "option1"},
 * 			{text: "Option 2", value: "option2"},
 * 			{text: "Option 3", value: "option3"}
 * 		]}
 * 	)
 * ```
 */
export declare class RadioField extends Field {
    private inputs;
    private _options;
    readonly type: RadioType;
    protected baseCls: string;
    private domName;
    constructor(type?: RadioType);
    protected fireChangeOnBlur: boolean;
    protected createLabel(): HTMLDivElement | void;
    protected createControl(): undefined | HTMLElement;
    set options(options: RadioOption[]);
    get options(): RadioOption[];
    protected internalGetValue(): string | number | boolean | any[] | Record<string, any> | undefined | null;
    protected internalSetValue(v?: any): void;
}
/**
 * Shorthand function to create {@link RadioField}
 *
 * @link @link https://goui.io/#form/ChecksAndRadios Example
 *
 * @param config
 */
export declare const radio: (config?: FieldConfig<RadioField>) => RadioField;
export {};
