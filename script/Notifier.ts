import {Component} from "./component/Component.js";
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

	public static error(msg: string|Error, timeout = 3000) {
		console.error(msg);
		if(typeof msg != "string") {
			msg = msg.message;
		}

		return new Message(msg, "error", timeout);
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

		const alert = Component.create({
			cls: "alert " + type,
			items: [
				Component.create({
					tagName:"span",
					text: msg
				})
			]
		});

		root.getItems().add(alert);

		if(timeout) {
			this.timeout = window.setTimeout(() => {
				alert.remove();
			}, timeout);
		}

		alert.getEl().addEventListener("click", () => {
			alert.remove();
			if(this.timeout) {
				clearTimeout(this.timeout);
			}
		});
	}
}