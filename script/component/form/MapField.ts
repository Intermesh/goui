/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */

import {Field, FieldEventMap} from "./Field.js";
import {createComponent} from "../Component.js";
import {btn} from "../Button.js";
import {Config, Observable} from "../Observable";

type MapFieldConfig = Config<MapField, FieldEventMap<MapField>, "buildField">;
type FieldBuilder = (value: MapFieldValue|undefined) => Field;
type MapFieldValue = any;

export interface MapField {
	set value(v: MapFieldValue)
	get value(): MapFieldValue
}

export class MapField extends Field {

	/**
	 * Set to the name of the field holding the key. If not given a key will be generated.
	 */
	public keyFieldName?: string;

	/**
	 * Set to the name of the field holding the value if it's a scalar.
	 */
	public valueFieldName?: string;

	constructor(public buildField: FieldBuilder) {
		super('div');

		this.cls = "vbox gap";
	}
	protected baseCls = "";

	protected renderControl() {
		// empty
	}


	protected internalSetValue(v?: any) {

		this.items.clear();
		if (v) {
			for (const key in v) {
				this.internalAdd(v[key], key);
			}
		}
	}


	protected internalGetValue(): string | number | boolean | any[] | Record<string, any> | undefined {
		const v: MapFieldValue = {};

		this.items.forEach((field) => {
			if(field instanceof Field) {
				const rowValue = field.value as MapFieldValue;
				let key = field.dataSet.key;
				if (this.keyFieldName && rowValue[this.keyFieldName]) {
					key = rowValue[this.keyFieldName];
					delete rowValue[this.keyFieldName];
				}
				v[key] = this.valueFieldName ? rowValue[this.valueFieldName] : rowValue;
			}
		})
		return v;
	}

	isEmpty(): boolean {
		return this.items.count()===0;
	}

	/**
	 * Add value to the map.
	 *
	 * Also fires change event
	 *
	 * @param data
	 * @param key
	 */
	public add(data: MapFieldValue, key?: string | undefined) {
		if(!this.valueOnFocus) {
			this.captureValueForChange();
		}
		this.internalAdd(data, key);
		this.fireChange();
	}

	private internalAdd(data: MapFieldValue, key?: string | number) {

		if(typeof key === 'number') {
			this._nextKey = Math.max(this._nextKey, key);
		}

		const field = this.buildField(data);
		field.dataSet.key = key || this.nextKey();
		field.value = this.valueFieldName ? {[this.valueFieldName]:data, [this.keyFieldName!]: key} : data;
		this.items.add(field);
	}

	private _nextKey = 0;

	protected nextKey() {
		// only works if sorted by key
		// todo: maybe use GUID for item with sortOrder?
		return ++this._nextKey;
	}

	reset() {
		super.reset();
		this.items.clear();
	}
}

/**
 * Create a map field
 *
 * @link https://goui.io/#form/MapField
 * @param config
 * @param items
 */
export const mapfield = (config: MapFieldConfig, ...items: Field[]) => createComponent(new MapField(config.buildField), config, items);