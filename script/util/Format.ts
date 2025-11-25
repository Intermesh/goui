/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {DateTime, Timezone} from "./DateTime.js";
import {t} from "../Translate.js";
import {DateInterval} from "./DateInterval";
import {diff} from "node:util";


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
	public static timeFormat = DateTime.hour12() ? "g:i a" :"G:i";

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
	 * They are auto detected from the browser settings at the bottom of this file
	 */
	public static decimalSeparator: string = ".";

	/**
	 * Thousands separator when using number formatting functions
	 *
	 * They are auto detected from the browser settings at the bottom of this file
	 */

	public static thousandsSeparator: string = ",";

	/**
	 * Checks if the time format uses 12hr
	 */
	public static timeFormat12hour() {
		return Format.timeFormat.includes("a");
	}


	/**
	 * @deprecated Use htmlEncode()
	 */
	public static escapeHTML (str: string) {
		return Format.htmlEncode(str);
	}

	/**
	 * Escape a HTML string for safely inserting it in the DOM tree
	 * This method is also added to the String class as {@link String.htmlEncode()}
	 *
	 * @param str
	 */
	public static htmlEncode (str: string) {
		const p = document.createElement('p');
		p.textContent = str;
		return p.innerHTML;
	}


	/**
	 * Replace newlines with <br /> tag
	 *
	 * @param text
	 */
	public static nl2br(text:string) {
		return text.replace(/\r?\n/g, '<br />');
	}


	/**
	 * Convert plain text to HTML with hyperlinks
	 *
	 * @param text
	 */
	public static textToHtml(text:string) {

		if (!text) {
			return "";
		}
		return this.nl2br(

			this.escapeHTML(this._convertUriToAnchors(text, true))
				.replace(/_%O%_/g, '<')
				.replace(/_%C%_/g,'>')

		);
	}

	/**
	 * Convert http(s) URI's and mail addresses in text to anchor tags.
	 *
	 * @param text
	 */
	public static convertUrisToAnchors(text: string): string {
		return Format._convertUriToAnchors(text);
	}

	private static _convertUriToAnchors(text: string, tmp = false) {
		// Regular expression to match URIs that are not inside anchor tags
		const uriRegex = /(https?:\/\/[^\s<>]+)/ig,
			close = tmp ? '_%C%_' : '>',
			open = tmp ? '_%O%_' : '<';

		// Replace matched URIs with anchor tags
		text = text.replace(uriRegex, (url) => {
			return `${open}a href="${url}" target="_blank" rel="noopener noreferrer"${close}${url}${open}/a${close}`;
		});

		text = text.replace(
			/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
			(match) => {
				return `${open}a href="mailto:${match}"${close}${match}${open}/a${close}`;
			}
		);

		return text;
	}

	/**
	 * Show time for today. Yesterday, Tomorrow and full date if otherwise
	 * 
	 * @param date
	 * @param showTime
	 *
	 * Todo 11 nov etc.
	 *
	 *
	 */
	public static smartDateTime (date: string | DateTime | Date, showTime:boolean = true) {

		if (!date) {
			return "";
		}
		if (!(date instanceof DateTime)) {
			date = new DateTime(date);
		}

		date = date.toTimezone(this.timezone);

		const now = new DateTime(),
			nowYmd = parseInt(now.format("Ymd")),
			vYmd = parseInt(date.format("Ymd")),
			diffDays = vYmd - nowYmd;

		switch(diffDays) {
			case 0:
				return Format.time(date);
			case -1:
				return !showTime ? t('Yesterday') : t('Yesterday') + " " + t('at') + " " + Format.time(date);
			case 1:
				return !showTime ? t('Tomorrow') : t('Tomorrow') + " " + t('at') + " " + Format.time(date);
		}

		let format = Format.dateFormat;

		//past or upcoming week
		if(diffDays > -6 && diffDays < 6) {
			format = "l";
		}

		if (now.getYear() === date.getYear()) {
			let dayIndex = Format.dateFormat.indexOf('d'),
				monthIndex = Format.dateFormat.indexOf('m');

			if(dayIndex == -1) {
				dayIndex = Format.dateFormat.indexOf('j');
			}

			format = dayIndex > monthIndex ? 'M j' : 'j M'
		}

		if(showTime) {
			format +=  " " + Format.timeFormat;
		}

		return date.format(format);

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
	 * @param currency Override default {@link Format.currency}
	 */
	public static money(amount: number, currency = this.currency): string {
		return currency + " " + this.number(amount, 2);
	}

	/**
	 * Format a number to a localized string
	 *
	 * Uses {@link decimalSeparator} and {@link thousandsSeparator}
	 *
	 * @param value
	 * @param decimals
	 * @param decimalSeparator Override {@link decimalSeparator}
	 * @param thousandsSeparator Override {@link thousandsSeparator}
	 */
	public static number(value: number, decimals = 2, decimalSeparator = this.decimalSeparator, thousandsSeparator = this.thousandsSeparator): string {

		if(value === null || value == undefined) {
			return "";
		}

		const neg = value < 0;

		if (neg) {
			value *= -1;
		}

		const no = value.toFixed(decimals), parts = no.split('.');

		let formatted = "";
		const length = parts[0].length;
		for (let i = length - 1, l = 0; i >= l; i--) {
			formatted = parts[0][i] + formatted;

			if (i > 0 && (length - i) % 3 == 0) {
				formatted = thousandsSeparator + formatted;
			}
		}

		if (decimals) {
			formatted += decimalSeparator + parts[1];
		}

		if (neg) {
			formatted = "-" + formatted;
		}

		return formatted;
	}

	/**
	 * Parse a local formatted number string into a number.
	 *
	 * @param value
	 * @param decimalSeparator Override {@link decimalSeparator}
	 * @param thousandsSeparator Override {@link thousandsSeparator}
	 */
	public static parseLocalNumber(value: string, decimalSeparator = this.decimalSeparator, thousandsSeparator = this.thousandsSeparator) : number {
		if(!value) {
			return 0;
		}

		if(thousandsSeparator != ""){
			const re = new RegExp('[' + thousandsSeparator + ']', 'g');
			value = value.replace(re, "");
		}

		return parseFloat(value.replace(decimalSeparator, "."));
	}


	/**
	 * Format a duration of minutes in user time format like H:i
	 *
	 * @param minutes
	 */
	public static duration(minutes: number): string {
		if (!minutes) {
			return "";
		}

		return DateInterval.createFromSeconds( minutes * 60).format("e:I");
	}

	/**
	 * Parse h:i time string and convert to minutes
	 *
	 * @param timeStr
	 */
	public static minutes(timeStr: string): number {
		const di = DateInterval.createFromFormat(timeStr);
		if(!di) {
			throw "Failed to parse time string";
		}
		return di.getTotalMinutes()!;
	}

	public static fileSize(bytes:number): string {
		if(!bytes)
			return '';
		const i = Math.floor( Math.log(bytes) / Math.log(1024) );
		return (bytes / Math.pow(1024, i) ).toFixed(i?2:0) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
	}


	// /**
	//  * Pass a javascript template as literals to compile at runtime
	//  *
	//  * @param template
	//  * @param vars
	//  */
	// public static template(template:string, vars: Record<string, any> = {}): string {
	//
	// 	const fn = [
	// 		'const tagged = ( ' + Object.keys(vars).join(', ') + ' ) =>',
	// 		'`' + template + '`',
	// 		'return tagged(...Object.values(vars))'
	// 	].join('\n');
	//
	// 	console.log(fn);
	//
	// 	const handler = new Function('vars', fn)
	//
	// 	return handler(vars);
	// }

}


// Set defaults from browser settings

//Create a known date string
Format.dateFormat =  (new Intl.DateTimeFormat().formatToParts(new Date())).map(part => {
		switch (part.type) {
			case "day": return "d";
			case "month": return "m";
			case "year": return "Y";
			default: return part.value;
		}
	})
	.join("");

console.log("Detected date format: " + Format.dateFormat + " " + Format.timeFormat);

const numberWithGroupAndDecimalSeparator = 10000.1;
Intl.NumberFormat()
	.formatToParts(numberWithGroupAndDecimalSeparator)
	.forEach(part => {
		switch(part.type) {
			case "group":
				console.log("Detected thousands separator: " + part.value)
				Format.thousandsSeparator = part.value;
				break;

			case "decimal":
				console.log("Detected decimal separator: " + part.value)
				Format.decimalSeparator = part.value;
				break;
		}
	});


