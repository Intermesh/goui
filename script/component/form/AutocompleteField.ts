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

		this.setupTable();

		this.input!.addEventListener('keydown', (ev ) => {

			switch((ev as KeyboardEvent).key) {
				case 'ArrowDown':
					this.table.show();
					this.table.focus();
					break;

				case 'Escape':
					if(!this.table.hidden) {
						this.table.hide();
						ev.stopPropagation();
					}
					break;
			}
		});

		return el;
	}


	protected internalRemove() {
		this.table.remove();
		return super.internalRemove();
	}

	private onInput(ev: KeyboardEvent) {
		this.table.show();
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

	private onTableShow() {
		this.el.classList.add("expanded");

		const rect = this.input!.getBoundingClientRect();

		//Align table with input
		this.table.el.style.left = rect.x + "px";
		this.table.el.style.top = rect.bottom + -2 + "px";
		this.table.width = this.width;
		if(!this.table.el.style.zIndex) {
			this.table.el.style.zIndex = (this.computeZIndex() + 1).toString();
		}

		//must be rendered and visible to get width below
		if (!this.table.rendered) {
			root.items.add(this.table);
		}

		//hide menu when clicked elsewhere
		window.addEventListener("mousedown", (ev) => {
			this.table.hide();
		}, {once: true});
	}

	private onTableHide() {
		this.el.classList.remove("expanded");
		this.focus();
	}

	private setupTable() {

		//setup for expanding under input
		this.table.cls = "autocomplete-suggestions";
		this.table.hidden = true;
		this.table.style.position = 'absolute';

		if(!this.table.height) {
			this.table.height = 300;
		}

		this.table.rowSelection = true;

		this.table.on("show",  () => {
			this.onTableShow();
		});

		this.table.on("hide",  () => {
			this.onTableHide();
		});

		// set value on click and enter
		this.table.on("rowclick", (table, rowIndex, ev) => {
			this.value = this.table.store.getRecordAt(rowIndex);
			this.table.hide();
		});

		this.table.el.addEventListener('keydown', (ev) => {
			switch(ev.key) {

				case "Enter":
					const selected = this.table.rowSelection!.selected;
					if (selected.length) {
						this.value = this.table.store.getRecordAt(selected[0]);
					}

					this.table.hide();
				break;

				case 'Escape':
					this.table.hide();
					break;
			}
		})
	}
}

/**
 * Shorthand function to create {@see TextAreaField}
 *
 * @param config
 */
export const autocomplete = (config: Config<AutocompleteField> & {table:Table}) => Object.assign(new AutocompleteField(config.table), config);