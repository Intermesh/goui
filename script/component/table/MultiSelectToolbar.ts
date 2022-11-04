import {comp, Component, Config} from "../Component.js";
import {Toolbar} from "../Toolbar.js";


export class MultiSelectToolbar extends Toolbar {



}

export const mstbar = (config?: Config<MultiSelectToolbar>, ...items: (Component | "->" | "-")[]) => {


	const c = new MultiSelectToolbar();
	if (config) {
		Object.assign(c, config);
	}

	if (items && items.length) {

		for (let i = 0, l = items?.length; i < l; i++) {
			switch (items[i]) {
				case '->':
					items[i] = comp({
						flex: 1
					});
					break;
				case '-':
					items[i] = comp({tagName: "hr"})
					break;
			}
		}

		c.items.add(...items as Component[]);

	}

	return c;

}


