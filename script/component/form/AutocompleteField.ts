import {TextField} from "./TextField.js";
import {Config, Observable, ObservableListener, ObservableListenerOpts} from "../Observable.js";
import {StoreRecord} from "../../data/Store.js";
import {Table} from "../Table.js";
import {root} from "../Root.js";
import {FunctionUtil} from "../../util/FunctionUtil.js";
import {FieldEventMap} from "./Field.js";

export interface AutocompleteEventMap<T extends Observable> extends FieldEventMap<T> {
	/**
	 * Fires when suggestions need to load
	 *
	 * @param form
	 */
	autocomplete: <Sender extends T>(field: Sender, input: string) => any
}

export interface AutocompleteField {
	on<K extends keyof AutocompleteEventMap<this>>(eventName: K, listener: Partial<AutocompleteEventMap<this>>[K], options?: ObservableListenerOpts): void

	fire<K extends keyof AutocompleteEventMap<this>>(eventName: K, ...args: Parameters<AutocompleteEventMap<this>[K]>): boolean

	set listeners(listeners: ObservableListener<AutocompleteEventMap<this>>)

}

/**
 * Autocomplete field
 */
export class AutocompleteField extends TextField {

	/**
	 * The property of the selected {@see StoreRecord} to display in the input
	 */
	public displayProperty: string;

	/**
	 *
	 * @param table The table to use for suggestions
	 * @param buffer Buffer typing in the input in ms
	 */
	constructor(readonly table: Table, private buffer = 300) {
		super();

		this.displayProperty = this.table.columns[0].property;

		this.autocomplete = "off";
		this.baseCls += " autocomplete";
	}

	protected internalRender(): HTMLElement {
		const el = super.internalRender();

		this.input!.addEventListener('input', FunctionUtil.buffer(this.buffer, this.onInput.bind(this)))

		this.setupTable();

		this.input!.addEventListener('keydown', (ev) => {

			switch ((ev as KeyboardEvent).key) {
				case 'ArrowDown':
					this.table.show();
					this.table.focus();
					break;

				case 'Escape':
					if (!this.table.hidden) {
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
		this.fire("autocomplete", this, this.input!.value);
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
		if (!this.table.el.style.zIndex) {
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

		if (!this.table.height) {
			this.table.height = 300;
		}

		this.table.rowSelection = {multiSelect: false};

		this.table.on("show", () => {
			this.onTableShow();
		});

		this.table.on("hide", () => {
			this.onTableHide();
		});

		// set value on click and enter
		this.table.on("rowclick", (table, rowIndex, ev) => {
			this.value = this.table.store.get(rowIndex);
			this.table.hide();
		});

		this.table.el.addEventListener('keydown', (ev) => {
			switch (ev.key) {

				case "Enter":
					const selected = this.table.rowSelection!.selected;
					if (selected.length) {
						this.value = this.table.store.get(selected[0]);
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
export const autocomplete = (config: Config<AutocompleteField> & { table: Table }) => Object.assign(new AutocompleteField(config.table), config);