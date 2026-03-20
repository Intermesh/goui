/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Field } from "./Field.js";
import { Config } from "../Observable.js";
/**
 * TextField component
 *
 * @see Form
 */
export declare class HiddenField extends Field {
    protected baseCls: string;
    constructor();
}
/**
 * Shorthand function to create {@link HiddenField}
 *
 * @param config
 */
export declare const hiddenfield: (config?: Config<HiddenField>) => HiddenField;
