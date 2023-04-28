/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */

import {Component, ComponentEventMap, Config, createComponent} from "../Component.js";
import {DateTime} from "../../util/DateTime.js";
import {E} from "../../util/Element.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "../Observable.js";
// import {Button} from "../Button";
export interface DatePickerEventMap<Type> extends ComponentEventMap<Type> {

	'select': <Sender extends Type>(datepicker: Sender, date: DateTime) => false | void
	'select-range': <Sender extends Type>(datepicker: Sender, start: DateTime, end: DateTime) => false | void
}

export interface DatePicker {
	on<K extends keyof DatePickerEventMap<this>>(eventName: K, listener: Partial<DatePickerEventMap<this>>[K], options?: ObservableListenerOpts): void;

	fire<K extends keyof DatePickerEventMap<this>>(eventName: K, ...args: Parameters<NonNullable<DatePickerEventMap<this>[K]>>): boolean;

	set listeners(listeners: ObservableListener<DatePickerEventMap<this>>)
}

export class DatePicker extends Component {

	public showWeekNbs: boolean
	public value: DateTime
	private now: DateTime
	public enableRangeSelect = false;

	protected baseCls = "datepicker"

	protected monthEl: HTMLSpanElement
	protected yearEl: HTMLSpanElement
	protected years: HTMLElement
	protected months:HTMLElement
	protected grid: HTMLElement
	protected menu: HTMLElement

	constructor() {
		super();
		this.showWeekNbs = true;
		this.value = new DateTime();
		this.now = new DateTime();
		//this.el = document.getElementById('cal');
		this.el.cls('+preload');

		this.el.append(
			this.menu = E('header',
				E('button','◀').on('click', _ => { this.moveMonth(-1)}),
				this.monthEl = E('span').on('click', _ => {
					this.months.cls('!active');
					this.years.cls('-active');
				}),
				this.yearEl = E('span').on('click', _ => {
					this.years.cls('!active');
					this.months.cls('-active');
					// scroll half way
					this.years.scrollTop = (this.years.scrollHeight / 2) - (this.years.clientHeight / 2);
				}),
				E('button',"▶").on('click',_=> {this.moveMonth(1) })
			),
			this.grid = E('div').cls('+cards'),
			E('div',
				this.years = E('ul').on('click', ({target}) => {
					const year = +target.textContent!;
					if(!isNaN(year)) {
						this.value.setYear(year);
						this.internalRender()
						this.years.cls('-active');
					}
				}),
				this.months = E('ul').on('click', ({target}) => {
					if(target.dataset.nb) {
						this.value.setMonth(+target.dataset.nb);
						this.internalRender();
						this.months.cls('-active');
					}
				})
			).cls(['cards','top'], true)
		);
		for (let i = -100; i < 100; i++) {
			this.years.append(E('li', (this.value.getYear() + i)+"").cls('now', i===0));
		}
		this.months.append(...DateTime.monthNames.map((name, i) =>
			E('li',name).cls('now', i === this.now.getMonth()-1).attr('data-nb',i+1)
		));
		//this.internalRender();
	}

	moveMonth(amount: number) {
		this.grid.cls('reverse',amount>0);
		this.grid.offsetHeight; // will reflow layout
		this.value.addMonths(amount);

		this.internalRender();
	}

	protected internalRender() {
		const el = super.internalRender();

		this.monthEl.textContent = this.value.format('M');
		this.yearEl.textContent = this.value.format('Y');
		this.years.querySelector('.selected')?.cls('-selected');
		let y = this.value.getYear()-this.now.getYear()+100;
		this.years.children[y]?.cls('+selected');
		this.months.querySelector('.selected')?.cls('-selected');
		this.months.querySelector('[data-nb="'+this.value.getMonth()+'"]')?.cls('+selected');

		const cal = E('div').cls('active');
		const dl = E('dl'),
			itr = this.value.clone().setMonthDay(1).setWeekDay(0),  // monday back from 1st
			weekNbs = E('ol');

		//header with day names
		dl.append(...Object.values(DateTime.dayNames).map(s => E('dt',s.substring(0,2)) ));
		// dates and week nbs
		for(let i=0; i<42; i++) {
			if(this.showWeekNbs && i % 7 == 0)
				weekNbs.append(E('li',itr.format('W')));
			dl.append(E('dd',itr.format('j')).attr('data-date', itr.format('Y-m-d'))
				.cls('off', itr.format('Ym') !== this.value.format('Ym'))
				.cls('today',itr.format(`Ymd`) === this.now.format(`Ymd`))
			);
			itr.addDays(1);
		}

		if(this.showWeekNbs)
			cal.append(weekNbs);

		this.setupDraggability(dl);
		cal.append(dl);

		const old = this.grid.firstElementChild?.cls('-active');
		this.grid.prepend(cal); // prepend so query selector will find the new month

		// cleanup
		setTimeout(function(){el.cls('-preload'); old?.remove(); },250);
		return el;
	}

	setValue(start:DateTime, end?:DateTime) {
		if(start.format('Ym') != this.value.format('Ym')) {
			this.value = start;
			this.internalRender();
		}
		const startEl = this.grid.querySelector<HTMLElement>('dd[data-date="'+start.format('Y-m-d')+'"]')!,
			endEl = !end ? startEl : this.grid.querySelector<HTMLElement>('dd[data-date="' + end.format('Y-m-d') + '"]')!;
		if(startEl && endEl) {
			this.markSelected(startEl, endEl)
		}
	}

	private markSelected(start: HTMLElement, end: HTMLElement) {
		this.el.querySelectorAll('.selected')
			.forEach(e => e.cls(['selected','tail','head'], false)); // clear selection

		end.cls('+tail');
		start.cls('+head');
		let itr: Element | null = start;
		while(itr && itr != end.nextElementSibling) {
			itr.cls('+selected');
			itr = itr.nextElementSibling;
		}
	}

	private setupDraggability(dl: HTMLDListElement) {
		let anchor:HTMLElement,
			start:HTMLElement,
			end:HTMLElement;
		const onMouseMove = ({target}: MouseEvent & {target: HTMLElement}) => {
			if(!this.enableRangeSelect) {
				return false;
			}
			if(target.isA('DD') && target != end) {
				[start, end] = (anchor.compareDocumentPosition(target) & 0x02) ? [target,anchor] : [anchor,target];
				this.markSelected(start,end);
			}
		}, onMouseUp = (_e: MouseEvent) => {

			dl.un('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
			if(!this.enableRangeSelect || start == end) {
				this.fire('select', this, new DateTime(start.attr('data-date')));
			} else {
				this.fire('select-range', this, new DateTime(start.attr('data-date')), new DateTime(end.attr('data-date')));
			}
		};
		dl.on('mousedown', ({target}) => {

			if(target.isA('dd')) {
				anchor = start = end = target;
				dl.querySelectorAll('dd.selected').forEach(e => e.cls(['selected','tail','head'], false)); // clear selection
				target.cls(['selected','tail','head'], true);
				dl.on('mousemove', onMouseMove);
				window.addEventListener('mouseup', onMouseUp);
			}
		});
	}
}
export const datepicker = (config?: Config<DatePicker>) => createComponent(new DatePicker(), config);