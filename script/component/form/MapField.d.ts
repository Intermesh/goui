/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */
import { Field, FieldConfig } from "./Field.js";
type MapFieldConfig = FieldConfig<MapField, "buildField">;
type FieldBuilder = (value: MapFieldValue | undefined) => Field;
type MapFieldValue = any;
export interface MapField {
    set value(v: MapFieldValue);
    get value(): MapFieldValue;
}
/**
 * A MapField represents a key value object
 *
 * @link https://goui.io/#form/MapField Example
 */
export declare class MapField extends Field {
    buildField: FieldBuilder;
    /**
     * Set to the name of the field holding the key. If not given a key will be generated.
     */
    keyFieldName?: string;
    /**
     * Set to the name of the field holding the value if it's a scalar.
     */
    valueFieldName?: string;
    private itemsContainer;
    constructor(buildField: FieldBuilder);
    protected baseCls: string;
    protected renderControl(): void;
    protected get itemContainerEl(): HTMLElement;
    protected validate(): void;
    clearInvalid(): void;
    protected internalSetValue(v?: any): void;
    protected internalGetValue(): string | number | boolean | any[] | Record<string, any> | undefined;
    isEmpty(): boolean;
    /**
     * Add value to the map.
     *
     * Also fires change event
     *
     * @param data
     * @param key
     */
    add(data: MapFieldValue, key?: string | undefined): void;
    insert(index: number, data: MapFieldValue, key?: string | undefined): void;
    private internalAdd;
    private _nextKey;
    protected nextKey(): number;
}
/**
 * Create a map field
 *
 * @link https://goui.io/#form/MapField
 * @param config
 * @param items
 */
export declare const mapfield: (config: MapFieldConfig, ...items: Field[]) => MapField;
export {};
