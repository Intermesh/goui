import {Observable, ObservableListener, ObservableListenerOpts} from "../Observable.js";
import {btn, Button, ButtonEventMap} from "../Button.js";
import {Component, Config, createComponent} from "../Component.js";
import {Menu, menu} from "../menu/Menu.js";
import {Field} from "../form/Field.js";

export interface Picker extends Component {
	setValue(val:any): void
}

export interface PickerButtonEventMap<T extends Observable> extends ButtonEventMap<T> {
	/**
	 * Fires when suggestions need to load
	 *
	 * @param form
	 */
	expand: <Sender extends T>(field: Sender) => any
	collapse: <Sender extends T>(field: Sender) => any
}

export interface PickerButton {
	on<K extends keyof PickerButtonEventMap<this>>(eventName: K, listener: Partial<PickerButtonEventMap<this>>[K], options?: ObservableListenerOpts): void
	fire<K extends keyof PickerButtonEventMap<this>>(eventName: K, ...args: Parameters<PickerButtonEventMap<this>[K]>): boolean
	set listeners(listeners: ObservableListener<PickerButtonEventMap<this>>)
}

/**
 * Autocomplete field
 */
export class PickerButton extends Button {

	//menu: Menu

	field!: Field
	//menu: Menu

	handler = () => { this.field.focus(); }

	constructor(readonly picker: Picker) {
		super();
		this.menu = menu({removeOnClose: false},this.picker);
		this.icon = "expand_more";
		this.type = "button";
	}

	protected internalRender(): HTMLElement {

		const el = super.internalRender().on('click', _ => {this.expand();});
			//.on('focus', _ => {this.expand();})
			//.on('blur', _ => {this.collapse()});

		this.field = this.parent!.parent as Field;
		this.picker.on("select", () => {setTimeout(() => { this.collapse(); }, 20)});

		return el;
	}

	private expand(){
		const rect = this.field.el!.getBoundingClientRect();
		this.menu!.show();
		this.menu!.showAt({
			x: rect.x,
			y: rect.bottom
		});
		//this.menu.show();
		this.picker.focus();
		this.fire('expand', this);
		this.el.cls("+expanded");
	}

	private collapse() {
		this.el.cls("-expanded");
		this.menu!.hide();
	}

}

export const pickerbutton = (config: Config<PickerButton> & { picker: Component }) => createComponent(new PickerButton(config.picker), config);