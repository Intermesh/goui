import { ChipsField } from "./ChipsField.js";
import { List, listStoreType } from "../List.js";
import { Menu } from "../menu/index.js";
import { Button } from "../Button.js";
import { FieldConfig, FieldEventMap } from "./Field.js";
import { storeRecordType } from "../../data/index.js";
export interface AutocompleteChipsEventMap extends FieldEventMap {
    /**
     * Fires when suggestions need to load
     *
     * @param form
     */
    autocomplete: {
        input: string;
    };
}
/**
 * Chips component that auto completes user input
 *
 * @link https://goui.io/#form/ChipsField Example
 */
export declare class AutocompleteChips<T extends List = List, EventMap extends AutocompleteChipsEventMap = AutocompleteChipsEventMap> extends ChipsField<EventMap> {
    readonly list: T;
    private buffer;
    protected menu?: Menu;
    protected menuButton?: Button;
    private valuesToCompare?;
    /**
     * @inheritDoc
     *
     * This disables the creation of new items.
     *
     * @param _text
     */
    textInputToValue: (_text: string) => Promise<any>;
    /**
     * Constructor
     *
     * @param list The drop down list or {@link Table}.
     * @param buffer
     */
    constructor(list: T, buffer?: number);
    protected createMenu(): Menu<import("../Component.js").ComponentEventMap>;
    private initList;
    private isPickerRecordInValue;
    /**
     * Method that transforms a record from the TablePicker store to a value for this field.
     * This is not necessarily a text value. In conjunction with {@link valueToTextField()} this
     * could also be an ID of an object for example.
     *
     * @param field
     * @param record
     */
    pickerRecordToValue(field: this, record: storeRecordType<listStoreType<T>>): any;
    protected internalRender(): HTMLElement;
    protected onEditorKeyDown(ev: KeyboardEvent): void;
    protected onEnter(ev: KeyboardEvent): void;
    private addSelected;
    private onInput;
}
type AutoCompleteChipsConfig<ListType extends List = List> = FieldConfig<AutocompleteChips<ListType>, "list"> & Partial<Pick<AutocompleteChips<ListType>, "textInputToValue" | "chipRenderer" | "pickerRecordToValue">>;
/**
 * Shorthand function to create {@link AutocompleteChips}
 *
 * @link https://goui.io/#form/ChipsField Example
 *
 * @param config
 */
export declare const autocompletechips: <ListType extends List = List>(config: AutoCompleteChipsConfig<ListType>) => AutocompleteChips<ListType, AutocompleteChipsEventMap>;
export {};
