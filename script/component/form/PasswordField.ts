import {TextField} from "./TextField.js";
import {t} from "../../Translate.js";
import {btn} from "../Button.js";
import {browser} from "../../util/index.js";
import {Notifier} from "../../Notifier.js";
import {FieldConfig, FieldEventMap} from "./Field.js";
import {createComponent} from "../Component.js";
import {InputFieldEventMap} from "./InputField.js";

function generatePassword(length = 16) {
	const charset =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{};:,.<>?";
	const charsetLength = charset.length;

	const randomValues = new Uint32Array(length);
	window.crypto.getRandomValues(randomValues);

	let password = "";
	for (let i = 0; i < length; i++) {
		password += charset[randomValues[i] % charsetLength];
	}

	return password;
}

type PasswordAutoComplete = "new-password" | "current-password";

export interface PasswordFieldEventMap extends InputFieldEventMap {
	generatepassword: {
		password: string
	}
}

export class PasswordField<EventMap extends PasswordFieldEventMap = PasswordFieldEventMap> extends TextField<EventMap> {
	constructor(autocomplete:PasswordAutoComplete) {
		super();


		this.label =  t("Password");
		this.type = "password";
		this.autocomplete = autocomplete;

		this.buttons = [
			btn({
				title: t("Show password"),
				icon: "visibility",
				handler: (btn) => {
					const passwordFld = btn.findAncestorByType(TextField)!;
					if(passwordFld.type == "password") {
						passwordFld.type = "text";
						btn.icon = "visibility_off";
					} else
					{
						passwordFld.type = "password";
						btn.icon = "visibility";
					}
				}
			})
			];

	}

	/**
	 * Autocomplete type is required for a password field
	 *
	 * If autocomplete is new-password then a generate password button is added to the field.
	 */
	get autocomplete() {
		return super.autocomplete as PasswordAutoComplete;
	}

	set autocomplete(autocomplete: PasswordAutoComplete) {
		super.autocomplete = autocomplete;

		if(this.autocomplete == "new-password") {
			const b = this.buttons;
			b.push(
				btn({
					icon: "magic_button",
					title: t("Generate password"),
					handler: (btn) => {
						const password = generatePassword(),
							passwordFld = btn.findAncestorByType(TextField)!

						passwordFld.value = password;
						browser.copyTextToClipboard(password);
						Notifier.success(t("The generated password has been copied to your clipboard."));
						this.fire("generatepassword", {password})
					}
				})
			)
			this.buttons = b;
		}
	}
}

/**
 * Shorthand function to create {@link PasswordField}
 *
 * @link https://goui.io/#form/TextField Examples
 * @param config
 */
export const passwordfield = (config: FieldConfig<PasswordField,"autocomplete">) => createComponent(new PasswordField(config.autocomplete), config);
