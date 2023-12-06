/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */
import {DateTime} from "./DateTime.js";

interface RecurrenceConfig {
	rule: RecurrenceRule
	dtstart: Date
	ff: Date
}

type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>

type NDay = { day: string, nthOfPeriod?: number };
export type Frequency = "yearly" | "monthly" | "weekly" | "daily" //| "hourly"
type DayOfWeek = 'mo' | 'tu' | 'we' | 'th' | 'fr' | 'sa' | 'su'
export type RecurrenceRule = {
	frequency: Frequency
	interval?: number
	skip?: 'omit' | 'backward' | 'forward'
	firstDayOfWeek?: DayOfWeek
	count?: number
	until?: string
	byDay?: NDay[]
	byMonthDay?: number[]
	byMonth?: string[] //'1'= january
	bySetPosition?: number[]
	byWeekNo?: number[]
	byYearDay?: number[]
	byHour?: number[]
}

/**
 * Class for looping date for Recurrence Rule
 *
 * @category Utility
 */
export class Recurrence {

	static dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

	completed?: boolean
	rule: RecurrenceRule & { interval: number }
	dtstart: Date
	until?: Date
	current: DateTime
	last?: DateTime
	occurrence: number = 0
	indices = {
		"BYSECOND": 0,
		"BYMINUTE": 0,
		"BYHOUR": 0,
		"BYDAY": 0,
		"BYMONTH": 0,
		"BYWEEKNO": 0,
		"BYMONTHDAY": 0
	}

	private dayNb(shortName: string) {
		return {'mo': 1, 'tu': 2, 'wo': 3, 'th': 4, 'fr': 5, 'sa': 6, 'su': 0}[shortName];
	}

	private nDayHas(date: DateTime) {
		// todo: change date.getDay() to 'mo' or 'su' and find period type in rrule and nthOfPeriod in date
		for (const d of this.rule.byDay!) {
			if (this.dayNb(d.day) === date.getDay() && d.nthOfPeriod == 1) return true;
		}
		return false;
	}

	constructor(config: RecurrenceConfig) {
		config.rule.interval ||= 1; // default;
		//@ts-ignore
		this.rule = config.rule;
		this.dtstart = config.dtstart;
		this.current = new DateTime(+this.dtstart);
		if(config.rule.until)
			this.until = new Date(config.rule.until.replace('T', ' '))
		this.occurrence++; // i'm counting the dtstart as first occurence
		this.validate(this.rule);

		if (config.ff) {
			while (this.current.date < config.ff && this.next()) {
				// fast forwarding
				//console.log('ff ', this.current.date);
			}
		}
	}

	next() {
		let previous = (this.last ? this.last.clone() : null);

		if ((this.rule.count && this.occurrence >= this.rule.count) ||
			(this.until && this.current.date > this.until)) {
			return null;
		}

		// if (this.occurrence == 0 && this.current >= this.dtstart) {
		// 	this.occurrence++;
		// 	return this.current;
		// }

		switch (this.rule.frequency) {
			// case "secondly":
			//   this.nextSecondly();
			//   break;
			// case "minutely":
			//   this.nextMinutely();
			//   break;
			// case "hourly":
			// 	 this.nextHourly();
			// 	 break;
			case "daily":
				this.nextDaily();
				break;
			case "weekly":
				this.nextWeekly();
				break;
			case "monthly":
				this.nextMonthly();
				break;
			case "yearly":
				this.nextYearly();
				break;

			default:
				return null;
		}

		if (this.current == previous) {
			throw new Error('Recursion isn\'t going anywhere');
		}
		this.last = this.current;
		if (this.until && this.current.date > this.until) {
			return null;
		} else {
			this.occurrence++;
			//console.log(this.occurrence);
			return this.current;
		}
	}

	// private nextHourly() {
	// 	this.current.setHours(this.current.getHours() + this.rule.interval);
	// }

	private nextDaily() {
		if (!this.rule.byDay) {
			this.current.addDays(this.rule.interval);
			return;
		}
		do {
			this.current.addDays(this.rule.interval);
		} while (
			!this.nDayHas(this.current) ||
			!this.rule.byMonth!.includes("" + this.current.getMonth())
			);
	}

	private nextWeekly() {
		if (!this.rule.byDay) {
			this.current.addDays(this.rule.interval * 7);
			return;
		}
		do {
			this.current.addDays(1);
			if (Recurrence.dayMap[this.current.getDay()].toLowerCase() === this.rule.firstDayOfWeek) { // role over week
				this.current.addDays(this.rule.interval * 7);
				this.current.setDay(this.dayNb(this.rule.firstDayOfWeek)!); // TODO: test
			}
		} while (!this.nDayHas(this.current));
	}

	private nextMonthly() {
		this.current.addMonths(this.rule.interval);
	}

	private nextYearly() {
		if (!this.rule.byMonth) {
			this.current.addYears(this.rule.interval);
			return
		} else {
			throw new Error('Not yet supported')
		}
	}


	private validate(p: RecurrenceRule) {
		// if('byDay' in p) {
		// 	this.sortByDay(p.byDay, this.rule.wkst);
		// }
		if ('byYearDay' in p && ('byMonth' in p || 'byWeek' in p || 'byMonthDay' in p || 'byDay' in p)) {
			throw new Error('Invalid byYearday rule');
		}
		if ("byWeekNo" in p && "byMonthDay" in p) {
			throw new Error('byWeekNo does not fit to byMonthDay');
		}
		if (['daily', 'weekly', 'monthly', 'yearly'].indexOf(p.frequency) === -1) {
			throw new Error('Invalid frequency rule');
		}
		if (p.frequency == 'monthly' && ('byYearDay' in p || 'byWeekNo' in p)) {
			throw new Error('Invalid monthly rule');
		}
		if (p.frequency == "weekly" && ("byYearDay" in p || "byMonthDay" in p)) {
			throw new Error("Invalid weekly rule");
		}
		if (p.frequency != "yearly" && "byYearDay" in p) {
			throw new Error("byYearDay may only appear in yearly rules");
		}
	}
}