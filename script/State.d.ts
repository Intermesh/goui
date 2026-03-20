/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
/**
 * State object to store component state
 *
 * @see Component.saveState
 */
export declare class State {
    static get(): State;
    hasItem(id: string): boolean;
    getItem(id: string): Record<string, any>;
    setItem(id: string, state: Record<string, any>): void;
}
