/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Form, FormEventMap } from "./Form.js";
import { AbstractDataSource, BaseEntity, DataSourceEventMap, DefaultEntity, EntityID } from "../../data/index.js";
import { Component } from "../Component.js";
import { FieldConfig } from "./Field.js";
export interface DataSourceFormEventMap<ValueType extends BaseEntity = DefaultEntity> extends FormEventMap {
    /**
     * Fires when the entity is saved successfully
     *
     * @param data The full entity data
     * @param isNew Indicates if the entity was new before the save
     */
    save: {
        data: ValueType;
        isNew: boolean;
    };
    /**
     * Fires when an error occurred when saving
     *
     * If a listener returns "false", the standard error dialog
     * is not shown.
     *
     * @param error
     */
    saveerror: {
        error: any;
    };
    /**
     * When the data is fetched from the store and set on the form.
     *
     * @param data the entity from the store
     */
    load: {
        data: ValueType;
    };
    /**
     * When the data is fetched from the store, but before it is set on the fields.
     *
     * @param data the entity from the store
     */
    beforeload: {
        data: ValueType;
    };
    /**
     * Fires when an error occurred when loading.
     *
     * If a listener returns "false", the standard error dialog
     * is not shown.
     *
     * @param form
     * @param data
     */
    loaderror: {
        error: any;
    };
    /**
     * When the data in the fields is serialized to a single json object to be posted to the server.
     *
     * When this form is updating an entity it will only contain the modified properties.
     *
     * @param form
     * @param data
     */
    beforesave: {
        data: Partial<ValueType>;
    };
}
/**
 * A form that loads and saves an entity from a {@link AbstractDataSource}
 */
export declare class DataSourceForm<ValueType extends BaseEntity = DefaultEntity> extends Form<ValueType, DataSourceFormEventMap<ValueType>> {
    dataSource: AbstractDataSource<ValueType, DataSourceEventMap>;
    currentId?: EntityID;
    /**
     * When set to true a modified entity will be set as JSON patch object
     */
    set patchMode(patchMode: boolean);
    private _patchMode;
    constructor(dataSource: AbstractDataSource<ValueType, DataSourceEventMap>);
    private handleServerValidation;
    create(data: any): void;
    /**
     * Clear the form and set it to the original unloaded state
     *
     * @param setValue When the form loads it's cleared but we don't need to set the value
     */
    clear(setValue?: boolean): void;
    get isNew(): boolean;
    /**
     * Load an entity into the form
     *
     * @param id
     */
    load(id: EntityID): Promise<void>;
}
export type DataSourceFormConfig<ValueType extends BaseEntity = DefaultEntity> = FieldConfig<DataSourceForm<ValueType>, "dataSource">;
/**
 * Shorthand function to create {@link DataSourceForm}
 *
 * @param config
 * @param items
 */
export declare const datasourceform: <ValueType extends BaseEntity = DefaultEntity>(config: DataSourceFormConfig<ValueType>, ...items: Component[]) => DataSourceForm<ValueType>;
