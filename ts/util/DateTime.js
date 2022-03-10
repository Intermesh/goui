const SystemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
/**
 * DateTime object
 *
 * Adds formatting, parsing and timezone support to a standard Date object
 */
export class DateTime {
    constructor(date = new Date()) {
        /**
         * The timezone of the date
         */
        this.timezone = SystemTimeZone;
        if (date instanceof Date) {
            this.date = date;
        }
        else {
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
    toTimezone(timezone) {
        if (this.timezone == timezone) {
            return this.clone();
        }
        const offset = this.getTimezoneOffset();
        // get the difference in timezone
        const d = this.clone();
        d.timezone = timezone;
        const newOffset = d.getTimezoneOffset();
        d.setMinutes(d.getMinutes() - newOffset + offset);
        return d;
    }
    /**
     * Create a copy of this object without reference
     */
    clone() {
        return new DateTime(new Date(this.date));
    }
    /**
     * Convert to UTC timezone
     */
    toUTC() {
        return this.toTimezone("UTC");
    }
    static getFormatter(timezone) {
        if (!DateTime.cache[timezone]) {
            DateTime.cache[timezone] = new Intl.DateTimeFormat('en-US', { timeZone: timezone, dateStyle: 'short', timeStyle: 'short' });
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
    getSystemTimezoneDiff() {
        if (this.timezone == SystemTimeZone) {
            return 0;
        }
        //calculate diff in minutes when changing to given timezone.
        const local = DateTime.getFormatter(this.timezone).format(this.date);
        // const local = this.date.toLocaleString("en-US", {timeZone: this.timezone});
        const d = new Date(local);
        // we don't care about milliseconds and seconds
        const u = Math.floor(this.date.getTime() / 1000 / 60), localU = Math.floor(d.getTime() / 1000 / 60);
        return u - localU;
    }
    /**
     * The ISO-8601 week number of year (weeks starting on Monday)
     */
    getWeekOfYear() {
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
    getDayOfYear() {
        let num = 0, d = new DateTime(this.date.getTime()), m = this.getMonth(), i;
        for (i = 1, d.setMonthDay(1), d.setMonth(1); i < m; d.setMonth(++i)) {
            num += d.getDaysInMonth();
        }
        return num + this.getMonthDay() - 1;
    }
    /**
     * Get the year
     */
    getYear() {
        return this.date.getFullYear();
    }
    /** Gets the month. Unlike JS it's 1 - 12 */
    getMonth() {
        return this.date.getMonth() + 1;
    }
    getMonthDay() {
        return this.date.getDate();
    }
    getWeekDay() {
        return this.date.getDay();
    }
    getHours() {
        return this.date.getHours();
    }
    getMinutes() {
        return this.date.getMinutes();
    }
    getSeconds() {
        return this.date.getSeconds();
    }
    getMilliseconds() {
        return this.date.getMilliseconds();
    }
    /** Gets the time value in milliseconds. */
    getTime() {
        return this.date.getTime();
    }
    /**
     * Sets the hour value in the Date object
     * @param hours A numeric value equal to the hours value.
     */
    setHours(hours) {
        this.date.setHours(hours);
        return this;
    }
    setMinutes(min) {
        this.date.setMinutes(min);
        return this;
    }
    setSeconds(s) {
        this.date.setSeconds(s);
        return this;
    }
    setMilliseconds(ms) {
        this.date.setMilliseconds(ms);
        return this;
    }
    setYear(year) {
        this.date.setFullYear(year);
        return this;
    }
    setMonth(month) {
        this.date.setMonth(month - 1);
        return this;
    }
    setMonthDay(date) {
        this.date.setDate(date);
        return this;
    }
    addYears(years) {
        this.date.setFullYear(this.date.getFullYear() + years);
        return this;
    }
    addMonths(months) {
        this.date.setDate(this.date.getMonth() + months);
        return this;
    }
    addDays(days) {
        this.date.setDate(this.date.getDate() + days);
        return this;
    }
    addHours(hours) {
        this.date.setHours(this.date.getHours() + hours);
        return this;
    }
    addMinutes(minutes) {
        this.date.setMinutes(this.date.getMinutes() + minutes);
        return this;
    }
    addSeconds(seconds) {
        this.date.setSeconds(this.date.getSeconds() + seconds);
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
    /**
     * Format date similar to PHP's date function
     *
     * Note: indented options are NOT supported.
     *
     * d - The day of the month (from 01 to 31)
     *    D - A textual representation of a day (three letters)
     * j - The day of the month without leading zeros (1 to 31)
     *    l (lowercase 'L') - A full textual representation of a day
     * N - The ISO-8601 numeric representation of a day (1 for Monday, 7 for Sunday)
     *    S - The English ordinal suffix for the day of the month (2 characters st, nd, rd or th. Works well with j)
     * w - A numeric representation of the day (0 for Sunday, 6 for Saturday)
     * z - The day of the year (from 0 through 365)
     * W - The ISO-8601 week number of year (weeks starting on Monday)
     *    F - A full textual representation of a month (January through December)
     * m - A numeric representation of a month (from 01 to 12)
     *    M - A short textual representation of a month (three letters)
     * n - A numeric representation of a month, without leading zeros (1 to 12)
     *    t - The number of days in the given month
     *    L - Whether it's a leap year (1 if it is a leap year, 0 otherwise)
     *    o - The ISO-8601 year number
     * Y - A four digit representation of a year
     * y - A two digit representation of a year
     * a - Lowercase am or pm
     * A - Uppercase AM or PM
     *      B - Swatch Internet time (000 to 999)
     * g - 12-hour format of an hour (1 to 12)
     * G - 24-hour format of an hour (0 to 23)
     * h - 12-hour format of an hour (01 to 12)
     * H - 24-hour format of an hour (00 to 23)
     * i - Minutes with leading zeros (00 to 59)
     * s - Seconds, with leading zeros (00 to 59)
     *      u - Microseconds (added in PHP 5.2.2)
     *      e - The timezone identifier (Examples: UTC, GMT, Atlantic/Azores)
     *    I  (capital i) - Whether the date is in daylights savings time (1 if Daylight Savings Time, 0 otherwise)
     *  O - Difference to Greenwich time (GMT) in hours (Example: +0100)
     *  P - Difference to Greenwich time (GMT) in hours:minutes (added in PHP 5.1.3)
     *    T - Timezone abbreviations (Examples: EST, MDT)
     *    Z - Timezone offset in seconds. The offset for timezones west of UTC is negative (-43200 to 50400)
     * c - The ISO-8601 date (e.g. 2013-05-05T16:34:42+00:00)
     *    r - The RFC 2822 formatted date (e.g. Fri, 12 Apr 2013 12:01:05 +0200)
     * U - The seconds since the Unix Epoch (January 1 1970 00:00:00 GMT)
     */
    format(format) {
        function twelvehr(d) {
            const hour = d.getHours();
            if (hour > 12) {
                return (hour - 12).toString();
            }
            else {
                return hour.toString();
            }
        }
        function getGMTOffset(d, colon = ":") {
            const tzo = d.getTimezoneOffset();
            return (tzo > 0 ? "-" : "+")
                + (Math.floor(Math.abs(tzo) / 60).toString().padStart(2, "0")
                    + (colon ? ":" : "")
                    + Math.abs(tzo % 60).toString().padStart(2, "0"));
        }
        const chars = format.split("");
        let output = "";
        for (let i = 0, l = chars.length; i < l; i++) {
            let char = chars[i];
            switch (char) {
                case 'W':
                    char = this.getWeekOfYear().toString();
                    break;
                case 'w':
                    char = this.getWeekDay().toString();
                    break;
                case 'z':
                    char = this.getDayOfYear().toString();
                    break;
                case 'Y':
                    char = this.getYear().toString();
                    break;
                case 'y':
                    char = this.getYear().toString();
                    break;
                case 'm':
                    char = this.getMonth().toString().padStart(2, "0");
                    break;
                case 'n':
                    char = this.getMonth().toString();
                    break;
                case 'd':
                    char = this.getMonthDay().toString().padStart(2, "0");
                    break;
                case 'j':
                    char = this.getMonthDay().toString();
                    break;
                case 'H':
                    char = this.getHours().toString().padStart(2, "0");
                    break;
                case 'G':
                    char = this.getHours().toString();
                    break;
                case 'h':
                    char = twelvehr(this.date).padStart(2, "0");
                    break;
                case 'g':
                    char = twelvehr(this.date);
                    break;
                case 'i':
                    char = this.getMinutes().toString().padStart(2, "0");
                    break;
                case 's':
                    char = this.getSeconds().toString().padStart(2, "0");
                    break;
                case 'a':
                    char = this.getHours() > 12 ? 'pm' : 'am';
                    break;
                case 'A':
                    char = this.getHours() > 12 ? 'PM' : 'AM';
                    break;
                case 'U':
                    char = (this.getTime() / 1000).toString();
                    break;
                case 'O':
                    char = getGMTOffset(this, "");
                    break;
                case 'P':
                    char = getGMTOffset(this);
                    break;
                case 'c':
                    char = this.format("Y-m-d\TH:i:sP");
                    break;
                case '\\':
                    i++;
                    if (chars.length > i + 1) {
                        char += chars[i];
                    }
                    break;
                default:
                    //do nothing
                    break;
            }
            output += char;
        }
        return output;
    }
    static createFormatRegex(format) {
        const chars = format.split("");
        let output = "";
        for (let i = 0, l = chars.length; i < l; i++) {
            let char = chars[i];
            switch (char) {
                case 'Y':
                    char = "(?<Y>\\d{4})";
                    break;
                case 's':
                case 'i':
                case 'y':
                    char = "(?<" + char + ">\\d{2})";
                    break;
                case 'G':
                case 'H':
                case 'm':
                case 'd':
                case 'g':
                case 'h':
                case 'j':
                case 'n':
                    char = "(?<" + char + ">\\d{1,2})";
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
    static createFromFormat(dateStr, format = "c", timezone) {
        const regex = new RegExp(DateTime.createFormatRegex(format), 'u');
        const result = regex.exec(dateStr);
        if (!result) {
            return null;
        }
        const date = new DateTime();
        date.setHours(0)
            .setMinutes(0)
            .setSeconds(0)
            .setMilliseconds(0);
        if (timezone) {
            date.timezone = timezone;
        }
        for (let key in result.groups) {
            switch (key) {
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
    compare(date) {
        return (this.date > date.date ? 1 : 0) - (this.date < date.date ? 1 : 0);
    }
}
DateTime.cache = {};
//# sourceMappingURL=DateTime.js.map