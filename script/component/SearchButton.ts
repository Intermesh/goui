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


/**
 * @inheritDoc
 */
export interface SearchButtonEventMap extends OverlayToolbarButtonEventMap {

	/**
	 * Represents an input object containing a text property.
	 */
	input: {
		/**
		 * The text that was entered by the user
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
	private readonly searchField: TextField;

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
					type: "button",
					icon: "clear",
					handler: () => {
						this.reset();
					}
				})
			]
		});

		this.searchField.on("render", () => {
			this.searchField.input.addEventListener('input', FunctionUtil.buffer(this.buffer, this.onInput.bind(this)))

			this.searchField.el.addEventListener('keydown', (e:KeyboardEvent) => {
				if(e.key == "Enter") {
					e.preventDefault();
					e.stopPropagation();
				}

				// if(e.key == "Escape") {
				// 	e.preventDefault();
				// 	e.stopPropagation();
				// 	this.close();
				// }
			})
		})

		this.items.add(this.searchField);

		this.on("open", () => {
			this.searchField.select()
		})
	}

	public reset() {
		this.searchField.reset();
		this.close();

		this.fire("reset", {});
		this.fire("input", {text: ""});
		this.el.classList.remove("accent");
		this.el.classList.remove("filled");
	}


	private onInput() {
		this.el.classList.toggle("accent", !!this.searchField.value);
		this.el.classList.toggle("filled", !!this.searchField.value);
		this.fire("input", {text: this.searchField.value});
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