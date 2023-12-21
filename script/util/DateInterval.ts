export class DateInterval {
	public weeks = 0;

	constructor(duration?:string) {
		if(duration && !this.setDuration(duration)) {
			throw "Invalid duration: " + duration;
		}
	}

	public seconds = 0;
	public minutes = 0;
	public hours = 0;
	public days = 0;
	public months = 0;
	public years = 0;

	public invert = false;


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

	toString() {
		return 'P' + (this.years > 0 ? this.years + 'Y' : '') +
			(this.months > 0 ? this.months + 'M' : '') +
			(this.days > 0 ? this.days + 'D' : '') +
			((this.hours || this.minutes || this.seconds) ? 'T' +
				(this.hours  > 0 ? this.hours  + 'H' : '') +
				(this.minutes > 0 ? this.minutes + 'M' : '') +
				(this.seconds > 0 ? this.seconds + 'S' : '') : '');
	}

}