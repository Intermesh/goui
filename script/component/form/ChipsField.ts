import {TextAreaField} from "./TextareaField.js";
import {TextField} from "./TextField.js";
import {Field, FieldEventMap} from "./Field";
import {comp, Component, createComponent} from "../Component";
import {Config} from "../Observable";
import {AutocompleteEventMap, AutocompleteField} from "./AutocompleteField";
import {E} from "../../util/Element.js";
export class ChipsField extends Field {

	protected baseCls = 'goui-form-field chips';
	private editor?: Component;
	private chipsContainer?: HTMLDivElement;

	/**
	 * Function that transforms the user text input to a chip
	 *
	 * @param text
	 */
	public textInputToValue = async (text: string) :Promise<any> => {
		return text;
	}

	/**
	 * Renders a value to the chip component
	 * @param value
	 */
	public chipRenderer = async (chip:Component, value: any) => {
		chip.text = value;
	}

	protected createControl(): HTMLElement | undefined {

		this.items.on("datachanged", collection => {
			this.el.classList.toggle("has-chips", this.items.count() > 1)
		})


		this.editor = comp({
			attr: {
				contentEditable: "true"
			},
			cls: "editor"
		})

		this.editor.el.addEventListener("keydown", (ev) => {
			this.onEditorKeyDown(ev);
		});

		this.wrap!.tabIndex = -1;
		this.wrap!.addEventListener("keydown", (ev) => {
			this.onElKeyDown(ev);
		})

		this.wrap!.addEventListener("focus", (ev) => {
			if(this.selectedIndex == -1) {
				this.editor!.focus();
			}
		})

		this.editor!.el.addEventListener("focus", (ev) => {
			this.clearSelection();
		})

		this.editor.render(this.wrap!);

		this.items.add(this.editor);

		return undefined;
	}

	private onEditorKeyDown(ev: KeyboardEvent) {

		this.clearInvalid();

		switch (ev.key) {
			case "Enter":
				ev.preventDefault();
				const chip =  this.createChip();
				this.textInputToValue(this.editor!.text).then((value) => {
					return this.chipRenderer(chip, value).then(() => {
						this.items.insert(-1, chip);
					})
				});

				this.editor!.text = "";

			break;

			case "ArrowLeft":
			case "Backspace":
				ev.stopPropagation();
				if(this.editor!.html == "") {
					ev.preventDefault();

					this.select(this.items.count() - 2);
					this.wrap!.focus();

				}
				break;
		}
	}

	private createChip() {
		const chip = comp({
			cls: "chip"
		});
		chip.el.addEventListener("click" , () => {
			this.select(this.items.indexOf(chip));
			this.wrap!.focus();
		})
		return chip;
	}

	protected get itemContainerEl(): HTMLElement {
		return this.wrap!;
	}

	private selectedIndex = -1;

	private clearSelection() {
		if(this.selectedIndex > -1) {
			this.items.get(this.selectedIndex).el.classList.remove("selected");
			this.selectedIndex = -1;
		}
	}

	private select(index:number) {

		if(index < 0) {
			return;
		}

		this.clearSelection();

		if(index > (this.items.count() - 2)) {
			this.editor!.focus();
			return;
		}

		this.selectedIndex = index;
		this.items.get(this.selectedIndex).el.classList.add("selected");

	}
	private onElKeyDown(ev: KeyboardEvent) {
		switch (ev.key) {
			case "Delete":
			case "Backspace":
				this.items.get(this.selectedIndex).remove();
				this.select(this.selectedIndex);
				break;

			case "ArrowLeft":
				this.select(this.selectedIndex - 1);
				break;

			case "ArrowRight":
				this.select(this.selectedIndex + 1);
				break;
		}
	}

	protected internalSetValue(v: any[], old: any) {
		if(this.rendered) {
			this.renderValue();
		}
	}

	protected internalRender(): HTMLElement {
		const el = super.internalRender();
		this.renderValue();
		return el;
	}

	private renderValue() {
		this.value.forEach((v:any) => {
			const chip =  this.createChip();

			this.chipRenderer(chip, v).then(() => {
				this.items.insert(-1, chip);
			});
		});
	}
}

type ChipsConfig = Config<ChipsField, FieldEventMap<ChipsField>> &
	// Add the function properties as they are filtered out
	Partial<Pick<ChipsField, "textInputToValue" | "chipRenderer">>
/**
 * Shorthand function to create {@see ChipsField}
 *
 * @param config
 */
export const chips = (config?: ChipsConfig) => createComponent(new ChipsField(), config);



