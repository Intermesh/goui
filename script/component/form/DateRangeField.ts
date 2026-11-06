import {Field, FieldConfig} from "./Field.js";
import {Button, btn} from "../Button.js";
import {Menu, menu} from "../menu/index.js";
import {t} from "../../Translate.js";
import {DatePicker, datepicker} from "../picker/index.js";
import {DateTime, Format} from "../../util/index.js";
import {comp, Component, createComponent, hr} from "../Component.js";

/**
 * Relative periods of the {@link DateRangeField} menu
 */
export type DateRangePreset = "today" | "yesterday" | "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth" | "thisYear";

/**
 * Date range field
 *
 * Used to select a date range. The value format is:
 *
 * "YYYY-MM-DD..YYYY-MM-DD"
 *
 * When a relative period like "This month" is chosen, {@link preset} is set. Store it instead of the value to
 * restore the period relative to the current date later with {@link setPreset}.
 *
 * @link https://goui.io/#form/DateTime Example
 */
export class DateRangeField extends Field {
	private button: Button;
	private startPicker: DatePicker;
	private endPicker: DatePicker	;

	private static f = "Y-m-d";
	private valueDisplay: Component;
	private fromPicker: DatePicker;
	private untilPicker: DatePicker;

	/**
	 * The relative period that produced the current value. Undefined when the value was set otherwise.
	 */
	public preset?: DateRangePreset;

	private applyingPreset = false;

	constructor() {
		super();

		this.startPicker = datepicker();

		this.startPicker.el.addEventListener("mouseup" , (ev) => {
			// prevent closing of the menu when clicking start date
			ev.stopPropagation();
		})

		this.endPicker = datepicker();

		this.endPicker.on("select", () => {
			this.value = this.startPicker.value.format(DateRangeField.f) +
				".." +
				this.endPicker.value.format(DateRangeField.f);

			this.fireChange(false);
		})


		this.fromPicker = datepicker();
		this.fromPicker.on("select", () => {
			this.value = ">=" + this.fromPicker.value.format(DateRangeField.f);

			this.fireChange(false);
		})
		this.untilPicker = datepicker();
		this.untilPicker.on("select", () => {
			this.value = "<" + this.untilPicker.value.addDays(1).format(DateRangeField.f);


			this.fireChange(false);
		})


		this.button = this.createButton();
		this.el.attr('for', this.button.id);


		this.baseCls += " date-range";

		this.valueDisplay = comp({cls: "value-display"});
		this.items.add(this.valueDisplay);

		this.buttons = [
			btn({
				icon: "clear",
				handler: ()=>{
					this.value = undefined;
					this.fireChange(false);
				}
			}),

			this.button
		];

		this.el!.addEventListener('keydown', (ev) => {

			switch (ev.key) {

				case 'ArrowDown':
					ev.preventDefault();
					this.button.menu!.show();
					this.button.menu!.focus();
					break;

				case 'Escape':
					this.button.menu!.close();
					ev.preventDefault();
					ev.stopPropagation();


					break;
			}
		});
	}


	protected get itemContainerEl() :HTMLElement{
		return this.inputWrap;
	}

	public setToday() {
		const today = new DateTime();

		this.startPicker.value = today;
		this.endPicker.value = today;

		this.value = this.startPicker.value.format(DateRangeField.f) +
			".." +
			this.endPicker.value.format(DateRangeField.f);
	}

	public setYesterday() {
		const yesterday =( new DateTime()).addDays(-1);

		this.startPicker.value = yesterday;
		this.endPicker.value = yesterday;

		this.value = this.startPicker.value.format(DateRangeField.f) +
			".." +
			this.endPicker.value.format(DateRangeField.f);
	}

	public setThisWeek() {
		const today = new DateTime(),
			weekDay = parseInt(today.format('N')),
			thisWeekStart = (new DateTime(today)).addDays((weekDay - 1) * -1),
			thisWeekEnd = thisWeekStart.clone().addDays(6);
		this.startPicker.value = thisWeekStart;
		this.endPicker.value = thisWeekEnd;

		this.value = this.startPicker.value.format(DateRangeField.f) +
			".." +
			this.endPicker.value.format(DateRangeField.f);
	}

	public setLastWeek() {
		const today = new DateTime(),
			weekDay = parseInt(today.format('N')),
			thisWeekStart = (new DateTime(today)).addDays(((weekDay - 1) * -1) - 7),
			thisWeekEnd = thisWeekStart.clone().addDays(6);
		this.startPicker.value = thisWeekStart;
		this.endPicker.value = thisWeekEnd;

		this.value = this.startPicker.value.format(DateRangeField.f) +
			".." +
			this.endPicker.value.format(DateRangeField.f);
	}

	private createButton() {
		return btn({
			flex: 1,
			icon: "expand_more",
			id: "dr-" + Component.uniqueID(),
			menu: menu({
					alignToInheritWidth: true,
					alignTo: this.el
				},
				btn({
					text: t("Today"),
					handler: () => {
						this.setPreset("today");
						this.fireChange(false);
					}
				}),

				btn({
					text: t("Yesterday"),
					handler: () => {
						this.setPreset("yesterday");
						this.fireChange(false);
					}
				}),

				btn({
					text: t("This week"),
					handler: () => {
						this.setPreset("thisWeek");
						this.fireChange(false);
					}
				}),

				btn({
					text: t("Last week"),
					handler: () => {
						this.setPreset("lastWeek");
						this.fireChange(false);
					}
				}),

				btn({
					text: t("This month"),
					handler: () => {
						this.setPreset("thisMonth");
						this.fireChange(false);
					}
				}),

				btn({
					text: t("Last month"),
					handler: () => {
						this.setPreset("lastMonth");
						this.fireChange(false);
					}
				}),

				btn({
					text: t("This year"),
					handler: () => {
						this.setPreset("thisYear");
						this.fireChange(false);
					},
					menu: new DateRangeFieldYearMenu(this)
				}),


				btn({
					text: t("Year"),
					menu: menu({}, ...this.yearsMenu())
				}),

				hr(),

				btn({
					text: t("Custom"),
					menu: menu({},
						comp({cls: "hbox"},
							this.startPicker, this.endPicker
						)
					)
				}),

				btn({
					text: t("From"),
					menu: menu({},
						this.fromPicker
					)
				}),

				btn({
					text: t("Until"),
					menu: menu({},
						this.untilPicker
					)
				}),

			)
		});
	}

	protected internalSetValue(v?: any) {
		if (!this.applyingPreset) {
			this.preset = undefined;
		}
		super.internalSetValue(v);

		if (!v) {
			this.valueDisplay.text = "";
		} else {

			if(v.indexOf("..") > -1) {
				const parts = v.split("..");

				const date1 = DateTime.createFromFormat(parts[0], DateRangeField.f)

				if (date1) {
					this.valueDisplay.text = Format.smartDateTime(date1, false);//.format(Format.dateFormat);

					if (parts[0] != parts[1]) {
						const date2 = DateTime.createFromFormat(parts[1], DateRangeField.f);

						if (date2) {
							this.valueDisplay.text += " - " + Format.smartDateTime(date2, false);//.format(Format.dateFormat);
						}
					}
				}
			} else {
				if (v.substring(0, 2) == ">=") {
					const date = DateTime.createFromFormat(v.substring(2, v.length), DateRangeField.f);

					if (date) {
						this.valueDisplay.text = "> " + Format.smartDateTime(date, false);//.format(Format.dateFormat)
					}
				} else if(v.substring(0,2) == "<=") {
					const date = DateTime.createFromFormat(v.substring(2,v.length) , DateRangeField.f);

					if(date) {
						this.valueDisplay.text = "<= " + Format.smartDateTime(date, false);
					}

				}else if(v.substring(0,1) == "<") {
					const date = DateTime.createFromFormat(v.substring(1,v.length) , DateRangeField.f);

					if(date) {
						this.valueDisplay.text = "<= " + Format.smartDateTime(date.addDays(-1), false);//.format(Format.dateFormat)
					}
				}else if(v.substring(0,1) == ">") {
					const date = DateTime.createFromFormat(v.substring(1,v.length) , DateRangeField.f);

					if(date) {
						this.valueDisplay.text = ">= " + Format.smartDateTime(date.addDays(-1), false);//.format(Format.dateFormat)
					}
				}
			}
		}

		if (v && this.preset) {
			// show that the period is relative to the current date
			this.valueDisplay.text = DateRangeField.presetText(this.preset);
		}
	}

	private static presetText(preset: DateRangePreset): string {
		switch (preset) {
			case "today":
				return t("Today");
			case "yesterday":
				return t("Yesterday");
			case "thisWeek":
				return t("This week");
			case "lastWeek":
				return t("Last week");
			case "thisMonth":
				return t("This month");
			case "lastMonth":
				return t("Last month");
			case "thisYear":
				return t("This year");
		}
	}

	/**
	 * Set the value to a period relative to the current date and remember it in {@link preset}
	 *
	 * @param preset eg. "thisMonth"
	 */
	public setPreset(preset: DateRangePreset) {
		this.applyingPreset = true;
		this.preset = preset;
		try {
			switch (preset) {
				case "today":
					this.setToday();
					break;
				case "yesterday":
					this.setYesterday();
					break;
				case "thisWeek":
					this.setThisWeek();
					break;
				case "lastWeek":
					this.setLastWeek();
					break;
				case "thisMonth":
					this.setMonth();
					break;
				case "lastMonth":
					const lastMonth = new DateTime();
					// first day of the month to prevent overflow on the 31st
					lastMonth.setMonthDay(1).addMonths(-1);
					this.setMonth(lastMonth.getMonth(), lastMonth.getYear());
					break;
				case "thisYear":
					this.setYear();
					break;
				default:
					this.preset = undefined;
			}
		} finally {
			this.applyingPreset = false;
		}
	}

	/**
	 * Set the month
	 *
	 * @param month 1 - 12
	 * @param year eg. 2024
	 * @private
	 */
	public setMonth(month?:number, year?:number) {
		const today = new DateTime();
		if(!year) {
			year = today.getYear()
		}
		if(!month) {
			month = today.getMonth()
		}

		this.startPicker.value = DateTime.createFromFormat(year + "-" + month + "-01", "Y-n-d")!;
		this.endPicker.value = this.startPicker.value.clone().addMonths(1).addDays(-1);

		this.value = this.startPicker.value.format(DateRangeField.f) +
			".." +
			this.endPicker.value.format(DateRangeField.f);

	}

	/**
	 * Set the year
	 *
	 * @param year eg. 2024
	 * @private
	 */
	public setYear(year?:number) {
		const today = new DateTime();
		if(!year) {
			year = today.getYear()
		}

		this.startPicker.value = DateTime.createFromFormat(year + "-01-01", "Y-n-d")!;
		this.endPicker.value = this.startPicker.value.clone().addYears(1).addDays(-1);

		this.value = this.startPicker.value.format(DateRangeField.f) +
			".." +
			this.endPicker.value.format(DateRangeField.f);

	}

	public setQuarter(q:number, year?:number) {
		const today = new DateTime();
		if(!year) {
			year = today.getYear()
		}

		const month = ((q - 1) * 3)  + 1, dateStr = year + "-" + month + "-01";

		this.startPicker.value = DateTime.createFromFormat(dateStr, "Y-n-d")!;
		this.endPicker.value = this.startPicker.value.clone().addMonths(3).addDays(-1);

		this.value = this.startPicker.value.format(DateRangeField.f) +
			".." +
			this.endPicker.value.format(DateRangeField.f);

	}

	private yearsMenu() {
		const years = [];

		for(let year = (new Date()).getFullYear() - 1, minYear = year - 8; year > minYear; year--) {
			years.push(
				btn({
					text: year +"",
					handler: () => {
						this.setYear(year);
					},
					menu: new DateRangeFieldYearMenu(this, year)
				})
			);
		}

		return years;
	}
}



class DateRangeFieldYearMenu extends Menu {

	constructor(public readonly field: DateRangeField, public readonly year?: number) {
		super();

		if(!this.year) {
			this.year = (new DateTime()).getYear();
		}

		this.items.add(
			btn({
				text: "Q1",
				handler: () => {
					this.field.setQuarter( 1, this.year!);
				},

				menu: menu({},
					btn({
						text: t("January"),
						handler: () => {
							this.field.setMonth(1, this.year);
						}
					}),
					btn({
						text: t("February"),
						handler: () => {
							this.field.setMonth(2, this.year);
						}
					}),
					btn({
						text: t("March"),
						handler: () => {
							this.field.setMonth(3, this.year);
						}
					})
				)
			}),



			btn({
				text: "Q2",
				handler: () => {
					this.field.setQuarter( 2, this.year!);
				},

				menu: menu({},
					btn({
						text: t("April"),
						handler: () => {
							this.field.setMonth(4, this.year);
						}
					}),
					btn({
						text: t("May"),
						handler: () => {
							this.field.setMonth(5, this.year);
						}
					}),
					btn({
						text: t("June"),
						handler: () => {
							this.field.setMonth(6, this.year);
						}
					})
				)
			}),


			btn({
				text: "Q3",
				handler: () => {
					this.field.setQuarter( 3, this.year!);
				},

				menu: menu({},
					btn({
						text: t("July"),
						handler: () => {
							this.field.setMonth(7, this.year);
						}
					}),
					btn({
						text: t("August"),
						handler: () => {
							this.field.setMonth(8, this.year);
						}
					}),
					btn({
						text: t("September"),
						handler: () => {
							this.field.setMonth(9, this.year);
						}
					})
				)
			}),



			btn({
				text: "Q4",
				handler: () => {
					this.field.setQuarter( 4, this.year!);
				},

				menu: menu({},
					btn({
						text: t("October"),
						handler: () => {
							this.field.setMonth(10, this.year);
						}
					}),
					btn({
						text: t("November"),
						handler: () => {
							this.field.setMonth(11, this.year);
						}
					}),
					btn({
						text: t("December"),
						handler: () => {
							this.field.setMonth(12, this.year);
						}
					})
				)
			})
		)
	}
}

/**
 * Shorthand function to create {@link DateRangeField}
 *
 * @link https://goui.io/#form/DateTime Example
 *
 * @param config
 */
export const daterangefield = (config?: FieldConfig<DateRangeField>) => createComponent(new DateRangeField(), config);
