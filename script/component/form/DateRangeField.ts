import {Field, FieldConfig, FieldEventMap} from "./Field";
import {btn, Button} from "../Button";
import {Menu, menu} from "../menu";
import {t} from "../../Translate";
import {DatePicker, datepicker} from "../picker";
import {DateTime, Format} from "../../util";
import {comp, createComponent, hr} from "../Component";
import {DateField} from "./DateField";

export class DateRangeField extends Field {
	private button: Button;
	private startPicker: DatePicker;
	private endPicker: DatePicker	;

	private static f = "Y-m-d";
	constructor() {
		super();

		this.startPicker = datepicker();
		this.endPicker = datepicker();

		this.endPicker.on("select", (datepicker, date) => {
			this.value = this.startPicker.value.format(DateRangeField.f) +
				".." +
				this.endPicker.value.format(DateRangeField.f);

			this.button.menu?.close()

			this.fireChange();
		})

		this.button = this.createButton();

		this.items.add(this.button);
	}

	protected createControl(): HTMLElement | undefined {
		return super.createControl();
	}

	private createButton() {
		return btn({
			flex: 1,
			menu: menu({
					alignToInheritWidth: true
				},
				btn({
					text: t("Today"),
					handler: () => {

						const today = new DateTime();

						this.startPicker.value = today;
						this.endPicker.value = today;

						this.value = this.startPicker.value.format(DateRangeField.f) +
							".." +
							this.endPicker.value.format(DateRangeField.f);

						this.fireChange();
					}
				}),

				btn({
					text: t("Yesterday"),
					handler: () => {

						const yesterday =( new DateTime()).addDays(-1);

						this.startPicker.value = yesterday;
						this.endPicker.value = yesterday;

						this.value = this.startPicker.value.format(DateRangeField.f) +
							".." +
							this.endPicker.value.format(DateRangeField.f);

						this.fireChange();
					}
				}),

				btn({
					text: t("This week"),
					handler: () => {

						const today = new DateTime(),
							weekDay = parseInt(today.format('N')),
							thisWeekStart = (new DateTime(today)).addDays((weekDay - 1) * -1),
							thisWeekEnd = thisWeekStart.clone().addDays(6);
						this.startPicker.value = thisWeekStart;
						this.endPicker.value = thisWeekEnd;

						this.value = this.startPicker.value.format(DateRangeField.f) +
							".." +
							this.endPicker.value.format(DateRangeField.f);
						this.fireChange();
					}
				}),

				btn({
					text: t("Last week"),
					handler: () => {

						const today = new DateTime(),
							weekDay = parseInt(today.format('N')),
							thisWeekStart = (new DateTime(today)).addDays(((weekDay - 1) * -1) - 7),
							thisWeekEnd = thisWeekStart.clone().addDays(6);
						this.startPicker.value = thisWeekStart;
						this.endPicker.value = thisWeekEnd;

						this.value = this.startPicker.value.format(DateRangeField.f) +
							".." +
							this.endPicker.value.format(DateRangeField.f);
						this.fireChange();
					}
				}),

				btn({
					text: t("This month"),
					handler: () => {
						this.setMonth();
					}
				}),

				btn({
					text: t("Last month"),
					handler: () => {
						this.setMonth(parseInt((new DateTime()).format("m")) - 1);
					}
				}),

				btn({
					text: t("This year"),
					handler: () => {
						this.setYear();
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


				hr(),

				btn({
					text: t("Clear"),
					handler: () => {
						this.value = undefined;
						this.fireChange();
					}
				})
			)
		});
	}




	protected internalSetValue(v?: any) {
		super.internalSetValue(v);

		if(!v) {
			this.button.text = "";
		} else {
			//const parts = v.split("..");

			this.button.text = v;
		}




	}

	private updateBtnText() {
		if(this.value == null) {
			this.button.text = "";
			return;
		}
		this.button.text = Format.date(this.startPicker.value) + ' - ' + Format.date(this.endPicker.value);

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

		this.fireChange();
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

		this.fireChange();
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

		this.fireChange();
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
 * Shorthand function to create {@see DateField}
 *
 * @param config
 */
export const daterangefield = (config?: FieldConfig<DateRangeField, FieldEventMap<DateRangeField>>) => createComponent(new DateRangeField(), config);
