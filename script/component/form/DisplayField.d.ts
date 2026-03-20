/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Field, FieldConfig } from "./Field.js";
import { Component } from "../Component.js";
/**
 * Display field
 *
 * Component used to display data only.
 *
 * Use cls: "pit" to style as an editable form field.
 *
 * A {@link Form} can be used to edit data but also to present data using display fields
 *
 * @link https://goui.io/#form/DisplayField Examples
 */
export declare class DisplayField extends Field {
    tagName: keyof HTMLElementTagNameMap;
    renderer: DisplayFieldRenderer;
    /**
     *
     * @param tagName Tagname defaults to ="label". If you pass another tag like h3 for example it will render a simple tag: <h3>{renderedValue}</h3>
     * @param renderer Renderer function for the value of the field
     */
    constructor(tagName?: keyof HTMLElementTagNameMap, renderer?: DisplayFieldRenderer);
    protected baseCls: string;
    /**
     * Escape value HTML
     *
     * @deprecated Use htmlEncode
     * {@link Format.escapeHTML}
     */
    set escapeValue(v: boolean);
    /**
     * Encod HTML entities
     *
     * {@link Format.escapeHTML}
     */
    htmlEncode: boolean;
    /**
     * Hide this field when the value is empty
     */
    hideWhenEmpty: boolean;
    protected renderTagOnly: boolean;
    protected createControl(): HTMLElement | undefined;
    protected internalSetValue(v?: any): void;
    protected renderControl(): void;
}
type DisplayFieldRenderer = (v: any, field: DisplayField) => Component | string | Promise<string | Component>;
type DisplayFieldConfig = FieldConfig<DisplayField> & {
    /**
     * Renderer function for the value of the field
     */
    renderer?: DisplayFieldRenderer;
};
/**
 * Shortcut function to create a {@link DisplayField}
 *
 * @link https://goui.io/#form/DisplayField Examples
 *
 * @param config
 * @param items
 */
export declare const displayfield: (config: DisplayFieldConfig, ...items: Component[]) => DisplayField;
/**
 * Create display field with date icon and renderer
 *
 * If you pass {tagName: "h3"} or another tag that's not "label", it will not render a field but instead loads
 * data directly into that element.
 *
 * @link https://goui.io/#form/DisplayField Examples
 *
 * @param config
 * @param items
 */
export declare const displaydatefield: (config: DisplayFieldConfig & {
    /**
     * Render field with date and time
     */
    withTime?: boolean;
}, ...items: Component[]) => DisplayField;
export declare const displaycheckboxfield: (config: Omit<DisplayFieldConfig, "renderer">, ...items: Component[]) => DisplayField;
export {};
