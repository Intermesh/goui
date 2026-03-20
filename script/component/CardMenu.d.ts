/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Component } from "./Component.js";
import { CardContainer } from "./CardContainer.js";
import { Button } from "./Button.js";
import { Config } from "./Observable.js";
import { Toolbar } from "./Toolbar.js";
/**
 * CardMenu class
 *
 * A menu for cards to create a tab panel in combination with a {@link CardContainer}
 *
 * If items in the card container have an "icon" in their {@link Component.dataSet} property then it will be used as {@link Button.icon}
 *
 * @link https://goui.io/#cardcontainer Example
 */
export declare class CardMenu extends Toolbar {
    /**
     * The card container this menu is for.
     *
     * If not given it will be looked up in the parent of the menu.
     */
    cardContainer?: CardContainer;
    protected baseCls: string;
    focus(o?: FocusOptions): void;
    /**
     * CardMenu constructor
     *
     * @param tagName Set to "aside" for a vertical menu
     */
    constructor(tagName?: keyof HTMLElementTagNameMap);
    private updateActiveTab;
    private createMenu;
    protected itemToButton(item: Component, index: number): Button<import("./Button.js").ButtonEventMap>;
}
/**
 * Shorthand function to create {@link CardMenu}
 *
 * A menu for cards to create a tab panel in combination with a {@link CardContainer}
 *
 * @link https://goui.io/#cardcontainer Example
 *
 * @param config
 * @param items
 */
export declare const cardmenu: (config?: Config<CardMenu>, ...items: Component[]) => CardMenu;
