export function E<K extends keyof HTMLElementTagNameMap>(tagName: K, ...items: (Node|string)[]): HTMLElementTagNameMap[K] {
	const el = document.createElement(tagName) ;
	el.append(...items);
	return el;
}
declare global {
	interface Element {
		/** Chainable shortcut for addEventListener */
		on<K extends keyof HTMLElementEventMap>(type: K, listener: (ev: HTMLElementEventMap[K] & { target: HTMLElement }) => any, options?: boolean | AddEventListenerOptions): this;

		/** Chainable shortcut for removeEventListener */
		un<K extends keyof HTMLElementEventMap>(type: K, listener: (ev: HTMLElementEventMap[K] & { target: HTMLElement }) => any, options?: boolean | AddEventListenerOptions): this;

		/**
		 * Change the classList
		 * Usage examples:
		 *   .cls('+active') // add
		 *   .cls('-selected') // remove
		 *   .cls('!collapsed') // toggle
		 *   .cls(['add','them','all'], true) // add multiple
		 *   .cls('maybe', myBoolean) // add of myBoolean is true / remove if false
		 *   .cls('remove', false) // remove
		 *   .cls('allmighty') // add this class and remove all others
		 * @see has() to check of classList contains your class.
		 * @param name of the class
		 * @param enabled add or remove it
		 */
		cls(name: string | string[], enabled?: boolean): this

		// read attribute
		attr(name: string): string

		// set attributes
		attr(name: string, value: any): this

		/**
		 * Check if element has attribute of className
		 * Will check for class if clsOrAttr starts with a '.'
		 *   .has('value')
		 *   .has('data-number')
		 *   .has('.active')
		 * @param clsOrAttr
		 */
		has(clsOrAttr: string): boolean

		/** Check if tagName matches case-insensitive */
		isA(tagName: string): boolean
	}
}
Object.assign(Element.prototype, {
	on(event: string, listener: (e: Event) => void, useCapture?: boolean) {
		this.addEventListener(event, listener, useCapture);
		return this
	},
	un(event: string, listener: (e: Event) => void, useCapture?: boolean) {
		this.removeEventListener(event, listener, useCapture);
		return this
	},
	cls(name: string|string[], enable?: boolean) {
		if(!name) return this;
		if(Array.isArray(name)) {
			(name as string[]).map((n) => { this.cls(n, enable)});
			return this;
		}
		name = name as string;
		if(enable !== undefined) {
			name = (enable ? '+' : '-') + name;
		}
		switch (name.substring(0, 1)) {
			case '+': this.classList.add(name.substring(1));
				break;
			case '-': this.classList.remove(name.substring(1));
				break;
			case '!': this.classList.toggle(name.substring(1));
				break;
			default: this.className = name;
		}
		return this;
	},
	attr(name: string, value?: string) {
		if(value === undefined) {
			return this.getAttribute(name);
		}
		this.setAttribute(name, value);
		return this;
	},
	has(clsOrAttr: string) {
		if (clsOrAttr.substring(0, 1) === '.') {
			return this.classList.contains(clsOrAttr.substring(1));
		}
		return this.hasAttribute(clsOrAttr);
	},
	isA(tagName: string) { /* Check element by tagname */
		return this.tagName.toLowerCase() === tagName.toLowerCase();
	}
} as Element);