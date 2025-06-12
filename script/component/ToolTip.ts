import {Component, createComponent} from "./Component";
import {Config} from "./Observable";
import {root} from "./Root";

/**
 * TIP: For long HTML tooltips use the render event:
 *
 * tooltip({
 * 	listeners: {'render': (me) => {me.html = 'Long text'}},
 * 	target: someDiv
 * });
 */
export class ToolTip extends Component {

	public renderTo? = root.el;

	constructor() {
		super("menu");
		this.baseCls = "goui-dropdown";
	}

	set target(targetEl: HTMLElement) {
		targetEl.on('mouseenter',(e: MouseEvent) => {
			e.stopPropagation();
			this.open(e);
		}).on('mouseleave',(e: MouseEvent) => {
			this.remove();
		});
		// just in case it doesn't go away.
		this.el.on('mouseleave',(e: MouseEvent) => {
			this.remove();
		})
	}

	open(e: MouseEvent) {
		this.render();
		this.align({top:e.y,bottom:e.y, left:e.x,right: e.x} as DOMRect);
	}

	private align(rect: DOMRect) {
		let left = rect.right + 16;
		let top = rect.bottom + 8;

		const tipRect = this.el.getBoundingClientRect();

		if (left + tipRect.width > window.innerWidth) {
			left = rect.left - tipRect.width - 8;
		}
		if (top + tipRect.height > window.innerHeight) {
			top = rect.top - tipRect.height - 16;
		}
		this.el.style.left = `${left}px`;
		this.el.style.top = `${top}px`;
	}
}

export const tooltip = (config?: Config<ToolTip>) => createComponent(new ToolTip(), config);