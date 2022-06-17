import * as Goui from "./Goui.js";
import {ComponentConfig} from "./Goui.js";

export type Constructor<T> = new (...args: any[]) => T;

export function Create<T extends Goui.Component>(cls:Constructor<T>, config?: ComponentConfig<T>, ...items:Goui.Component[]) : T {
	const o = new cls;
	if(config) {
		Object.assign(o, config);
	}
	if(items.length) {
		o.getItems().replace(items);
	}
	// @ts-ignore
	o.init();

	return o;
}

export const Component = (config?:Goui.ComponentConfig<Goui.Component>, ...items:Goui.Component[]) => Create(Goui.Component, config, ...items);
export const Button = (config?:Goui.ButtonConfig<Goui.Button>) => Create(Goui.Button, config);
export const Toolbar = (config?:Goui.ComponentConfig<Goui.Component>, ...items:Goui.Component[]) => Create(Goui.Toolbar, config, ...items);
export const Menu = (config?:Goui.MenuConfig<Goui.Menu>, ...items:Goui.Component[]) => Create(Goui.Menu, config, ...items);
export const ColorMenu = (config?:Goui.MenuConfig<Goui.ColorMenu>, ...items:Goui.Component[]) => Create(Goui.ColorMenu, config, ...items);
export const CheckboxField = (config?:Goui.FieldConfig<Goui.CheckboxField>, ...items:Goui.Component[]) => Create(Goui.CheckboxField, config, ...items);