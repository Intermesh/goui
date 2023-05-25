/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Component, ComponentEventMap, createComponent} from "./Component.js";
import {Config, ObservableListenerOpts} from "./Observable.js";
import {FunctionUtil} from "../util/FunctionUtil.js";


/**
 * Data available to draggable item listeners
 */
interface DragData {

	/**
	 * x when dragging started
	 */
	startX: number,

	/**
	 * y when dragging started
	 */
	startY: number,

	/**
	 * Current x
	 */
	x: number,

	/**
	 * Current y
	 */
	y: number

	/**
	 * offsetLeft of dragged element when dragging started
	 */
	startOffsetLeft: number,

	/**
	 * offsetTop of dragged element when dragging started
	 */
	startOffsetTop: number,

	/**
	 * The left offset from the element offsetLeft where the user grabbed the element
	 */
	grabOffsetLeft: number,

	/**
	 * The top offset from the element offsetLeft where the user grabbed the element
	 */
	grabOffsetTop: number

	data: any
}

interface ConstrainBox {
	left: number,
	right: number,
	bottom: number,
	top: number
}

/**
 * @inheritDoc
 */
export interface DraggableComponentEventMap<Type> extends ComponentEventMap<Type> {
	/**
	 * Fires when the component is dropped
	 *
	 * @param comp
	 */
	drop: (comp: Type, dragData: DragData, e: MouseEvent) => void

	/**
	 * Fires contanty while the component is being dragged
	 * @param comp
	 * @param dragData
	 * @param e
	 */
	drag: (comp: Type, dragData: DragData, e: MouseEvent) => void;

	/**
	 * Return false to prevent drag
	 *
	 * @param comp
	 * @param e
	 */
	dragstart: (comp: Type, dragData: DragData, e: MouseEvent) => false | void;
}


export interface DraggableComponent {
	on<K extends keyof DraggableComponentEventMap<this>>(eventName: K, listener: Partial<DraggableComponentEventMap<this>>[K], options?: ObservableListenerOpts): void;

	fire<K extends keyof DraggableComponentEventMap<this>>(eventName: K, ...args: Parameters<DraggableComponentEventMap<any>[K]>): boolean
}

export class DraggableComponent extends Component {

	protected dragData?: DragData;

	private constrainBox?: ConstrainBox;
	private _dragConstrainTo: Window | HTMLElement = window
	private _dragConstrainPad?: Partial<ConstrainBox>;

	/**
	 * Update left and top css properties when dragging
	 */
	public setPosition?: boolean;


	/**
	 * Enable dragging
	 */
	private _draggable: boolean = true;

	constructor(tagName: keyof HTMLElementTagNameMap = "div") {
		super(tagName);

		if (this.baseCls) {
			this.baseCls += " draggable";
		} else {
			this.baseCls = "draggable";
		}

		this.on("render", () => {
			// invoke draggable setter once
			if (this._draggable) {
				this.toggleDraggable(this._draggable);
			}
		}, {once: true});
	}

	/**
	 * Enable or disable dragging
	 */
	public set draggable(draggable: boolean) {
		this._draggable = draggable;

		if(this.rendered) {
			this.toggleDraggable(draggable);
		}
	}

	private toggleDraggable(draggable: boolean) {
		const dragHandle = this.getDragHandle();

		if (!dragHandle) {
			return;
		}

		if (draggable) {
			dragHandle.classList.add("goui-draghandle")
			dragHandle.addEventListener('click', this.onDragHandleClick);
			dragHandle.addEventListener('mousedown', this.onDragHandleMouseDown);
		} else {
			dragHandle.classList.remove("goui-draghandle")
			dragHandle.removeEventListener('click', this.onDragHandleClick);
			dragHandle.removeEventListener('mousedown', this.onDragHandleMouseDown);
		}
	}

	public get draggable() {
		return this._draggable;
	}

	private onDragHandleClick = (e: MouseEvent) => {
		//prevent click events under draggable items
		//needed for table header resize that triggered a sort on click too
		e.stopPropagation();
	}

	private onDragHandleMouseDown = (e: MouseEvent) => {

		//stop if clicked on button inside drag handle. to prevent window dragging on buttons.
		const target = e.target as HTMLElement;
		if (target != this.el && (target.tagName == "BUTTON" || target.closest("BUTTON"))) {
			return;
		}

		if (e.button != 0) {
			//only drag with left click
			return;
		}
		e.preventDefault();
		//e.stopPropagation();

		this.focus();

		const el = this.el, rect = el.getBoundingClientRect();

		if (this.setPosition === undefined) {
			const cmpStyle = getComputedStyle(el);
			this.setPosition = cmpStyle.position == 'absolute' || cmpStyle.position == 'fixed';
		}

		this.dragData = {
			startOffsetLeft: el.offsetLeft,
			startOffsetTop: el.offsetTop,
			grabOffsetLeft: e.clientX - rect.x,
			grabOffsetTop: e.clientY - rect.y,
			x: e.clientX,
			y: e.clientY,
			startX: e.clientX,
			startY: e.clientY,
			data: {}
		};


		if (this.fire('dragstart', this, this.dragData, e) !== false) {
			this.onDragStart(e);
		}
	};


	/**
	 * Returns the DOM element that can be grabbed to drag the component
	 * @protected
	 */
	protected getDragHandle(): HTMLElement {
		return this.el;
	}

	/**
	 * Constrain dragging to this element
	 * @param el
	 * @param pad Supply paddings
	 */
	public dragConstrainTo(el: HTMLElement | Window, pad?: Partial<ConstrainBox>) {
		this._dragConstrainTo = el;
		this._dragConstrainPad = pad;
	}

	private calcConstrainBox(el: HTMLElement | Window, pad?: Partial<ConstrainBox>): ConstrainBox {
		let box = {
			left: 0,
			right: 0,
			bottom: 0,
			top: 0
		};

		if (el instanceof Window) {
			//window is a special case. The page might be scrolled and we want to constrain to the viewport then.
			box.right = window.innerWidth;
			box.bottom = window.innerHeight;
		} else {
			const rect = el.getBoundingClientRect();
			box.left = rect.left;
			box.right = rect.right;
			box.bottom = rect.bottom;
			box.top = rect.top;
		}

		if (pad) {
			if (pad.left)
				box.left += pad.left;

			if (pad.right)
				box.right -= pad.right;

			if (pad.top)
				box.top += pad.top;

			if (pad.bottom)
				box.bottom -= pad.bottom;
		}

		return box;
	}

	private onDragStart(e: MouseEvent) {
		e.preventDefault();
		this.constrainBox = this.calcConstrainBox(this._dragConstrainTo, this._dragConstrainPad);

		const onDrag = FunctionUtil.onRepaint((e: MouseEvent) => {
			this.onDrag(e);
		});

		document.addEventListener('mousemove', onDrag);
		document.addEventListener('mouseup', (e) => {
			document.removeEventListener('mousemove', onDrag);

			this.fire("drop", this, this.dragData!, e);

		}, {once: true});
	}

	private onDrag(e: MouseEvent) {

		const d = this.dragData!;

		d.x = e.clientX;
		d.y = e.clientY;

		this.constrainCoords();

		if (this.setPosition) {
			this.el.style.top = (d.startOffsetTop + d.y - d.startY) + "px";
			this.el.style.left = (d.startOffsetLeft + d.x - d.startX) + "px";
		}

		this.fire("drag", this, this.dragData!, e);
	}

	private constrainCoords() {

		if (!this.constrainBox) {
			return;
		}

		const maxTop = this.constrainBox.bottom - this.el.offsetHeight + this.dragData!.grabOffsetTop;
		const maxLeft = this.constrainBox.right - this.el.offsetWidth + this.dragData!.grabOffsetLeft;

		this.dragData!.y = Math.max(this.constrainBox.top + this.dragData!.grabOffsetTop, Math.min(this.dragData!.y, maxTop))
		this.dragData!.x = Math.max(this.constrainBox.left + this.dragData!.grabOffsetLeft, Math.min(this.dragData!.x, maxLeft))

		return;
	}

	/**
	 * Constrain the component to the given element
	 *
	 * @param el
	 * @param pad
	 */
	public constrainTo(el: HTMLElement | Window, pad?: Partial<ConstrainBox>) {
		const constraints = this.calcConstrainBox(el, pad);

		let maxTop = constraints.bottom - this.el.offsetHeight,
			maxLeft = constraints.right - this.el.offsetWidth,
			minTop = 0,
			minLeft = 0;

		if (this.el.offsetTop > maxTop) {
			console.warn("Contraining to top " + maxTop);
			this.el.style.top = maxTop + "px";
		} else if (this.el.offsetTop < minTop) {
			console.warn("Contraining to top " + minTop);
			this.el.style.top = minTop + "px";
		}

		if (this.el.offsetLeft > maxLeft) {
			console.warn("Contraining to left " + maxLeft);
			this.el.style.left = maxLeft + "px";
		} else if (this.el.offsetLeft < minLeft) {
			console.warn("Contraining to left " + minLeft);
			this.el.style.left = minLeft + "px";
		}
	}
}

/**
 * Shorthand function to create {@see DraggableComponent}
 *
 * @param config
 * @param items
 */
export const draggable = (config?: Config<DraggableComponent, DraggableComponentEventMap<DraggableComponent>>, ...items: Component[]) => createComponent(new DraggableComponent(config?.tagName), config, items);