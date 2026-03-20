/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { FieldConfig } from "./Field.js";
import { InputField } from "./InputField.js";
export interface NumberField {
    set value(v: number | undefined);
    get value(): number | undefined;
}
/**
 * NumberField component
 *
 * @link https://goui.io/#form/NumberField Examples
 */
export declare class NumberField extends InputField {
    protected baseCls: string;
    /**
     * Multiply value with this number on set and divide on get value
     */
    multiplier: number;
    /**
     * Decimal separator. Defaults to {@link Format.decimalSeparator}
     */
    decimalSeparator: string;
    /**
     * Thousands separator. Defaults to {@link Format.thousandsSeparator}
     */
    thousandsSeparator: string;
    constructor();
    protected validate(): void;
    protected internalSetValue(v?: number | undefined): void;
    private isEmptyNumber;
    protected internalGetValue(): number | undefined;
    /**
     * Set the number of decimals.
     */
    decimals: number;
    /**
     * The minimum number allowed
     *
     * @param min
     */
    min: number | undefined;
    /**
     * The maximum number allowed
     *
     * @param max
     */
    max: number | undefined;
}
/**
 * Creator function for a {@link NumberField}
 *
 * @link https://goui.io/#form/NumberField Example
 * @param config
 */
export declare const numberfield: (config?: FieldConfig<NumberField>) => NumberField;
