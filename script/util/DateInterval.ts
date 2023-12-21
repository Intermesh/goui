function pad(n: any): string {
	return n.toString().padStart(2, "0");
}


// function parseInt(str:string):number {
// 	return parseInt(str);
// }

export class DateInterval {
	public weeks = 0;

	constructor(duration?:string) {
		if(duration && !this.setDuration(duration)) {
			throw "Invalid duration: " + duration;
		}
	}

	public microSeconds = 0;
	public seconds = 0;
	public minutes = 0;
	public hours = 0;
	public days = 0;
	public months = 0;
	public years = 0;

	/**
	 * Total number of days.
	 *
	 * Only available when using DateTime.diff()
	 */
	public totalDaysBetween:number|undefined = undefined;

	public invert = false;


	private static converters: { [key: string]: (dateInterval: DateInterval) => string } = {
		'Y': dateInterval => pad(dateInterval.years),
		'y': dateInterval =>dateInterval.years.toString(),

		'M': dateInterval => pad(dateInterval.months),
		'm': dateInterval => dateInterval.months.toString(),

		'D': dateInterval => pad(dateInterval.days),
		'd': dateInterval => dateInterval.days.toString(),

		'a': dateInterval => (dateInterval.totalDaysBetween ?? "") + "",

		'H': dateInterval => pad(dateInterval.hours),
		'h': dateInterval => dateInterval.hours.toString(),

		'I': dateInterval => pad(dateInterval.minutes),
		'i': dateInterval => dateInterval.minutes.toString(),

		'S': dateInterval => pad(dateInterval.seconds),
		's': dateInterval => dateInterval.seconds.toString(),

		'F': dateInterval => pad(dateInterval.microSeconds),
		'f': dateInterval => dateInterval.microSeconds.toString(),

		'R': dateInterval => dateInterval.invert ? "-" : "+",
		'r': dateInterval => dateInterval.invert ? "-" : "",

	};


	public setDuration(duration:string) {
		const iso8601DurationRegex = /(-)?P(?:([.,\d]+)Y)?(?:([.,\d]+)M)?(?:([.,\d]+)W)?(?:([.,\d]+)D)?(?:T(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?)?/
		const matches = duration.match(iso8601DurationRegex);

		if(!matches) {
			return false;
		}

		this.invert = matches[1] !== undefined;

		this.years = matches[2] ? parseInt(matches[2]): 0;
		this.months = matches[3] ? parseInt(matches[3]): 0;
		this.weeks = matches[4] ? parseInt(matches[4]): 0;
		this.days = matches[5] ? parseInt(matches[5]): 0;
		this.hours = matches[6] ? parseInt(matches[6]): 0;
		this.minutes = matches[7] ? parseInt(matches[7]): 0;
		this.seconds = matches[8] ? parseInt(matches[8]): 0;

		return true;
	}

	toIso8601() {
		return 'P' + (this.years > 0 ? this.years + 'Y' : '') +
			(this.months > 0 ? this.months + 'M' : '') +
			(this.days > 0 ? this.days + 'D' : '') +
			((this.hours || this.minutes || this.seconds) ? 'T' +
				(this.hours  > 0 ? this.hours  + 'H' : '') +
				(this.minutes > 0 ? this.minutes + 'M' : '') +
				(this.seconds > 0 ? this.seconds + 'S' : '') : '');
	}

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
	 * Create date by given format
	 * See Date.format()
	 * Supports:
	 * Y, y, m, n, d, j, H, h, G, g, i, s, a, A
	 *
	 * @example
	 * ```
	 * const date = Date.createFromFormat("2021-10-21 21:09", "Y-m-d H:i"));
	 *
	 * const date = console.log(Date.createFromFormat("10/12/2021 9:09am", "m/d/Y g:ia", "America/New_York));
	 * ```
	 */
	public static createFromFormat(dateStr: string, format: string = "h:I"): DateInterval | undefined {

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

		console.log(thisDuration, otherDuration, result);
		return result;
	}

}