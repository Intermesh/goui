import { DateTime } from "./DateTime.js";
export class Format {
    /**
     * Format a date to a string
     *
     * @param date
     */
    static date(date) {
        if (!date) {
            return "";
        }
        if (!(date instanceof DateTime)) {
            date = new DateTime(date);
        }
        return date.toTimezone(this.timezone).format(Format.dateFormat);
    }
    /**
     * Format a time to a string
     * @param date
     */
    static time(date) {
        if (!(date instanceof DateTime)) {
            date = new DateTime(date);
        }
        return date.toTimezone(this.timezone).format(Format.timeFormat);
    }
    /**
     * Formats a date and time to the default format
     *
     * @see Format.dateFormat
     * @see Format.timeFormat
     * @param date
     */
    static dateTime(date) {
        if (!(date instanceof DateTime)) {
            date = new DateTime(date);
        }
        //We want leading zero's in full date time strings so they align. There for replace g and H
        return date.toTimezone(this.timezone).format(Format.dateFormat + " " + Format.timeFormat.replace("g", "h").replace("G", "H"));
    }
    /**
     * Format a number to money
     *
     * @param amount
     */
    static money(amount) {
        return this.currency + " " + this.number(amount, 2);
    }
    /**
     * Format a number to a localized string
     *
     * @param value
     * @param decimals
     */
    static number(value, decimals = 2) {
        const neg = value < 0;
        if (neg) {
            value *= -1;
        }
        const dec = this.decimalSeparator, tho = this.thousandsSeparator;
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
}
/**
 * Date format when using date formatting functions
 */
Format.dateFormat = "d-m-Y";
/**
 * Time format when using time formatting functions
 */
Format.timeFormat = "G:i";
/**
 * Timezone when using time format functions
 */
Format.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
/**
 * Currency to use
 */
Format.currency = "€";
/**
 * Decimal separator when using number formatting functions
 */
Format.decimalSeparator = ".";
/**
 * Escape a HTML string for safely inserting it in the DOM tree
 * @param str
 */
Format.escapeHTML = function (str) {
    const p = document.createElement('p');
    p.innerText = str;
    return p.innerHTML;
};
//# sourceMappingURL=Format.js.map