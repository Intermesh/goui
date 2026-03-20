/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { ContainerField, ContainerFieldValue } from "./ContainerField.js";
import { Config } from "../Observable.js";
import { Component } from "../Component.js";
import { FieldEventMap } from "./Field.js";
export type FormHandler<FormType extends Form> = (<F extends FormType>(form: F) => any | Promise<any>) | undefined;
/**
 * @inheritDoc
 */
export interface FormEventMap extends FieldEventMap {
    /**
     * Fires when the form is valid and submitted. The event is fired after calling the handler.
     *
     * @param form
     */
    beforesubmit: {};
    /**
     * Fires when the form is valid (client side) and submitted. The event is fired after calling the handler.
     *
     * When a server side error occurs handlerResponse will be empty and error will be set
     *
     * @param form
     */
    submit: {
        handlerResponse: any;
        error: any;
    };
    /**
     * Not fired by the framework. But comes in handy when you extend this form and add a cancel button
     *
     * @param form
     */
    cancel: {};
}
/**
 * Form component
 *
 * Forms can be used to submit or present data.
 *
 * @example https://goui.io/#form Examples
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
export declare class Form<ValueType extends ContainerFieldValue = ContainerFieldValue, EventMap extends FormEventMap = FormEventMap> extends ContainerField<EventMap, ValueType> {
    /**
     * When this is set to true, the field will use the values set as their original value, used for resetting and
     * determining if the field was modified.
     */
    static TRACK_RESET_VALUES: boolean;
    protected baseCls: string;
    hideLabel: boolean;
    constructor();
    readonly el: HTMLFormElement;
    /**
     * Executed when form is submitted.
     *
     * If a promise is returned the "submit" event will fire after it has been resolved. Also, the form will be masked during
     * the promise.
     *
     * @param form
     */
    handler: FormHandler<this>;
    protected internalRender(): HTMLElement;
    set value(v: Partial<ValueType>);
    get value(): ValueType;
    /**
     * Get the modified field values since the form was:
     *
     * - rendered OR
     * - value was set (usually through a load) OR
     * - submitted
     */
    get modified(): Partial<ValueType>;
    /**
     * Validates the form and submits it using the handler function passed with the config.
     */
    submit(): Promise<boolean>;
    setInvalid(msg: string): void;
}
/**
 * Shorthand function to create {@link Form}
 *
 * @param config
 * @param items
 */
export declare const form: <ValueType extends ContainerFieldValue = ContainerFieldValue>(config?: Config<Form>, ...items: Component[]) => Form<ValueType, FormEventMap>;
