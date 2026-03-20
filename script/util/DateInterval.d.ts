import { DateTime } from "./DateTime.js";
/**
 * DateInterval class
 *
 * Represents a date interval.
 *
 * Commonly created via {@link DateTime.diff}
 */
export declare class DateInterval {
    /**
     * Constructor
     *
     * @link https://en.wikipedia.org/wiki/ISO_8601#Durations
     * @param duration ISO 8601 Duration
     */
    constructor(duration?: string);
    /**
     * Number of microseconds.
     */
    microSeconds: number;
    /**
     * Number of seconds
     */
    seconds: number;
    /**
     * Number of minutes
     */
    minutes: number;
    /**
     * Number of hours
     */
    hours: number;
    /**
     * Number of days
     */
    days: number;
    /**
     * NUmber of months
     */
    months: number;
    /**
     * Number of years
     */
    years: number;
    /**
     * True if it represents a negative period
     */
    invert: boolean;
    private _start?;
    private _end?;
    private static converters;
    /**
     * Populate the number of hours, minutes and seconds from a number of seconds.
     *
     * @param seconds
     */
    static createFromSeconds(seconds: number): DateInterval;
    /**
     * Set interval from the time elapsed between to datetime objects
     *
     * @param start
     * @param end
     */
    static createFromDates(start: DateTime, end: DateTime): DateInterval;
    /**
     * Calculates total number of days that have elapsed between two dates.
     *
     * Only available if this diff was created using {@link DateTime.diff}
     */
    getTotalDays(): number | undefined;
    /**
     * Calculates total number of minutes that have elapsed between two dates.
     *
     * Only available if this diff was created using {@link DateTime.diff}
     */
    getTotalMinutes(): number | undefined;
    /**
     * Calculates total number of hours but without minutes and seconds that have elapsed between two dates.
     *
     * Only available if this diff was created using {@link DateTime.diff}
     */
    getTotalHours(): number | undefined;
    /**
     * Set the interval from an ISO8601 duration
     * @link https://en.wikipedia.org/wiki/ISO_8601#Durations
     * @param duration
     */
    setDuration(duration: string): boolean;
    /**
     * Build an Iso8601 duration string
     *
     * @link https://en.wikipedia.org/wiki/ISO_8601#Durations
     */
    toIso8601(): string;
    /**
     * Format the interval to a string.
     *
     * Note: It follows the PHP DateInterval spec except for the "a" and "j" signs.
     *
     * You can use the following characters. You can escape a character with a \ to output it as given:
     *
     * Y	Years, numeric, at least 2 digits with leading 0, eg.	01, 03
     * y	Years, numeric	1, 3
     * M	Months, numeric, at least 2 digits with leading 0, eg.	01, 03, 12
     * m	Months, numeric, eg.	1, 3, 12
     * D	Days, numeric, at least 2 digits with leading 0, eg.	01, 03, 31
     * d	Days, numeric, eg.	1, 3, 31
     * a	Total number of days but without time as a result of a {@link DateTime.diff} or (unknown) otherwise, eg.	4, 18, 8123
     * H	Hours, numeric, at least 2 digits with leading 0, eg.	01, 03, 23
     * h	Hours, numeric, eg.	1, 3, 23
     * e 	Total number of hours but without the minutes and seconds as a result of a {@link DateTime.diff} or (unknown) otherwise, eg.	4, 18, 8123
     * I	Minutes, numeric, at least 2 digits with leading 0, eg.	01, 03, 59
     * i	Minutes, numeric, eg.	1, 3, 59
     * j  The total number of minutes but without seconds as a result of a {@link DateTime.diff} or (unknown) if this duration holds more than hours and minutes and seconds, eg.	4, 18, 8123
     * S	Seconds, numeric, at least 2 digits with leading 0, eg.	01, 03, 57
     * s	Seconds, numeric, eg.	1, 3, 57
     * F	Microseconds, numeric, at least 6 digits with leading 0, eg.	007701, 052738, 428291
     * f	Microseconds, numeric, eg.	7701, 52738, 428291
     * R	Sign "-" when negative, "+" when positive, eg.	-, +
     * r	Sign "-" when negative, empty when positive, eg.	-,
     *
     * @param format
     */
    format(format: string): string;
    private static createFormatRegex;
    /**
     * Create date by given format. See {@link DateInterval.format}.
     *
     * Does not support "a" and "e". "j" can only be used alone.
     *
     * @example
     * ```
     * const dateInterval = DateInterval.createFromFormat("21:09", "h:I"));
     *
     * const dateInterval = DateInterval.createFromFormat("315", "j"));
     * ```
     */
    static createFromFormat(dateStr: string, format?: string): DateInterval | undefined;
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
    compare(other: DateInterval): number;
}
