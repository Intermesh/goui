/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Component, ComponentEventMap } from "../Component.js";
import { Config } from "../Observable.js";
import { Button } from "../Button.js";
import { MaterialIcon } from "../MaterialIcon.js";
import { Menu } from "../menu";
/**
 * @inheritDoc
 */
export interface FieldEventMap extends ComponentEventMap {
    /**
     * Fires when the field is changed by the user. It fires on blur.
     *
     * Note: this event does not fire on {@link ContainerField} and {@link Form}
     *
     * @param field
     */
    change: {
        /**
         * The new field value
         */
        readonly newValue: any;
        /**
         * The previous value before the change.
         */
        readonly oldValue: any;
    };
    /**
     * Fires when the value is set programmatically
     *
     */
    beforesetvalue: {
        /**
         * The new field value.
         *
         * It's possible to change the value in this event
         */
        value: any;
        /**
         * The old field value
         */
        readonly oldValue: any;
    };
    /**
     * Fires when the value is retrieved
     */
    beforegetvalue: {
        /**
         * The field value
         *
         * It's possible to change that value in this event
         */
        value: any;
    };
    /**
     * Fires when the field value is set programmatically or changed by the user
     */
    setvalue: {
        /**
         * The new field value
         */
        readonly newValue: any;
        /**
         * The old field value before it was set
         */
        readonly oldValue: any;
    };
    /**
     * Fires when field is reset
     */
    reset: {
        /**
         * The new value the field resets to
         */
        readonly newValue: any;
        /**
         * The field value before the reset action
         */
        readonly oldValue: any;
    };
    /**
     * Fires when the field loses focus
     */
    blur: {};
    /**
     * Fires when validated
     *
     * Use {@link setInvalid()} to mark field invalid
     */
    validate: {};
    /**
     * Fires when the field is invalid
     *
     * Use {@link setInvalid()} to mark field invalid
     *
     * @param field
     */
    invalid: {};
}
export type FieldValue = string | number | boolean | any[] | undefined | null | Record<string, any>;
/**
 * Base class for a form field
 *
 * Field components should at least implement "createControl" and "internalSetValue".
 */
export declare abstract class Field<EventMap extends FieldEventMap = FieldEventMap> extends Component<EventMap> {
    private _buttons?;
    private toolbar?;
    private _wrap?;
    protected _labelEl?: HTMLElement;
    private _icon;
    protected iconEl?: HTMLElement;
    /**
     * Tracks if the field currently has focus.
     *
     * @private
     */
    private hasFocus;
    constructor(tagName?: keyof HTMLElementTagNameMap);
    readonly isFormField = true;
    /**
     * Adds standard style. You may want to remove this if you don't want the standard
     * look of a form field.
     *
     * @protected
     */
    protected baseCls: string;
    private _name?;
    private _required;
    private _readOnly;
    private _label;
    protected _value: FieldValue;
    protected control: HTMLElement | undefined;
    /**
     * The value this field resets to when a form is reset with the reset() function
     * Changes when a form loads.
     * @protected
     */
    protected resetValue: any;
    /**
     * The value that was set before adding this component to a parent. This is used with the clear() function.
     * Useful when reusing a form for multiple save and load actions.
     *
     * @protected
     */
    protected defaultValue: any;
    invalidMsg: string;
    private _hint;
    private hintEl?;
    /**
     * Used for "change" event
     * @protected
     */
    protected valueOnFocus?: FieldValue;
    /**
     * Validate the field on blur.
     *
     * Not recommended as it's causing annoying GUI jumping when adding the validation messages. It causes to click
     * next to the desired element.
     */
    validateOnBlur: boolean;
    /**
     * Fires a change event if the field's value is different since it got focus
     * @protected
     */
    protected fireChangeOnBlur: boolean;
    onAdded(index: number): void;
    protected onFocusOut(e: FocusEvent): void;
    /**
     * Return true if the field was modified
     */
    protected isChangedSinceFocus(): boolean;
    /**
     * Checks if the focus out or focus in is relevant for capturing the change event.
     * Useful to override when using a menu in the field. Then you should also check if the focus is in the menu.
     *
     * @param e
     * @protected
     */
    protected eventTargetIsInFocus(e: FocusEvent): boolean;
    protected onFocusIn(e: FocusEvent): void;
    protected captureValueForChange(): void;
    protected internalRender(): HTMLElement;
    isFocusable(): boolean;
    /**
     * A wrapper DIV element that contains input and toolbar for input buttons like an expand button for a drop-down
     */
    get wrap(): HTMLDivElement;
    /**
     *
     * Renders wrap with icon and buttons etc. If you want complete control over the rendered components then override this
     * to do nothing and add child items.
     *
     * @protected
     */
    protected renderControl(): void;
    private renderButtons;
    /**
     * When buttons with menus are added it is handy to delay the validation on blur.
     * Because when the user will click something in the menu it will blur the field and you probably don't
     * want it to validate at that point. It's important that the menu will return focus to the field
     * and sets the value afterward.
     *
     * @param menu
     * @protected
     */
    protected setupMenu(menu: Menu): void;
    protected createControl(): HTMLElement | undefined;
    /**
     * Render buttons inside the text field
     *
     * @example
     * ```
     * buttons: [
     * 				 		btn({icon: "clear", handler:(btn) => (btn.parent!.parent! as Field).value = ""})
     * 					]
     * ```
     * @param buttons
     */
    set buttons(buttons: Component[]);
    get buttons(): Component[];
    /**
     * Add a button
     *
     * @param btn
     */
    addButton(btn: Button): void;
    protected createHint(): HTMLDivElement | void;
    protected createLabel(): HTMLElement | void;
    private getLabelText;
    /**
     * Form element name which will be the key in values
     * If omitted the field won't be included in the form values.
     */
    get name(): string;
    /**
     * The field's name
     */
    set name(name: string);
    get required(): boolean;
    /**
     * Required or not
     */
    set required(required: boolean);
    get label(): string;
    /**
     * The field's label
     */
    set label(label: string);
    get icon(): MaterialIcon | "" | undefined;
    /**
     * The field's icon rendered at the left inside the field
     */
    set icon(icon: MaterialIcon | "" | undefined);
    get hint(): string;
    /**
     * The field's hint text
     */
    set hint(hint: string);
    get readOnly(): boolean;
    /**
     * Make the field read only
     */
    set readOnly(readOnly: boolean);
    /**
     * Check if the field was modified since create or when a form was loaded and @see trackReset() was called.
     */
    isModified(): boolean;
    /**
     * Get the old value before user modifications were made after {@link trackReset()}
     */
    getOldValue(): any;
    /**
     * Copies the current value to the reset value. Typically happens when this component was added to a parent and
     * when the form it belongs too loads.
     *
     * @see Form in the trackModifications method
     */
    trackReset(): void;
    /**
     * Set the field value
     */
    set value(v: FieldValue);
    protected checkHasValue(): void;
    /**
     * Applies set value to the control.
     *
     * This is also called when the control is rendered. Note that this.rendered is still false when that happens.
     *
     * @param v
     * @protected
     */
    protected internalSetValue(v?: any): void;
    /**
     * Helper to fire "change" event. Child classes must implement this.
     */
    protected fireChange(fireSetValue?: boolean): void;
    get value(): FieldValue;
    protected internalGetValue(): FieldValue;
    /**
     * Reset the field value to the value that was given to the field's constructor
     * @see setValue()
     */
    reset(): void;
    /**
     * Clears the field to it's original state set in the code.
     *
     *
     * @param setValue When the form loads it's cleared but we don't need to set the value
     *
     */
    clear(setValue?: boolean): void;
    /**
     * Set the field as invalid and set a message
     *
     * @param msg
     */
    setInvalid(msg: string): void;
    /**
     * Check if the field is empty
     */
    isEmpty(): boolean;
    protected validate(): void;
    protected internalRemove(): void;
    protected setValidityState(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): void;
    protected applyInvalidMsg(): void;
    /**
     * Clears the invalid state
     */
    clearInvalid(): void;
    /**
     * Check if the field is marked invalid without doing any validation
     */
    isMarkedInvalid(): boolean;
    /**
     * Checks if the field is valid. It performs validation too.
     * If you want to check if the field is marked as invalid without validation use isMarkedInvalid()
     */
    isValid(): boolean;
    private createIcon;
    protected renderIcon(): void;
}
export type FieldConfig<Cmp extends Field, Required extends keyof Cmp = never> = Omit<Config<Cmp, Required>, "isValid" | "clearInvalid" | "isEmtpy" | "isFocussable" | "isModified" | "reset" | "setInvalid" | "trackReset">;
