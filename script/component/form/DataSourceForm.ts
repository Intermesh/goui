/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {Form, FormEventMap} from "./Form.js";
import {AbstractDataSource, BaseEntity, DefaultEntity, EntityID} from "../../data/index.js";
import {t} from "../../Translate.js";
import {Listener, ObservableListenerOpts} from "../Observable.js";
import {Component, createComponent} from "../Component.js";
import {Window} from "../Window.js";
import {FieldConfig} from "./Field.js";
import {Format} from "../../util/index";


export interface DataSourceFormEventMap<Type, ValueType extends BaseEntity = DefaultEntity> extends FormEventMap<Type> {

	/**
	 * Fires when the entity is saved successfully
	 * @param form
	 * @param data
	 * @param isNew
	 */
	save: (form: Type, data: ValueType, isNew:boolean) => any

	/**
	 * Fires when an error occurred when saving
	 *
	 * If a listener returns "false", the standard error dialog
	 * is not shown.
	 *
	 * @param form
	 * @param data
	 */
	saveerror: (form: Type, error: any) => any

	/**
	 * When the data is fetched from the store. but before it is put into the fields
	 * @param form
	 * @param data the entity from the store
	 */
	load: (form: Type, data: ValueType) => any,

	/**
	 * Fires when an error occurred when loading.
	 *
	 * If a listener returns "false", the standard error dialog
	 * is not shown.
	 *
	 * @param form
	 * @param data
	 */
	loaderror: (form: Type, error: any) => any

	/**
	 * When the data in the fields is serialized to a single json object to be posted to the server.
	 * @param form
	 * @param data
	 */
	beforesave: (form: Type, data: Partial<ValueType>) => void,
}

export interface DataSourceForm<ValueType extends BaseEntity = DefaultEntity> extends Form<ValueType> {
	on<K extends keyof DataSourceFormEventMap<this, ValueType>, L extends Listener>(eventName: K, listener: Partial<DataSourceFormEventMap<this,ValueType>>[K], options?: ObservableListenerOpts): L
	un<K extends keyof DataSourceFormEventMap<this, ValueType>>(eventName: K, listener: Partial<DataSourceFormEventMap<this,ValueType>>[K]): boolean
	fire<K extends keyof DataSourceFormEventMap<this, ValueType>>(eventName: K, ...args: Parameters<DataSourceFormEventMap<any, ValueType>[K]>): boolean
}

export class DataSourceForm<ValueType extends BaseEntity = DefaultEntity> extends Form<ValueType> {

	public currentId?: EntityID

	constructor(public dataSource: AbstractDataSource<ValueType>) {
		super();

		this.handler = async form1 => {
			try {
				let data,
					v = this.currentId ? this.modified : this.value;
				if(this.fire('beforesave', this, v) === false) {
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
					this.fire('save', this, data, isNew);
				}

			} catch (e:any) {

				if(e.type == "invalidProperties") {
					this.handleServerValidation(e);
				}

				if(this.fire('saveerror', this, e) === false) {
					return;
				}

				console.error(t("Error"), e);
				if(e.type != "invalidProperties") {
					void Window.error(e);
				}

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

		this.fire('load', this, data);
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
			this.fire('load', this, entity);
			this.value = entity as ValueType;
		} catch (e:any) {
			console.error(t("Error"), e);
			if(this.fire('loaderror', this, e) !== false) {
				void Window.error(e);
			}
		} finally {
			this.unmask();
		}
	}
}

export type DataSourceFormConfig<ValueType extends BaseEntity =  DefaultEntity> =


		FieldConfig<DataSourceForm<ValueType>, DataSourceFormEventMap<DataSourceForm<ValueType>, ValueType>, "dataSource">




/**
 * Shorthand function to create {@link DataSourceForm}
 *
 * @param config
 * @param items
 */
export const datasourceform = <ValueType extends BaseEntity =  DefaultEntity>(config: DataSourceFormConfig<ValueType>, ...items: Component[]):DataSourceForm<ValueType> => createComponent(new DataSourceForm<ValueType>(config.dataSource), config, items);
