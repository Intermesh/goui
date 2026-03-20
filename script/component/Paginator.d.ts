/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Toolbar } from "./Toolbar.js";
import { Store } from "../data/Store.js";
import { Config } from "./Observable.js";
export declare class Paginator extends Toolbar {
    store: Store;
    private prev;
    private next;
    protected baseCls: string;
    constructor(store: Store);
    private onStoreLoad;
}
/**
 * Shorthand function to create {@link Paginator}
 *
 * @param config
 */
export declare const paginator: (config: Config<Paginator> & {
    store: Store;
}) => Paginator;
