import {DateTime} from "./DateTime.js";

function pad(n: any): string {
	return n.toString().padStart(2, "0");
}


/**
 * DateInterval class
 *
 * Represents a date interval.
 *
 * Commonly created via {@link DateTime.diff}
 */
export class DateInterval {


	/**
	 * Constructor
	 *
	 * @link https://en.wikipedia.org/wiki/ISO_8601#Durations
	 * @param duration ISO 8601 Duration
	 */
	constructor(duration?:string) {
		if(duration && !this.setDuration(duration)) {
			throw "Invalid duration: " + duration;
		}
	}

	/**
	 * Number of microseconds.
	 */
	public microSeconds = 0;

	/**
	 * Number of seconds
	 */
	public seconds = 0;

	/**
	 * Number of minutes
	 */
	public minutes = 0;

	/**
	 * Number of hours
	 */
	public hours = 0;

	/**
	 * Number of days
	 */
	public days = 0;

	/**
	 * NUmber of months
	 */
	public months = 0;

	/**
	 * Number of years
	 */
	public years = 0;

	/**
	 * True if it represents a negative period
	 */
	public invert = false;

	private _start?:DateTime;
	private _end?:DateTime;

	private static converters: { [key: string]: (dateInterval: DateInterval) => string } = {
		'Y': dateInterval => pad(dateInterval.years),
		'y': dateInterval =>dateInterval.years.toString(),

		'M': dateInterval => pad(dateInterval.months),
		'm': dateInterval => dateInterval.months.toString(),

		'D': dateInterval => pad(dateInterval.days),
		'd': dateInterval => dateInterval.days.toString(),

		'a': dateInterval => (dateInterval.getTotalDays() ?? "") + "",

		'H': dateInterval => pad(dateInterval.hours),
		'h': dateInterval => dateInterval.hours.toString(),

		'I': dateInterval => pad(dateInterval.minutes),
		'i': dateInterval => dateInterval.minutes.toString(),
		'j': dateInterval => (dateInterval.getTotalMinutes() ?? "") + "",

		'S': dateInterval => pad(dateInterval.seconds),
		's': dateInterval => dateInterval.seconds.toString(),

		'F': dateInterval => pad(dateInterval.microSeconds),
		'f': dateInterval => dateInterval.microSeconds.toString(),

		'R': dateInterval => dateInterval.invert ? "-" : "+",
		'r': dateInterval => dateInterval.invert ? "-" : "",

	};


	/**
	 * Set interval from the time elapsed bewtween to datetime objects
	 *
	 * @param start
	 * @param end
	 */
	public setFromDates(start:DateTime, end:DateTime) {

		this._start = start;
		this._end = end;

		let monthDays = end.clone().setDate(0).getDate(),
			sihdmy = [0, 0, 0, 0, 0, end.getYear() - start.getYear()],
			it = 0,
			map = {getSeconds: 60, getMinutes: 60, getHours: 24, getDate: monthDays, getMonth: 12};
		for (let i in map) {
			let fn = i as 'getSeconds' | 'getMinutes' | 'getHours' | 'getDate' | 'getMonth';
			if (sihdmy[it] + end[fn]() < start[fn]()) {
				sihdmy[it + 1]--;
				sihdmy[it] += map[fn] - start[fn]() + end[fn]();
			} else if (sihdmy[it] + end[fn]() > start[fn]()) {
				sihdmy[it] += end[fn]() - start[fn]();
			}
			it++;
		}

		this.seconds = sihdmy[0];
		this.minutes = sihdmy[1];
		this.hours = sihdmy[2];
		this.days = sihdmy[3];
		this.months = sihdmy[4];
		this.years = sihdmy[5];
	}

	/**
	 * Calculates total number of days that have elapsed between two dates.
	 *
	 * Only available if this diff was created using {@link DateTime.diff}
	 */
	public getTotalDays() {
		if(!this._start || !this._end) {
			return undefined;
		}
		return Math.floor((
			Date.UTC(this._end.getYear(), this._end.date.getMonth(), this._end.getDate()) -
			Date.UTC(this._start.getYear(), this._start.date.getMonth(), this._start.getDate())
		) / 86400000);
	}


	/**
	 * Calculates total number of minutes that have elapsed between two dates.
	 *
	 * Only available if this diff was created using {@link DateTime.diff}
	 */
	public getTotalMinutes(){

		if(this._start && this._end) {
			return Math.abs(this._start.getTime() - this._end.getTime()) / 60000;
		}

		if(this.days || this.months || this.years){
			return undefined;
		}

		return this.hours * 60 + this.minutes;
	}


	/**
	 * Set the interval from an ISO8601 duration
	 * @link https://en.wikipedia.org/wiki/ISO_8601#Durations
	 * @param duration
	 */
	public setDuration(duration:string) {
		const iso8601DurationRegex = /(-)?P(?:([.,\d]+)Y)?(?:([.,\d]+)M)?(?:([.,\d]+)W)?(?:([.,\d]+)D)?(?:T(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?)?/
		const matches = duration.match(iso8601DurationRegex);

		if(!matches) {
			return false;
		}

		this.invert = matches[1] !== undefined;

		this.years = matches[2] ? parseInt(matches[2]): 0;
		this.months = matches[3] ? parseInt(matches[3]): 0;
		this.days = matches[4] ? parseInt(matches[4]) * 7 : 0;
		if(!matches[4]) {
			this.days = matches[5] ? parseInt(matches[5]) : 0;
		}
		this.hours = matches[6] ? parseInt(matches[6]): 0;
		this.minutes = matches[7] ? parseInt(matches[7]): 0;
		this.seconds = matches[8] ? parseInt(matches[8]): 0;

		return true;
	}

	/**
	 * Build an Iso8601 duration string
	 *
	 * @link https://en.wikipedia.org/wiki/ISO_8601#Durations
	 */
	toIso8601() {
		return 'P' + (this.years > 0 ? this.years + 'Y' : '') +
			(this.months > 0 ? this.months + 'M' : '') +
			(this.days > 0 ? this.days + 'D' : '') +
			((this.hours || this.minutes || this.seconds) ? 'T' +
				(this.hours  > 0 ? this.hours  + 'H' : '') +
				(this.minutes > 0 ? this.minutes + 'M' : '') +
				(this.seconds > 0 ? this.seconds + 'S' : '') : '');
	}

	/**
	 * Format the interval to a string.
	 *
	 * You can use the following characters. You can escape a character with a \ to output it as given:
	 *
	 * Y	Years, numeric, at least 2 digits with leading 0, eg.	01, 03
	 * y	Years, numeric	1, 3
	 * M	Months, numeric, at least 2 digits with leading 0, eg.	01, 03, 12
	 * m	Months, numeric, eg.	1, 3, 12
	 * D	Days, numeric, at least 2 digits with leading 0, eg.	01, 03, 31
	 * d	Days, numeric, eg.	1, 3, 31
	 * a	Total number of days as a result of a {@link DateTime.diff} or (unknown) otherwise, eg.	4, 18, 8123
	 * H	Hours, numeric, at least 2 digits with leading 0, eg.	01, 03, 23
	 * h	Hours, numeric, eg.	1, 3, 23
	 * I	Minutes, numeric, at least 2 digits with leading 0, eg.	01, 03, 59
	 * i	Minutes, numeric, eg.	1, 3, 59
	 * j  The total number of minutes as a result of a {@link DateTime.diff} or (unknown) if this duration holds more than hours and minutes and seconds, eg.	4, 18, 8123
	 * S	Seconds, numeric, at least 2 digits with leading 0, eg.	01, 03, 57
	 * s	Seconds, numeric, eg.	1, 3, 57
	 * F	Microseconds, numeric, at least 6 digits with leading 0, eg.	007701, 052738, 428291
	 * f	Microseconds, numeric, eg.	7701, 52738, 428291
	 * R	Sign "-" when negative, "+" when positive, eg.	-, +
	 * r	Sign "-" when negative, empty when positive, eg.	-,
	 *
	 * @param format
	 */
	public format(format: string): string {

		const chars = format.split("");
		let output = "";
		for (let i = 0, l = chars.length; i < l; i++) {
			let char = chars[i];
			if (char == '\\') {
				i++;
				if (chars.length > i + 1) {
					char += chars[i];
				}
			} else if (char in DateInterval.converters) {
				char = DateInterval.converters[char](this) + "";
			}
			output += char;
		}
		return output;
	}

	private static createFormatRegex(format: string) {
		const chars = format.split("");
		let output = "";

		for (let i = 0, l = chars.length; i < l; i++) {
			let char = chars[i];
			switch (char) {
				case 'Y':
					char = "(?<Y>\\d{2,4})";
					break;

				case 'I':
				case 'M':
				case 'S':
					char = "(?<" + char + ">\\d{2})";
					break;

				case 'y':
				case 's':
				case 'i':
				case 'H':
				case 'm':
				case 'd':
				case 'h':
					char = "(?<" + char + ">\\d{1,2})";
					break;

				case "R":
					char = "(?<" + char + ">[-+]{1})";
					break;

				case "r":
					char = "(?<" + char + ">-?)";
					break;

				default:
					//do nothing
					break;
			}


			output += char;
		}
		return output;
	}


	/**
	 * Create date by given format. See {@link DateInterval.format}.
	 *
	 * Does not support "a". "j" can only be used alone.
	 *
	 * @example
	 * ```
	 * const dateInterval = DateInterval.createFromFormat("21:09", "h:I"));
	 *
	 * const dateInterval = DateInterval.createFromFormat("315", "j"));
	 * ```
	 */
	public static createFromFormat(dateStr: string, format: string = "h:I"): DateInterval | undefined {

		if(format == "j") {
			const date = new DateInterval();
			const mins = parseInt(dateStr);
			date.minutes = mins % 60;
			date.hours = Math.floor(mins / 60);
			return date;
		}

		const regex = new RegExp(DateInterval.createFormatRegex(format), 'u');
		const result = regex.exec(dateStr);

		if (!result) {
			return undefined;
		}
		const date = new DateInterval();


		for(let key in result.groups) {
			switch(key) {
				case "Y":
				case "y":
					date.years = parseInt(result.groups[key]);
					break;

				case "M":
				case "m":
					date.months = parseInt(result.groups[key]);
					break;

				case "D":
				case "d":
					date.days = parseInt(result.groups[key]);
					break;

				case "H":
				case "h":
					date.hours = parseInt(result.groups[key]);
					break;

				case "I":
				case "i":
					date.minutes = parseInt(result.groups[key]);
					break;



				case "S":
				case "s":
					date.seconds = parseInt(result.groups[key]);
					break;


				case "F":
				case "f":
					date.microSeconds = parseInt(result.groups[key]);
					break;

				case "R":
				case "r":
					date.invert = result.groups[key] == "-";
					break;
			}
		}

		return date;
	}

	/**
	 * Compare with given interval
	 *
	 * Returns:
	 *
	 * - -1 if this date is before the given date
	 * - 0 if dates are equal
	 * - 1 if this date is after the given date
	 *
	 * @param date
	 * @return number
	 */
	public compare(other: DateInterval): number {
		const thisDuration = parseInt(this.format("rYMDHISF"));
		const otherDuration = parseInt(other.format("rYMDHISF"));
		const result = (thisDuration > otherDuration ? 1 : 0) - (thisDuration < otherDuration ? 1 : 0);
		return result;
	}

}