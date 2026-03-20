/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */
/**
 * Short function to create a HTML element by tag name
 *
 * @category Utility
 * @param tag Tag name
 * @param items Elements to append to this new element
 * @constructor
 */
export declare function E<K extends keyof HTMLElementTagNameMap>(tag: K, ...items: (Node | string | number)[]): HTMLElementTagNameMap[K];
declare global {
    /**
     * @category Utility
     */
    interface Element {
        /** Chainable shortcut for addEventListener */
        on<K extends keyof HTMLElementEventMap>(type: K, listener: (ev: HTMLElementEventMap[K] & {
            target: HTMLElement;
        }) => any, options?: boolean | AddEventListenerOptions): this;
        /** Chainable shortcut for removeEventListener */
        un<K extends keyof HTMLElementEventMap>(type: K, listener: (ev: HTMLElementEventMap[K] & {
            target: HTMLElement;
        }) => any, options?: boolean | AddEventListenerOptions): this;
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
        cls(name: string | string[], enabled?: boolean): this;
        attr(name: string): string;
        attr(name: string, value: any): this;
        /**
         * Add style to an element in a chainable way
         */
        css(style: Partial<CSSStyleDeclaration>): this;
        /**
         * Check if element has attribute of className
         * Will check for class if clsOrAttr starts with a '.'
         *   .has('value')
         *   .has('data-number')
         *   .has('.active')
         * @param clsOrAttr
         */
        has(clsOrAttr: string): boolean;
        /** Check if tagName matches case-insensitive */
        isA(tagName: string): boolean;
        /**
         * Look up the dom tree for an element matchign the expression
         * If no selector is given, return the parent
         * @param selector , a valid CSS selector
         * @param until and the highest element to look bot. (dofault <body>)
         */
        up(selector: string, until?: Element): HTMLElement | null;
        /**
         * Clear all child nodes
         */
        empty(): void;
        /**
         * Check if this element is visible within the given container
         * @param container Defaults to the viewport
         */
        isScrolledIntoView(container?: Element): boolean;
    }
}
