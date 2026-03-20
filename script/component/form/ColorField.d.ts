/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Field, FieldConfig } from "./Field.js";
/**
 * ColorField component
 *
 * @see Form
 */
export declare class ColorField extends Field {
    private readonly picker;
    private readonly pickerButton;
    constructor();
    private createPicker;
    set required(required: boolean);
    protected createControl(): undefined | HTMLElement;
    setInvalid(msg: string): void;
    clearInvalid(): void;
    protected internalSetValue(v?: any): void;
}
/**
 * Shorthand function to create {@link ColorField}
 *
 * @link https://goui.io/#form/Select Example
 *
 * @param config
 */
export declare const colorfield: (config?: FieldConfig<ColorField>) => ColorField;
