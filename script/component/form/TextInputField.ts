import {InputField} from "./InputField.js";
import {t} from "../../Translate.js";

export abstract class TextInputField extends InputField {
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

	protected validate() {

		super.validate();

		const v = this.value as string;
		if(!v) {
			return;
		}

		if (this.maxLength !== undefined && v.length > this.maxLength) {
			this.setInvalid(t("Text is larger than the maximum of {maxLength} characters.").replace("{max}", this.maxLength.toString()));
		}
		if (this.minLength !== undefined && v.length < this.minLength) {
			this.setInvalid(t("Text is shorter than the maximum of {minLength} characters.").replace("{min}", this.minLength.toString()));
		}

	}
}