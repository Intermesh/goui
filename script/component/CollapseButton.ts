import {Button, ButtonConfig} from "./Button";
import {Component, createComponent} from "./Component";

export class CollapseButton extends Button {
	constructor(private collapseEl:Component | ((btn:CollapseButton) => Component)) {
		super();

		this.on("beforerender", () => {
			this.icon = this.getCollapseEl().hidden ? "expand_more" : "expand_less";
		});

		this.handler = () => {
			const el = this.getCollapseEl();
			if (el.hidden) {
				el.hidden = false;
				this.icon = "expand_less";
			} else {
				el.hidden = true;
				this.icon = "expand_more";
			}
		}
	}

	private getCollapseEl() {
		if(this.collapseEl instanceof Component) {
			return this.collapseEl;
		} else {
			return this.collapseEl(this);
		}
	}
}

export const collapsebtn = (config: ButtonConfig<CollapseButton> & {collapseEl: Component}) => createComponent(new CollapseButton(config.collapseEl), config);
