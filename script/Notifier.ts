import {comp, Component} from "./component/Component.js";
import {root} from "./component/Root.js";

/**
 * Alert factory
 *
 * @example
 *
 * ```
 * Alert.error("Oops!");
 * ```
 */
export class Notifier {

	public static error(msg: string|unknown, timeout = 3000) {
		console.error(msg);
		if (msg instanceof Error) {
			msg = msg.message;
		} else if (typeof msg != "string")
		{
			msg = msg + "";
		}

		return new Message(msg as string, "error", timeout);
	}

	public static success(msg: string, timeout = 3000) {
		return new Message(msg, "success", timeout);
	}

	public static notice(msg: string, timeout = 3000) {
		return new Message(msg, "notice", timeout);
	}

	public static warning(msg: string, timeout = 3000) {
		return new Message(msg, "warning", timeout);
	}

}

class Message {
	readonly timeout?: number;

	constructor(msg: string, type: string, timeout = 3000) {

		const alert = comp({
			cls: "alert " + type
		},
			comp({
				tagName:"span",
				text: msg
			})
		);

		root.items.add(alert);

		if(timeout) {
			this.timeout = window.setTimeout(() => {
				alert.remove();
			}, timeout);
		}

		alert.el.addEventListener("click", () => {
			alert.remove();
			if(this.timeout) {
				clearTimeout(this.timeout);
			}
		});
	}
}