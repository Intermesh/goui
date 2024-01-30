import {Field, FieldEventMap} from "./Field";
import {comp, Component, createComponent} from "../Component";
import {Config} from "../Observable";
import {btn} from "../Button";
import {t} from "../../Translate";

/**
 * Chips component
 */
export class ChipsField extends Field {

	protected baseCls = 'goui-form-field chips';
	private _editor?: Component;
	private chipsContainer?: HTMLDivElement;

	/**
	 * Function that transforms the user text input to a chip.
	 *
	 * If it returns an empty value no chip will be rendered
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
		chip.items.get(0)!.text = value;
	}

	public get editor() : Component {
		return this._editor!;
	}

	protected createControl(): HTMLElement | undefined {

		this.chipsContainer = document.createElement("div");
		this.chipsContainer.classList.add("control-wrap");

		this._editor = comp({
			id: Component.uniqueID(),
			attr: {
				contentEditable: "true"
			},
			cls: "editor"
		});

		this.el.setAttribute("for", this._editor.id);

		this._editor.el.addEventListener("keydown", (ev) => {
			this.onEditorKeyDown(ev);
		});

		this.el.addEventListener("click", (ev) => {
			if(this.selectedIndex == -1) {
				this._editor!.focus();
			}
		})

		this._editor!.el.addEventListener("focus", (ev) => {
			this.clearSelection();
		})
		//this._editor.render(this.chipsContainer!);

		this.items.add(this._editor);

		return this.chipsContainer;
	}

	private onEditorKeyDown(ev: KeyboardEvent) {

		this.clearInvalid();

		switch (ev.key) {
			case "Enter":
				ev.preventDefault();
				const chip =  this.createChip();
				this.textInputToValue(this._editor!.text).then((value) => {
					if(!value) {
						return;
					}
					return this.chipRenderer(chip, value).then(() => {
						this.items.insert(-1, chip);
						this.value.push(value);
					})
				});

				this._editor!.text = "";

			break;

			case "ArrowRight":
				if(this.selectedIndex > -1) {
					this.select(this.selectedIndex + 1);
				}
				break;

			case "ArrowLeft":
				if(this.selectedIndex == -1) {
					if(this._editor!.html == "") {
						ev.preventDefault();
						this.select(this.items.count() - 2);
					}
				} else {
					this.select(this.selectedIndex - 1);
				}
				break;

			case "Delete":
			case "Backspace":
				ev.stopPropagation();
				if(this._editor!.html == "") {

					if(this.selectedIndex == -1) {
						ev.preventDefault();
						this.select(this.items.count() - 2);
					} else {
						this.items.get(this.selectedIndex)!.remove();
						this.value.splice(this.selectedIndex, 1);
						this.select(this.selectedIndex);
					}
					// this.focus();
				}
				break;
		}
	}

	private createChip() {
		const chip = comp({
			cls: "chip hbox"
		},
			comp({}),
			btn({
				title: t("Remove"),
				icon: "cancel",
				handler: (btn) => {
					this.captureValueForChange();
					const index = this.items.indexOf(chip);
					chip.remove();
					this.value.splice(index, 1);
					this.fireChange();
				}
			})
		);
		chip.el.addEventListener("click" , () => {
			this.select(this.items.indexOf(chip));
			// this.focus();
		})
		return chip;
	}

	protected get itemContainerEl(): HTMLElement {
		return this.chipsContainer!;
	}

	private selectedIndex = -1;

	private clearSelection() {
		if(this.selectedIndex > -1) {
			const item = this.items.get(this.selectedIndex);
			if(item) {
				item.el.classList.remove("selected");
			}
			this.selectedIndex = -1;
		}
	}

	private select(index:number) {

		if(index < 0) {
			return;
		}

		this.clearSelection();

		if(index > (this.items.count() - 2)) {
			this._editor!.focus();
			return;
		}

		this.selectedIndex = index;
		this.items.get(this.selectedIndex)!.el.classList.add("selected");

	}

	protected internalSetValue(v: any[]) {
		if(this.rendered) {
			//remove all chips except the editor (last item).
			for(let i = 0; i < this.items.count() -1; i++) {
				this.items.removeAt(i);
			}

			while(this.items.count() > 1) {
				this.items.removeAt(0);
			}

			this.renderValue();
		}
	}

	protected internalRender(): HTMLElement {
		const el = super.internalRender();
		this.renderValue();
		return el;
	}

	private renderValue() {
		if(!this.value) {
			return;
		}
		this.value.forEach((v:any) => {
			const chip =  this.createChip();

			this.chipRenderer(chip, v).then(() => {
				this.items.insert(-1, chip);
			});
		});
	}

	focus(o?: FocusOptions) {
		this.editor.focus(o);
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



