/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Config } from "./Observable.js";
import { OverlayToolbarButton, OverlayToolbarButtonEventMap } from "./OverlayToolbarButton";
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
        text: string;
    };
    /**
     * Fires when the search button resets to the empty stats
     */
    reset: {};
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
export declare class SearchButton extends OverlayToolbarButton<SearchButtonEventMap> {
    private readonly searchField;
    private buffer;
    constructor();
    reset(): void;
    private onInput;
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
export declare const searchbtn: (config?: Config<SearchButton>) => SearchButton;
