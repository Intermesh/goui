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


	public chipRenderer = (data: any) => {
		return data;
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

		this.editor.render(this.wrap!);

		this.items.add(this.editor);

		return undefined;
	}

	private onEditorKeyDown(ev: KeyboardEvent) {

		this.clearInvalid();

		console.warn(ev.key);
		switch (ev.key) {
			case "Enter":
				ev.preventDefault();
				this.items.insert(-1, comp({
						cls: "chip",
						html: this.chipRenderer(this.editor!.text)
					})
				);
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

	protected get itemContainerEl(): HTMLElement {
		return this.wrap!;
	}

	private selectedIndex = -1;

	private select(index:number) {

		if(index < 0) {
			return;
		}

		if(this.selectedIndex > -1) {
			this.items.get(this.selectedIndex).el.classList.remove("selected");
		}

		if(index > (this.items.count() - 2)) {
			this.editor!.focus();
			return;
		}

		this.selectedIndex = index;
		this.items.get(this.selectedIndex).el.classList.add("selected");

	}
	private onElKeyDown(ev: KeyboardEvent) {
		switch (ev.key) {
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
}


/**
 * Shorthand function to create {@see ChipsField}
 *
 * @param config
 */
export const chips = (config: Config<ChipsField, FieldEventMap<ChipsField>>) => createComponent(new ChipsField(), config);