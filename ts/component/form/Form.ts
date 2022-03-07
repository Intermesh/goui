import {ContainerField, ContainerFieldConfig, ContainerFieldEventMap} from "./ContainerField.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "../Observable.js";
import {Alert} from "../../Alert.js";
import {Key} from "../../util/Key.js";

export interface FormConfig<T extends Observable> extends ContainerFieldConfig<T> {
	/**
	 * Executed when form is submitted
	 *
	 * @param form
	 */
	handler?: (this: this, form: Form) => void

	/**
	 * @inheritDoc
	 */
	listeners?: ObservableListener<FormEventMap<T>>
}


export interface FormEventMap<T extends Observable> extends ContainerFieldEventMap<T> {
	/**
	 * Fires before adding an item. Return false to abort.
	 *
	 * @param form
	 */
	submit?: (form: T) => any
}

export interface Form {
	on<K extends keyof FormEventMap<Form>>(eventName: K, listener: FormEventMap<Form>[K], options?: ObservableListenerOpts): void
	fire<K extends keyof FormEventMap<Form>>(eventName: K, ...args: Parameters<NonNullable<FormEventMap<Form>[K]>>): boolean
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
	protected hideLabel = true;
	protected tagName = "form" as keyof HTMLElementTagNameMap

	protected handler: ((this: this, form: Form) => void) | undefined;

	public static create<T extends typeof Observable>(this: T, config?: FormConfig<InstanceType<T>>) {
		return <InstanceType<T>> super.create(<any> config);
	}

	protected internalRender() {
		const el = <HTMLFormElement> super.internalRender();

		// disable browser validation
		el.noValidate = true;

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
			if((e.ctrlKey || e.metaKey) && e.key == Key.Enter) {
				e.preventDefault();
				if(document.activeElement && "blur" in document.activeElement) {
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
		return this.getValue();
	}

	/**
	 * Set form field values
	 *
	 * @param v
	 */
	setValues(v: { [key: string]: any }) {
		this.setValue(v);
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
			if(this.handler) {
				this.handler!(this);
			}

			this.fire("submit", this);
		} else {
			el.classList.add('invalid');
			el.classList.remove('valid');

			Alert.error("The form is invalid. Please check your input.");
		}
	}

	/**
	 * @inheritDoc
	 */
	public focus(o?: FocusOptions) {
		const fields = this.findFields();
		if(fields.length) {
			fields[0].focus(o);
		} else {
			super.focus(o);
		}
	}

}