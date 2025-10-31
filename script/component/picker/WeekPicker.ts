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

export interface WeekPickerEventMap extends ComponentEventMap {
	/**
	 * Fires when a week is selected
	 */
	select: {
		/**
		 * The selected start date of the week
		 */
		date: DateTime
	}
}


/**
 * Week picker
 *
 * Select a week of the year
 */
export class WeekPicker extends Component<WeekPickerEventMap> {

	private _value: DateTime
	private now: DateTime

	protected baseCls = "weekpicker"

	private yearField: NumberField;
	private weekMenu: Component;

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
						width: 70,
						decimals: 0,
						thousandsSeparator: "",
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

				this.weekMenu = comp({flex: 1, style: {columns: "4"}})

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
		curDate.addDays(-curDate.getWeekDay());
		if(curDate.format("W") != "1") {
			curDate.addDays(7);
		}

		const currentWeek = parseInt(this.now.format("W")),
		 currentYear = this.now.getYear();

		this.weekMenu.items.clear();

		const selectedWeek = this.value.format("Y-W")

		for(let week = 1; week < 53; week++) {

			let cls = "";

			if(curDate.format("Y-W") == selectedWeek) {
				cls = "primary filled";
			} else {
				cls = week == currentWeek && this.yearField.value == currentYear ? "primary outlined" : "";
			}

			this.weekMenu.items.add(btn({
				html: "w"  + week + "&nbsp;<small>" + curDate.format("d M") + "</small>",
				dataSet: {date: curDate.format("Y-m-d")},
				cls,
				handler: btn => {
					this.value = DateTime.createFromFormat(btn.dataSet.date, 'Y-m-d')!
					this.fire("select", {date: this.value});
				}
			}))
			curDate.addDays(7);
		}
	}
}

/**
 * Create a {@link WeekPicker}
 *
 * Can select a week of the year
 *
 * @link https://goui.io/#datepicker Example
 *
 * @param config
 */
export const weekpicker = (config?: Config<WeekPicker>) => createComponent(new WeekPicker(), config);