import { Component } from "./Component.js";
import { Menu } from "./menu/Menu.js";
import { root } from "./Root.js";
import { router } from "../Router.js";
/**
 * Button component
 *
 * @example
 *
 * ```typescript
 * Button.create({
 *   icon: "star",
 *   text: "Test 1"
 *   handler: (e) => alert("Hi!")
 * })
 * ```
 *
 */
export class Button extends Component {
    constructor() {
        super(...arguments);
        this.tagName = "button";
        this.type = "button";
        this.baseCls = "button";
    }
    static create(config) {
        return super.create(config);
    }
    init() {
        super.init();
        if (this.route) {
            router.add(new RegExp(this.route), () => {
                // when route is passed handler returns a promise which must be returned
                // to the router so it can evaluate new router paths after the promise is ressolved
                return this.handler.call(this, this);
            });
        }
    }
    internalRender() {
        const el = super.internalRender();
        el.type = this.type;
        // to prevent dragging in window header when buttons are clicked.
        // not sure if this will cause problems for other functions.
        el.addEventListener("mousedown", e => {
            e.stopPropagation();
        });
        if (this.handler) {
            el.addEventListener("click", (e) => {
                // check detail for being the first click. We don't want double clicks to call the handler twice
                if (e.button == 0 && e.detail == 1) {
                    this.handler.call(this, this, e);
                    if (this.route) {
                        router.setPath(this.route);
                    }
                }
                this.fire("click", this, e);
            });
        }
        else {
            el.addEventListener("click", (e) => {
                this.fire("click", this, e);
            });
        }
        this.applyTextAndIcon();
        if (this.menu) {
            this.menu.parentButton = this;
            this.menu.removeOnClose = false;
            el.classList.add("has-menu");
            // The first menu of a button will expand on click, sub menus will show on hover and are hidden with css.
            // Before I made this without JS with the :focus-within selector but that didn't work in Safari because it
            // doesn't focus buttons on click.
            // First menu is rendered directly in body so it's positioned absolute on the page and there's no need for overflow
            // visible in windows.
            if (!(this.parent instanceof Menu)) {
                this.menu.hide();
                el.addEventListener("click", ev => {
                    if (this.menu.isHidden()) {
                        // noinspection PointlessBooleanExpressionJS
                        if (this.fire("beforeshowmenu", this, this.menu, ev) === false) {
                            return;
                        }
                        const rect = el.getBoundingClientRect();
                        //must be rendered and visible to get width below
                        if (!this.menu.isRendered()) {
                            root.addItem(this.menu);
                        }
                        this.menu.show();
                        this.menu.showAt({ x: this.menu.isLeftExpanding() ? rect.right - this.menu.getWidth() : rect.x, y: rect.bottom });
                        this.fire("showmenu", this, this.menu, ev);
                    }
                    else {
                        this.menu.hide();
                    }
                });
            }
            else {
                this.menu.render(el);
            }
        }
        return el;
    }
    getMenu() {
        return this.menu;
    }
    internalRemove() {
        if (this.menu) {
            this.menu.remove();
        }
        super.internalRemove();
    }
    applyText() {
    }
    setText(text) {
        this.text = text;
        if (this.rendered) {
            this.applyTextAndIcon();
        }
    }
    getText() {
        return this.text;
    }
    setIcon(icon) {
        this.icon = icon;
        if (this.rendered) {
            this.applyTextAndIcon();
        }
    }
    getIcon() {
        return this.icon;
    }
    applyTextAndIcon() {
        const el = this.getEl();
        if (this.text) {
            el.classList.add("with-text");
        }
        else if (this.rendered) {
            el.classList.remove("with-text");
        }
        if (this.icon) {
            el.classList.add("with-icon");
        }
        if (this.rendered) {
            el.classList.remove("with-icon");
        }
        let html = "";
        if (!this.text && !this.icon) {
            html = this.html + "";
        }
        else {
            if (this.icon) {
                html = `<i class="icon">${this.icon}</i>${el.innerHTML}`;
            }
            if (this.text) {
                html += `<span class="text">${this.text}</span>`;
            }
        }
        el.innerHTML = html;
    }
}
//# sourceMappingURL=Button.js.map