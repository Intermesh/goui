import { Component } from "./Component.js";
/**
 * Mask element
 *
 * Shows a mask over the entire (position:relative) element it's in.
 *
 * Used in {@see Body.mask()}
 */
export class Mask extends Component {
    constructor() {
        super(...arguments);
        this.baseCls = "mask";
        this.spinner = true;
    }
    static create(config) {
        return super.create(config);
    }
    init() {
        super.init();
        if (this.spinner) {
            this.html = '<div class="spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
        }
    }
}
//# sourceMappingURL=Mask.js.map