import { Component } from "./component/Component.js";
import { root } from "./component/Root.js";
export { Alert };
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
    static error(msg) {
        console.error(msg);
        if (typeof msg != "string") {
            msg = msg.message;
        }
        return new Message(msg, "error");
    }
    static success(msg) {
        return new Message(msg, "success");
    }
    static notice(msg) {
        return new Message(msg, "notice");
    }
    static warning(msg) {
        return new Message(msg, "warning");
    }
}
class Message {
    constructor(msg, type) {
        const alert = Component.create({
            cls: "alert " + type,
            items: [
                Component.create({
                    tagName: "span",
                    text: type.toUpperCase() + ": "
                }),
                Component.create({
                    tagName: "span",
                    text: msg
                })
            ]
        });
        root.addItem(alert);
        this.timeout = window.setTimeout(() => {
            alert.remove();
        }, 3000);
        alert.getEl().addEventListener("click", () => {
            alert.remove();
            clearTimeout(this.timeout);
        });
    }
}
//# sourceMappingURL=Alert.js.map