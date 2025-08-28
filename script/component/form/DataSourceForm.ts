/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {Form, FormEventMap} from "./Form.js";
import {AbstractDataSource, BaseEntity, DataSourceEventMap, DefaultEntity, EntityID} from "../../data/index.js";
import {t} from "../../Translate.js";
import {Component, createComponent} from "../Component.js";
import {Window} from "../Window.js";
import {FieldConfig} from "./Field.js";
import {Format} from "../../util/index";


export interface DataSourceFormEventMap<ValueType extends BaseEntity = DefaultEntity> extends FormEventMap {

	/**
	 * Fires when the entity is saved successfully
	 *
	 * @param data The full entity data
	 * @param isNew Indicates if the entity was new before the save
	 */
	save: {data: ValueType, isNew:boolean}

	/**
	 * Fires when an error occurred when saving
	 *
	 * If a listener returns "false", the standard error dialog
	 * is not shown.
	 *
	 * @param error
	 */
	saveerror: {error: any}

	/**
	 * When the data is fetched from the store. but before it is put into the fields
	 *
	 * @param data the entity from the store
	 */
	load: {data: ValueType},

	/**
	 * Fires when an error occurred when loading.
	 *
	 * If a listener returns "false", the standard error dialog
	 * is not shown.
	 *
	 * @param form
	 * @param data
	 */
	loaderror: {error: any}

	/**
	 * When the data in the fields is serialized to a single json object to be posted to the server.
	 *
	 * When this form is updating an entity it will only contain the modified properties.
	 *
	 * @param form
	 * @param data
	 */
	beforesave: {data: Partial<ValueType>}
}


export class DataSourceForm<ValueType extends BaseEntity = DefaultEntity> extends Form<ValueType, DataSourceFormEventMap<ValueType>> {

	public currentId?: EntityID

	constructor(public dataSource: AbstractDataSource<ValueType, DataSourceEventMap>) {
		super();

		this.handler = async form1 => {
			try {
				let data,
					v = this.currentId ? this.modified : this.value;
				if(this.fire('beforesave', {data:v}) === false) {
					return;
				}

				//save because it changes when this.currentId is set
				const isNew = this.isNew;

				if (!isNew) {
					data = await this.dataSource.update(this.currentId!, v as ValueType);
				} else {
					data = await this.dataSource.create(v);

					this.currentId = data.id;
				}

				if (data) {
					this.fire('save', {data, isNew});
				}

			} catch (e:any) {

				if(e.type == "invalidProperties") {
					this.handleServerValidation(e);
				}

				if(this.fire('saveerror', {error: e}) === false) {
					return;
				}

				console.error(t("Error"), e);
				if(e.type != "invalidProperties") {
					void Window.error(e);
				}

				throw e;

			}
		}
	}

	private handleServerValidation(error: any) {

		console.error(error);

		for(const propertyName in error.validationErrors) {
			const field = this.findField(propertyName);
			if(!field) {
				continue;
			}

			field.setInvalid(Format.escapeHTML(error.validationErrors[propertyName].description));
		}

		const invalid = this.findFirstInvalid();
		if (invalid) {
			invalid.focus();
		}

		this.setInvalid(t('You have errors in your form. The invalid fields are marked.'));
	}

	public create(data: any) {
		this.clear();

		this.fire('load', {data});
		if (data) {
			this.value = data;
			this.trackReset();
		}
	}


	/**
	 * Clear the form and set it to the original unloaded state
	 *
	 * @param setValue When the form loads it's cleared but we don't need to set the value
	 */
	clear(setValue:boolean = true) {
		super.clear(setValue);
		delete this.currentId;
	}

	get isNew () {
		return !this.currentId;
	}

	/**
	 * Load an entity into the form
	 *
	 * @param id
	 */
	public async load(id: EntityID) {

		this.mask();

		try {
			this.clear(false);
			this.currentId = id;
			let entity = await this.dataSource!.single(id);
			if (!entity) {
				throw "Failed to load entity with id " + id;
			}
			this.fire('load', {data:entity});
			this.value = entity as ValueType;
		} catch (e:any) {
			console.error(t("Error"), e);
			if(this.fire('loaderror', {error: e}) !== false) {
				void Window.error(e);
			}
		} finally {
			this.unmask();
		}
	}
}

export type DataSourceFormConfig<ValueType extends BaseEntity =  DefaultEntity> =


		FieldConfig<DataSourceForm<ValueType>, "dataSource">




/**
 * Shorthand function to create {@link DataSourceForm}
 *
 * @param config
 * @param items
 */
export const datasourceform = <ValueType extends BaseEntity =  DefaultEntity>(config: DataSourceFormConfig<ValueType>, ...items: Component[]):DataSourceForm<ValueType> => createComponent(new DataSourceForm<ValueType>(config.dataSource), config, items);
