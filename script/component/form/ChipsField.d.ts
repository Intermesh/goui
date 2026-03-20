import { Field, FieldConfig, FieldEventMap, FieldValue } from "./Field.js";
import { Component, ComponentEventMap } from "../Component.js";
export interface ChipsField {
    get value(): FieldValue[];
    set value(v: FieldValue[]);
}
export interface ChipEventMap extends ComponentEventMap {
    deleteclick: {};
}
/**
 * Function that renders the chip
 */
export type ChipRenderer = (chip: Component, value: any) => Promise<void> | void;
/**
 * Chips component
 *
 * A form field that holds an array value represented in chips (small rectangular items with text). Like a tags
 * field or recipients field for an e-mail composer for example.
 *
 * @link https://goui.io/#form/ChipsField Example
 */
export declare class ChipsField<EventMap extends FieldEventMap = FieldEventMap> extends Field<EventMap> {
    protected baseCls: string;
    private _editor?;
    private chipsContainer?;
    /**
     * Function that transforms the user text input to a chip.
     *
     * If it returns an empty value no chip will be rendered
     *
     * @param text
     */
    textInputToValue: (text: string) => Promise<any>;
    /**
     * Renders a value to the chip component
     * @param chip
     * @param value
     */
    chipRenderer: ChipRenderer;
    get editor(): Component;
    protected createControl(): HTMLElement | undefined;
    protected onEditorKeyDown(ev: KeyboardEvent): void;
    protected onEnter(ev: KeyboardEvent): void;
    private createChip;
    protected get itemContainerEl(): HTMLElement;
    private selectedIndex;
    private clearSelection;
    private select;
    protected internalSetValue(v: any[]): void;
    protected internalGetValue(): FieldValue;
    focus(o?: FocusOptions): void;
}
type ChipsConfig = FieldConfig<ChipsField> & Partial<Pick<ChipsField, "textInputToValue" | "chipRenderer">>;
/**
 * Shorthand function to create {@link ChipsField}
 *
 * A form field that holds an array value represented in chips (small rectangular items with text). Like a tags
 * field or recipients field for an e-mail composer for example.
 *
 * @link https://goui.io/#form/ChipsField Example
 *
 * @param config
 */
export declare const chips: (config?: ChipsConfig) => ChipsField<FieldEventMap>;
export {};
