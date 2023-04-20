/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */

import {Field} from "./Field.js";
import {Config, createComponent} from "../Component.js";
import {btn} from "../Button.js";

interface MapFieldRow {
	field: Field
	key : string
	isNew: boolean
}

interface MapFieldConfig extends Config<Field> {
	/**
	 * Function that returns a new form field for an array item
	 */
	buildField: FieldBuilder

}

type FieldBuilder = (value?: MapFieldValue) => Field;

type MapFieldValue = Record<string, any>;

export class MapField extends Field {

	rows: MapFieldRow[] = []

	constructor(public buildField: FieldBuilder){
		super('div')
	}

	protected renderControl() {
		// empty
	}

	set value(v: MapFieldValue) {
		super.value = v;

		this.items.clear();
		if(v) {
			for(const key in v) {
				this.add(v[key], key);
			}
		}
	}

	get value(): MapFieldValue {
		const v: MapFieldValue = {};
		this.rows.forEach(row => {
			v[row.key] = row.field.value;
		})
		return v;
	}

	public add(data: MapFieldValue, key?:string|undefined) {
		const row = {
			key: key === undefined ? this.nextKey() : key,
			field: this.buildField(data),
			isNew: true
		};
		row.field.items.add(btn({
			icon: "delete",
			handler: button => { this.rows.splice(this.rows.indexOf(row),1); row.field.remove(); }
		}));
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