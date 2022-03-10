import { Component } from "./Component.js";
import { FunctionUtil } from "../util/FunctionUtil.js";
export class DraggableComponent extends Component {
    constructor() {
        super(...arguments);
        this._dragConstrainTo = window;
    }
    static create(config) {
        return super.create(config);
    }
    init() {
        this.baseCls += " draggable";
        super.init();
        this.on("render", () => {
            this.initDragHandle();
        });
    }
    initDragHandle() {
        this.getDragHandle().classList.add("draghandle");
        this.getDragHandle().addEventListener('click', (e) => {
            //prevent click events under draggable items
            //needed for table header resize that triggered a sort on click too
            e.stopPropagation();
        });
        this.getDragHandle().addEventListener('mousedown', (e) => {
            if (e.button != 0) {
                //only drag with left click
                return;
            }
            e.preventDefault();
            //e.stopPropagation();
            this.focus();
            const el = this.getEl(), rect = el.getBoundingClientRect();
            if (this.setPosition === undefined) {
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
    getDragHandle() {
        return this.getEl();
    }
    /**
     * Contstain draggin to this element
     * @param el
     * @param pad Supply paddings
     */
    dragConstrainTo(el, pad) {
        this._dragConstrainTo = el;
        this._dragConstrainPad = pad;
    }
    calcConstrainBox() {
        if (this._dragConstrainTo instanceof Window) {
            this.constrainBox = {
                left: 0,
                right: window.innerWidth,
                bottom: window.innerHeight,
                top: 0
            };
        }
        else {
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
    onDragStart(e) {
        e.preventDefault();
        this.calcConstrainBox();
        const onDrag = FunctionUtil.onRepaint((e) => {
            this.onDrag(e);
        });
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', (e) => {
            document.removeEventListener('mousemove', onDrag);
            this.fire("drop", this, this.dragData, e);
        }, { once: true });
    }
    onDrag(e) {
        const d = this.dragData;
        d.x = e.clientX;
        d.y = e.clientY;
        this.constrainCoords();
        if (this.setPosition) {
            this.getEl().style.top = (d.startOffsetTop + d.y - d.startY) + "px";
            this.getEl().style.left = (d.startOffsetLeft + d.x - d.startX) + "px";
        }
        this.fire("drag", this, this.dragData, e);
    }
    constrainCoords() {
        if (!this.constrainBox) {
            return;
        }
        const maxTop = this.constrainBox.bottom - this.getEl().offsetHeight + this.dragData.grabOffsetTop;
        const maxLeft = this.constrainBox.right - this.getEl().offsetWidth + this.dragData.grabOffsetLeft;
        this.dragData.y = Math.max(this.constrainBox.top + this.dragData.grabOffsetTop, Math.min(this.dragData.y, maxTop));
        this.dragData.x = Math.max(this.constrainBox.left + this.dragData.grabOffsetLeft, Math.min(this.dragData.x, maxLeft));
        return;
    }
}
//# sourceMappingURL=DraggableComponent.js.map