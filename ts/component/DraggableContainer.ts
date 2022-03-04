import {Container, ContainerConfig, ContainerEventMap} from "./Container.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "./Observable.js";
import {ComponentConfig} from "./Component.js";
import {FunctionUtil} from "../util/FunctionUtil.js";



/**
 * Data available to draggable item listeners
 */
interface DragData {

	/**
	 * x when dragging started
	 */
	startX:number,

	/**
	 * y when dragging started
	 */
	startY: number,

	/**
	 * Current x
	 */
	x:number,

	/**
	 * Current y
	 */
	y:number

	/**
	 * offsetLeft of dragged element when dragging started
	 */
	startOffsetLeft:number,

	/**
	 * offsetTop of dragged element when dragging started
	 */
	startOffsetTop:number,

	/**
	 * The left offset from the element offsetLeft where the user grabbed the element
	 */
	grabOffsetLeft:number,

	/**
	 * The top offset from the element offsetLeft where the user grabbed the element
	 */
	grabOffsetTop:number

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
export interface DraggableContainerEventMap<T extends Observable> extends ContainerEventMap<T>{
	/**
	 * Fires when the component is dropped
	 *
	 * @param comp
	 */
	drop?: (comp: T, dragData: DragData, e: MouseEvent) => void

	/**
	 * Fires contanty while the component is being dragged
	 * @param comp
	 * @param dragData
	 * @param e
	 */
	drag?: (comp: T, dragData: DragData, e: MouseEvent) => void;

	/**
	 * Return false to prevent drag
	 *
	 * @param comp
	 * @param e
	 */
	dragstart?: (comp: T, dragData: DragData, e: MouseEvent) => false | void;
}

/**
 * @inheritDoc
 */
export interface DraggableContainerConfig<T extends Observable> extends ContainerConfig<T> {
	/**
	 * Update left and top css properties when dragging
	 */
	setPosition?: boolean
	/**
	 * @inheritDoc
	 */
	listeners?: ObservableListener<DraggableContainerEventMap<T>>
}

export interface DraggableContainer {
	on<K extends keyof DraggableContainerEventMap<DraggableContainer>>(eventName: K, listener: DraggableContainerEventMap<DraggableContainer>[K], options?: ObservableListenerOpts): void;
	fire<K extends keyof DraggableContainerEventMap<DraggableContainer>>(eventName: K, ...args: Parameters<NonNullable<DraggableContainerEventMap<DraggableContainer>[K]>>): boolean
}

export class DraggableContainer extends Container {
	public static create<T extends typeof Observable>(this: T, config?: DraggableContainerConfig<InstanceType<T>>) {
		return <InstanceType<T>> super.create(<any> config);
	}

	protected dragData?: DragData;

	private constrainBox?: ConstrainBox;
	private _dragConstrainTo: Window | HTMLElement = window
	private _dragConstrainPad?: Partial<ConstrainBox>;

	public setPosition?:boolean;

	protected init() {
		this.baseCls += " draggable"
		super.init();

		this.on("render", () => {
			this.initDragHandle();
		})
	}

	private initDragHandle() {
		this.getDragHandle().classList.add("go-draghandle")
		this.getDragHandle().addEventListener('click', (e) => {
			//prevent click events under draggable items
			//needed for table header resize that triggered a sort on click too
			e.stopPropagation();
		});

		this.getDragHandle().addEventListener('mousedown', (e: MouseEvent) => {
			if (e.button != 0) {
				//only drag with left click
				return;
			}
			e.preventDefault();
			//e.stopPropagation();

			this.focus();

			const el = this.getEl(), rect = el.getBoundingClientRect();

			if(this.setPosition === undefined) {
				this.setPosition = getComputedStyle(el).position == 'absolute';
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
		});


	}


	/**
	 * Returns the DOM element that can be grabbed to drag the component
	 * @protected
	 */
	protected getDragHandle(): HTMLElement {
		return this.getEl();
	}

	/**
	 * Contstain draggin to this element
	 * @param el
	 * @param pad Supply paddings
	 */
	public dragConstrainTo(el: HTMLElement | Window, pad?: Partial<ConstrainBox>) {
		this._dragConstrainTo = el;
		this._dragConstrainPad = pad;
	}

	private calcConstrainBox() {
		if (this._dragConstrainTo instanceof Window) {
			this.constrainBox = {
				left: 0,
				right: window.innerWidth,
				bottom: window.innerHeight,
				top: 0
			};
		} else {
			const rect = this._dragConstrainTo.getBoundingClientRect();
			this.constrainBox = {
				left: rect.left,
				right: rect.right,
				bottom: rect.bottom,
				top: rect.top
			};
		}

		if (this._dragConstrainPad) {
			if (this._dragConstrainPad.left)
				this.constrainBox.left += this._dragConstrainPad.left;

			if (this._dragConstrainPad.right)
				this.constrainBox.right -= this._dragConstrainPad.right;

			if (this._dragConstrainPad.top)
				this.constrainBox.top += this._dragConstrainPad.top;

			if (this._dragConstrainPad.bottom)
				this.constrainBox.bottom -= this._dragConstrainPad.bottom;
		}
	}

	private onDragStart(e: MouseEvent) {
		e.preventDefault();
		this.calcConstrainBox();

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

		if(this.setPosition) {
			this.getEl().style.top = (d.startOffsetTop + d.y - d.startY) + "px";
			this.getEl().style.left = (d.startOffsetLeft + d.x - d.startX) + "px";
		}

		this.fire("drag", this, this.dragData!, e);
	}

	private constrainCoords() {

		if (!this.constrainBox) {
			return ;
		}

		const maxTop = this.constrainBox.bottom - this.getEl().offsetHeight + this.dragData!.grabOffsetTop;
		const maxLeft = this.constrainBox.right - this.getEl().offsetWidth + this.dragData!.grabOffsetLeft;

		this.dragData!.y = Math.max(this.constrainBox.top + this.dragData!.grabOffsetTop, Math.min(this.dragData!.y, maxTop))
		this.dragData!.x = Math.max(this.constrainBox.left + this.dragData!.grabOffsetLeft, Math.min(this.dragData!.x, maxLeft))

		return;
	}
}