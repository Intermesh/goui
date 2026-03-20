/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { DateTime, Timezone } from "./DateTime.js";
/**
 * Formatting utilities
 * @category Utility
 */
export declare class Format {
    /**
     * Date format when using date formatting functions
     */
    static dateFormat: string;
    /**
     * Time format when using time formatting functions
     */
    static timeFormat: string;
    /**
     * Timezone when using time format functions
     */
    static timezone: Timezone;
    /**
     * Currency to use
     */
    static currency: string;
    /**
     * Decimal separator when using number formatting functions
     * They are auto detected from the browser settings at the bottom of this file
     */
    static decimalSeparator: string;
    /**
     * Thousands separator when using number formatting functions
     *
     * They are auto detected from the browser settings at the bottom of this file
     */
    static thousandsSeparator: string;
    /**
     * Checks if the time format uses 12hr
     */
    static timeFormat12hour(): boolean;
    /**
     * @deprecated Use htmlEncode()
     */
    static escapeHTML(str: string): string;
    /**
     * Escape a HTML string for safely inserting it in the DOM tree
     * This method is also added to the String class as {@link String.htmlEncode()}
     *
     * @param str
     */
    static htmlEncode(str: string): string;
    /**
     * Replace newlines with <br /> tag
     *
     * @param text
     */
    static nl2br(text: string): string;
    /**
     * Convert plain text to HTML with hyperlinks
     *
     * @param text
     */
    static textToHtml(text: string): string;
    /**
     * Convert http(s) URI's and mail addresses in text to anchor tags.
     *
     * @param text
     */
    static convertUrisToAnchors(text: string): string;
    private static _convertUriToAnchors;
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
    static smartDateTime(date: string | DateTime | Date, showTime?: boolean): any;
    /**
     * Format a date to a string
     *
     * @param date
     */
    static date(date: string | DateTime | Date): string;
    /**
     * Format a time to a string
     * @param date
     */
    static time(date: string | DateTime | Date): string;
    /**
     * Formats a date and time to the default format
     *
     * @see Format.dateFormat
     * @see Format.timeFormat
     * @param date
     */
    static dateTime(date: string | DateTime | Date): string;
    /**
     * Format a number to money
     *
     * @param amount
     * @param currency Override default {@link Format.currency}
     */
    static money(amount: number, currency?: string): string;
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
    static number(value: number, decimals?: number, decimalSeparator?: string, thousandsSeparator?: string): string;
    /**
     * Parse a local formatted number string into a number.
     *
     * @param value
     * @param decimalSeparator Override {@link decimalSeparator}
     * @param thousandsSeparator Override {@link thousandsSeparator}
     */
    static parseLocalNumber(value: string, decimalSeparator?: string, thousandsSeparator?: string): number;
    /**
     * Format a duration of minutes in user time format like H:i
     *
     * @param minutes
     */
    static duration(minutes: number): string;
    /**
     * Parse h:i time string and convert to minutes
     *
     * @param timeStr
     */
    static minutes(timeStr: string): number;
    static fileSize(bytes: number): string;
}
