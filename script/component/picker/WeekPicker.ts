/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */

import {comp, Component, ComponentEventMap, createComponent} from "../Component.js";
import {DateTime, Format} from "../../util";
import {Config, Listener, ObservableListenerOpts} from "../Observable.js";
import {fieldset, NumberField, numberfield} from "../form";
import {btn} from "../Button";
import {Menu, menu} from "../menu";
import {t} from "../../Translate";

// import {Button} from "../Button";
export interface WeekPickerEventMap<Type> extends ComponentEventMap<Type> {
	'select': (datepicker: Type, date: DateTime|undefined) => false | void
}

export interface WeekPicker extends Component{
	on<K extends keyof WeekPickerEventMap<this>, L extends Listener>(eventName: K, listener: Partial<WeekPickerEventMap<this>>[K], options?: ObservableListenerOpts): L;
	un<K extends keyof WeekPickerEventMap<this>>(eventName: K, listener: Partial<WeekPickerEventMap<this>>[K]): boolean
	fire<K extends keyof WeekPickerEventMap<this>>(eventName: K, ...args: Parameters<WeekPickerEventMap<Component>[K]>): boolean;
}

export class WeekPicker extends Component {

	private _value: DateTime
	private now: DateTime

	protected baseCls = "weekpicker"


	minDate?: DateTime;

	maxDate?: DateTime;

	// private footer: HTMLElement;
	private numberField: NumberField;
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
							this.numberField.value!--;

						}
					}),
					this.numberField = numberfield({
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
							this.numberField.value!++;
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
		if(!this.numberField) {
			return;
		}
		const curDate = DateTime.createFromFormat(this.numberField.value + "-01-01", "Y-m-d")!;
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
				cls = week == currentWeek && this.numberField.value == currentYear ? "primary outlined" : "";
			}

			this.weekMenu.items.add(btn({
				html: "w"  + week + "&nbsp;<small>" + curDate.format("d M") + "</small>",
				dataSet: {date: curDate.format("Y-m-d")},
				cls,
				handler: btn => {
					this.value = DateTime.createFromFormat(btn.dataSet.date, 'Y-m-d')!
					this.fire("select", this, this.value);
				}
			}))
			curDate.addDays(7);
		}
	}
}

export const weekpicker = (config?: Config<WeekPicker, WeekPickerEventMap<WeekPicker>>) => createComponent(new WeekPicker(), config);