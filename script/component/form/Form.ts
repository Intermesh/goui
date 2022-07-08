import {ContainerField} from "./ContainerField.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "../Observable.js";
import {Notifier} from "../../Notifier.js";
import {Component, Config} from "../Component.js";
import {FieldEventMap} from "./Field.js";


export interface FormEventMap<Sender extends Observable> extends FieldEventMap<Sender> {
	/**
	 * Fires before adding an item. Return false to abort.
	 *
	 * @param form
	 */
	submit: <T extends Sender>(form: T) => any
}

export interface Form {
	on<K extends keyof FormEventMap<this>>(eventName: K, listener: Partial<FormEventMap<this>>[K], options?: ObservableListenerOpts): void

	fire<K extends keyof FormEventMap<this>>(eventName: K, ...args: Parameters<FormEventMap<this>[K]>): boolean

	set listeners(listeners: ObservableListener<FormEventMap<this>>)

	get el(): HTMLFormElement
}

/**
 * Form component
 *
 * @example
 * ```
 * const form = Form.create({
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
export class Form extends ContainerField {
	protected baseCls = "form"
	public hideLabel = true;

	constructor() {
		super("form");
	}


	/**
	 * Executed when form is submitted
	 *
	 * @param form
	 */
	public handler: ((this: this, form: Form) => void) | undefined;


	protected internalRender() {
		const el = super.internalRender();

		// disable browser validation
		this.el.noValidate = true;

		if (this.handler) {

			el.addEventListener("submit", (event) => {
				event.preventDefault();
				this.submit();
			});
		}

		el.addEventListener("reset", (e) => {
			e.preventDefault();
			this.reset();
		});

		//Submit forms on CTRL + ENTER. (For html area or text area's)
		el.addEventListener("keydown", (e) => {
			if ((e.ctrlKey || e.metaKey) && e.key == "Enter") {
				e.preventDefault();
				if (document.activeElement && "blur" in document.activeElement) {
					(<HTMLElement>document.activeElement).blur();
				}
				this.submit();
			}
		})

		return el;
	}


	/**
	 * Get all form values
	 */
	getValues(): { [key: string]: any } {
		return this.value;
	}

	/**
	 * Set form field values
	 *
	 * @param v
	 */
	setValues(v: { [key: string]: any }) {
		this.value = v;
	}

	/**
	 * @inheritDoc
	 */
	public reset() {
		this.findFields().forEach((field) => {
			field.reset();
		})
	}

	/**
	 * Validates the form and submits it using the handler function passed with the config.
	 */
	public submit() {

		let el = <HTMLFormElement>this.el;

		this.clearInvalid();

		if (this.isValid()) {
			el.classList.add('valid');
			el.classList.remove('invalid');
			if (this.handler) {
				this.handler!(this);
			}

			this.fire("submit", this);
		} else {
			el.classList.add('invalid');
			el.classList.remove('valid');

			Notifier.error("The form is invalid. Please check your input.");
		}
	}

	/**
	 * @inheritDoc
	 */
	public focus(o?: FocusOptions) {
		const fields = this.findFields();
		if (fields.length) {
			fields[0].focus(o);
		} else {
			super.focus(o);
		}
	}

}

/**
 * Shorthand function to create {@see Form}
 *
 * @param config
 * @param items
 */
export const form = (config?: Config<Form>, ...items: Component[]) => {
	const c = new Form();
	if(config) {
		Object.assign(c, config);
	}
	if(items.length) {
		c.items.add(...items);
	}
	return c;
}
