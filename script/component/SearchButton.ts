/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {btn, Button, ButtonEventMap} from "./Button.js";
import {tbar, Toolbar} from "./Toolbar.js";
import {t} from "../Translate.js";
import {TextField, textfield} from "./form/TextField.js";
import {Config, createComponent} from "./Component.js";
import {FunctionUtil} from "../util/FunctionUtil.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "./Observable.js";


/**
 * @inheritDoc
 */
export interface SearchButtonEventMap<Type> extends ButtonEventMap<Type> {

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


	}

	public handler = (button:Button, ev?:MouseEvent) => {

		this.mainTbar = button.parent as Toolbar;
		this.getSearchTBar().show();

		this.searchField.focus();
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
				this.searchTBar = tbar({
					cls: "search"
					},

				btn({
					icon: "chevron_left",
					title: t("Back"),
					handler: () => {
						this.close();
					}
				}),
				this.searchField
			);

			this.mainTbar!.items.add(this.searchTBar);
		}

		return this.searchTBar;
	}
}

/**
 * Shorthand function to create {@see SearchButton}
 *
 * @example
 * ```
 * searchbtn({
 * 	listeners: {
 * 		input:(searchBtn, text) => {
 *
 * 			const filtered = records.filter((r) => {
 * 				return !text || r.description.toLowerCase().indexOf(text.toLowerCase()) === 0;
 * 			});
 *
 * 			//simple local filter on the store
 * 			table.store.loadData(filtered, false)
 * 		}
 * 	}
 * })
 * ```
 *
 * @param config
 * @param items
 */
export const searchbtn = (config?:Config<SearchButton>) => createComponent(new SearchButton(), config);