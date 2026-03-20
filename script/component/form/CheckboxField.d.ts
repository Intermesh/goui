/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { FieldConfig } from "./Field.js";
import { InputField } from "./InputField.js";
type CheckBoxType = 'box' | 'switch' | 'button';
export interface CheckboxField {
    get input(): HTMLInputElement;
}
/**
 * Checkbox field
 *
 * @link https://goui.io/#form/ChecksAndRadios Example
 * @see Form
 */
export declare class CheckboxField extends InputField {
    /**
     *
     * @param type Render the checkbox as a checkbox, switch or toggle button
     */
    constructor(type?: CheckBoxType);
    protected baseCls: string;
    protected applyTitle(): void;
    focus(o?: FocusOptions): void;
    protected createLabel(): void;
    protected renderIcon(): void;
    protected createControl(): HTMLDivElement;
    set color(v: string);
    get color(): string;
    protected internalSetValue(v: boolean): void;
    protected internalGetValue(): boolean;
}
export type CheckboxFieldConfig = Omit<FieldConfig<CheckboxField>, "type"> & {
    type?: CheckBoxType;
};
/**
 * Shorthand function to create {@link CheckboxField}
 *
 * @link https://goui.io/#form/ChecksAndRadios Example
 *
 * @param config
 */
export declare const checkbox: (config?: CheckboxFieldConfig) => CheckboxField;
export {};
