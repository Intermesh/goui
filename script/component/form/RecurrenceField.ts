/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */

import {RecurrencePicker} from "../picker/RecurrencePicker.js";
import {t} from "../../Translate.js";
import {E} from "../../util/Element.js";
import {DateTime} from "../../util/DateTime.js";
import {RecurrenceRule} from "../../util/Recurrence.js";
import {createComponent} from "../Component.js";
import {Field, FieldEventMap} from "./Field.js";
import {btn, Button} from "../Button.js";
import {menu} from "../menu/index.js";
import {Config} from "../Observable";

export class RecurrenceField extends Field {

	private readonly picker: RecurrencePicker
	private readonly pickerButton: Button;

	constructor() {
		super();
		this.picker = new RecurrencePicker(new DateTime());
		this.buttons = [
			this.pickerButton = btn({
				icon: "expand_more",
				menu:
					menu({
							alignTo:  this.el,
							alignToInheritWidth: true
						},
						this.picker
					)
			})
		]
	}

	protected createControl() {
		const input = E('input').attr('type', 'text').attr('readOnly', true).cls('text')
		this.picker.on('select', (_, val) => {

			this.pickerButton.menu!.hide();
			this.clearInvalid();
			this.focus();

			this.value = val;
			input.value = this.toText(val!);
		});
		return input;
	}

	setStartDate(date: DateTime) {
		this.picker.setStartDate(date);
	}

	private toText(rule: RecurrenceRule) {
		const rr = rule;
		if (!rr || !rr.frequency) {
			return t('Not recurring');
		}
		const record = RecurrencePicker.frequencies[rr.frequency];
		if (!record) {
			return "Unsupported frequency: " + rr.frequency;
		}
		let str = record[4];
		if (rr.interval) {
			str = t('Every') + ' ' + rr.interval + ' ' + record[rr.interval > 1 ? 1 : 0];
		}
		if (rr.byDay) {
			let
				days = [],
				workdays = (rr.byDay.length === 5);
			for (var i = 0; i < rr.byDay.length; i++) {
				if (rr.byDay[i].day == 'sa' || rr.byDay[i].day == 'su') {
					workdays = false;
				}
				var nthDay = '';
				if (rr.byDay[i].nthOfPeriod) {
					nthDay = t('the') + ' ' + this.getSuffix(rr.byDay[i].nthOfPeriod!) + ' ';
				}
				days.push(nthDay + DateTime.dayNames[rr.byDay[i].day]);
			}
			if (workdays) {
				days = [t('Workdays')];
			}
			str += (' ' + t('at ') + days.join(', '));
		}
		if (rr.byMonthDay) {
			str += (' ' + t('at day') + ' ' + rr.byMonthDay.join(', '))
		}

		if (rr.count) {
			str += ', ' + rr.count + ' ' + t('times');
		}
		if (rr.until) {
			str += ', ' + t('until') + ' ' + (new DateTime(rr.until)).format("d-m-Y");
		}
		return str;
	}

	private getSuffix(week: number) {
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
}

/**
 * Shorthand function to create {@see RecurrenceField}
 *
 * @param config
 */
export const recurrencefield = (config?: Config<RecurrenceField, FieldEventMap<RecurrenceField>>) => createComponent(new RecurrenceField(), config);