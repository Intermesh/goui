import {Component, createComponent} from "../Component.js";
import {E} from "../../util/index.js";
import {checkbox, CheckboxField, CheckboxFieldConfig} from "./CheckboxField.js";
import {Config} from "../Observable";


export class CheckboxGroup extends Component {
	private _itemContainerEl?: HTMLDivElement;
	constructor() {
		super("fieldset");

		this.baseCls = "checkbox-group";

	}

	set options(options:CheckboxFieldConfig[]) {
		this.items.replace(...options.map(o => {
			o.type = "button";
			return checkbox(o)
		}))
	}

	protected createLabel(): HTMLDivElement | void {
		return;
	}

	public label:string = "";

	protected renderItems() {

		const label = E("h3").cls("legend");
		label.innerText = this.label;
		this.el.appendChild(label);

		return super.renderItems();
	}

	protected get itemContainerEl(): HTMLDivElement {
		if(!this._itemContainerEl) {
			this._itemContainerEl = E("div").cls("goui group");
			this.el.appendChild(this._itemContainerEl)
		}

		return this._itemContainerEl;
	}
}

export const checkboxgroup = (config?: Config<CheckboxGroup>) => createComponent(new CheckboxGroup(), config);