/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Component } from "./Component.js";
import { Config } from "./Observable.js";
/**
 * The Avatar class represents a graphical avatar component that displays a user's initials, background color, or an optional image.
 * It is configurable with a display name, image URL, and will dynamically generate background colors based on the display name.
 *
 * @extends Component
 */
export declare class Avatar extends Component {
    protected baseCls: string;
    static colors: string[];
    private imgUrl;
    private bgColor;
    set displayName(displayName: string);
    private setBackground;
    get displayName(): string;
    set backgroundImage(imgUrl: string | undefined);
    get backgroundImage(): string;
    /**
     * Grabs the first char of the first and last word.
     *
     * @param {string} name
     * @returns {string}
     */
    static initials(name: string): string;
}
/**
 * Shorthand function to create {@link Avatar}
 *
 * @param config
 */
export declare const avatar: (config?: Config<Avatar>) => Avatar;
