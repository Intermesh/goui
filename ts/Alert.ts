import {isString} from "util";
import {Container} from "../../../goui/component/Container.js";
import {Component} from "../../../goui/component/Component.js";
import {root} from "../../../goui/component/Root.js";

export {Alert};

/**
 * Alert factory
 *
 * @example
 *
 * ```
 * Alert.error("Oops!");
 * ```
 */
class Alert {

	public static error(msg: string|Error) {
		console.error(msg);
		if(typeof msg != "string") {
			msg = msg.message;
		}

		return new Message(msg, "error");
	}

	public static success(msg: string) {
		return new Message(msg, "success");
	}

	public static notice(msg: string) {
		return new Message(msg, "notice");
	}

	public static danger(msg: string) {
		return new Message(msg, "danger");
	}

}

class Message {
	readonly timeout: number;

	constructor(msg: string, type: string) {

		const alert = Container.create({
			cls: "alert " + type,
			items: [
				Component.create({
					tagName:"span",
					text: type.toUpperCase()
				}),
				Component.create({
					tagName:"span",
					text: msg
				})
			]
		});

		root.addItem(alert);

		this.timeout = window.setTimeout(() => {
			root.remove();
		}, 3000);

		alert.getEl().addEventListener("click", () => {
			root.remove();
			clearTimeout(this.timeout);
		});
	}
}