import { FieldConfig } from "./Field.js";
import { InputField } from "./InputField.js";
/**
 * Text Area component
 *
 * @see Form
 */
export declare class TextAreaField extends InputField {
    protected baseCls: string;
    private _autoHeight;
    protected createInput(): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    /**
     * Let the textarea grow to it's content
     *
     * @param v
     */
    set autoHeight(v: boolean);
    get autoHeight(): boolean;
    private resize;
}
/**
 * Shorthand function to create {@link TextAreaField}
 *
 * @link https://goui.io/#form/TextField Examples
 *
 * @param config
 */
export declare const textarea: (config?: FieldConfig<TextAreaField>) => TextAreaField;
