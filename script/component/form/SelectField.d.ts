/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { FieldConfig, FieldValue } from "./Field.js";
import { Store } from "../../data/index.js";
import { InputField } from "./InputField.js";
/**
 * Select component option
 *
 * By default, it should have a "value" and "text" property. This can be changed with the {@link SelectField.valueField} and
 * {@link SelectField.textRenderer}.
 *
 * @link https://goui.io/#form/Select Examples
 *
 */
type SelectOption = {
    [key: string]: any;
};
export interface SelectField {
    get input(): HTMLSelectElement;
}
/**
 * Select field
 *
 * @see Form
 */
export declare class SelectField extends InputField {
    baseCls: string;
    /**
     * The field of the select options that is used as value
     */
    valueField: string;
    protected fireChangeOnBlur: boolean;
    /**
     * Renderer function. Defaults to returning a 'name' property.
     *
     * @param record
     */
    textRenderer?: (record: {
        [key: string]: any;
    }) => string;
    private _store?;
    private _options?;
    protected createInput(): HTMLSelectElement;
    protected createControl(): HTMLDivElement;
    protected onFocusIn(e: FocusEvent): void;
    /**
     * Redraw the options. Can be useful when this.textRenderer() produces another result
     */
    drawOptions(): void;
    protected internalRender(): HTMLElement;
    /**
     * Provide select input with options
     *
     * It should have at least have a field that corresponds with {@link Select.valueField}
     *
     * By default, it should have a "value" and "name" property. This can be changed with the {@link Select.valueField} and
     * {@link Select.textRenderer}.
     *
     * @param opts
     */
    set options(opts: SelectOption[]);
    get options(): SelectOption[];
    /**
     * A store to provide the {@link Select.options}.
     * @param store
     */
    set store(store: Store);
    get store(): Store | undefined;
    protected internalGetValue(): FieldValue;
    protected internalSetValue(v: FieldValue): void;
}
/**
 * Shorthand function to create {@link SelectField}
 *
 * @link https://goui.io/#form/Select Examples
 *
 * @param config
 */
export declare const select: (config?: FieldConfig<SelectField>) => SelectField;
export {};
