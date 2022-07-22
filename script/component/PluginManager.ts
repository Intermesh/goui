import {Component} from "./Component.js";

export type PluginFunction =  (comp:any) => void;

/**
 * Register plugins for components
 *
 */
export class PluginManager {

	private static plugins:Record<string, PluginFunction[]> = {};

	public static register(id:string, fn:PluginFunction) {
		if(!this.plugins[id]) {
			this.plugins[id] = [];
		}
		this.plugins[id].push(fn);
	}

	public static get(id: string) {
		return this.plugins[id] || undefined;
	}
}