import {Button} from "./Button";
import {Component, ComponentState, createComponent} from "./Component";
import {Config} from "./Observable";

type CollapseEl = ((btn:CollapseButton) => Component) | Component

/**
 * Button that can be used to hide and show another component
 * Use "stateId" to remember the collapsed state.
 */
export class CollapseButton extends Button {

	/**
	 * Constructor
	 *
	 * @param collapseEl Pass a component or a function that returns the component after render
	 */
	constructor(private collapseEl:CollapseEl) {
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

			this.saveState();
		}
	}

	protected buildState(): ComponentState {
		return {
			collapsed: this.getCollapseEl().hidden
		}
	}

	protected restoreState(state: ComponentState) {
		super.restoreState(state);

		if("collapsed" in state) {
			this.getCollapseEl().hidden = state.collapsed;
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

/**
 * Button that can be used to hide and show another component
 * Use "stateId" to remember the collapsed state.
 *
 * @param config
 */
export const collapsebtn = (config: Config<CollapseButton> & {
	/**
	 * Pass a component or a function that returns the component after render
	 */
	collapseEl: CollapseEl
}) => createComponent(new CollapseButton(config.collapseEl), config);
