/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Field, FieldConfig, FieldValue } from "./Field.js";
/**
 * @inheritDoc
 */
type ArrayFieldConfig<Type extends FieldValue = Record<string, any>> = FieldConfig<ArrayField<Type>, "buildField">;
type FieldBuilder<Type extends FieldValue = Record<string, any>> = (value: Type) => Field;
export interface ArrayField<Type extends FieldValue = Record<string, any>> extends Field {
    get value(): Type[];
    set value(value: Type[]);
}
/**
 * An ArrayField can be used to represent an array of objects like contact e-mail addresses for example
 *
 * @see Form
 * @link https://goui.io/#form/ArrayField Examples
 *
 */
export declare class ArrayField<Type extends FieldValue = Record<string, any>> extends Field {
    buildField: FieldBuilder<Type>;
    protected baseCls: string;
    private itemsContainer;
    /**
     *
     * @param buildField Function that returns a new form field for an array item
     */
    constructor(buildField: FieldBuilder<Type>, tagName?: keyof HTMLElementTagNameMap);
    /**
     * CSS class to apply to the item container
     * @default goui vbox gap
     */
    itemContainerCls: string;
    protected renderControl(): void;
    protected get itemContainerEl(): HTMLElement;
    protected validate(): void;
    clearInvalid(): void;
    private enableChangeEvent;
    protected internalSetValue(v?: any): void;
    protected internalGetValue(): Type[];
    /**
     * Add value to the values array. Also fires change event
     *
     * @param value
     */
    addValue(value: Type): Field<import("./Field.js").FieldEventMap>;
    private internalAddValue;
    isEmpty(): boolean;
}
/**
 * Shorthand function to create {@link ArrayField}
 *
 * @see https://github.com/Intermesh/goui-docs/blob/main/script/form/ArrayFieldPage.ts
 *
 * @param config
 * @param items
 */
export declare const arrayfield: <Type extends FieldValue = Record<string, any>>(config: ArrayFieldConfig<Type>, ...items: Field[]) => ArrayField<Type>;
export {};
