import { Field, FieldConfig } from "./Field.js";
import { DateInterval } from "../../util/index.js";
/**
 * Duration field
 *
 * Represents a period of time
 */
export declare class DurationField extends Field {
    outputFormat: string;
    protected baseCls: string;
    private hoursInput?;
    private minutesInput?;
    /**
     * Minimum allowed duration to be entered
     */
    min: DateInterval | undefined;
    /**
     * Maximum allowed duration to be entered
     */
    max: DateInterval | undefined;
    /**
     *
     * @param outputFormat Format it will as value
     *
     * {@link DurationField.value}
     *
     * It can be any string format supported by {@link DateInterval.format}
     */
    constructor(outputFormat?: string);
    protected validate(): void;
    /**
     * Get the value DateInterval object
     */
    getValueAsDateInterval(): DateInterval;
    protected createControl(): HTMLElement | undefined;
    protected internalSetValue(v?: any): void;
    protected internalGetValue(): string | number | boolean | any[] | Record<string, any> | undefined;
}
/**
 * Create a {@link DurationField}
 *
 * @link https://goui.io/#form/DateTime Examples
 *
 * @param config
 */
export declare const durationfield: (config?: FieldConfig<DurationField>) => DurationField;
