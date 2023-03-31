/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {ContainerField} from "./ContainerField.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "../Observable.js";
import {Notifier} from "../../Notifier.js";
import {Component, Config, createComponent} from "../Component.js";
import {FieldEventMap} from "./Field.js";
import {t} from "../../Translate.js";
import {AbstractDataSource, BaseEntity, DefaultEntity, EntityID} from "../../data/index.js";


export interface FormEventMap<Sender extends Observable> extends FieldEventMap<Sender> {
	/**
	 * Fires when the form is submitted. The event is fired after calling the handler.
	 *
	 * You can check if the form is valid after submitting with {@see form.isValid()}
	 *
	 * @param form
	 */
	submit: <T extends Sender>(form: T, handlerResponse: any) => any,

	/**
	 * Not fired by the framework. But comes in handy when you extend this form and add a cancel button
	 *
	 * @param form
	 */
	cancel: <T extends Sender>(form: T) => any

	saved: <T extends Sender>(form:T, response:any) => any

	/**
	 * When the data is fetched from the store. but before it is put into the fields
	 * @param form
	 * @param data the entity from the store
	 */
	load: <T extends Sender>(form: T, data: any) => any,

	/**
	 * When the data in the fields is serialized to a single json object to be posted to the server.
	 * @param form
	 * @param data
	 */
	serialize: <T extends Sender>(form: T, data: any) => void,
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
export class Form extends ContainerField {
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
	public handler: ((this: this, form: Form) => any|Promise<any>) | undefined;

	store?: AbstractDataSource

	protected currentId?: EntityID

	public create(data: any) {
		this.reset();
		this.currentId = '_new_';
		this.fire('load', this, data);
		if(data){
			this.setValues(data);
		}
	}

	public async load(id: EntityID) {

		this.mask();

		try {
			this.currentId = id;
			let entity = await this.store!.single(id);
			if(!entity) {
				throw "Failed to load entity with id " + id;
			}
			this.fire('load', this, entity);
			this.value = entity;
		} catch (e) {
			alert(t("Error")+ ' '+ e);
		} finally {
			this.unmask();
		}
	}

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
					(document.activeElement as HTMLElement).blur();
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
		delete this.currentId;
	}

	/**
	 * Validates the form and submits it using the handler function passed with the config.
	 */
	public async submit() {

		const el = this.el as HTMLFormElement;

		this.clearInvalid();

		if (this.isValid()) {
			el.cls(['+valid','-invalid']);

			let handlerResponse = undefined;
			if (this.handler) {
				try {
					handlerResponse = await this.handler!(this);
				}catch(e:any){
					el.cls(['-valid','+invalid']);

 					const msg = typeof(e) == "string" ? e : e.message;
					Notifier.error(msg);
					return;
				}
			} else if(this.store) {
				try {
					this._value = {};
					let v = this.value as DefaultEntity;
					if( this.currentId) {
						v.id = this.currentId;
					}
					this.fire('serialize', this, v);

					let response;
					if(this.currentId) {
						response = this.store.update(v);
					} else {
						response = this.store.create(v);
					}

					if(response) {
						this.fire('saved', this, response);
					}

				} catch (e) {
					console.log(t("Error"), e);
				} finally {
					this.unmask();
				}
			}

			this.fire("submit", this, handlerResponse);

			//this.reset();
		} else {
			el.cls(['-valid','+invalid']);

			Notifier.error(t('You have errors in your form. The invalid fields are marked.'));

			const invalid = this.findFirstInvalid();
			if(invalid) {
				invalid.focus();
			}
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
export const form = (config?: Config<Form>, ...items: Component[]) => createComponent(new Form, config, items);
