import {Component, Config, createComponent} from "../Component.js";
import {DateTime} from "../../util/DateTime.js";
import {E} from "../../util/Element.js";
// import {Button} from "../Button";

export class DatePicker extends Component{

	showWeekNbs: boolean
	value: DateTime
	now: DateTime

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
		this.el.append(
			this.menu = E('header',
				E('button','◀').on('click', _ => { this.month(-1)}),
				this.monthEl = E('span').on('click', _ => this.months.cls('!active')),
				this.yearEl = E('span').on('click', _ => {
					this.years.cls('!active');
					this.months.cls('-active');
					// scroll half way
					this.years.scrollTop = (this.years.scrollHeight / 2) - (this.years.clientHeight / 2);
				}),
				E('button',"▶").on('click',_=> {this.month(1) })
			),
			this.grid = E('div').cls('cards'),
			E('div',
				this.years = E('ul').on('click', ({target}) => {
					this.value.setYear(+target.textContent!);
					this.render()
					this.years.cls('-active');
				}),
				this.months = E('ul').on('click', ({target}) => {
					this.value.setMonth(+target.dataset.nb!);
					this.render();
					this.months.cls('-active');
				})
			).cls(['cards','top'], true)
		);
		for (let i = -100; i < 100; i++) {
			this.years.append(E('li', this.value.format('Y') + i).cls('now', i===0));
		}
		this.months.append(...DateTime.monthNames.map((name, i) => E('li',name).cls('now', i === this.now.getMonth()).attr('data-nb',i) ));

		//this.internalRender();
	}

	month(n: number) {
		this.grid.cls('reverse',n>0);
		this.value.addMonths(n);
		this.internalRender();
	}

	protected internalRender() {
		const el = super.internalRender();

		this.monthEl.textContent = this.value.format('M');
		this.yearEl.textContent = this.value.format('Y');
		this.years.querySelector('.selected')?.cls('-selected');
		let y = this.value.getYear()-this.now.getYear()+100;
		this.years.children[y]?.cls('selected');
		this.months.querySelector('.selected')?.cls('-selected');
		this.months.querySelector('[data-nb="'+this.value.getMonth()+'"]')?.cls('+selected');

		const cal = E('div');
		if(!this.grid.children.length)
			cal.cls('active');
		const dl = E('dl'),
			itr = this.value.clone().setMonth(1).setDay(0),
			weekNbs = E('ol'); // monday back from 1st

		//header
		dl.append(...DateTime.dayNames.map(s => E('dt',s.substring(0,2)) ));
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

		this.makeSelectable(dl);
		cal.append(dl);
		this.grid.append(cal);
		const prev = cal.previousElementSibling;

		prev?.cls('active', false);
		setTimeout(function(){cal.cls('active'); },0);
		setTimeout(function(){prev?.remove(); },1375);

		return el;
	}

	makeSelectable(dl: HTMLDListElement) {
		let anchor:HTMLElement,
			start:HTMLElement,
			end:HTMLElement;
		const onMouseMove = ({target}: MouseEvent & {target: HTMLElement}) => {
			if(target.tagName == 'DD' && target != end) {
				dl.querySelectorAll('.selected')
					.forEach(e => e.cls(['selected','tail','head'], false)); // clear selection

				[start, end] = (anchor.compareDocumentPosition(target) & 0x02) ? [target,anchor] : [anchor,target];
				end.cls('+tail');
				start.cls('+head');
				let itr: Element | null = start;
				while(itr && itr != end.nextElementSibling) {
					itr.cls('+selected');
					itr = itr.nextElementSibling;
				}

			}
		}
		const onMouseUp = (_e: MouseEvent) => {

			dl.un('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
			if(start == end) {
				console.log('selected', start.attr('data-date'));
			} else {
				console.log('range', start.attr('data-date'), end.attr('data-date'));
			}
		};
		dl.on('mousedown', ({target}) => {

			if(target.tagName == 'DD') {
				anchor = start = end = target;
				dl.querySelectorAll('dd.selected').forEach(e => e.cls('-selected')); // clear selection
				target.cls(['selected','tail','head'], true);
				dl.on('mousemove', onMouseMove);
				window.addEventListener('mouseup', onMouseUp);
			}
		});
	}
}
export const datepicker = (config?: Config<DatePicker>) => createComponent(new DatePicker(), config);