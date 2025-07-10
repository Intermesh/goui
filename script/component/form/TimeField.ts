import {TextField} from "./TextField.js";
import {Field, FieldConfig, FieldEventMap} from "./Field.js";
import {comp, createComponent} from "../Component.js";
import {DateInterval, DateTime, E, FunctionUtil} from "../../util/index.js";
import {InputField} from "./InputField.js";
import {Menu, menu} from "../menu/index.js";
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
export class TimeField extends Field {


	protected baseCls = "goui-form-field time no-floating-label";
	private menu!: Menu;

	private hoursInput?: HTMLInputElement;
	private minutesInput?: HTMLInputElement;

	private amPm?: HTMLSelectElement;

	constructor(public outputFormat = "H:i", public readonly twelveHour = false) {
		super();
		if(twelveHour)
			this.el.classList.add("twelvehour");

		this.createMenu();

	}


	protected createControl(): HTMLElement | undefined {
		const ctrl = E("div").cls("goui");


		const onBlur = function(this:any) {
			if(!this.value) {
				return;
			}
			this.value = this.value.padStart(2, "0")
			return true;
		}

		const onFocus = function(this:any, ev:any) {
			ev.preventDefault();
			this.focus();
			this.setSelectionRange(0, this.value.length);
		};

		const onKeyDown = (ev:KeyboardEvent) => {
			switch(ev.key) {
				case "Tab":
				case "Enter":
				case "Backspace":
				case "Delete":
					return true;

				case ':':
					this.minutesInput!.focus();
					ev.preventDefault();
					break;

				default:
					if(!/^[0-9]$/i.test(ev.key)) {
						//only allow numbers
						ev.preventDefault();
					}
			}
		};


		this.hoursInput = document.createElement("input");
		this.hoursInput.classList.add("text");
		this.hoursInput.classList.add("hour");
		this.hoursInput.inputMode = "numeric";
		this.hoursInput.type = "text";
		this.hoursInput.pattern = "[0-9]+";
		this.hoursInput.onblur = onBlur;
		this.hoursInput.onfocus = onFocus;
		this.hoursInput.onmousedown = onFocus;
		this.hoursInput.maxLength = 2;
		this.hoursInput.oninput = FunctionUtil.buffer(500, function(this: any,e:any) {
			onBlur.call(this);
			onFocus.call(this, e)
		});

		this.hoursInput.placeholder = "--";
		this.hoursInput.autocomplete = "off";
		this.hoursInput.onkeydown = onKeyDown;

		this.minutesInput = document.createElement("input");
		this.minutesInput.classList.add("text");
		this.minutesInput.classList.add("minute");
		this.minutesInput.inputMode = "numeric";
		this.minutesInput.type = "text";
		this.minutesInput.pattern = "[0-9]+";
		this.minutesInput.maxLength = 2;
		this.minutesInput.oninput = FunctionUtil.buffer(500, function(this: any,e:any) {

			if(parseInt(this.value) > 59) {
				this.value = "59";
			}

			onBlur.call(this);
			onFocus.call(this, e)
		});
		const hoursInput = this.hoursInput!;
		this.minutesInput.onmousedown = onFocus;
		this.minutesInput.onblur = function(this:any) {
			onBlur.call(this);
			if(!this.value && hoursInput.value) {
				this.value = "00";
			}
		};
		this.minutesInput.onfocus = onFocus;
		this.minutesInput.onkeydown = onKeyDown;

		this.minutesInput.placeholder = "--";
		this.minutesInput.autocomplete = "off";

		this.amPm = document.createElement("select");
		this.amPm.append(new Option("am", "am", true, true));
		this.amPm.append(new Option("pm", "pm"));


		ctrl.append(this.hoursInput, ":", this.minutesInput, this.amPm);

		return ctrl;
	}

	protected internalSetValue(v?: any) {
		if(v && this.hoursInput && this.minutesInput && this.amPm) {
			const dt = DateTime.createFromFormat(v, "H:i");
			if(!dt) {
				return;
			}

			if(this.twelveHour) {
				this.hoursInput.value = dt.format("h");
				this.amPm.value = dt.format("a");
			} else {
				this.hoursInput.value = dt.format("H");
			}
			this.minutesInput.value = dt.format("i");
		}
	}

	protected internalGetValue(): string | undefined {
		if(!this.hoursInput!.value) {
			return undefined;
		}

		let hrs = this.hoursInput!.value;

		if(this.twelveHour && this.amPm!.value == "pm") {
			hrs = (parseInt(hrs) + 12) + "";
		}


		return hrs + ":" + (this.minutesInput!.value ? this.minutesInput!.value : "00");

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
			if(btn.dataSet.hour !== undefined) {
				dt.setHours(btn.dataSet.hour);
			}

			if(btn.dataSet.min !== undefined) {
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
				// renderTo: this.el,
				// autoClose: false,
				removeOnClose: false,
				hidden: true,
				height: 300,
				width: 200,
				isDropdown: true,
				cls: "hbox",
				listeners: {
					beforehide: ({target}) => {
						// cancel hide if field still has focus
						if(this.el.contains(document.activeElement)) {
							//hide menu when clicked elsewhere
							window.addEventListener("mousedown", (ev) => {
								target.close();
							}, {once: true});

							return false;
						}
					}
				}
			},
			hrsContainer,
			minsContainer
		);

		// otherwise it will be rendered to the root el.
		// this.menu.parent = this;

		this.el.addEventListener('focus', () => {
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

		this.el.addEventListener('blur', (e:any) => {
			setTimeout(() => {
				if (e.relatedTarget && this.menu.el.contains(e.relatedTarget)) {
					return;
				}
				this.menu.hide();
			});
		})
	}

	protected eventTargetIsInFocus(e: FocusEvent): boolean {
		return super.eventTargetIsInFocus(e) || (e.relatedTarget instanceof HTMLElement) && this.menu.el.contains(e.relatedTarget);
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
	public min:string|undefined;

	/**
	 * The maximum number allowed
	 *
	 * The value of the time input is always in 24-hour format that includes leading zeros: hh:mm
	 *
	 * @param max
	 */
	public max:string|undefined;




	/**
	 * Get the date as DateTime object
	 */
	public getValueAsDateTime() {

		let v = this.value as string, date;
		if (!v || !(date = DateTime.createFromFormat(v, this.outputFormat))) {
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
 * Shorthand function to create {@link TextField}
 *
 * @param config
 */
export const timefield = (config?: FieldConfig<TimeField>) => createComponent(new TimeField(config?.outputFormat ?? "H:i", config?.twelveHour), config);