/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {ContainerField, ContainerFieldValue} from "./ContainerField.js";
import {Config, ObservableListenerOpts} from "../Observable.js";
import {Notifier} from "../../Notifier.js";
import {Component, createComponent} from "../Component.js";
import {FieldEventMap} from "./Field.js";
import {t} from "../../Translate.js";


export interface FormEventMap<Type, ValueType extends ContainerFieldValue = ContainerFieldValue> extends FieldEventMap<Type> {
	/**
	 * Fires when the form is submitted. The event is fired after calling the handler.
	 *
	 * You can check if the form is valid after submitting with {@see form.isValid()}
	 *
	 * @param form
	 */
	submit: (form: Type, handlerResponse: any) => any,

	/**
	 * Not fired by the framework. But comes in handy when you extend this form and add a cancel button
	 *
	 * @param form
	 */
	cancel: (form: Type) => any
}

export interface Form<ValueType extends ContainerFieldValue = ContainerFieldValue> extends ContainerField<ValueType> {
	on<K extends keyof FormEventMap<this, ValueType>>(eventName: K, listener: Partial<FormEventMap<this,ValueType>>[K], options?: ObservableListenerOpts): void

	fire<K extends keyof FormEventMap<this, ValueType>>(eventName: K, ...args: Parameters<FormEventMap<any, ValueType>[K]>): boolean

	get el(): HTMLFormElement


}

/**
 * Form component
 *
 * @example
 * ```
 * const form = form({
 * 	cls: "scroll fit",
 * 	handler: () => {
 *
 * 		console.log(form.getValues());
 *
 * 		const sub = <ContainerField>form.findField("sub");
 * 		const test1 = <TextField>sub.findField("test1");
 * 		test1.setInvalid("Hey something went wrong!");
 * 	},
 * 	items: [
 * 		Fieldset.create({
 * 			items: [
 *
 * 				TextField.create({
 * 					label: "Required field",
 * 					name: "test",
 * 					required: true
 * 				}),
 * 				DateField.create({
 * 					label: "Date",
 * 					name: "date"
 *
 * 				}),
 * 				HtmlField.create({
 * 					label: "Html"
 * 				}),
 *
 * 		    // This will create a "sub" object in the form values with the child components
 * 				ContainerField.create({
 * 					name: "sub",
 * 					items: [
 * 						TextField.create({
 * 							label: "A freaking long stupid label",
 * 							name: "test1",
 * 						}),
 * 						TextField.create({
 * 							label: "Test 2",
 * 							name: "test2",
 * 						}),
 * 					]
 * 				}),
 * 				CheckboxField.create({
 * 					label: "A checkbox label comes after",
 * 					name: "checkbox"
 * 				})
 * 			]
 * 		})
 * 	]
 * });
 *
 * @example Password validation
 *
 * ```
 * 	TextField.create({
 * 		type: "password",
 * 		label: "Password",
 * 		name: "password",
 * 		listeners: {
 * 			validate: (field) => {
 * 				const form = field.findAncestorByInstanceType(Form)!;
 * 				if(field.getValue() != form.findField("confirm")!.getValue()) {
 * 					field.setInvalid("The passwords don't match");
 * 				}
 * 			}
 * 		},
 * 	}),
 *
 * 	TextField.create({
 * 		itemId: "confirm",//item ID used instead of name so this field won't be submitted
 * 		type: "password",
 * 		label: "Confirm password"
 * 	}),
 *
 * ```
 *
 */
export class Form<ValueType extends ContainerFieldValue = ContainerFieldValue> extends ContainerField<ValueType> {
	protected baseCls = "goui-form"
	public hideLabel = true;
	private oldValue?: ValueType;

	constructor() {
		super("form");
	}


	/**
	 * Executed when form is submitted.
	 *
	 * If a promise is returned the "submit" event will fire after it has been resolved.
	 *
	 * @param form
	 */
	public handler: ((this: this, form: Form<ValueType>) => any | Promise<any>) | undefined;

	protected internalRender() {
		const el = super.internalRender();

		// disable browser validation
		this.el.noValidate = true;

		el.addEventListener("submit", (event) => {
			event.preventDefault();
			this.submit();
		});

		el.addEventListener("reset", (e) => {
			e.preventDefault();
			this.reset();
		});

		//Submit forms on CTRL + ENTER. (For html area or text area's)
		el.addEventListener("keydown", (e) => {
			if ((e.ctrlKey || e.metaKey) && e.key == "Enter") {
				e.preventDefault();
				if (document.activeElement && "blur" in document.activeElement) {
					(document.activeElement as HTMLElement).blur();
				}
				this.submit();
			}
		})

		this.trackModifications();

		return el;
	}

	/**
	 * @inheritDoc
	 */
	public reset() {
		this.findFields().forEach((field) => {
			field.reset();
		})
	}


	public trackModifications() {
		this.oldValue = this.value;
	}

	set value(v: Partial<ValueType>) {
		super.value = v;
		this.trackModifications();
	}

	get value(): ValueType {
		return super.value;
	}

	/**
	 * Get the modified field values since the form was:
	 *
	 * - rendered OR
	 * - value was set (usually through a load) OR
	 * - submitted
	 */
	public getModified(): Partial<ValueType> {
		const v = this.value;
		for (const name in this.oldValue) {
			if(JSON.stringify(v[name]) === JSON.stringify(this.oldValue[name])) {
				delete v[name];
			}
		}

		return v;
	}

	/**
	 * Validates the form and submits it using the handler function passed with the config.
	 */
	public async submit() {

		const el = this.el as HTMLFormElement;

		this.clearInvalid();

		if (this.isValid()) {
			el.cls(['+valid', '-invalid']);

			let handlerResponse = undefined;
			if (this.handler) {
				try {
					handlerResponse = await this.handler!(this);

				} catch (e: any) {
					el.cls(['-valid', '+invalid']);

					const msg = typeof (e) == "string" ? e : e.message;
					Notifier.error(msg);
					return;
				}
			}
			this.fire("submit", this, handlerResponse);

			this.trackModifications();

		} else {
			el.cls(['-valid', '+invalid']);

			const invalid = this.findFirstInvalid();
			if (invalid) {
				invalid.focus();
			}

			this.setInvalid(t('You have errors in your form. The invalid fields are marked.'))
		}
	}

	setInvalid(msg: string) {
		super.setInvalid(msg);
		Notifier.error(msg);
	}

}

/**
 * Shorthand function to create {@see Form}
 *
 * @param config
 * @param items
 */
export const form = <ValueType extends ContainerFieldValue = ContainerFieldValue>(config?: Config<Form<ValueType>, FormEventMap<Form<ValueType>>>, ...items: Component[]) => createComponent(new Form<ValueType>, config, items);
