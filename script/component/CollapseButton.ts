import {Button, ButtonConfig} from "./Button";
import {Component, createComponent} from "./Component";

export class CollapseButton extends Button {
	constructor(private collapseEl:Component) {
		super();

		this.icon = collapseEl.hidden ? "expand_more" : "expand_less";

		this.handler = () => {

			if (this.collapseEl.hidden) {
				this.collapseEl.hidden = false;
				this.icon = "expand_less";
			} else {
				this.collapseEl.hidden = true;
				this.icon = "expand_more";
			}
		}
	}
}

export const collapsebtn = (config: ButtonConfig<CollapseButton> & {collapseEl: Component}) => createComponent(new CollapseButton(config.collapseEl), config);
