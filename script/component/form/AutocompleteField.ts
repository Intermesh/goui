import {TextField} from "./TextField.js";
import {Config} from "../Observable.js";
import {CheckboxField} from "./CheckboxField.js";
import {Store, StoreRecord} from "../../data/Store.js";
import {column, Table, table} from "../Table.js";
import {root} from "../Root.js";
import {rowselect} from "../TableRowSelect.js";

/**
 * Text Area component
 *
 * @see Form
 */
export class AutocompleteField extends TextField {

	public displayProperty:string;

	constructor(private table :Table) {
		super();

		this.displayProperty = this.table.columns[0].property;

		this.autocomplete = "off";
		this.baseCls += " autocomplete";
	}

	protected internalRender(): HTMLElement {
		const el = super.internalRender();

		this.input!.addEventListener('input', (ev) => {
			this.onInput(ev as KeyboardEvent);
		})

		this.table.cls = "autocomplete-suggestions";
		this.table.hidden = true;
		this.table.style.position = 'absolute';
		this.table.style.width = '100%';
		this.table.height = 300;
		this.table.style.backgroundColor = "white";

		this.table.rowSelection = true;

		this.table.on("rowclick", (table, rowIndex, ev) => {
			this.value = this.table.store.getRecordAt(rowIndex);
			this.table.hide();
			this.focus();
		});

		this.table.el.addEventListener('keypress', (ev) => {
			const selected = this.table.rowSelection!.selected;
			if(selected.length) {
				this.value = this.table.store.getRecordAt(selected[0]);
			}

			this.table.hide();
			this.focus();
		})

		this.input!.addEventListener('keydown', (ev ) => {

			if((ev as KeyboardEvent).key == 'ArrowDown') {
				this.table.focus();
			}
		});



		return el;
	}


	private onInput(ev: KeyboardEvent) {
		this.showTable();
	}

	private showTable() {
		const rect = this.input!.getBoundingClientRect();

		this.table.el.style.left = rect.x + "px";
		this.table.el.style.top =  rect.bottom + "px";
		this.table.el.style.zIndex = (this.computeZIndex() + 1).toString();
		this.table.width = this.width;

		//must be rendered and visible to get width below
		if (!this.table.rendered) {
			root.items.add(this.table);
		}

		this.table.show();

		//hide menu when clicked elsewhere
		// window.addEventListener("mousedown", (ev) => {
		// 	this.table.hide();
		// }, {once: true});
	}

	set value(v: StoreRecord) {

		if (this.input) {
			this.input.value = v[this.displayProperty] + "";
		}

		this._value = v;
	}

	get value() {
		return this._value;
	}
}

/**
 * Shorthand function to create {@see TextAreaField}
 *
 * @param config
 */
export const autocomplete = (config: Config<AutocompleteField> & {table:Table}) => Object.assign(new AutocompleteField(config.table), config);