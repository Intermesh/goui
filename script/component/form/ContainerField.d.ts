/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Field, FieldConfig, FieldEventMap } from "./Field.js";
import { Component } from "../Component.js";
export type ContainerFieldValue = Record<string, any>;
export interface ContainerField<EventMap extends FieldEventMap = FieldEventMap, ValueType extends ContainerFieldValue = ContainerFieldValue> extends Field<EventMap> {
    set value(v: Partial<ValueType>);
    get value(): ValueType;
}
/**
 * A container field is used to create a sub property in the form object.
 *
 * The value that it returns is an object with the field names as keys. You can add multiple container fields with the
 * same form name to organize the fields. But check {@link keepUnknownValues} when you need this.
 *
 * @link https://goui.io/#form/ContainerField Example
 */
export declare class ContainerField<EventMap extends FieldEventMap = FieldEventMap, ValueType extends ContainerFieldValue = ContainerFieldValue> extends Field<EventMap> {
    constructor(tagName?: keyof HTMLElementTagNameMap);
    protected baseCls: string;
    hideLabel: boolean;
    protected fireChangeOnBlur: boolean;
    /**
     * Not needed on container field as the fields within handle this.
     */
    validateOnBlur: boolean;
    /**
     * When this field is populated with an object that contains properties we don't have form fields for, they will be
     * retained when keepUnkownValues is set to true. This is the default.
     *
     * You can add multiple container fields with the same form name to organize fields. You need to set this to false when
     * you do this otherwise fieldB will overwrite fieldA with unknown values.
     */
    keepUnknownValues: boolean;
    /**
     * Find all form fields
     *
     * @param nameOrItemId If given only items with matching name or itemId are returned
     */
    findFields(nameOrItemId?: string | undefined): Field<FieldEventMap>[];
    /**
     * Find form field by name or item ID
     *
     * It cascades down the component hierarchy.
     *
     * @param nameOrItemId
     */
    findField<FieldType extends Field = Field>(nameOrItemId: string): FieldType | undefined;
    /**
     * @inheritDoc
     */
    reset(): void;
    /**
     * @inheritDoc
     */
    clear(setValue?: boolean): void;
    /**
     * Copies the current value to the reset value. Typically happens when this component was added to a parent and
     * when the form it belongs too loads.
     */
    trackReset(): void;
    isModified(): boolean;
    /**
     * Add some additional values to the form.
     * setting the value will reset the entire form or container. Patching will leave the other values alone.
     * @param v
     */
    patch(v: Partial<ValueType>): this;
    protected internalSetValue(v: Partial<ValueType>): void;
    protected internalGetValue(): ValueType;
    getOldValue(): any;
    isValid(): boolean;
    protected validate(): void;
    /**
     * Find the first invalid field
     */
    findFirstInvalid(): Field | undefined;
    protected renderControl(): void;
    clearInvalid(): void;
    protected applyInvalidMsg(): void;
    /**
     * @inheritDoc
     */
    focus(o?: FocusOptions): void;
}
/**
 * Shorthand function to create {@link ContainerField}
 *
 * @link https://goui.io/#form/ContainerField Example
 * @param config
 * @param items
 */
export declare const containerfield: (config?: FieldConfig<ContainerField>, ...items: Component[]) => ContainerField<FieldEventMap, ContainerFieldValue>;
