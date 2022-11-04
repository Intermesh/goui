import {btn, Button, ButtonEventMap} from "./Button.js";
import {tbar, Toolbar} from "./Toolbar.js";
import {t} from "../Translate.js";
import {TextField, textfield} from "./form/TextField.js";
import {Component, Config, createComponent} from "./Component.js";
import {FunctionUtil} from "../util/FunctionUtil.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "./Observable.js";
import {DraggableComponentEventMap} from "./DraggableComponent.js";
import {Window} from "./Window.js";


/**
 * @inheritDoc
 */
export interface SearchButtonEventMap<Type extends Observable> extends ButtonEventMap<Type> {

	input: <Sender extends Type>(searchBtn: Sender, text: string) => void

	reset: <Sender extends Type>(searchBtn: Sender) => void
}

export interface SearchButton {
	on<K extends keyof SearchButtonEventMap<this>>(eventName: K, listener: Partial<SearchButtonEventMap<this>>[K], options?: ObservableListenerOpts): void;

	fire<K extends keyof SearchButtonEventMap<this>>(eventName: K, ...args: Parameters<SearchButtonEventMap<this>[K]>): boolean

	set listeners(listeners: ObservableListener<SearchButtonEventMap<this>>)
}

export class SearchButton extends Button {
	private searchField: TextField;
	private searchTBar?: Toolbar;
	private mainTbar?: Toolbar;

	private buffer = 300;

	constructor() {
		super();

		this.icon = "search";

		this.title = t("Search");

		this.searchField = textfield({
			label: t("Search"),
			flex: 1,
			buttons: [
				btn({
					icon: "clear",
					handler: () => {
						this.reset();
					}
				})
			]
		});


		this.searchField.on("render", () => {
			this.searchField.input!.addEventListener('input', FunctionUtil.buffer(this.buffer, this.onInput.bind(this)))
		})


		this.handler = (button, ev) => {

			this.mainTbar = button.parent as Toolbar;
			this.mainTbar.hide();

			this.getSearchTBar().show();

			this.searchField.focus();
		}
	}

	public reset() {
		this.searchField.reset();
		this.close();

		this.fire("reset", this);
		this.fire("input", this, "");
		this.el.classList.remove("accent");
	}

	public close() {
		this.searchTBar!.hide();
		this.mainTbar!.show();
	}

	private onInput() {
		this.el.classList.toggle("accent", !!this.searchField.value);
		this.fire("input", this, this.searchField.value);
	}

	private getSearchTBar() {

		if(!this.searchTBar) {
			this.searchTBar = tbar({},
				btn({
					icon: "chevron_left",
					title: t("Back"),
					handler: () => {
						this.close();
					}
				}),
				this.searchField
			);

			const cmpWithToolBar = (this.mainTbar!.parent as Component);

			const i = cmpWithToolBar.items.indexOf(this.mainTbar!);
			cmpWithToolBar.items.insert(i, this.getSearchTBar());
		}

		return this.searchTBar;
	}


}



/**
 * Shorthand function to create {@see SearchButton}
 *
 * @param config
 * @param items
 */
export const searchbtn = (config?:Config<SearchButton>) => createComponent(new SearchButton(), config);