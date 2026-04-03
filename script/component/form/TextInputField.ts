import {InputField, InputFieldEventMap} from "./InputField.js";
import {t} from "../../Translate.js";

export abstract class TextInputField<EventMap extends InputFieldEventMap = InputFieldEventMap> extends InputField<EventMap> {
	/**
	 * The minimum required input length
	 *
	 * @param min
	 */
	public minLength: number | undefined;


	/**
	 * The maximum required input length
	 *
	 * @param min
	 */
	public maxLength: number | undefined;

	protected async validate() {

		await super.validate();

		const v = this.value as string;
		if(!v) {
			return;
		}

		if (this.maxLength !== undefined && v.length > this.maxLength) {
			this.setInvalid(t("Text is larger than the maximum of {maxLength} characters.").replace("{maxLength}", this.maxLength.toString()));
		}
		if (this.minLength !== undefined && v.length < this.minLength) {
			this.setInvalid(t("Text is shorter than the maximum of {minLength} characters.").replace("{minLength}", this.minLength.toString()));
		}

	}
}