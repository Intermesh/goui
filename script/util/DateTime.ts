export {}

export type Timezone =
	'utc' |
	'UTC' |
	'europe/andorra' |
	'asia/dubai' |
	'asia/kabul' |
	'europe/tirane' |
	'asia/yerevan' |
	'antarctica/casey' |
	'antarctica/davis' |
	'antarctica/dumontdurville' | // https://bugs.chromium.org/p/chromium/issues/detail?id=928068
	'antarctica/mawson' |
	'antarctica/palmer' |
	'antarctica/rothera' |
	'antarctica/syowa' |
	'antarctica/troll' |
	'antarctica/vostok' |
	'america/argentina/buenos_aires' |
	'america/argentina/cordoba' |
	'america/argentina/salta' |
	'america/argentina/jujuy' |
	'america/argentina/tucuman' |
	'america/argentina/catamarca' |
	'america/argentina/la_rioja' |
	'america/argentina/san_juan' |
	'america/argentina/mendoza' |
	'america/argentina/san_luis' |
	'america/argentina/rio_gallegos' |
	'america/argentina/ushuaia' |
	'pacific/pago_pago' |
	'europe/vienna' |
	'australia/lord_howe' |
	'antarctica/macquarie' |
	'australia/hobart' |
	'australia/currie' |
	'australia/melbourne' |
	'australia/sydney' |
	'australia/broken_hill' |
	'australia/brisbane' |
	'australia/lindeman' |
	'australia/adelaide' |
	'australia/darwin' |
	'australia/perth' |
	'australia/eucla' |
	'asia/baku' |
	'america/barbados' |
	'asia/dhaka' |
	'europe/brussels' |
	'europe/sofia' |
	'atlantic/bermuda' |
	'asia/brunei' |
	'america/la_paz' |
	'america/noronha' |
	'america/belem' |
	'america/fortaleza' |
	'america/recife' |
	'america/araguaina' |
	'america/maceio' |
	'america/bahia' |
	'america/sao_paulo' |
	'america/campo_grande' |
	'america/cuiaba' |
	'america/santarem' |
	'america/porto_velho' |
	'america/boa_vista' |
	'america/manaus' |
	'america/eirunepe' |
	'america/rio_branco' |
	'america/nassau' |
	'asia/thimphu' |
	'europe/minsk' |
	'america/belize' |
	'america/st_johns' |
	'america/halifax' |
	'america/glace_bay' |
	'america/moncton' |
	'america/goose_bay' |
	'america/blanc-sablon' |
	'america/toronto' |
	'america/nipigon' |
	'america/thunder_bay' |
	'america/iqaluit' |
	'america/pangnirtung' |
	'america/atikokan' |
	'america/winnipeg' |
	'america/rainy_river' |
	'america/resolute' |
	'america/rankin_inlet' |
	'america/regina' |
	'america/swift_current' |
	'america/edmonton' |
	'america/cambridge_bay' |
	'america/yellowknife' |
	'america/inuvik' |
	'america/creston' |
	'america/dawson_creek' |
	'america/fort_nelson' |
	'america/vancouver' |
	'america/whitehorse' |
	'america/dawson' |
	'indian/cocos' |
	'europe/zurich' |
	'africa/abidjan' |
	'pacific/rarotonga' |
	'america/santiago' |
	'america/punta_arenas' |
	'pacific/easter' |
	'asia/shanghai' |
	'asia/urumqi' |
	'america/bogota' |
	'america/costa_rica' |
	'america/havana' |
	'atlantic/cape_verde' |
	'america/curacao' |
	'indian/christmas' |
	'asia/nicosia' |
	'asia/famagusta' |
	'europe/prague' |
	'europe/berlin' |
	'europe/copenhagen' |
	'america/santo_domingo' |
	'africa/algiers' |
	'america/guayaquil' |
	'pacific/galapagos' |
	'europe/tallinn' |
	'africa/cairo' |
	'africa/el_aaiun' |
	'europe/madrid' |
	'africa/ceuta' |
	'atlantic/canary' |
	'europe/helsinki' |
	'pacific/fiji' |
	'atlantic/stanley' |
	'pacific/chuuk' |
	'pacific/pohnpei' |
	'pacific/kosrae' |
	'atlantic/faroe' |
	'europe/paris' |
	'europe/london' |
	'asia/tbilisi' |
	'america/cayenne' |
	'africa/accra' |
	'europe/gibraltar' |
	'america/godthab' |
	'america/danmarkshavn' |
	'america/scoresbysund' |
	'america/thule' |
	'europe/athens' |
	'atlantic/south_georgia' |
	'america/guatemala' |
	'pacific/guam' |
	'africa/bissau' |
	'america/guyana' |
	'asia/hong_kong' |
	'america/tegucigalpa' |
	'america/port-au-prince' |
	'europe/budapest' |
	'asia/jakarta' |
	'asia/pontianak' |
	'asia/makassar' |
	'asia/jayapura' |
	'europe/dublin' |
	'asia/jerusalem' |
	'asia/kolkata' |
	'indian/chagos' |
	'asia/baghdad' |
	'asia/tehran' |
	'atlantic/reykjavik' |
	'europe/rome' |
	'america/jamaica' |
	'asia/amman' |
	'asia/tokyo' |
	'africa/nairobi' |
	'asia/bishkek' |
	'pacific/tarawa' |
	'pacific/enderbury' |
	'pacific/kiritimati' |
	'asia/pyongyang' |
	'asia/seoul' |
	'asia/almaty' |
	'asia/qyzylorda' |
	'asia/qostanay' | // https://bugs.chromium.org/p/chromium/issues/detail?id=928068
	'asia/aqtobe' |
	'asia/aqtau' |
	'asia/atyrau' |
	'asia/oral' |
	'asia/beirut' |
	'asia/colombo' |
	'africa/monrovia' |
	'europe/vilnius' |
	'europe/luxembourg' |
	'europe/riga' |
	'africa/tripoli' |
	'africa/casablanca' |
	'europe/monaco' |
	'europe/chisinau' |
	'pacific/majuro' |
	'pacific/kwajalein' |
	'asia/yangon' |
	'asia/ulaanbaatar' |
	'asia/hovd' |
	'asia/choibalsan' |
	'asia/macau' |
	'america/martinique' |
	'europe/malta' |
	'indian/mauritius' |
	'indian/maldives' |
	'america/mexico_city' |
	'america/cancun' |
	'america/merida' |
	'america/monterrey' |
	'america/matamoros' |
	'america/mazatlan' |
	'america/chihuahua' |
	'america/ojinaga' |
	'america/hermosillo' |
	'america/tijuana' |
	'america/bahia_banderas' |
	'asia/kuala_lumpur' |
	'asia/kuching' |
	'africa/maputo' |
	'africa/windhoek' |
	'pacific/noumea' |
	'pacific/norfolk' |
	'africa/lagos' |
	'america/managua' |
	'europe/amsterdam' |
	'europe/oslo' |
	'asia/kathmandu' |
	'pacific/nauru' |
	'pacific/niue' |
	'pacific/auckland' |
	'pacific/chatham' |
	'america/panama' |
	'america/lima' |
	'pacific/tahiti' |
	'pacific/marquesas' |
	'pacific/gambier' |
	'pacific/port_moresby' |
	'pacific/bougainville' |
	'asia/manila' |
	'asia/karachi' |
	'europe/warsaw' |
	'america/miquelon' |
	'pacific/pitcairn' |
	'america/puerto_rico' |
	'asia/gaza' |
	'asia/hebron' |
	'europe/lisbon' |
	'atlantic/madeira' |
	'atlantic/azores' |
	'pacific/palau' |
	'america/asuncion' |
	'asia/qatar' |
	'indian/reunion' |
	'europe/bucharest' |
	'europe/belgrade' |
	'europe/kaliningrad' |
	'europe/moscow' |
	'europe/simferopol' |
	'europe/kirov' |
	'europe/astrakhan' |
	'europe/volgograd' |
	'europe/saratov' |
	'europe/ulyanovsk' |
	'europe/samara' |
	'asia/yekaterinburg' |
	'asia/omsk' |
	'asia/novosibirsk' |
	'asia/barnaul' |
	'asia/tomsk' |
	'asia/novokuznetsk' |
	'asia/krasnoyarsk' |
	'asia/irkutsk' |
	'asia/chita' |
	'asia/yakutsk' |
	'asia/khandyga' |
	'asia/vladivostok' |
	'asia/ust-nera' |
	'asia/magadan' |
	'asia/sakhalin' |
	'asia/srednekolymsk' |
	'asia/kamchatka' |
	'asia/anadyr' |
	'asia/riyadh' |
	'pacific/guadalcanal' |
	'indian/mahe' |
	'africa/khartoum' |
	'europe/stockholm' |
	'asia/singapore' |
	'america/paramaribo' |
	'africa/juba' |
	'africa/sao_tome' |
	'america/el_salvador' |
	'asia/damascus' |
	'america/grand_turk' |
	'africa/ndjamena' |
	'indian/kerguelen' |
	'asia/bangkok' |
	'asia/dushanbe' |
	'pacific/fakaofo' |
	'asia/dili' |
	'asia/ashgabat' |
	'africa/tunis' |
	'pacific/tongatapu' |
	'europe/istanbul' |
	'america/port_of_spain' |
	'pacific/funafuti' |
	'asia/taipei' |
	'europe/kiev' |
	'europe/uzhgorod' |
	'europe/zaporozhye' |
	'pacific/wake' |
	'america/new_york' |
	'america/detroit' |
	'america/kentucky/louisville' |
	'america/kentucky/monticello' |
	'america/indiana/indianapolis' |
	'america/indiana/vincennes' |
	'america/indiana/winamac' |
	'america/indiana/marengo' |
	'america/indiana/petersburg' |
	'america/indiana/vevay' |
	'america/chicago' |
	'america/indiana/tell_city' |
	'america/indiana/knox' |
	'america/menominee' |
	'america/north_dakota/center' |
	'america/north_dakota/new_salem' |
	'america/north_dakota/beulah' |
	'america/denver' |
	'america/boise' |
	'america/phoenix' |
	'america/los_angeles' |
	'america/anchorage' |
	'america/juneau' |
	'america/sitka' |
	'america/metlakatla' |
	'america/yakutat' |
	'america/nome' |
	'america/adak' |
	'pacific/honolulu' |
	'america/montevideo' |
	'asia/samarkand' |
	'asia/tashkent' |
	'america/caracas' |
	'asia/ho_chi_minh' |
	'pacific/efate' |
	'pacific/wallis' |
	'pacific/apia' |
	'africa/johannesburg';

const SystemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase() as Timezone;

function pad(n: string|number): string {
	return (n < 10 ? '0':'') + n;
}
const durationRegex = /(-)?P(?:([.,\d]+)Y)?(?:([.,\d]+)M)?(?:([.,\d]+)W)?(?:([.,\d]+)D)?(?:T(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?)?/;

/**
 * DateTime object
 *
 * Adds formatting, parsing and timezone support to a standard Date object
 */
export class DateTime {


	readonly date: Date;

	static firstWeekDay = 1; // 1 = monday, 7 = sunday
	static dayNames: string[] = [];
	static monthNames: string[] = []

	static staticInit(lang: string) {
		const locale = new Intl.Locale(lang);
		if('weekInfo' in locale) {
			// @ts-ignore
			DateTime.firstWeekDay = locale.weekInfo.firstDay; // weekInfo might not be supported in all browsers
		}
		let tmp = new Date('1970-01-01'),
		   intlDays = new Intl.DateTimeFormat(lang, {weekday: 'long'});

		for (let i = 0; i < 7; i++) {  // monday
			tmp.setDate(i + 4 + DateTime.firstWeekDay);
			DateTime.dayNames.push(intlDays.format(tmp));
		}
		let intlMonth = new Intl.DateTimeFormat(lang, {month: 'long'});
		for (let i = 0; i < 12; i++) {
			tmp.setMonth(i);
			DateTime.monthNames.push(intlMonth.format(tmp));
		}
	}

	/**
	 * The timezone of the date
	 */
	public timezone:Timezone = SystemTimeZone;

	constructor(date:Date| number | string = new Date()) {
		if(date instanceof Date) {
			this.date = date;
		}else
		{
			this.date = new Date(date);
		}
	}

	/**
	 * User timezone offset in minutes
	 *
	 * eg.
	 *
	 * ```
	 * const browser = new Date("2021-10-21T16:00:00+00:00");
	 *
	 * const amsterdam = utc.toTimezone("europe/amsterdam");
	 *
	 * console.log(amsterdam.getUserTimezoneOffset()); // 120 (in daylight savings time)
	 * ```
	 */
	getTimezoneOffset() {

		//JS dates always have system timezone
		const systemTZOffset = this.date.getTimezoneOffset();

		return systemTZOffset + this.getSystemTimezoneDiff();
	}

	/**
	 * Convert date to timezone
	 *
	 * @example On computer with Amsterdam timezone
	 *
	 * ```
	 * const browser = new Date("2021-10-21T16:00:00+00:00");
	 * console.log(browser.format("c"), browser.getTimeZone());
	 * const riga = browser.toTimezone("europe/riga");
	 *
	 * console.log(riga.format("c"), riga.getTimeZone());
	 *
	 * const utc = riga.toUTC();
	 *
	 * console.log(utc.format("c"), utc.getTimeZone());
	 *
	 * ```
	 *
	 * Output:
	 * 2021-10-21T18:00:00+02:00 Europe/Amsterdam
	 * 2021-10-21T19:00:00+03:00 europe/riga
	 * 2021-10-21T16:00:00+00:00 UTC
	 *
	 *
	 * @param timezone eg. europe/amsterdam
	 */
	toTimezone<T extends string> (timezone: Timezone) {

		if(this.timezone == timezone) {
			return this.clone();
		}

		const offset = this.getTimezoneOffset();
		// get the difference in timezone
		const d = this.clone();
		d.timezone = timezone;
		const newOffset = d.getTimezoneOffset();

		d.setMinutes(d.getMinutes() - newOffset + offset );

		return d;
	}

	diff(end: DateTime) {
		let monthDays = end.clone().setDate(0).getDate(),
			sihdmy = [0,0,0,0,0, end.getYear() - this.getYear()],
			it = 0,
			map = {getSeconds: 60, getMinutes: 60, getHours: 24, getDate: monthDays, getMonth: 12};
		for(let i in map) {
			let fn = i as 'getSeconds' | 'getMinutes' | 'getHours' | 'getDate' | 'getMonth';
			if(sihdmy[it]+end[fn]() < this[fn]()){
				sihdmy[it+1]--;
				sihdmy[it] += map[fn] - this[fn]() + end[fn]();
			} else if(sihdmy[it]+end[fn]() > this[fn]()) {
				sihdmy[it] += end[fn]() - this[fn]();
			}
			it++;
		}
		// sec, min, hour, day, month, year
		const [s,i,h,d,m,y] = sihdmy;
		return 'P'+(y>0 ? y+'Y':'')+
			(m>0 ? m+'M':'')+
			(d>0 ? d+'D':'')+
			((h || i || s) ? 'T'+
				(h>0 ? h+'H':'')+
				(i>0 ? i+'M':'')+
				(s>0 ? s+'S':''):'');

	}

	/**
	 * Create a copy of this object without reference
	 */
	public clone() {
		return new DateTime(new Date(this.date));
	}

	/**
	 * Convert to UTC timezone
	 */
	public toUTC() {
		return this.toTimezone("UTC");
	}

	private static getFormatter(timezone:Timezone) {
		if(!DateTime.cache[timezone]) {
			DateTime.cache[timezone] = new Intl.DateTimeFormat('en-US', {timeZone: timezone, dateStyle: 'short', timeStyle: 'short'});
		}

		return DateTime.cache[timezone];
	}

	/**
	 * Get the offset between the system timezone and the date timezone in minutes.
	 *
	 * For example if the computer has europe/amsterdam and the date UTF it's 60 minutes in winter time.
	 *
	 * @private
	 */
	private getSystemTimezoneDiff() {

		if(this.timezone == SystemTimeZone) {
			return 0;
		}

		//calculate diff in minutes when changing to given timezone.
		const local = DateTime.getFormatter(this.timezone).format(this.date);
		// const local = this.date.toLocaleString("en-US", {timeZone: this.timezone});
		const d = new Date(local);

		// we don't care about milliseconds and seconds
		const u = Math.floor(this.date.getTime() / 1000 / 60), localU = Math.floor(d.getTime() / 1000 / 60);

		return  u - localU;

	}

	private static cache:Record<string, Intl.DateTimeFormat> = {};

	/**
	 * The ISO-8601 week number of year (weeks starting on Monday)
	 */
	getWeekOfYear():number {

		const ms1d = 864e5, // milliseconds in a day
			ms7d = 7 * ms1d; // milliseconds in a week

		// adapted from http://www.merlyn.demon.co.uk/weekcalc.htm
		const DC3 = Date.UTC(this.getYear(), this.getMonth() - 1, this.getMonthDay() + 3) / ms1d, // an Absolute Day Number
			AWN = Math.floor(DC3 / 7), // an Absolute Week Number
			Wyr = new Date(AWN * ms7d).getUTCFullYear();

		return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;

	}

	/**
	 * Get the numeric day number of the year
	 */
	getDayOfYear(): number {

		let num = 0,
			d = new DateTime(this.date.getTime()),
			m = this.getMonth(),
			i;

		for (i = 1, d.setMonthDay(1), d.setMonth(1); i < m; d.setMonth(++i)) {
			num += d.getDaysInMonth();
		}
		return num + this.getMonthDay() - 1;

	}

	/**
	 * Get the year
	 */
	getYear(): number {
		return this.date.getFullYear();
	}

	/** Gets the month. Unlike JS it's 1 - 12 */
	getMonth(): number {
		return this.date.getMonth() + 1;
	}

	getDate() : number {
		return this.date.getDate();
	}
	getMonthDay(): number {
		return this.getDate();
	}

	getDay() : number {
		return this.date.getDay();
	}

	/**
	 * Like getDay but take firstWeekDay of the week into account
	 * 0 = first day of the week, 6 = last day
	 */
	getWeekDay() : number {
		if (DateTime.firstWeekDay == 1) { // monday
			return (this.date.getDay() || 7) - 1;
		}
		// sunday
		return this.date.getDay();
	}

	getHours(): number {
		return this.date.getHours();
	}

	getMinutes(): number {
		return this.date.getMinutes();
	}

	getSeconds(): number {
		return this.date.getSeconds();
	}

	getMilliseconds(): number {
		return this.date.getMilliseconds();
	}

	/** Gets the time value in milliseconds. */
	getTime(): number {
		return this.date.getTime();
	}

	/**
	 * Sets the hour value in the Date object
	 * @param hours A numeric value equal to the hours value.
	 * @params min A numeric value equal to the minutes value.
	 * @param sec A numeric value equal to the seconds value.
	 */
	setHours(hours: number, min = this.date.getMinutes(), sec = this.date.getSeconds()) {
		this.date.setHours(hours, min, sec);
		return this;
	}

	setMinutes(min: number) {
		this.date.setMinutes(min);
		return this;
	}

	setSeconds(s: number) {
		this.date.setSeconds(s);
		return this;
	}

	setMilliseconds(ms: number) {
		this.date.setMilliseconds(ms);
		return this;
	}

	setYear(year: number): DateTime {
		this.date.setFullYear(year);
		return this;
	}

	setMonth(month:number) {
		this.date.setMonth(month - 1);
		return this;
	}

	setDate(date:number) {
		this.date.setDate(date);
		return this;
	}
	setMonthDay(date:number) {
		return this.setDate(date);
	}

	setWeekDay(day:number) {
		this.date.setDate(this.date.getDate() - this.getWeekDay() + day);
		return this;
	}

	/** Jump to day in current week */
	setDay(day:number) {
		this.date.setDate(this.date.getDate() - this.date.getDay() + day);
		return this;
	}

	addYears(years:number) {
		this.date.setFullYear(this.date.getFullYear() + years);
		return this;
	}

	addMonths(months:number) {
		this.date.setMonth(this.date.getMonth() + months);
		return this;
	}

	addDays(days:number) {
		this.date.setDate(this.date.getDate() + days);
		return this;
	}

	addHours(hours:number) {
		this.date.setHours(this.date.getHours() + hours);
		return this;
	}

	addMinutes(minutes:number) {
		this.date.setMinutes(this.date.getMinutes() + minutes);
		return this;
	}

	addSeconds(seconds:number) {
		this.date.setSeconds(this.date.getSeconds() + seconds);
		return this;
	}

	addDuration(iso8601: string) {
		let p:any,
			matches = iso8601.match(durationRegex)!;
		matches.shift(); // full match
		const sign = matches.shift() || '';
		for(let o of ['FullYear', 'Month', 'Week', 'Date', 'Hours', 'Minutes', 'Seconds']) {
			if(p = matches.shift()) { // p= amount to add
				if(o === 'Week') {
					p *= 7;
					o = 'Date';
				}
				this.date['set'+o as 'setDate'](this.date['get'+o as 'getDate']() + parseInt(sign+p))
			}
		}
		return this;
	}

	/**
	 * Check if current date is in a leap year
	 */
	isLeapYear() {
		const year = this.getYear();
		return !!((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
	}


	/**
	 * Get the number of days in the current month
	 */
	getDaysInMonth() {
		const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		const m = this.getMonth() - 1;
		return m == 1 && this.isLeapYear() ? 29 : daysInMonth[m];
	}

	getGMTOffset(colon: ":"|"" = ":") {
		const tzo = this.getTimezoneOffset();
		return (tzo > 0 ? "-" : "+") + pad(Math.floor(Math.abs(tzo) / 60)) + colon + pad(Math.abs(tzo % 60));
	}

	private static converters: {[key:string]:(date: DateTime) => string|number} = {
		'd': date => pad(date.getMonthDay()),
		'D': date => DateTime.dayNames[date.getWeekDay()].substring(0,3),
		'j': date => date.getMonthDay(),
		'l': date => DateTime.dayNames[date.getWeekDay()],

		'w': date => date.getDay(),
		'z': date => date.getDayOfYear(),
		'W': date => date.getWeekOfYear(),
		'F': date => DateTime.monthNames[date.getMonth()-1],
		'm': date => pad(date.getMonth()),
		'M': date => DateTime.monthNames[date.getMonth()-1].substring(0,3),
		'n': date => date.getMonth(),

		'Y': date => date.getYear(),
		'y': date => (date.getYear()+"").substr(-2),
		'a': date => date.getHours() > 12 ? 'pm' : 'am',
		'A': date => date.getHours() > 12 ? 'PM' : 'AM',

		'g': date => date.getHours() % 12,
		'G': date => date.getHours(),
		'h': date => pad(date.getHours() % 12),
		'H': date => pad(date.getHours()),
		'i': date => pad(date.getMinutes()),
		's': date => pad(date.getSeconds()),

		'O': date => date.getGMTOffset(""),
		'P': date => date.getGMTOffset(),
		'U': date => Math.floor(date.getTime() / 1000),
		'c': date => date.format("Y-m-d\TH:i:sP")
	};

	/**
	 * Format date similar to PHP's date function
	 *
	 * Note: indented options are NOT supported.
	 *
	 * d - The day of the month (from 01 to 31)
	 * D - A textual representation of a day (three letters)
	 * j - The day of the month without leading zeros (1 to 31)
	 * l (lowercase 'L') - A full textual representation of a day
	 * N - The ISO-8601 numeric representation of a day (1 for Monday, 7 for Sunday)
	 * S - The English ordinal suffix for the day of the month (2 characters st, nd, rd or th. Works well with j)
	 * w - A numeric representation of the day (0 for Sunday, 6 for Saturday)
	 * z - The day of the year (from 0 through 365)
	 * W - The ISO-8601 week number of year (weeks starting on Monday)
	 * F - A full textual representation of a month (January through December)
	 * m - A numeric representation of a month (from 01 to 12)
	 * M - A short textual representation of a month (three letters)
	 * n - A numeric representation of a month, without leading zeros (1 to 12)
	 * t - The number of days in the given month
	 * L - Whether it's a leap year (1 if it is a leap year, 0 otherwise)
	 * o - The ISO-8601 year number
	 * Y - A four digit representation of a year
	 * y - A two digit representation of a year
	 * a - Lowercase am or pm
	 * A - Uppercase AM or PM
	 * B - Swatch Internet time (000 to 999)
	 * g - 12-hour format of an hour (1 to 12)
	 * G - 24-hour format of an hour (0 to 23)
	 * h - 12-hour format of an hour (01 to 12)
	 * H - 24-hour format of an hour (00 to 23)
	 * i - Minutes with leading zeros (00 to 59)
	 * s - Seconds, with leading zeros (00 to 59)
	 * u - Microseconds (added in PHP 5.2.2)
	 * e - The timezone identifier (Examples: UTC, GMT, Atlantic/Azores)
	 * I  (capital i) - Whether the date is in daylights savings time (1 if Daylight Savings Time, 0 otherwise)
	 * O - Difference to Greenwich time (GMT) in hours (Example: +0100)
	 * P - Difference to Greenwich time (GMT) in hours:minutes (added in PHP 5.1.3)
	 * T - Timezone abbreviations (Examples: EST, MDT)
	 * Z - Timezone offset in seconds. The offset for timezones west of UTC is negative (-43200 to 50400)
	 * c - The ISO-8601 date (e.g. 2013-05-05T16:34:42+00:00)
	 * r - The RFC 2822 formatted date (e.g. Fri, 12 Apr 2013 12:01:05 +0200)
	 * U - The seconds since the Unix Epoch (January 1 1970 00:00:00 GMT)
	 */
	format(format: string): string {

		const chars = format.split("");
		let output = "";
		for (let i = 0, l = chars.length; i < l; i++) {
			let char = chars[i];
			if(char == '\\') {
				i++;
				if (chars.length > i + 1) {
					char += chars[i];
				}
			} else if (char in DateTime.converters) {
				char = DateTime.converters[char](this)+"";
			}
			output += char;
		}
		return output;
	}


	public static createFormatRegex(format:string) {
		const chars = format.split("");
		let output = "";

		for(let i = 0, l = chars.length; i < l; i++) {
			let char = chars[i];
			switch(char) {
				case 'Y':
					char = "(?<Y>\\d{4})";
					break;

				case 's':
				case 'i':

				case 'y':
					char = "(?<"+char+">\\d{2})";
					break;

				case 'G':
				case 'H':
				case 'm':
				case 'd':
				case 'g':
				case 'h':
				case 'j':
				case 'n':
					char = "(?<"+char+">\\d{1,2})";
					break;

				case 'a':
					char = "(?<a>am|pm)";
					break;

				case 'A':
					char = "(?<a>AM|PM)";
					break;

				case 'P':
					char = "(?<P>[\+\-](\\d{2}):(\\d{2}))";
					break;
				case 'c':
					char = DateTime.createFormatRegex("Y-m-d\TH:i:sP");
					break;

				// case '\\':
				// 	i++;
				// 	if (chars.length > i + 1) {
				// 		char += chars[i];
				// 	}
				// 	break;

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
	public static createFromFormat (dateStr:string, format: string = "c", timezone?:Timezone): DateTime|null {


		const regex = new RegExp(DateTime.createFormatRegex(format), 'u');
		const result = regex.exec(dateStr);

		if(!result) {
			return null;
		}

		const date = new DateTime();
		date.setHours(0)
			.setMinutes(0)
			.setSeconds(0)
			.setMilliseconds(0);

		if(timezone) {
			date.timezone = timezone;
		}

		for(let key in result.groups) {
			switch(key) {
				case "Y":
					date.setYear(parseInt(result.groups["Y"]));
					break;
				case "y":
					date.setYear(parseInt(2000 + result.groups["y"]));
					break;

				case 'n':
				case 'm':
					date.setMonth(parseInt(result.groups[key]));
					break;

				case 'j':
				case 'd':
					date.setMonthDay(parseInt(result.groups[key]));
					break;

				case 'G':
				case 'H':
					date.setHours(parseInt(result.groups[key]));
					break;

				case 'h':
				case 'g':

					const pm = result.groups.a ? result.groups.a == 'pm' : result.groups.A ? result.groups.A == 'PM' : false;

					const h = pm ? parseInt(result.groups[key]) : parseInt(result.groups[key]) + 12;
					date.setHours(h);
					break;

				case 'i':
					date.setMinutes(parseInt(result.groups[key]));
					break;

				case 's':
					date.setSeconds(parseInt(result.groups[key]));
					break;
			}
		}

		return date;
	}

	/**
	 * Compare with given date
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
	public compare(date:DateTime):number {
		return (this.date > date.date ? 1 : 0) - (this.date < date.date ? 1 : 0);
	}


}
DateTime.staticInit(navigator.language);


