import {TextField} from "./TextField.js";
import {Field, FieldConfig} from "./Field.js";
import {comp, createComponent} from "../Component.js";
import {DateTime, E, Format, FunctionUtil} from "../../util/index.js";
import {menu} from "../menu/index.js";
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

	private hoursInput?: HTMLInputElement;
	private minutesInput?: HTMLInputElement;
	private amPm?: HTMLSelectElement;
	public readonly menuBtn: Button;

	/**
	 * TimeField constructor
	 *
	 * @param outputFormat Output format to the server. See {@link DateTime.format}.
	 */
	constructor(public outputFormat = "H:i") {
		super();

		this.menuBtn = btn({
			icon: "schedule"
		});
		this.addButton(this.menuBtn);

		this.twelveHour = Format.timeFormat12hour();
	}

	/**
	 * Use 12h or 24h format. Defaults to the system settings.
	 * @param twelveHour
	 */
	public set twelveHour(twelveHour:boolean) {
		this.el.classList.toggle("twelvehour", twelveHour);

		this.menuBtn.menu = this.createMenu();
	}

	/**
	 * Use 12h or 24h format. Defaults to the system settings.
	 */
	public get twelveHour() {
		return this.el.classList.contains("twelvehour");
	}

	protected createControl(): HTMLElement | undefined {
		const ctrl = E("div").cls("goui");

		const onBlur = function (this: any) {
			if (!this.value) {
				return;
			}
			this.value = this.value.padStart(2, "0")
			return true;
		}

		const onFocus = function (this: any, ev: any) {
			ev.preventDefault();
			this.focus();
			this.setSelectionRange(0, this.value.length);
		};

		const onKeyDown = (ev: KeyboardEvent) => {
			switch (ev.key) {
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
					if (!/^[0-9]$/i.test(ev.key)) {
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
		this.hoursInput.oninput = FunctionUtil.buffer(500, function (this: any, e: any) {
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
		this.minutesInput.oninput = FunctionUtil.buffer(500, function (this: any, e: any) {

			if (parseInt(this.value) > 59) {
				this.value = "59";
			}

			onBlur.call(this);
			onFocus.call(this, e)
		});
		const hoursInput = this.hoursInput!;
		this.minutesInput.onmousedown = onFocus;
		this.minutesInput.onblur = function (this: any) {
			onBlur.call(this);
			if (!this.value && hoursInput.value) {
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
		if (v && this.hoursInput && this.minutesInput && this.amPm) {
			const dt = DateTime.createFromFormat(v, "H:i");
			if (!dt) {
				return;
			}

			if (this.twelveHour) {
				this.hoursInput.value = dt.format("h");
				this.amPm.value = dt.format("a");
			} else {
				this.hoursInput.value = dt.format("H");
			}
			this.minutesInput.value = dt.format("i");
		}
	}

	protected internalGetValue(): string | undefined {
		if (!this.hoursInput!.value) {
			return undefined;
		}

		let hrs = this.hoursInput!.value;

		if (this.twelveHour && this.amPm!.value == "pm") {
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

		const handler = (btn: Button) => {
			let dt = this.getValueAsDateTime();
			if (!dt) {
				dt = new DateTime();
				dt.setHours(0);
				dt.setMinutes(0);

			}
			if (btn.dataSet.hour !== undefined) {
				dt.setHours(btn.dataSet.hour);
			}

			if (btn.dataSet.min !== undefined) {
				dt.setMinutes(btn.dataSet.min);
			}

			this.value = dt.format("H:i");
			updateMenuSelection();
			this.focus();
		}

		const hourFormat = this.twelveHour ? 'h\\&\\n\\b\\s\\p\\;a' : 'H';

		const updateMenuSelection = () => {
			const dt = this.getValueAsDateTime();

			if (dt) {
				mnu.items.get(0)!.items.forEach(b => b.cls = "")
				mnu.items.get(1)!.items.forEach(b => b.cls = "")

				const activeHour = mnu.items.get(0)!.findItem(dt.getHours())!;
				activeHour.cls = "pressed";

				if (!activeHour.el.isScrolledIntoView(mnu.items.get(0)!.el))
					activeHour.el.scrollIntoView();

				const activeMin = mnu.items.get(1)!.findItem(dt.getMinutes())!
				activeMin.cls = "pressed";

				if (!activeMin.el.isScrolledIntoView(mnu.items.get(1)!.el))
					activeMin.el.scrollIntoView();
			}
		}

		for (let h = 0; h < 24; h++) {
			hrsContainer.items.add(btn({
				dataSet: {hour: h},
				itemId: h,
				html: DateTime.createFromFormat(h + "", "H")!.format(hourFormat),
				handler: handler
			}))
		}

		for (let m = 0; m < 60; m++) {
			minsContainer.items.add(btn({
				dataSet: {min: m},
				itemId: m,
				text: DateTime.createFromFormat(m + "", "k")?.format("i"),
				handler: handler
			}))
		}

		const mnu = menu({
				height: 300,
				width: 200,
				alignTo: this.wrap,
				alignToInheritWidth: true,
				cls: "hbox",
				listeners: {
					render: ev => {
						// for safari that does not focus on buttons.
						ev.target.el.tabIndex = -1;
					},
					show: ev => {
						updateMenuSelection();
					}
				}
			},
			hrsContainer,
			minsContainer
		)

		return mnu;
	}

	public set step(v: number) {
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
	public min: string | undefined;

	/**
	 * The maximum number allowed
	 *
	 * The value of the time input is always in 24-hour format that includes leading zeros: hh:mm
	 *
	 * @param max
	 */
	public max: string | undefined;

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

	get value(): string | undefined {
		const v = super.value as string | undefined;
		return v ? v : undefined;
	}

	protected eventTargetIsInFocus(e: FocusEvent): boolean {
		return super.eventTargetIsInFocus(e) || (e.relatedTarget instanceof HTMLElement) && this.menuBtn.menu!.el.contains(e.relatedTarget);
	}
}


/**
 * Shorthand function to create {@link TextField}
 *
 * @param config
 */
export const timefield = (config?: FieldConfig<TimeField>) => createComponent(new TimeField(config?.outputFormat ?? "H:i"), config);