import {Component, createComponent} from "./Component";
import {Config} from "./Observable";
import {root} from "./Root";

/**
 * Tooltip component
 *
 * @example TIP: For long HTML tooltips use the render event:
 * ```
 * tooltip({
 * 	listeners: {'render': (me) => {me.html = 'Long text'}},
 * 	target: someDiv
 * });
 * ```
 */
export class ToolTip extends Component {

	public renderTo? = root.el;

	/**
	 * Tooltip shows with a delay in ms
	 */
	public delay = 300;


	private timeout: any = undefined;
	private closeTimeout: any;

	constructor() {
		super("menu");
		this.baseCls = "goui-dropdown";
	}

	set target(targetEl: HTMLElement) {
		targetEl.on('mouseenter',(e: MouseEvent) => {
			// e.stopPropagation();
			this.timeout = setTimeout(() =>{
				this.open(e);
			}, this.delay)

		}).on('mouseleave',(e: MouseEvent) => {
			if(this.timeout) {
				clearTimeout(this.timeout);
				this.timeout = undefined;
			}

			//close delay to allow moving into tooltip
			this.closeTimeout = setTimeout(() => {
				this.remove();
			}, 100);
		});

		// keep tooltip open if moving mouse into the tooltip
		this.el.on("mouseenter", () =>{
			if(this.closeTimeout) {
				clearTimeout(this.closeTimeout);
				this.closeTimeout = undefined;
			}
		});

		//close immediately when leaving tooltip
		this.el.on('mouseleave',(e: MouseEvent) => {
			clearTimeout(this.timeout);
			this.timeout = undefined;
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

/**
 * Creates as {@link ToolTip} Component
 *
 * @param config
 *
 * @example
 * ```
 * tooltip({
 * 	text: "Hi I am the tooltip",
 * 	target: cmp.el
 * });
 * ```
 */
export const tooltip = (config?: Config<ToolTip>) => createComponent(new ToolTip(), config);