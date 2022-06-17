import * as Goui from "./Goui.js";
import {CreateComponent} from "./Goui.js";

export type Constructor<T> = new (...args: any[]) => T;



export const Component = (config?:Goui.ComponentConfig<Goui.Component>, ...items:Goui.Component[]) => CreateComponent(Goui.Component, config, ...items);
export const Button = (config?:Goui.ButtonConfig<Goui.Button>) => CreateComponent(Goui.Button, config);
export const Toolbar = (config?:Goui.ComponentConfig<Goui.Component>, ...items:Goui.Component[]) => CreateComponent(Goui.Toolbar, config, ...items);
export const Menu = (config?:Goui.MenuConfig<Goui.Menu>, ...items:Goui.Component[]) => CreateComponent(Goui.Menu, config, ...items);
export const ColorMenu = (config?:Goui.MenuConfig<Goui.ColorMenu>, ...items:Goui.Component[]) => CreateComponent(Goui.ColorMenu, config, ...items);
export const CheckboxField = (config?:Goui.FieldConfig<Goui.CheckboxField>, ...items:Goui.Component[]) => CreateComponent(Goui.CheckboxField, config, ...items);