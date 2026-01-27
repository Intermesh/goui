import {Button} from "./Button";
import {Component, ComponentState, createComponent} from "./Component";
import {Config} from "./Observable";

type CollapseTarget = ((btn:CollapseButton) => Component) | Component

/**
 * Button that can be used to hide and show another component
 * Use "stateId" to remember the collapsed state.
 */
export class CollapseButton extends Button {

	/**
	 * Constructor
	 *
	 * @param target Pass a component or a function that returns the component after render
	 */
	constructor(private target:CollapseTarget) {
		super();

		this.on("beforerender", () => {
			this.icon = this.getCollapseTarget().hidden ? "expand_more" : "expand_less";
		});

		this.handler = () => {
			const el = this.getCollapseTarget();
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
			collapsed: this.getCollapseTarget().hidden
		}
	}

	protected restoreState(state: ComponentState) {
		super.restoreState(state);

		if("collapsed" in state) {
			this.getCollapseTarget().hidden = state.collapsed;
		}
	}

	private getCollapseTarget() {
		if(this.target instanceof Component) {
			return this.target;
		} else {
			return this.target(this);
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
	target: CollapseTarget
}) => createComponent(new CollapseButton(config.target), config);
