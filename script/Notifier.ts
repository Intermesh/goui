/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {comp, root} from "./component/index";

/**
 * Notify factory
 *
 * @example
 *
 * ```
 * Notifier.error("Oops!");
 * ```
 */
export class Notifier {

	/**
	 * Show an error toast
	 *
	 * @param msg any string or object with a message property
	 * @param timeout Timeout in seconds before it automatically disappears. It also dissappears on any mouseclick
	 */
	public static error(msg: any, timeout = 0) {
		console.error(msg);
		if (msg instanceof Object && msg.message) {
			msg = msg.message;
		} else if (typeof msg != "string") {
			msg = msg + "";
		}

		return new Message(msg as string, "error", timeout);
	}

	/**
	 * Show success toast
	 *
	 * @param msg
	 * @param timeout
	 */
	public static success(msg: string, timeout = 3000) {
		return new Message(msg, "success", timeout);
	}

	/**
	 * Show a notice toast
	 *
	 * @param msg
	 * @param timeout
	 */
	public static notice(msg: string, timeout = 3000) {
		return new Message(msg, "notice", timeout);
	}

	/**
	 * Show a warning toast
	 * @param msg
	 * @param timeout
	 */
	public static warning(msg: string, timeout = 3000) {
		return new Message(msg, "warning", timeout);
	}

}

class Message {
	readonly timeout?: number;

	constructor(msg: string, type: string, timeout = 3000) {

		const alert = comp({
				cls: "goui-alert " + type
			},
			comp({
				tagName: "span",
				text: msg
			})
		);

		root.items.add(alert);

		if (timeout) {
			this.timeout = window.setTimeout(() => {
				alert.remove();
			}, timeout);
		}

		setTimeout(() => {
			document.body.addEventListener("click", () => {
				alert.remove();
				if (this.timeout) {
					clearTimeout(this.timeout);
				}
			}, {once: true});
		});
	}
}