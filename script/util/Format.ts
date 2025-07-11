/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {DateTime, Timezone} from "./DateTime.js";
import {t} from "../Translate.js";
import {DateInterval} from "./DateInterval";



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
	 */
	public static decimalSeparator: string = ".";

	/**
	 * Thousands separator when using number formatting functions
	 */

	public static thousandsSeparator: string = ",";

	/**
	 * Checks if the time format uses 12hr
	 */
	public static timeFormat12hour() {
		return Format.timeFormat.includes("a");
	}


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
			this.convertUrisToAnchors(
				this.escapeHTML(text)
			)
		);
	}

	/**
	 * Convert URI's in text to anchor tags.
	 *
	 * @param text
	 */
	public static convertUrisToAnchors(text: string): string {
		// Regular expression to match URIs that are not inside anchor tags
		const uriRegex = /(https?:\/\/[^\s]+|ftp:\/\/[^\s]+)/ig;

		// Replace matched URIs with anchor tags
		return text.replace(uriRegex, (url) => {
			return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
		});
	}

	/**
	 * Show time for today. Yesterday, Tomorrow and full date if otherwise
	 * 
	 * @param date
	 * @param showTime
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
			diff = vYmd - nowYmd;

		switch(diff) {
			case 0:
				return Format.time(date);
			case -1:
				return !showTime ? t('Yesterday') : t('Yesterday') + " " + t('at') + " " + Format.time(date);
			case 1:
				return !showTime ? t('Tomorrow') : t('Tomorrow') + " " + t('at') + " " + Format.time(date);
		}

		let format = Format.dateFormat;

		// //past or upcoming week
		// if(diff > -6 && diff < 6) {
		// 	format = "l";
		// }
		//
		// if (now.getYear() === date.getYear()) {
		// 	let dayIndex = Format.dateFormat.indexOf('d'),
		// 		monthIndex = Format.dateFormat.indexOf('m');
		//
		// 	if(dayIndex == -1) {
		// 		dayIndex = Format.dateFormat.indexOf('j');
		// 	}
		//
		// 	format = dayIndex > monthIndex ? 'M j' : 'j M'
		// }

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

//Create a known date string
const d = new Date(1999,1,18);

Format.dateFormat = d.toLocaleString()
	.replace(/1999/,"Y")
	.replace(/99/,"Y")
	.replace(/F[^ ]{3,}/i,"M")
	.replace(/F[^ ]+/i,"m")
	.replace(/18[^ ]+/,"d") // day number with suffix
	.replace(/18/,"d");


Format.timeFormat = d.setHours(13,45,0).toLocaleString()
	.replace(/PM/,"A")
	.replace(/pm/,"a")
	.replace(/13/,"H")
	.replace(/1/,"h")
	.replace(/45/,"i")
	.replace(/00/,"s");

console.log(Format.dateFormat, Format.timeFormat);

