/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Field, FieldConfig, FieldEventMap } from "./Field.js";
import { Button } from "../Button.js";
import { Menu } from "../menu/Menu.js";
import { List } from "../List.js";
export interface ListFieldEventMap extends FieldEventMap {
    /**
     * Fires when an item is selected from the list
     */
    select: {
        record: any;
    };
}
/**
 * ListField component
 *
 * @link https://goui.io/#form/Select Example
 *
 * @see Form
 */
export declare class ListField<ListType extends List = List> extends Field<ListFieldEventMap> {
    readonly list: ListType;
    readonly valueProperty: string;
    readonly menu: Menu;
    protected readonly menuButton: Button;
    readonly picker: import("../index.js").ListPicker<ListType>;
    private container?;
    protected baseCls: string;
    constructor(list: ListType, valueProperty?: string);
    protected internalRender(): HTMLElement;
    pickerRecordToValue(_field: this, record: any): string;
    protected createControl(): HTMLDivElement;
    protected internalSetValue(v?: string): void;
    /**
     * This method transforms the value in to a HTML representation
     *
     * @param field
     * @param value
     */
    renderValue(field: this, value: any): Promise<string>;
}
export type ListFieldConfig<T extends List> = FieldConfig<ListField<T>, "list"> & Partial<Pick<ListField<T>, "pickerRecordToValue" | "renderValue">>;
/**
 * Shorthand function to create {@link ListField}
 *
 * @link https://goui.io/#form/Select Example
 *
 * @param config
 */
export declare const listfield: <T extends List>(config: ListFieldConfig<T>) => ListField<import("../Observable.js").Config<ListField<T>, "list">["list"]>;
