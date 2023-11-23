/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */

import {Field, FieldEventMap} from "./Field.js";
import {createComponent} from "../Component.js";
import {btn} from "../Button.js";
import {Config} from "../Observable";

interface MapFieldRow {
	field?: Field
	key: string
	isNew: boolean,
	remove: () => void
}

type MapFieldConfig = Config<MapField, FieldEventMap<MapField>, "buildField">;

type FieldBuilder = (value: MapFieldValue|undefined, row: MapFieldRow) => Field;

type MapFieldValue = Record<string, any>;

export class MapField extends Field {

	private rows: MapFieldRow[] = []

	/**
	 * Set to the name of the field holding the key. If not given a key will be generated.
	 */
	public keyFieldName?: string;

	constructor(public buildField: FieldBuilder) {
		super('div')
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
		this.rows.forEach(row => {
			const rowValue = row.field!.value;
			let key = row.key;
			if(this.keyFieldName && rowValue[this.keyFieldName]) {
				key = rowValue[this.keyFieldName];
				delete rowValue[this.keyFieldName];
			}
			v[key] = rowValue;
		})
		return v;
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
		const row: MapFieldRow = {
			key: key === undefined ? this.nextKey() : key,
			field: undefined,
			isNew: true,
			remove: () => {
				this.rows.splice(this.rows.indexOf(row), 1);
				row.field!.remove();
			}
		};

		row.field = this.buildField(data, row);


		row.field.value = data;
		this.rows.push(row);
		this.items.add(row.field);
	}

	private _nextKey = 1;

	protected nextKey() {
		// only works if sorted by key
		// todo: maybe use GUID for item with sortOrder?
		return "_new_" + this._nextKey++;
	}

	reset() {
		super.reset();
		this.rows = [];
		this.items.clear();
	}
}

export const mapfield = (config: MapFieldConfig, ...items: Field[]) => createComponent(new MapField(config.buildField), config, items);