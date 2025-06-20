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
	public closeDelay = 100;


	private timeout: any = undefined;
	private closeTimeout: any;
	private observer: MutationObserver|undefined;
	private targetEl?: HTMLElement;

	constructor() {
		super("menu");
		this.baseCls = "goui-dropdown";
	}

	set target(targetEl: HTMLElement) {

		this.targetEl = targetEl
		targetEl.on('mouseenter',e => {
			this.timeout = setTimeout(() => {
				this.open(e);
			}, this.delay)
		}).on('mouseleave',_e => {
			this.close()
		}).on('contextmenu', _e => {
			this.close()
		});

		this.el.on("mouseenter", () => {
			// keep tooltip open if moving mouse into the tooltip
			if(this.closeTimeout) {
				clearTimeout(this.closeTimeout);
				this.closeTimeout = undefined;
			}
		}).on('mouseleave',(e: MouseEvent) => {
			//close when leaving tooltip
			this.close()
		})
	}

	protected internalRender(): HTMLElement {

		if(!this.observer) {
			this.observer  = new MutationObserver((mutationsList) => {
				mutationsList.forEach((mutation) => {
					mutation.removedNodes.forEach((removedNode) => {
						if (removedNode === this.targetEl) {
							this.observer!.disconnect(); // Optional: stop observing after removal
							this.remove();
						}
					});
				});
			});
		}
		this.observer.observe(this.targetEl!.parentNode!, {childList: true});

		return super.internalRender();
	}

	protected internalRemove() {
		this.observer?.disconnect();
		super.internalRemove();
	}

	private open(e: MouseEvent) {
		this.render();
		this.align({top:e.y,bottom:e.y, left:e.x,right: e.x} as DOMRect);
		const pad = Component.remToPx(16);
		this.constrainTo(window, {
			top: pad,
			left: pad,
			bottom: pad,
			right: pad
		});
	}

	private close() {
		if(this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = undefined;
		}
		//close delay to allow moving into tooltip
		this.closeTimeout = setTimeout(() => {
			this.remove();
		}, this.closeDelay);
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