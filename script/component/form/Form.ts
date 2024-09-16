/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {ContainerField, ContainerFieldValue} from "./ContainerField.js";
import {Config, Listener, ObservableListenerOpts} from "../Observable.js";
import {Notifier} from "../../Notifier.js";
import {Component, createComponent} from "../Component.js";
import {Field, FieldConfig, FieldEventMap} from "./Field.js";
import {t} from "../../Translate.js";
import {DatePickerEventMap} from "../picker.js";


export type FormHandler<ValueType extends ContainerFieldValue = ContainerFieldValue> = ((form: Form<ValueType>) => any | Promise<any>) | undefined;

export interface FormEventMap<Type, ValueType extends ContainerFieldValue = ContainerFieldValue> extends FieldEventMap<Type> {
	/**
	 * Fires when the form is valid and submitted. The event is fired after calling the handler.
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
	on<K extends keyof FormEventMap<this, ValueType>, L extends Listener>(eventName: K, listener: Partial<FormEventMap<this,ValueType>>[K], options?: ObservableListenerOpts): L
	un<K extends keyof FormEventMap<this, ValueType>>(eventName: K, listener: Partial<FormEventMap<this, ValueType>>[K]): boolean
	fire<K extends keyof FormEventMap<this, ValueType>>(eventName: K, ...args: Parameters<FormEventMap<any, ValueType>[K]>): boolean

	get el(): HTMLFormElement


}

/**
 * Form component
 *
 * Forms can be used to submit or present data.
 *
 * @example Password validation
 *
 * ```
 * 	textfield({
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
 * 	textfield({
 * 		itemId: "confirm",//item ID used instead of name so this field won't be submitted
 * 		type: "password",
 * 		label: "Confirm password"
 * 	}),
 *
 * ```
 *
 */
export class Form<ValueType extends ContainerFieldValue = ContainerFieldValue> extends ContainerField<ValueType> {

	/**
	 * When this is set to true, the field will use the values set as their original value, used for resetting and
	 * determining if the field was modified.
	 */
	public static TRACK_RESET_VALUES = false;

	protected baseCls = "goui-form"
	public hideLabel = true;

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
	public handler: FormHandler<ValueType>;

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

	set value(v: Partial<ValueType>) {
		super.value = v;
		this.trackReset();
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
	public get modified(): Partial<ValueType> {
		const v:Partial<ValueType> = {};

		this.findFields().forEach((field: any) => {
			if(field instanceof Field) {
				if (field.name && !field.disabled && field.isModified()) {
					v[field.name as keyof ValueType] = field.value as any;
				}
			} else
			{
				//for Extjs compat try .getName() and .getValue()
				const fieldName = field.getName()  as keyof ValueType;
				if (fieldName && !field.disabled && field.isDirty()) {
					v[fieldName] = field.getValue();
				}
			}
		});

		return v;
	}

	/**
	 * Validates the form and submits it using the handler function passed with the config.
	 */
	public async submit() : Promise<boolean>{

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
					return false;

				}
			}
			this.fire("submit", this, handlerResponse);

			return true;

		} else {
			el.cls(['-valid', '+invalid']);

			const invalid = this.findFirstInvalid();
			if (invalid) {
				invalid.focus();
			}

			this.setInvalid(t('You have errors in your form. The invalid fields are marked.'))

			return false;
		}
	}

	setInvalid(msg: string) {
		super.setInvalid(msg);
		Notifier.error(msg);
	}

}
export type FormConfig<ValueType extends ContainerFieldValue = ContainerFieldValue> =
	FieldConfig<Form<ValueType>, FormEventMap<Form<ValueType>>> & {
	/**
	 * Executed when form is submitted.
	 *
	 * If a promise is returned the "submit" event will fire after it has been resolved.
	 *
	 * @param form
	 */
	handler?: FormHandler<ValueType>;
}
/**
 * Shorthand function to create {@see Form}
 *
 * @param config
 * @param items
 */
export const form = <ValueType extends ContainerFieldValue = ContainerFieldValue>(config?: FormConfig<ValueType>, ...items: Component[]) => createComponent(new Form<ValueType>, config, items);
