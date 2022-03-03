import {Component, ComponentConfig} from "./Component.js";
import {Observable} from "./Observable.js";

export interface MaskConfig<T extends Observable> extends ComponentConfig<T> {
	/**
	 * Show loading spinner
	 */
	spinner?: boolean
}

/**
 * Mask element
 *
 * Shows a mask over the entire (position:relative) element it's in.
 *
 * Used in {@see Body.mask()}
 */
export class Mask extends Component {

	baseCls = "go-mask"

	spinner = true

	public static create<T extends typeof Observable>(this: T, config?: MaskConfig<InstanceType<T>>) {
		return <InstanceType<T>> super.create(<any> config);
	}

	protected init() {
		super.init();

		if (this.spinner) {
			this.html = '<div class="go-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
		}
	}
}