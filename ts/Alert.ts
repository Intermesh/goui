import {isString} from "util";

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
		const alert = document.createElement("div");
		alert.classList.add("alert");
		alert.classList.add("" + type);
		alert.innerHTML = "<span>" + type.toUpperCase() + ":</span> " + msg;

		document.body.appendChild(alert);

		this.timeout = window.setTimeout(() => {
			document.body.removeChild(alert);
		}, 3000);

		alert.addEventListener("click", () => {
			document.body.removeChild(alert);
			clearTimeout(this.timeout);
		});
	}
}