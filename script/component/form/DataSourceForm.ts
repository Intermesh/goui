/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {Form, FormEventMap} from "./Form";
import {AbstractDataSource, BaseEntity, DefaultEntity, EntityID} from "../../data";
import {t} from "../../Translate";
import {Config, ObservableListenerOpts} from "../Observable";
import {Component, createComponent} from "../Component";
import {ContainerFieldValue} from "./ContainerField";
import {Window} from "../Window";
import {Notifier} from "../../Notifier";
import {CardContainer} from "../CardContainer";


export interface DataSourceFormEventMap<Type, ValueType extends ContainerFieldValue = ContainerFieldValue> extends FormEventMap<Type> {

	/**
	 * Fires when the entity is saved successfully
	 * @param form
	 * @param data
	 */
	save: (form: Type, data: ValueType) => any

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
	beforesave: (form: Type, data: ValueType) => void,
}

export interface DataSourceForm<ValueType extends BaseEntity = DefaultEntity> extends Form<ValueType> {
	on<K extends keyof DataSourceFormEventMap<this, ValueType>>(eventName: K, listener: Partial<DataSourceFormEventMap<this,ValueType>>[K], options?: ObservableListenerOpts): void
	fire<K extends keyof DataSourceFormEventMap<this, ValueType>>(eventName: K, ...args: Parameters<DataSourceFormEventMap<any, ValueType>[K]>): boolean
}

export class DataSourceForm<ValueType extends BaseEntity = DefaultEntity> extends Form<ValueType> {

	constructor(public dataSource: AbstractDataSource<ValueType>) {
		super();

		this.handler = async form1 => {
			try {
				this._value = {};
				let v = this.value;
				if (this.currentId) {
					v.id = this.currentId;
				}
				this.fire('beforesave', this, v);

				let data;
				if (this.currentId) {
					data = await this.dataSource.update(v as ValueType);
				} else {
					data = await this.dataSource.create(v);
				}

				if (data) {
					this.fire('save', this, data);
				}

			} catch (e:any) {

				if(e.type == "invalidProperties") {
					this.handleServerValidation(e);
					return;
				}

				console.log(t("Error"), e);
				if(this.fire('saveerror', this, e) !== false) {
					void Window.error(e.message ?? t("Unknown error"));
				}
			} finally {
				this.unmask();
			}
		}
	}

	private handleServerValidation(error: any) {
		for(const propertyName in error.validationErrors) {
			const field = this.findField(propertyName);
			if(!field) {
				continue;
			}

			field.setInvalid(error.validationErrors[propertyName].description);
		}

		const invalid = this.findFirstInvalid();
		if (invalid) {
			invalid.focus();
		}

		this.setInvalid(t('You have errors in your form. The invalid fields are marked.'));
	}

	protected currentId?: EntityID

	public create(data: any) {
		this.reset();
		this.currentId = '_new_';
		this.fire('load', this, data);
		if (data) {
			this.setValues(data);
		}
	}
	reset() {
		super.reset();
		delete this.currentId;
	}

	/**
	 * Load an entity into the form
	 *
	 * @param id
	 */
	public async load(id: EntityID) {

		this.mask();

		try {
			this.currentId = id;
			let entity = await this.dataSource!.single(id);
			if (!entity) {
				throw "Failed to load entity with id " + id;
			}
			this.fire('load', this, entity);
			this.value = entity as ValueType;
		} catch (e:any) {
			alert(t("Error") + ' ' + e);
			console.log(t("Error"), e);
			if(this.fire('loaderror', this, e) !== false) {
				void Window.error(e.message);
			}
		} finally {
			this.unmask();
		}
	}
}

/**
 * Shorthand function to create {@see DataSourceForm}
 *
 * @param config
 * @param items
 */
export const datasourceform = <ValueType extends BaseEntity =  DefaultEntity>(config: Config<DataSourceForm<ValueType>, DataSourceFormEventMap<DataSourceForm<ValueType>>, "dataSource">, ...items: Component[]) => createComponent(new DataSourceForm<ValueType>(config.dataSource), config, items);
