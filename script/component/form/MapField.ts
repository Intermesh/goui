/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */

import {Field, FieldEventMap} from "./Field.js";
import {createComponent} from "../Component.js";
import {btn} from "../Button.js";
import {Config, Observable} from "../Observable";

interface MapFieldRow {
	field?: Field
	key: string
	isNew: boolean
}

type MapFieldConfig = Config<MapField, FieldEventMap<MapField>, "buildField">;

type FieldBuilder = (value: MapFieldValue|undefined) => Field;

type MapFieldValue = Record<string, any>;

export class MapField extends Field {

	/**
	 * Set to the name of the field holding the key. If not given a key will be generated.
	 */
	public keyFieldName?: string;

	constructor(public buildField: FieldBuilder) {
		super('div');

		this.cls = "vbox gap";
	}
	protected baseCls = "";

	protected renderControl() {
		// empty
	}

	set value(v: MapFieldValue) {
		super.value = v;

		this.items.clear();
		if (v) {
			for (const key in v) {
				this.internalAdd(v[key], key);
			}
		}
	}

	get value(): MapFieldValue {
		const v: MapFieldValue = {};

		this.items.forEach((field) => {
			if(field instanceof Field) {
				const rowValue = field.value;
				let key = field.dataSet.key;
				if (this.keyFieldName && rowValue[this.keyFieldName]) {
					key = rowValue[this.keyFieldName];
					delete rowValue[this.keyFieldName];
				}
				v[key] = rowValue;
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

	private internalAdd(data: MapFieldValue, key?: string | undefined) {

		const field = this.buildField(data);
		field.dataSet.key = key === undefined ? this.nextKey() : key;

		field.value = data;
		this.items.add(field);
	}

	private _nextKey = 1;

	protected nextKey() {
		// only works if sorted by key
		// todo: maybe use GUID for item with sortOrder?
		return "_new_" + this._nextKey++;
	}

	reset() {
		super.reset();
		this.items.clear();
	}
}

export const mapfield = (config: MapFieldConfig, ...items: Field[]) => createComponent(new MapField(config.buildField), config, items);