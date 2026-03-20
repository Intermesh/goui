/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Component, ComponentEventMap } from "./Component.js";
import { Config } from "./Observable.js";
/**
 * @inheritDoc
 */
export interface CardContainerEventMap extends ComponentEventMap {
    /**
     * Fires before adding an item. Return false to abort.
     */
    cardchange: {
        /**
         * The new zero based active index of the cardcontainer
         */
        index: number | undefined;
        /**
         * The old zero based active index of the cardcontainer
         */
        oldIndex: number | undefined;
    };
}
/**
 * Card container
 *
 * Holds multiple components but only shows one. Can be used in combination with a {@link CardMenu} to create a tab panel.
 *
 * @link https://goui.io/#cardcontainer Example
 */
export declare class CardContainer<EventMap extends CardContainerEventMap = CardContainerEventMap> extends Component<EventMap> {
    private _activeItem?;
    protected baseCls: string;
    constructor();
    protected internalRender(): HTMLElement;
    protected renderItems(): void;
    private setCardVisibilities;
    /**
     * The active card index. Defaults to 0 if not given.
     */
    set activeItem(ref: number | Component);
    /**
     * The active card component. Defaults to the first card if not given.
     */
    get activeItemComponent(): Component<ComponentEventMap> | undefined;
    /**
     * The active card index. Defaults to 0 if not given.
     */
    get activeItem(): number;
    getActiveComponent(): Component<ComponentEventMap> | undefined;
    focus(o?: FocusOptions): void;
}
/**
 * Shorthand function to create {@link CardContainer}
 *
 * Holds multiple components but only shows one. Can be used in combination with a {@link CardMenu} to create a tab panel.
 *
 * @link https://goui.io/#cardcontainer Example
 *
 * @param config
 * @param items
 */
export declare const cards: (config?: Config<CardContainer>, ...items: Component[]) => CardContainer<CardContainerEventMap>;
