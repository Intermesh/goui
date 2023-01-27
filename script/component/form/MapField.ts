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
	buildField: (value: {[key:string]:any}) => Field

}

export class MapField extends Field {

	rows: MapFieldRow[] = []

	constructor(public buildField: (value: {[key:string]:any}) => Field){
		super('div')
	}

	protected renderControl() {
		// empty
	}

	set value(v: {[key:string]:any}) {
		super.value = v;

		this.items.clear();
		if(v) {
			for(const key in v) {
				const field = this.buildField(v[key]);
				field.value = v[key];
				this.rows.push({key, field, isNew: false});
				this.items.add(field);
			}
		}
	}

	get value(): {[key:string]:any} {
		const v: {[key:string]:any} = {};
		this.rows.forEach(row => {
			v[row.key] = row.field.value;
		})
		return v;
	}

	add(data: any) {
		const row = {
			key: this.nextKey()+"",
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

	nextKey() {
		// only works if sorted by key
		// todo: maybe use GUID for item with sortOrder?
		return this.rows.length ? (+this.rows[this.rows.length-1].key)+1 : 1;
	}

	reset() {
		super.reset();
		this.rows = [];
		this.items.clear();
	}
}

export const mapfield = (config: MapFieldConfig, ...items: Field[]) => createComponent(new MapField(config.buildField), config, items);