/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
/**
 * Notify factory
 *
 * @example
 *
 * ```
 * Notifier.error("Oops!");
 * ```
 */
export declare class Notifier {
    /**
     * Show an error toast
     *
     * @param msg any string or object with a message property
     * @param timeout Timeout in seconds before it automatically disappears. It also dissappears on any mouseclick
     */
    static error(msg: any, timeout?: number): Message;
    /**
     * Show success toast
     *
     * @param msg
     * @param timeout
     */
    static success(msg: string, timeout?: number): Message;
    /**
     * Show a notice toast
     *
     * @param msg
     * @param timeout
     */
    static notice(msg: string, timeout?: number): Message;
    /**
     * Show a warning toast
     * @param msg
     * @param timeout
     */
    static warning(msg: string, timeout?: number): Message;
}
declare class Message {
    readonly timeout?: number;
    constructor(msg: string, type: string, timeout?: number);
}
export {};
