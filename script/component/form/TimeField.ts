import {TextField} from "./TextField.js";
import {FieldConfig, FieldEventMap} from "./Field.js";
import {comp, createComponent} from "../Component.js";
import {DateTime} from "../../util.js";
import {InputField} from "./InputField.js";
import {Menu, menu} from "../menu.js";
import {btn, Button} from "../Button.js";


export interface TimeField {
	get input(): HTMLInputElement
}
/**
 * TimeField component
 *
 * Time input based on the browser's locale.
 *
 * @property value Outputs time in "H:i" format. eg. 09:30 or 15:30 {@link DateTime.format}
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/time
 */
export class TimeField extends InputField {


	protected baseCls = "goui-form-field time no-floating-label";
	private menu!: Menu;

	constructor() {
		super();

		this.type = "time";

		this.createMenu();

	}

	private createMenu() {

		const hrsContainer = comp({
			tagName: "li",
			flex: 1,
			cls: "scroll vbox gap"
		}),
			minsContainer = comp({
				tagName: "li",
				flex: 1,
				cls: "scroll vbox gap"
			});

		const handler = (btn:Button) => {
			let dt = this.getValueAsDateTime();
			if(!dt) {
				dt = new DateTime();
				dt.setHours(0);
				dt.setMinutes(0);

			}
			if(btn.dataSet.hour) {
				dt.setHours(btn.dataSet.hour);
			}

			if(btn.dataSet.min) {
				dt.setMinutes(btn.dataSet.min);
			}

			this.value = dt.format("H:i");
			this.focus();
		}

		const hourFormat = DateTime.hour12() ? 'h\\&\\n\\b\\s\\p\\;a' : 'H';

		for(let h = 0; h < 24; h++) {
			hrsContainer.items.add(btn({
				dataSet: {hour: h},
				itemId: h,
				html: DateTime.createFromFormat(h + "", "H")!.format(hourFormat),
				handler: handler
			}))
		}

		for(let m = 0; m < 60; m++) {
			minsContainer.items.add(btn({
				dataSet: {min: m},
				itemId: m,
				text: DateTime.createFromFormat(m + "", "k")?.format("i"),
				handler: handler
			}))
		}

		this.menu = menu({
			renderTo: this.el,
				autoClose: false,
				hidden: true,
				height: 300,
				width: 200,
				isDropdown: true,
				cls: "hbox",
				listeners: {
					hide: (menu) => {

					}
				}
			},
			hrsContainer,
			minsContainer
		);




		this.input.addEventListener('focus', () => {
			this.menu.show();

			const dt = this.getValueAsDateTime();

			if(dt) {

				this.menu.items.get(0)!.items.forEach(b => b.cls="")
				this.menu.items.get(1)!.items.forEach(b => b.cls="")

				const activeHour = this.menu.items.get(0)!.findItem(dt.getHours())!;
				activeHour.cls="primary filled";

				if(!activeHour.el.isScrolledIntoView(this.menu.items.get(0)!.el))
					activeHour.el.scrollIntoView();

				const activeMin = this.menu.items.get(1)!.findItem(dt.getMinutes())!
				activeMin.cls="primary filled";

				if(!activeMin.el.isScrolledIntoView(this.menu.items.get(1)!.el))
					activeMin.el.scrollIntoView();
			}
		})

		// for safari that does not focus on buttons.
		this.menu.el.tabIndex = -1;

		this.input.addEventListener('blur', (e:any) => {
			setTimeout(() => {
				if (e.relatedTarget && this.menu.el.contains(e.relatedTarget)) {
					return;
				}
				this.menu.hide();
			});
		})
	}

	protected internalRemove() {
		if (this.menu) {
			this.menu.remove();
		}
		super.internalRemove();
	}

	protected internalRender(): HTMLElement {

		const el = super.internalRender();

		this.menu.alignTo = this.wrap;
		this.menu.alignToInheritWidth = false;

		return el;
	}

	public set step(v:number) {
		this.input!.step = v.toString();
	}

	public get step() {
		return parseInt(this.input!.step);
	}

	/**
	 * The minimum number allowed
	 *
	 * The value of the time input is always in 24-hour format that includes leading zeros: hh:mm
	 *
	 * @param min
	 */
	public set min(min:string) {
		this.input!.attr('min', min);
	}

	public get min() {
		return this.input!.attr('min');
	}

	/**
	 * The maximum number allowed
	 *
	 * The value of the time input is always in 24-hour format that includes leading zeros: hh:mm
	 *
	 * @param max
	 */
	public set max(max:string) {
		this.input!.attr('max', max);
	}

	public get max() {
		return this.input!.attr('max');
	}

	protected outputFormat() {
		return "H:i";
	}

	/**
	 * Get the date as DateTime object
	 */
	public getValueAsDateTime() {

		let v = this.value as string, date;
		if (!v || !(date = DateTime.createFromFormat(v, this.outputFormat()))) {
			return undefined;
		}
		return date;
	}

	set value(v: string | undefined) {
		super.value = v;
	}

	get value(): string |undefined {
		const v = super.value as string | undefined;
		return v ? v : undefined;
	}
}


/**
 * Shorthand function to create {@see TextField}
 *
 * @param config
 */
export const timefield = (config?: FieldConfig<TimeField, FieldEventMap<TextField>>) => createComponent(new TimeField(), config);