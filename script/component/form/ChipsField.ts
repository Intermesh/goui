import {Field, FieldConfig, FieldEventMap, FieldValue} from "./Field.js";
import {comp, Component, ComponentEventMap, createComponent, span} from "../Component.js";
import {btn} from "../Button.js";
import {t} from "../../Translate.js";
import {Listener, ObservableListenerOpts} from "../Observable.js";


export interface ChipsField {
	get value(): FieldValue[],
	set value(v: FieldValue[])
}

export interface ChipEventMap extends ComponentEventMap {
	deleteclick: {}
}


class Chip extends Component<ChipEventMap> {
	private textComponent: Component;
	constructor() {
		super();

		this.cls = "chip";

		this.items.add(
			this.textComponent = span({}),
			btn({
				title: t("Remove"),
				icon: "cancel",
				cls: "small",
				handler: (btn) => {
					this.fire("deleteclick", {});
				}
			})
		);
	}

	get text(): string {
		return this.textComponent.text;
	}

	set text(text: string) {
		this.textComponent.text = text;
		this.title = text;
	}
}
export type ChipRendered = (chip:Component, value: any) => Promise<void> | void
/**
 * Chips component
 */
export class ChipsField<EventMap extends FieldEventMap = FieldEventMap> extends Field<EventMap> {

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
	public chipRenderer : ChipRendered = (chip:Component, value: any) => {
		chip.text = value;
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
		this._editor!.el.addEventListener("blur", () => {
			this._editor!.el.innerText = "";
		})
		//this._editor.render(this.chipsContainer!);

		this.items.add(this._editor);

		return this.chipsContainer;
	}

	// get value(): FieldValue[] {
	// 	return super.value as FieldValue[];
	// }
	//
	// set value(v: FieldValue[]) {
	// 	super.value = v;
	// }

	protected onEditorKeyDown(ev: KeyboardEvent) {

		this.clearInvalid();

		switch (ev.key) {
			case "Enter":
				this.onEnter(ev);
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
						this.select(this.selectedIndex);
					}
					// this.focus();
				}
				break;
		}
	}

	protected onEnter(ev: KeyboardEvent) {
		ev.preventDefault();
		const chip = this.createChip();
		this.textInputToValue(this._editor!.text).then((value) => {
			if (!value) {
				return;
			}

			let r = this.chipRenderer(chip, value);

			if (r instanceof Promise) {
				r.then(() => {
					this.items.insert(-1, chip);
					this.value = this.value.concat([value]);
				});
			} else {
				this.items.insert(-1, chip);
				this.value = this.value.concat([value]);
			}
		});

		this._editor!.text = "";
	}

	private createChip() {

		const chip = new Chip();
		chip.on("deleteclick", comp1 => {
			this.captureValueForChange();
			const index = this.items.indexOf(chip);
			chip.remove();
			this.value.splice(index, 1);
			this.fireChange();
		})

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

			//remove all chips except the editor (last item).
			while(this.items.count() > 1) {
				this.items.removeAt(0);
			}

			v.forEach((v:any) => {
				const chip =  this.createChip();
				this.chipRenderer(chip, v);
				chip.dataSet.value = v;
				this.items.insert(-1, chip);
			});

	}

	protected internalGetValue(): FieldValue {
		const v: any[] = [];

		this.items.forEach((item) => {
			if(item.dataSet.value) {
				v.push(item.dataSet.value);
			}
		});

		return v;
	}

	// protected internalRender(): HTMLElement {
	// 	const el = super.internalRender();
	// 	this.renderValue();
	// 	return el;
	// }
	//
	// private renderValue() {
	// 	const v = this.internalGetValue() as Array<any>;
	//
	// 	if(!v) {
	// 		return;
	// 	}
	//
	// 	v.forEach((v:any) => {
	// 		const chip =  this.createChip();
	//
	// 		this.chipRenderer(chip, v).then(() => {
	// 			this.items.insert(-1, chip);
	// 		});
	// 	});
	// }

	focus(o?: FocusOptions) {
		this.editor.focus(o);
	}


}

type ChipsConfig = FieldConfig<ChipsField> &
	// Add the function properties as they are filtered out
	Partial<Pick<ChipsField, "textInputToValue" | "chipRenderer">>
/**
 * Shorthand function to create {@link ChipsField}
 *
 * @param config
 */
export const chips = (config?: ChipsConfig) => createComponent(new ChipsField(), config);



