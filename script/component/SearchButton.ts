/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {btn} from "./Button.js";
import {t} from "../Translate.js";
import {TextField, textfield} from "./form/TextField.js";
import {createComponent} from "./Component.js";
import {FunctionUtil} from "../util/FunctionUtil.js";
import {Config} from "./Observable.js";
import {OverlayToolbarButton, OverlayToolbarButtonEventMap} from "./OverlayToolbarButton";
import {ToolbarItems} from "./Toolbar.js";


/**
 * @inheritDoc
 */
export interface SearchButtonEventMap extends OverlayToolbarButtonEventMap {

	/**
	 * Represents an input object containing a text property.
	 */
	input: {
		/**
		 * The text that was entered by the user. Unlike the regular input event this event buffers for 300ms by default
		 */
		text: string
	}

	/**
	 * Fires when the search button resets to the empty stats
	 */
	reset: {}
}

/**
 * Represents a search button with an integrated text field for input and related functionality.
 * The `SearchButton` class extends `OverlayToolbarButton` with specialized behavior for search operations, including debounced input handling and event firing.
 *
 * Events:
 * - `open`: Triggered when the search button is activated.
 * - `reset`: Triggered when the search input field is reset.
 * - `input`: Triggered when the input value in the search field changes.
 */
export class SearchButton extends OverlayToolbarButton<SearchButtonEventMap> {
	private _searchField?: TextField;

	private buffer = 300;

	constructor() {
		super();

		this.icon = "search";
		this.title = t("Search");
	}

	public get searchField() {
		if(!this._searchField) {
			this._searchField = textfield({
				placeholder: t("Search") + "...",
				flex: 1,

				buttons: [
					btn({
						type: "button",
						icon: "clear",
						handler: () => {
							this.reset();
						}
					})
				],
				listeners: {
					render: ({target}) => {
						target.input.addEventListener('input', FunctionUtil.buffer(this.buffer, this.onInput.bind(this)))

						target.el.addEventListener('keydown', (e: KeyboardEvent) => {
							if (e.key == "Enter") {
								e.preventDefault();
								e.stopPropagation();
							}
						});
					}
				}
			})

			this.on("open", () => {
				this._searchField!.select()
			})
		}

		return this._searchField;
	}



	protected getTbarItems() {
		return [this.searchField];
	}

	public reset() {
		this.searchField?.reset();
		this.close();

		this.fire("reset", {});
		this.fire("input", {text: ""});
		this.el.classList.remove("accent");
		this.el.classList.remove("filled");
	}


	private onInput() {
		this.el.classList.toggle("accent", !!this.searchField!.value);
		this.el.classList.toggle("filled", !!this.searchField!.value);
		this.fire("input", {text: this.searchField!.value});
	}

}

/**
 * Shorthand function to create {@link SearchButton}
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
 */
export const searchbtn = (config?: Config<SearchButton>) => createComponent(new SearchButton(), config);