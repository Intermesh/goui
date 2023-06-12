/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {Form, FormEventMap} from "./Form";
import {AbstractDataSource, BaseEntity, DefaultEntity, EntityID} from "../../data";
import {t} from "../../Translate";
import {Config} from "../Observable";
import {Component, createComponent} from "../Component";

export class DataSourceForm<ValueType extends BaseEntity = DefaultEntity> extends Form<ValueType> {


	constructor(public dataSource: AbstractDataSource<ValueType>) {
		super();

		this.handler = form1 => {
			try {
				this._value = {};
				let v = this.value;
				if (this.currentId) {
					v.id = this.currentId;
				}
				this.fire('serialize', this, v);

				let response;
				if (this.currentId) {
					response = this.dataSource.update(v);
				} else {
					response = this.dataSource.create(v);
				}

				if (response) {
					this.fire('saved', this, response);
				}

			} catch (e) {
				console.log(t("Error"), e);
			} finally {
				this.unmask();
			}
		}
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
		} catch (e) {
			alert(t("Error") + ' ' + e);
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
export const datasourceform = <ValueType extends BaseEntity =  DefaultEntity>(config: Config<DataSourceForm<ValueType>, FormEventMap<DataSourceForm<ValueType>>, "dataSource">, ...items: Component[]) => createComponent(new DataSourceForm<ValueType>(config.dataSource), config, items);
