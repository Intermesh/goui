/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {DateTime, Timezone} from "./DateTime.js";

/**
 * Formatting utilities
 * @category Utility
 */
export class Format {

	/**
	 * Date format when using date formatting functions
	 */
	public static dateFormat = "d-m-Y";

	/**
	 * Time format when using time formatting functions
	 */
	public static timeFormat = "G:i";

	/**
	 * Timezone when using time format functions
	 */
	public static timezone = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase() as Timezone;

	/**
	 * Currency to use
	 */
	public static currency = "€";

	/**
	 * Decimal separator when using number formatting functions
	 */
	public static decimalSeparator: string = ".";

	/**
	 * Thousands separator when using number formatting functions
	 */

	public static thousandsSeparator: ",";


	/**
	 * Escape a HTML string for safely inserting it in the DOM tree
	 * @param str
	 */
	public static escapeHTML = function (str: string) {
		const p = document.createElement('p');
		p.innerText = str;
		return p.innerHTML;
	}


	/**
	 * Format a date to a string
	 *
	 * @param date
	 */
	public static date(date: string | DateTime | Date) {
		if (!date) {
			return "";
		}
		if (!(date instanceof DateTime)) {
			date = new DateTime(date);
		}

		return date.toTimezone(this.timezone).format(Format.dateFormat)
	}

	/**
	 * Format a time to a string
	 * @param date
	 */
	public static time(date: string | DateTime | Date) {
		if (!(date instanceof DateTime)) {
			date = new DateTime(date);
		}

		return date.toTimezone(this.timezone).format(Format.timeFormat)
	}

	/**
	 * Formats a date and time to the default format
	 *
	 * @see Format.dateFormat
	 * @see Format.timeFormat
	 * @param date
	 */
	public static dateTime(date: string | DateTime | Date) {
		if (!(date instanceof DateTime)) {
			date = new DateTime(date);
		}

		//We want leading zero's in full date time strings so they align. There for replace g and H
		return date.toTimezone(this.timezone).format(Format.dateFormat + " " + Format.timeFormat.replace("g", "h").replace("G", "H"))
	}


	/**
	 * Format a number to money
	 *
	 * @param amount
	 */
	public static money(amount: number): string {
		return this.currency + " " + this.number(amount, 2);
	}

	/**
	 * Format a number to a localized string
	 *
	 * @param value
	 * @param decimals
	 */
	public static number(value: number, decimals = 2): string {
		const neg = value < 0;

		if (neg) {
			value *= -1;
		}

		const dec = this.decimalSeparator,
			tho = this.thousandsSeparator;

		const no = value.toFixed(decimals), parts = no.split('.');

		let formatted = "";
		const length = parts[0].length;
		for (let i = length - 1, l = 0; i >= l; i--) {
			formatted = parts[0][i] + formatted;

			if (i > 0 && (length - i) % 3 == 0) {
				formatted = tho + formatted;
			}
		}

		if (decimals) {
			formatted += dec + parts[1];
		}

		if (neg) {
			formatted = "-" + formatted;
		}

		return formatted;
	}


	public static duration(value: number, zeroPad:boolean = false): string {
		if (value < 0) {
			return "";
		}
		let retStr = "";
		const hours = Math.floor(value / 60), minutes = value % 60;;
		if(zeroPad && hours < 10) {
			retStr += "0";
		}
		retStr += hours + ":";
		retStr += ((minutes < 10) ? "0" + minutes : minutes);
		return retStr;
	}

	public static shortTime(v: string): string {
		let arV = v.split(":");
		if (arV.length !== 3) {
			return '';
		}
		return arV[0] + ":" + arV[1];
	}

	public static minutes(timeStr: string): number {
		const parts = timeStr.split(':');
		return parseInt(parts[0]) * 60 + parseInt(parts[1]);
	}

}

