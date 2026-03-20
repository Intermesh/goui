/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { FieldConfig } from "./Field.js";
import { Button } from "../Button.js";
import { List, listStoreType } from "../List.js";
import { Menu } from "../menu/index.js";
import { storeRecordType } from "../../data/index.js";
import { InputField, InputFieldEventMap } from "./InputField.js";
/**
 * @inheritDoc
 */
export interface AutocompleteEventMap extends InputFieldEventMap {
    /**
     * Fires when suggestions need to load
     *
     * @param form
     */
    autocomplete: {
        input: string;
    };
    /**
     * Fires when an item is selected from the list
     */
    select: {
        record: any;
    };
}
export interface AutocompleteField<T extends List = List, EventMap extends AutocompleteEventMap = AutocompleteEventMap> extends InputField<EventMap> {
    get input(): HTMLInputElement;
    get value(): string | number | null | undefined;
    set value(v: string | number | null | undefined);
}
/**
 * Autocomplete field
 *
 * @link https://goui.io/#form/Select Example
 */
export declare class AutocompleteField<T extends List = List, EventMap extends AutocompleteEventMap = AutocompleteEventMap> extends InputField<EventMap> {
    readonly list: T;
    private buffer;
    readonly menu: Menu;
    protected readonly menuButton: Button;
    readonly picker: import("../index.js").ListPicker<T>;
    readonly clearable: boolean;
    /**
     *
     * @param list The table to use for suggestions
     * @param buffer Buffer typing in the input in ms
     */
    constructor(list: T, buffer?: number);
    protected eventTargetIsInFocus(e: FocusEvent): boolean;
    protected createInput(): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    /**
     * Method that transforms a record from the TablePicker store to a value for this field.
     * This is not necessarily a text value. In conjunction with {@link valueToTextField()} this
     * could also be an ID of an object for example.
     */
    pickerRecordToValue(field: this, record: storeRecordType<listStoreType<T>>): any;
    /**
     * This method transforms the value in to a text representation for the input field
     */
    valueToTextField(field: this, value: any): Promise<any>;
    protected internalSetValue(v?: string): void;
    protected internalGetValue(): import("./Field.js").FieldValue;
    protected internalRender(): HTMLElement;
    private onInput;
    reset(): void;
    clear(): void;
}
type AutoCompleteConfig<T extends List, Required extends keyof AutocompleteField<T>> = FieldConfig<AutocompleteField<T>, Required> & Partial<Pick<AutocompleteField<T>, "pickerRecordToValue" | "valueToTextField">>;
/**
 * Shorthand function to create an {@link AutocompleteField}
 *
 * @link https://goui.io/#form/Select Example
 *
 * @param config
 */
export declare const autocomplete: <T extends List>(config: AutoCompleteConfig<T, "list">) => AutocompleteField<import("../Observable.js").Config<AutocompleteField<T, AutocompleteEventMap>, "list">["list"], AutocompleteEventMap>;
export {};
