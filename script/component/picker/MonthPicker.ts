/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2024 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {comp, Component, ComponentEventMap, createComponent} from "../Component.js";
import {DateTime} from "../../util";
import {Config} from "../Observable.js";
import {fieldset, NumberField, numberfield} from "../form";
import {btn} from "../Button";

export interface MonthPickerEventMap extends ComponentEventMap {
	/**
	 * Fires when a Month is selected
	 */
	select: {
		/**
		 * The selected start date of the month
		 */
		date: DateTime
	}
}

/**
 * Month picker
 *
 * Select a Month of the year
 */
export class MonthPicker extends Component<MonthPickerEventMap> {

	private _value: DateTime
	private now: DateTime

	protected baseCls = "monthpicker"

	private yearField: NumberField;
	private monthMenu: Component;

	constructor() {
		super();
		this._value = new DateTime();
		this.now = new DateTime();

		this.cls = "fit";
		this.items.add(
			fieldset({cls: "fit vbox gap"},

				comp({cls: "group", style: {alignSelf: "center"}},
					btn({
						icon: "chevron_left",
						handler: () => {
							this.yearField.value!--;
						}
					}),
					this.yearField = numberfield({
						decimals: 0,
						value: this.value.getYear(),
						listeners: {
							setvalue: () => {
								this.changeYear();
							}
						}
					}),
					btn({
						icon: "chevron_right",
						handler: () => {
							this.yearField.value!++;
						}
					}),
				),

				this.monthMenu = comp({flex: 1, style: {columns: "4"}})

				)
		)

	}

	set value(v: DateTime) {
		this._value = v;
		this.changeYear();
	}

	get value() {
		return this._value;
	}

	private changeYear() {
		if(!this.yearField) {
			return;
		}
		const curDate = DateTime.createFromFormat(this.yearField.value + "-01-01", "Y-m-d")!;

		const currentMonth = parseInt(this.now.format("m")),
		 currentYear = this.now.getYear();

		this.monthMenu.items.clear();

		const selectedMonth = this.value.format("Y-m")

		for(let month = 1; month < 13; month++) {

			let cls = "";

			if(curDate.format("Y-m") == selectedMonth) {
				cls = "primary filled";
			} else {
				cls = month == currentMonth && this.yearField.value == currentYear ? "primary outlined" : "";
			}


			this.monthMenu.items.add(btn({
				html: curDate.format('F').capitalize(),
				dataSet: {date: curDate.format("Y-m-d")},
				cls,
				handler: btn => {
					this.value = DateTime.createFromFormat(btn.dataSet.date, 'Y-m-d')!
					this.fire("select", {date:this.value});
				}
			}))
			curDate.addMonths(1);
		}
	}
}

/**
 * Create a Month picker
 *
 * Can select a Month of the year
 *
 * @param config
 */
export const monthpicker = (config?: Config<MonthPicker>) => createComponent(new MonthPicker(), config);