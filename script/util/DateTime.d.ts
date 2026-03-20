/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { DateInterval } from "./DateInterval.js";
/**
 * @category Utility
 */
export type Timezone = 'utc' | 'UTC' | 'europe/andorra' | 'asia/dubai' | 'asia/kabul' | 'europe/tirane' | 'asia/yerevan' | 'antarctica/casey' | 'antarctica/davis' | 'antarctica/dumontdurville' | // https://bugs.chromium.org/p/chromium/issues/detail?id=928068
'antarctica/mawson' | 'antarctica/palmer' | 'antarctica/rothera' | 'antarctica/syowa' | 'antarctica/troll' | 'antarctica/vostok' | 'america/argentina/buenos_aires' | 'america/argentina/cordoba' | 'america/argentina/salta' | 'america/argentina/jujuy' | 'america/argentina/tucuman' | 'america/argentina/catamarca' | 'america/argentina/la_rioja' | 'america/argentina/san_juan' | 'america/argentina/mendoza' | 'america/argentina/san_luis' | 'america/argentina/rio_gallegos' | 'america/argentina/ushuaia' | 'pacific/pago_pago' | 'europe/vienna' | 'australia/lord_howe' | 'antarctica/macquarie' | 'australia/hobart' | 'australia/currie' | 'australia/melbourne' | 'australia/sydney' | 'australia/broken_hill' | 'australia/brisbane' | 'australia/lindeman' | 'australia/adelaide' | 'australia/darwin' | 'australia/perth' | 'australia/eucla' | 'asia/baku' | 'america/barbados' | 'asia/dhaka' | 'europe/brussels' | 'europe/sofia' | 'atlantic/bermuda' | 'asia/brunei' | 'america/la_paz' | 'america/noronha' | 'america/belem' | 'america/fortaleza' | 'america/recife' | 'america/araguaina' | 'america/maceio' | 'america/bahia' | 'america/sao_paulo' | 'america/campo_grande' | 'america/cuiaba' | 'america/santarem' | 'america/porto_velho' | 'america/boa_vista' | 'america/manaus' | 'america/eirunepe' | 'america/rio_branco' | 'america/nassau' | 'asia/thimphu' | 'europe/minsk' | 'america/belize' | 'america/st_johns' | 'america/halifax' | 'america/glace_bay' | 'america/moncton' | 'america/goose_bay' | 'america/blanc-sablon' | 'america/toronto' | 'america/nipigon' | 'america/thunder_bay' | 'america/iqaluit' | 'america/pangnirtung' | 'america/atikokan' | 'america/winnipeg' | 'america/rainy_river' | 'america/resolute' | 'america/rankin_inlet' | 'america/regina' | 'america/swift_current' | 'america/edmonton' | 'america/cambridge_bay' | 'america/yellowknife' | 'america/inuvik' | 'america/creston' | 'america/dawson_creek' | 'america/fort_nelson' | 'america/vancouver' | 'america/whitehorse' | 'america/dawson' | 'indian/cocos' | 'europe/zurich' | 'africa/abidjan' | 'pacific/rarotonga' | 'america/santiago' | 'america/punta_arenas' | 'pacific/easter' | 'asia/shanghai' | 'asia/urumqi' | 'america/bogota' | 'america/costa_rica' | 'america/havana' | 'atlantic/cape_verde' | 'america/curacao' | 'indian/christmas' | 'asia/nicosia' | 'asia/famagusta' | 'europe/prague' | 'europe/berlin' | 'europe/copenhagen' | 'america/santo_domingo' | 'africa/algiers' | 'america/guayaquil' | 'pacific/galapagos' | 'europe/tallinn' | 'africa/cairo' | 'africa/el_aaiun' | 'europe/madrid' | 'africa/ceuta' | 'atlantic/canary' | 'europe/helsinki' | 'pacific/fiji' | 'atlantic/stanley' | 'pacific/chuuk' | 'pacific/pohnpei' | 'pacific/kosrae' | 'atlantic/faroe' | 'europe/paris' | 'europe/london' | 'asia/tbilisi' | 'america/cayenne' | 'africa/accra' | 'europe/gibraltar' | 'america/godthab' | 'america/danmarkshavn' | 'america/scoresbysund' | 'america/thule' | 'europe/athens' | 'atlantic/south_georgia' | 'america/guatemala' | 'pacific/guam' | 'africa/bissau' | 'america/guyana' | 'asia/hong_kong' | 'america/tegucigalpa' | 'america/port-au-prince' | 'europe/budapest' | 'asia/jakarta' | 'asia/pontianak' | 'asia/makassar' | 'asia/jayapura' | 'europe/dublin' | 'asia/jerusalem' | 'asia/kolkata' | 'indian/chagos' | 'asia/baghdad' | 'asia/tehran' | 'atlantic/reykjavik' | 'europe/rome' | 'america/jamaica' | 'asia/amman' | 'asia/tokyo' | 'africa/nairobi' | 'asia/bishkek' | 'pacific/tarawa' | 'pacific/enderbury' | 'pacific/kiritimati' | 'asia/pyongyang' | 'asia/seoul' | 'asia/almaty' | 'asia/qyzylorda' | 'asia/qostanay' | // https://bugs.chromium.org/p/chromium/issues/detail?id=928068
'asia/aqtobe' | 'asia/aqtau' | 'asia/atyrau' | 'asia/oral' | 'asia/beirut' | 'asia/colombo' | 'africa/monrovia' | 'europe/vilnius' | 'europe/luxembourg' | 'europe/riga' | 'africa/tripoli' | 'africa/casablanca' | 'europe/monaco' | 'europe/chisinau' | 'pacific/majuro' | 'pacific/kwajalein' | 'asia/yangon' | 'asia/ulaanbaatar' | 'asia/hovd' | 'asia/choibalsan' | 'asia/macau' | 'america/martinique' | 'europe/malta' | 'indian/mauritius' | 'indian/maldives' | 'america/mexico_city' | 'america/cancun' | 'america/merida' | 'america/monterrey' | 'america/matamoros' | 'america/mazatlan' | 'america/chihuahua' | 'america/ojinaga' | 'america/hermosillo' | 'america/tijuana' | 'america/bahia_banderas' | 'asia/kuala_lumpur' | 'asia/kuching' | 'africa/maputo' | 'africa/windhoek' | 'pacific/noumea' | 'pacific/norfolk' | 'africa/lagos' | 'america/managua' | 'europe/amsterdam' | 'europe/oslo' | 'asia/kathmandu' | 'pacific/nauru' | 'pacific/niue' | 'pacific/auckland' | 'pacific/chatham' | 'america/panama' | 'america/lima' | 'pacific/tahiti' | 'pacific/marquesas' | 'pacific/gambier' | 'pacific/port_moresby' | 'pacific/bougainville' | 'asia/manila' | 'asia/karachi' | 'europe/warsaw' | 'america/miquelon' | 'pacific/pitcairn' | 'america/puerto_rico' | 'asia/gaza' | 'asia/hebron' | 'europe/lisbon' | 'atlantic/madeira' | 'atlantic/azores' | 'pacific/palau' | 'america/asuncion' | 'asia/qatar' | 'indian/reunion' | 'europe/bucharest' | 'europe/belgrade' | 'europe/kaliningrad' | 'europe/moscow' | 'europe/simferopol' | 'europe/kirov' | 'europe/astrakhan' | 'europe/volgograd' | 'europe/saratov' | 'europe/ulyanovsk' | 'europe/samara' | 'asia/yekaterinburg' | 'asia/omsk' | 'asia/novosibirsk' | 'asia/barnaul' | 'asia/tomsk' | 'asia/novokuznetsk' | 'asia/krasnoyarsk' | 'asia/irkutsk' | 'asia/chita' | 'asia/yakutsk' | 'asia/khandyga' | 'asia/vladivostok' | 'asia/ust-nera' | 'asia/magadan' | 'asia/sakhalin' | 'asia/srednekolymsk' | 'asia/kamchatka' | 'asia/anadyr' | 'asia/riyadh' | 'pacific/guadalcanal' | 'indian/mahe' | 'africa/khartoum' | 'europe/stockholm' | 'asia/singapore' | 'america/paramaribo' | 'africa/juba' | 'africa/sao_tome' | 'america/el_salvador' | 'asia/damascus' | 'america/grand_turk' | 'africa/ndjamena' | 'indian/kerguelen' | 'asia/bangkok' | 'asia/dushanbe' | 'pacific/fakaofo' | 'asia/dili' | 'asia/ashgabat' | 'africa/tunis' | 'pacific/tongatapu' | 'europe/istanbul' | 'america/port_of_spain' | 'pacific/funafuti' | 'asia/taipei' | 'europe/kiev' | 'europe/uzhgorod' | 'europe/zaporozhye' | 'pacific/wake' | 'america/new_york' | 'america/detroit' | 'america/kentucky/louisville' | 'america/kentucky/monticello' | 'america/indiana/indianapolis' | 'america/indiana/vincennes' | 'america/indiana/winamac' | 'america/indiana/marengo' | 'america/indiana/petersburg' | 'america/indiana/vevay' | 'america/chicago' | 'america/indiana/tell_city' | 'america/indiana/knox' | 'america/menominee' | 'america/north_dakota/center' | 'america/north_dakota/new_salem' | 'america/north_dakota/beulah' | 'america/denver' | 'america/boise' | 'america/phoenix' | 'america/los_angeles' | 'america/anchorage' | 'america/juneau' | 'america/sitka' | 'america/metlakatla' | 'america/yakutat' | 'america/nome' | 'america/adak' | 'pacific/honolulu' | 'america/montevideo' | 'asia/samarkand' | 'asia/tashkent' | 'america/caracas' | 'asia/ho_chi_minh' | 'pacific/efate' | 'pacific/wallis' | 'pacific/apia' | 'africa/johannesburg';
/**
 * DateTime object
 *
 * Adds formatting, parsing and timezone support to a standard Date object
 *
 * @category Utility
 */
export declare class DateTime {
    readonly date: Date;
    static firstWeekDay: number;
    static dayNames: Record<string, string>;
    static dayMap: string[];
    static monthNames: string[];
    /**
     * Timezone when using time format functions
     */
    static timezone: Timezone;
    static staticInit(lang: string, firstWeekDay?: number): void;
    /**
     * Check if the system uses 12 hour format time.
     *
     * Unfortunately it's not possible to detect a 12h or 24h clock setting. We can only check what's used in the
     * users' locale.
     */
    static hour12(): boolean;
    /**
     * The timezone of the date
     */
    private _timezone;
    /**
     * The timezone of the date
     */
    get timezone(): Timezone;
    static defaultTimezone: Timezone;
    /**
     * Constructor
     *
     * @param date Can be a date object, a unix timestamp or date string
     * (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format)
     * Note that this object differs from the standard Date constructor. If you pass YYYY-MM-DD it will append T00:00:00
     * to avoid shifts in negative timezones.
     *
     * eg:
     *
     * ```
     * new DateTime("2025-07-10").getDate() //returns 9 when you are in Los Angeles (-8 timezone)
     * new DateTime("2025-07-10").getDate() //returns 10 when you are in Los Angeles (-8 timezone)
     * ```
     * @param timezone
     */
    constructor(date?: Date | DateTime | number | string, timezone?: Timezone);
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
    getTimezoneOffset(): number;
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
    toTimezone<T extends string>(timezone: Timezone): DateTime;
    private adjustFromSystemToUserTimezone;
    /**
     * Calculate difference between this and the given date
     *
     * @param end
     */
    diff(end: DateTime): DateInterval;
    /**
     * Create a copy of this object without reference
     */
    clone(): DateTime;
    /**
     * Convert to UTC timezone
     */
    toUTC(): DateTime;
    private static getFormatter;
    /**
     * Get the offset between the system timezone and the date timezone in minutes.
     *
     * For example if the computer has europe/amsterdam and the date UTF it's 60 minutes in winter time.
     *
     * @private
     */
    private getSystemTimezoneDiff;
    private static cache;
    /**
     * The ISO-8601 week number of year (weeks starting on Monday)
     */
    getWeekOfYear(): number;
    /**
     * Get the numeric day number of the year
     */
    getDayOfYear(): number;
    /**
     * Get the year
     */
    getYear(): number;
    /** Gets the month. Unlike JS it's 1 - 12 */
    getMonth(): number;
    getDate(): number;
    getMonthDay(): number;
    /** 0 for sunday, 1 for monday, 2 for tuesday */
    getDay(): number;
    /**
     * Like getDay but take firstWeekDay of the week into account
     * 0 = first day of the week, 6 = last day
     */
    getWeekDay(): number;
    getHours(): number;
    getMinutes(): number;
    getSeconds(): number;
    getMilliseconds(): number;
    /** Gets the time value in milliseconds. */
    getTime(): number;
    getMinuteOfDay(): number;
    /**
     * Sets the hour value in the Date object
     * @param hours A numeric value equal to the hours value.
     * @params min A numeric value equal to the minutes value.
     * @param sec A numeric value equal to the seconds value.
     */
    setHours(hours: number, min?: number, sec?: number, ms?: number): this;
    setMinutes(min: number): this;
    setSeconds(s: number): this;
    setMilliseconds(ms: number): this;
    setYear(year: number): DateTime;
    setMonth(month: number): this;
    /**
     * Get the day of the year in range 1-366
     */
    getYearDay(): number;
    /**
     * Set the day of the year
     * @param yearDay range 1-366
     */
    setYearDay(yearDay: number): this;
    /**
     * Sets the numeric day-of-the-month value of the Date object using local time.
     * @param date A numeric value equal to the day of the month.
     */
    setDate(date: number): this;
    setMonthDay(date: number): this;
    setWeekDay(day: number): this;
    /** Jump to day in current week */
    setDay(day: number): this;
    addYears(years: number): this;
    addMonths(months: number): this;
    addDays(days: number): this;
    addHours(hours: number): this;
    addMinutes(minutes: number): this;
    addSeconds(seconds: number): this;
    /**
     * Add a date interval
     *
     * @param dateInterval
     */
    add(dateInterval: DateInterval): this;
    /**
     * Check if current date is in a leap year
     */
    isLeapYear(): boolean;
    /**
     * Get the number of days in the current month
     */
    getDaysInMonth(): number;
    getGMTOffset(colon?: ":" | ""): string;
    private static converters;
    /**
     * Format the date into a string
     *
     * You can use the following characters. You can escape a character with a \ to output it as given.
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
     * k - Minutes without leading zeros (0 to 59)
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
     *
     */
    format(format: string): string;
    private static createFormatRegex;
    /**
     * Create date by given format. See {@link DateTime.format()}.
     * Supports:
     * Y, y, m, n, d, j, H, h, G, g, i, k, s, a, A
     *
     * k = minutes without leading zeros
     *
     * @example
     * ```
     * const date = Date.createFromFormat("2021-10-21 21:09", "Y-m-d H:i"));
     *
     * const date = console.log(Date.createFromFormat("10/12/2021 9:09am", "m/d/Y g:ia", "America/New_York));
     * ```
     */
    static createFromFormat(dateStr: string, format?: string, timezone?: Timezone): DateTime | undefined;
    /**
     * Compare with given date
     *
     * Returns:
     *
     * - -1 if this date is smaller than the given
     * - 0 if dates are equal
     * - 1 if this date is greater than the given
     *
     * @param date
     * @return number
     */
    compare(date: DateTime): number;
    isInThePast(): boolean;
    isInTheFuture(): boolean;
}
