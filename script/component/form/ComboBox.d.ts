import { AutocompleteField } from "./AutocompleteField.js";
import { AbstractDataSource, DataSourceStore, DataSourceStoreConfig, Filter } from "../../data/index.js";
import { Table, TableConfig } from "../table/index.js";
import { FieldConfig } from "./Field.js";
export type ComboBoxStoreConfig<DS extends AbstractDataSource = AbstractDataSource> = Partial<DataSourceStoreConfig<DS, any>>;
export type ComboBoxDS<ComboBoxType> = ComboBoxType extends ComboBox<infer DS> ? DS : never;
export type ComboRenderer = (field: ComboBox, record: any) => string;
export declare const ComboBoxDefaultRenderer: ComboRenderer;
/**
 * Combo box
 *
 * An extension of the Autocomplete field that simplifies the creation of a simple combobox with a
 * valueProperty and displayProperty.
 *
 * @link https://goui.io/#form/Select Example
 */
export declare class ComboBox<DS extends AbstractDataSource = AbstractDataSource> extends AutocompleteField<Table<DataSourceStore<DS>>> {
    readonly dataSource: DS;
    readonly displayProperty: string;
    readonly valueProperty: string;
    protected renderer: ComboRenderer;
    protected selectFirst: boolean;
    /**
     * When autocompleting from the datasource this filter name will be used.
     */
    filterName: string;
    /**
     * Set additional filter properties on the store.
     */
    filter?: Filter;
    /**
     * Constructor
     * @param dataSource
     * @param displayProperty
     * @param valueProperty
     * @param renderer
     * @param storeConfig
     * @param tableConfig
     * @param selectFirst Selects the first record on render
     */
    constructor(dataSource: DS, displayProperty?: string, valueProperty?: string, renderer?: ComboRenderer, storeConfig?: ComboBoxStoreConfig<DS>, tableConfig?: Partial<TableConfig>, selectFirst?: boolean);
    protected selectFirstRecord(): Promise<void>;
    pickerRecordToValue(_field: this, record: any): string;
    valueToTextField(_field: this, value: string): Promise<string>;
}
export type ComboBoxConfig<Type extends ComboBox = ComboBox> = FieldConfig<Type, "dataSource"> & {
    /**
     * Config for the {@link DataSourceStore}
     */
    storeConfig?: ComboBoxStoreConfig<ComboBoxDS<Type>>;
    /**
     * Renders the value in the list and input field. Must return plain text.
     */
    renderer?: ComboRenderer;
    /**
     * Select the first record on render
     */
    selectFirst?: boolean;
    tableConfig?: Partial<TableConfig>;
};
/**
 * Shorthand function to create {@link ComboBox}
 *
 * @link https://goui.io/#form/Select
 * @param config
 */
export declare const combobox: (config: ComboBoxConfig) => ComboBox<AbstractDataSource<import("../../index.js").DefaultEntity, import("../../index.js").DataSourceEventMap>>;
