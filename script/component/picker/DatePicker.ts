/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */

import {Component, ComponentEventMap, createComponent} from "../Component.js";
import {DateTime} from "../../util/DateTime.js";
import {E} from "../../util/Element.js";
import {Config, Listener, ObservableListenerOpts} from "../Observable.js";
import {t} from "../../Translate";

// import {Button} from "../Button";
export interface DatePickerEventMap<Type> extends ComponentEventMap<Type> {

	'select': (datepicker: Type, date: DateTime|undefined) => false | void
	'select-range': (datepicker: Type, start: DateTime|undefined, end: DateTime|undefined) => false | void
}

export interface DatePicker extends Component{
	on<K extends keyof DatePickerEventMap<this>, L extends Listener>(eventName: K, listener: Partial<DatePickerEventMap<this>>[K], options?: ObservableListenerOpts): L;
	un<K extends keyof DatePickerEventMap<this>>(eventName: K, listener: Partial<DatePickerEventMap<this>>[K]): boolean
	fire<K extends keyof DatePickerEventMap<this>>(eventName: K, ...args: Parameters<DatePickerEventMap<Component>[K]>): boolean;
}

export class DatePicker extends Component {

	public showWeekNbs: boolean
	public value: DateTime
	private now: DateTime
	public enableRangeSelect = false;

	protected baseCls = "datepicker"

	protected monthEl: HTMLButtonElement
	protected yearEl: HTMLButtonElement
	protected years: HTMLElement
	protected months: HTMLElement
	protected grid: HTMLElement
	protected menu: HTMLElement

	minDate?: DateTime;

	maxDate?: DateTime;

	/**
	 * Used to determine if a refresh() is needed when new value is set.
	 * @private
	 */
	private renderedMonth?: string;
	// private footer: HTMLElement;


	constructor() {
		super();
		this.showWeekNbs = true;
		this.value = new DateTime();
		this.now = new DateTime();

		this.el.append(
			this.menu = E('header',
				E('button', E('i', "chevron_left").cls("icon")).cls(["goui-button", "nav", "with-icon"], true).on('click', _ => {
					this.moveMonth(-1)
				}),
				this.monthEl = E('button').cls("goui-button").on('click', _ => {
					this.months.cls('!active');
					this.years.cls('-active');
				}),
				this.yearEl = E('button').cls("goui-button").on('click', _ => {
					this.years.cls('!active');
					this.months.cls('-active');
					// scroll half way
					this.years.scrollTop = (this.years.scrollHeight / 2) - (this.years.clientHeight / 2);
				}),
				E('button', E('i', "chevron_right").cls("icon")).cls(["goui-button", "nav", "with-icon"], true).on('click', _ => {
					this.moveMonth(1)
				})
			),
			this.grid = E('div').cls('+cards'),
			E('div',
				this.years = E('ul').on('click', ({target}) => {
					const year = +target.textContent!;
					if (!isNaN(year)) {
						this.value.setYear(year);
						this.setValue(this.value);
						this.years.cls('-active');
					}
				}),
				this.months = E('ul').on('click', ({target}) => {
					if (target.dataset.nb) {
						this.value.setMonth(+target.dataset.nb);
						this.setValue(this.value);
						this.months.cls('-active');
					}
				})
			).cls(['cards', 'top', 'animate', 'reverse'], true)
		);

		// minimum and maximum year
		for (let i = -100; i < 100; i++) {
			this.years.append(E('li', (this.value.getYear() + i) + "").cls('now', i === 0));
		}
		this.months.replaceChildren(...DateTime.monthNames.map((name, i) =>
			E('li', name).cls('now', i === this.now.getMonth() - 1).attr('data-nb', i + 1)
		));
	}

	moveMonth(amount: number) {
		this.grid.cls('reverse', amount > 0);
		this.grid.offsetHeight; // will reflow layout
		this.value.addMonths(amount);
		this.setValue(this.value);
	}



	/**
	 * Refresh the view
	 */
	public refresh() {
		this.el.cls('+preload');
		if(this.value) {
			this.setValue(this.value);
		}
	}


	private constrainValue() {
		if(this.maxDate) {
			if (this.value.format("Ymd") > this.maxDate.format("Ymd")) {
				this.value = this.maxDate.clone();
			}
		}

		if(this.minDate) {
			if (this.value.format("Ymd") < this.minDate.format("Ymd")) {
				this.value = this.minDate.clone();
			}
		}
	}

	private setYearClasses() {

		this.years.querySelector('.selected')?.cls('-selected');

		for(let i= 0, l= this.years.children.length; i < l; i++) {
			const child = this.years.children[i];
			const curYear = parseInt(child.textContent!);
			if(curYear === this.value.getYear()) {
				child.cls('+selected');
			}
			if(this.minDate && this.minDate!.getYear() > curYear ) {
				child.cls('+disabled');
			}
			if(this.maxDate && this.maxDate!.getYear() < curYear) {
				child.cls('+disabled');
			}
		}
	}

	private setMonthClasses() {
		for(let m= 0; m < 12;m++) {
			const child = this.months.children[m];
			const curMonth =this.value.getYear() + (m+1).toString().padStart(2,"0");
			let sign;
			sign = m === (this.value.getMonth() -1)  ? "+" : "-";
			child.cls(sign + 'selected');

			sign = (this.minDate && this.minDate.format("Ym") > curMonth) ||
			(this.maxDate && this.maxDate.format("Ym") < curMonth)  ? "+" : "-";

			child.cls(sign + 'disabled');
		}
	}

	protected internalRender() {

		this.constrainValue();

		const el = super.internalRender();

		const year = this.value.format('Y'),
			month = this.value.format("M");

		this.renderedMonth = year+month;
		this.yearEl.innerHTML = year + '<i class="icon">arrow_drop_down</i>';
		this.monthEl.innerHTML = month + '<i class="icon">arrow_drop_down</i>';


		this.setYearClasses();
		this.setMonthClasses();

		if(this.showWeekNbs) {
			this.el.classList.add("show-weeknbs");
		}


		const cal = E('div');
		const dl = E('dl'),
			itr = this.value.clone().setMonthDay(1).setWeekDay(0),  // monday back from 1st
			weekNbs = E('ol');

		//header with day names
		dl.append(...Object.values(DateTime.dayNames).map(s => E('dt', s.substring(0, 2))));

		const minStr = this.minDate ? this.minDate.format('Ymd') : '00000101',
			maxStr = this.maxDate ? this.maxDate.format('Ymd') : '99991231';
		// dates and week nbs
		for (let i = 0; i < 42; i++) {
			const itrStr = itr.format("Ymd");

			if (this.showWeekNbs && i % 7 == 0) {
				weekNbs.append(E('li', itr.format('W')));
			}

			dl.append(E('dd', itr.format('j')).attr('data-date', itr.format('Y-m-d'))
				.cls('disabled', minStr > itrStr || maxStr < itrStr)
				.cls('off', itr.format('Ym') !== this.value.format('Ym'))
				.cls('today', itr.format(`Ymd`) === this.now.format("Ymd"))
			);
			itr.addDays(1);
		}
		if (this.showWeekNbs) {
			cal.append(weekNbs);
		}

		this.setupDraggability(dl);
		cal.append(dl);

		const old = this.grid.firstElementChild?.cls('-active').cls("+reverse");
		this.grid.prepend(cal); // prepend so query selector will find the new month

		this.grid.offsetHeight; // force paint

		this.grid.cls("+animate");

		cal.cls('active');

		// cleanup
		setTimeout(function () {

			old?.remove();
		}, 400);
		return el;
	}

	setValue(start: DateTime, end?: DateTime) {

		this.value = start;
		if (this.rendered && start.format('YM') !== this.renderedMonth) {
			this.internalRender();
		}

		const startEl = this.grid.querySelector<HTMLElement>('dd[data-date="' + start.format('Y-m-d') + '"]')!,
			endEl = !end ? startEl : this.grid.querySelector<HTMLElement>('dd[data-date="' + end.format('Y-m-d') + '"]')!;
		if (startEl && endEl) {
			this.markSelected(startEl, endEl)
		}
	}

	private markSelected(start: HTMLElement, end: HTMLElement) {
		this.el.querySelectorAll('.selected')
			.forEach(e => e.cls(['selected', 'tail', 'head'], false)); // clear selection

		end.cls('+tail');
		start.cls('+head');
		let itr: Element | null = start;
		while (itr && itr != end.nextElementSibling) {
			itr.cls('+selected');
			itr = itr.nextElementSibling;
		}
	}

	private setupDraggability(dl: HTMLDListElement) {
		let anchor: HTMLElement,
			start: HTMLElement,
			end: HTMLElement;
		const onMouseMove = ({target}: MouseEvent & { target: HTMLElement }) => {
			if (!this.enableRangeSelect) {
				return false;
			}
			if (target.isA('DD') && target != end) {
				[start, end] = (anchor.compareDocumentPosition(target) & 0x02) ? [target, anchor] : [anchor, target];
				this.markSelected(start, end);
			}
		}, onMouseUp = (_e: MouseEvent) => {
			dl.un('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
			if (!this.enableRangeSelect || start == end) {
				const v = new DateTime(start.attr('data-date'));
				this.value = v;
				this.fire('select', this, v);
			} else {
				this.fire('select-range', this, new DateTime(start.attr('data-date')), new DateTime(end.attr('data-date')));
			}
		};

		dl.on('mousedown', ({target}) => {
			if (target.isA('dd')) {
				anchor = start = end = target;
				dl.querySelectorAll('dd.selected').forEach(e => e.cls(['selected', 'tail', 'head'], false)); // clear selection
				target.cls(['selected', 'tail', 'head'], true);
				dl.on('mousemove', onMouseMove);
				window.addEventListener('mouseup', onMouseUp);
			}
		});
	}
}

export const datepicker = (config?: Config<DatePicker, DatePickerEventMap<DatePicker>>) => createComponent(new DatePicker(), config);