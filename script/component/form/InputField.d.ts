import { Field, FieldEventMap, FieldValue } from "./Field.js";
export interface InputFieldEventMap extends FieldEventMap {
    /**
     * Fires on input
     */
    input: {
        value: any;
    };
}
export declare abstract class InputField<EventMap extends InputFieldEventMap = InputFieldEventMap> extends Field<EventMap> {
    protected _input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | undefined;
    protected fireChangeOnBlur: boolean;
    constructor();
    /**
     * Get the DOM HTMLInputElement
     */
    get input(): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | undefined;
    protected onFirstListenerAdded(eventName: keyof EventMap): void;
    set title(title: string);
    focus(o?: FocusOptions): void;
    /**
     * Selects all the text in the field
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLInputElement/select)
     */
    select(): void;
    protected createControl(): HTMLElement;
    protected createInput(): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    setInvalid(msg: string): void;
    clearInvalid(): void;
    protected internalSetValue(v: FieldValue): void;
    protected internalGetValue(): FieldValue;
    set name(name: string);
    get name(): string;
    set type(type: string);
    get type(): string;
    /**
     * Autocomplete value
     *
     * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
     *
     * @param autocomplete
     */
    set autocomplete(autocomplete: AutoFill);
    get autocomplete(): AutoFill;
    /**
     * When the field is empty this will be displayed inside the field
     *
     * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/placeholder
     *
     * @param placeholder
     */
    set placeholder(placeholder: string);
    get placeholder(): string;
    /**
     * Make field read only
     *
     * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly
     * @param readOnly
     */
    set readOnly(readOnly: boolean);
    get readOnly(): boolean;
    /**
     * Make field required
     */
    get required(): boolean;
    set required(required: boolean);
    get disabled(): boolean;
    set disabled(disabled: boolean);
    protected validate(): void;
}
