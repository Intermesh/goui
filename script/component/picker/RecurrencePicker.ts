/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */


import {comp, Component} from "../Component.js";
import {DateTime} from "../../util/DateTime.js";
import {t} from "../../Translate.js";
import {btn} from "../Button.js";
import {select, SelectField} from "../form/SelectField.js";
import {textfield} from "../form/TextField.js";
import {DateField, datefield} from "../form/DateField.js";
import {Form, form} from "../form/Form.js";
import {tbar} from "../Toolbar.js";
import {CheckboxField} from "../form/CheckboxField.js";
import {Frequency, RecurrenceRule} from "../../util/Recurrence.js";
import {ObservableListenerOpts} from "../Observable.js";
import {NumberField, numberfield} from "../form/NumberField.js";
import {Field} from "../form/Field.js";
import {CardContainer, CardContainerEventMap} from "../CardContainer.js";
import {Menu} from "../menu/Menu.js";
import {checkboxgroup} from "../form/index.js";

export interface RecurrencePickerEventMap<Type> extends CardContainerEventMap<Type> {

	select: (picker: Type, rule: RecurrenceRule | null) => false | void
}

export interface RecurrencePicker {
	on<K extends keyof RecurrencePickerEventMap<this>>(eventName: K, listener: Partial<RecurrencePickerEventMap<this>>[K], options?: ObservableListenerOpts): void;

	fire<K extends keyof RecurrencePickerEventMap<this>>(eventName: K, ...args: Parameters<RecurrencePickerEventMap<Component>[K]>): boolean;
}

type FrequencyDefaults = [text: string, plural: string, repeatDefault: number, untilDefault: string, frequencyText: string]

export class RecurrencePicker extends CardContainer {

	protected baseCls = "recurrencepicker";

	form: Form
	menu: Component
	weekOfMonth = 1

	startDate: DateTime

	count: NumberField
	until: DateField

	rule!: RecurrenceRule | null

	static frequencies: { [freq: string]: FrequencyDefaults } = {
		'daily': [t("day"), t('days'), 30, '30-d', t('Daily')],
		'weekly': [t("week"), t('weeks'), 13, '91-d', t('Weekly')],
		'monthly': [t("month"), t('months'), 12, '1-y', t('Monthly')],
		'yearly': [t("year"), t('years'), 5, '5-y', t('Annually')]
	}

	constructor(startDate: DateTime) {
		super();
		this.startDate = startDate;
		this.width = 450;
		// value = current weekday?

		const weeklyOptions = checkboxgroup({
			itemId: 'weeklyOptions',
			label: "Weekdays",
			options: [0, 1, 2, 3, 4, 5, 6].map(i => {
				return {label: DateTime.dayNames[DateTime.dayMap[i]].substring(0, 2), name: DateTime.dayMap[i]}
			})
		})

		this.menu = comp({}, ...this.quickMenuItems());

		const frequencyField = select({
			name: 'frequency',
			itemId: 'frequency',
			width: 120,
			textRenderer: r => (this.form.findChild('interval')! as Field).value == 1 ? r.text : r.plural,
			options: Object.keys(RecurrencePicker.frequencies).map(k => ({
				value: k,
				text: RecurrencePicker.frequencies[k as Frequency][0],
				plural: RecurrencePicker.frequencies[k as Frequency][1]
			})),
			listeners: {
				'change': (me, v) => {
					this.changeFrequency(v);
				}
			}
		});
		this.count = numberfield({
			itemId: 'repeatCount',
			name: 'count',
			hidden: true,
			max: 1000,
			width: 80,
			value: 13,
			decimals: 0,
			hint: t('times') // should be suffix
		});
		this.until = datefield({
			itemId: 'endDate',
			name: 'until',
			width: 160,
			hidden: true,
			required: false
		});
		this.form = form({},
			comp({cls: 'flow'},
				comp({text: t('Every')}),
				numberfield({
					decimals: 0,
					name: 'interval',
					itemId: 'interval',
					min: 1,
					width: 50,
					value: 1,
					listeners: {
						'setvalue': (me, newVal, oldVal) => {
							if (oldVal == 1 && newVal != 1 || oldVal != 1 && newVal == 1) {
								frequencyField.drawOptions();
							}
						}
					}
				}),
				frequencyField,
				select({
					hidden: true,
					disabled: true,
					name: 'monthlyType',
					itemId: 'monthlyOptions',
					label: t('at the'),
					width: 120,
					value: 'byMonthDay',
					options: [
						{value: 'byMonthDay', name: this.startDate.format('jS')},
						{value: 'byDay', name: this.getSuffix() + ' ' + this.startDate.format('l')}
					]
				}),
				weeklyOptions,
				textfield({
					hidden: true, name: 'byDay', listeners: {
						'change': (fld, val) => {
							for (let j = 0; j < 7; j++) {
								const cb = weeklyOptions.items.get(j) as CheckboxField;
								cb.value = val.indexOf(cb.name) !== -1;
							}
						}
					}
				}),
				comp({cls: 'flow'},
					comp({html: t("Ends")}),
					select({
						width: 100,
						name: 'endsRadio',
						value: 'forever',
						textRenderer: r => r.text,
						options: [
							{text: t("Never"), value: 'forever'},
							{text: t("After"), value: 'count'},
							{text: t("At"), value: 'until'}
						],
						listeners: {
							'setvalue': (me, v) => {
								this.count.hidden = this.count.disabled = (v != 'count');
								this.until.hidden = this.until.disabled = (v != 'until');
							}
						}
					})
				),
				this.count,
				this.until
			),
			tbar({},
				btn({
					text: t('Back'),
					handler: b => this.activeItem = 0
				}),
				comp({flex: 1}),
				btn({
					text: t('Ok'),
					handler: (btn) => {
						this.setValue(this.createCustomRule(this.form.value));
						(this.parent! as Menu).close();
						this.activeItem = 0
					}
				})
			)
		)
		this.items.add(this.menu, this.form);
	}

	quickMenuItems() {
		return [
			btn({
				text: t('Not recurring'),
				handler: _ => this.setValue(null)
			}),
			comp({tagName: 'hr'}),
			btn({
				text: t('Daily'),
				handler: _ => this.setValue({frequency: 'daily'})
			}),
			btn({
				text: t('Weekly') + ' ' + t('at ') + this.startDate.format('l'),
				handler: _ => this.setValue({frequency: 'weekly'})
			}),
			btn({
				text: t('Monthly') + ' ' + t('at day') + ' ' + this.startDate.format('j'),
				handler: _ => this.setValue({frequency: 'monthly', byMonthDay: [+this.startDate.format('j')]})
			}),
			btn({
				text: t('Monthly') + ' ' + t('at the') + ' ' + this.getSuffix() + ' ' + this.startDate.format('l'),
				handler: _ => this.setValue({
					frequency: 'monthly',
					byDay: [{day: DateTime.dayMap[this.startDate.getWeekDay()], nthOfPeriod: this.weekOfMonth}]
				})
			}),
			btn({
				text: t('Annually') + ' ' + t('at ') + this.startDate.format('j F'),
				handler: _ => this.setValue({frequency: 'yearly'})
			}),
			btn({
				text: t('Each working day'),
				handler: _ => this.setValue({
					frequency: 'weekly',
					byDay: [{day: 'mo'}, {day: 'tu'}, {day: 'we'}, {day: 'th'}, {day: 'fr'}]
				})
			}),
			comp({tagName: 'hr'}),
			btn({
				text: t('Customize') + '...', handler: () => {
					// collapse menu, open form
					this.changeFrequency(this.rule?.frequency || 'yearly');
					this.activeItem = 1;
				}
			})
		];
	}

	createCustomRule(values: any) {
		const rule = {frequency: values.frequency} as RecurrenceRule;
		if (values.interval != 1) rule.interval = values.interval;
		if (values.until) rule.until = values.until;
		if (values.count) rule.count = values.count;
		if (values.monthlyType) {
			switch (values.monthlyType) {
				case 'byMonthDay':
					rule.byMonthDay = [parseInt(this.startDate.format('j'))];
					break;
				case 'byDay':
					rule.byDay = [{
						day: DateTime.dayMap[this.startDate.getWeekDay()],
						nthOfPeriod: this.weekOfMonth
					}];
					break;
			}
		}
		return rule;
	}

	setStartDate(date: DateTime) {
		this.startDate = date.clone();
		for (var i = 0, m = date.getMonth(); m == date.getMonth(); date = date.addDays(-7)) {
			i++;
		}
		this.weekOfMonth = i;
		this.menu.items.clear().add(...this.quickMenuItems());
	}

	changeFrequency(f: Frequency) {
		const record = RecurrencePicker.frequencies[f]; // 2 = repeat default, 3 = untildefault
		// set defaults for endAt fields
		(this.form.findChild('frequency')! as Field).value = f;
		var repeat = this.count
		if (repeat.disabled) {
			repeat.value = record[2]; // repeatDefault
		}
		var until = this.until;
		if (until.disabled) {
			var add: string[] = record[3].split('-'); // untilDefault
			add[1] == 'd' ? this.startDate.addDays(parseInt(add[0])) : this.startDate.addYears(parseInt(add[0]))
			until.value = this.startDate.format('Y-m-d');
		}

		// show-n-hide option panels for week and month frequency
		['weekly', 'monthly'].map(p => {
			const el = this.form.findChild(p + 'Options')!;
			el.hidden = (p != f);
			el.disabled = (p != f);
		});
	}

	private getSuffix(week?: number) {
		week = week || this.weekOfMonth;
		switch (week) {
			case 1:
				return t("first");
			case 2:
				return t("second");
			case 3:
				return t("third");
			case 4:
				return t("fourth");
			default:
				return t("last");
		}
	}

	setValue(rrule: RecurrenceRule | null) {
		if (this.rule == rrule) return;
		this.rule = rrule;
		this.fire('select', this, rrule);

		const form = this.form;
		if (rrule && rrule.frequency) {
			form.value = rrule;
			this.changeFrequency(rrule.frequency);
			if (rrule.until) {
				form.findField('endsRadio')!.value = 'until';
				//form.value = {until: rrule.until};
			} else if (rrule.count) {
				form.findField('endsRadio')!.value = 'count';
				//form.value = {count: rrule.count};
			}
			if (rrule.byDay) {
				form.findField('monthlyOptions')!.value = 'byDay';
			}
			if (rrule.byMonthDay) {
				form.findField('monthlyOptions')!.value = 'byMonthDay';
			}
		}
	}
}