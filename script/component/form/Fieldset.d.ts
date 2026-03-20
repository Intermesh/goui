/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Component } from "../Component.js";
import { Config } from "../Observable.js";
/**
 * Field set component
 *
 * @see Form
 */
export declare class Fieldset extends Component {
    constructor();
    protected baseCls: string;
    /**
     * The legend to display
     */
    legend?: string;
    internalRender(): HTMLElement;
}
/**
 * Shorthand function to create fieldset
 *
 * @param config
 * @param items
 */
export declare const fieldset: (config?: Config<Fieldset>, ...items: Component[]) => Fieldset;
