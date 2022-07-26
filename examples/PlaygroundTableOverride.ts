import {PlaygroundTable} from "./PlaygroundTable.js";
import {FunctionUtil} from "@goui/util/FunctionUtil.js";

/**
 * Example on how to override a component by extending the render function
 */
export function playgroundTableOverride() {

	PlaygroundTable.prototype.render = FunctionUtil.createInterceptor(
		PlaygroundTable.prototype.render,
		function (this: PlaygroundTable) {
			this.el.classList.add("cls-added-by-override");
		}
	)
}



