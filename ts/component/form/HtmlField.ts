// noinspection JSDeprecatedSymbols

import {Field, FieldConfig, FieldEventMap} from "./Field.js";
import {Toolbar} from "../Toolbar.js";
import {Button, MaterialIcon} from "../Button.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "../Observable.js";
import {browserDetect} from "../../util/BrowserDetect.js";
import {Key} from "../../util/Key.js";
import {ColorMenu} from "../menu/ColorMenu.js";
import {Menu} from "../menu/Menu.js";
import {Component} from "../Component.js";
import {FunctionUtil} from "../../util/FunctionUtil.js";
import {body} from "../Body.js";

/**
 * @inheritDoc
 */
export interface HtmlFieldConfig<T extends Observable> extends FieldConfig<T> {
	/**
	 * When the field is empty this will be dispklayed inside the field
	 */
	placeholder?: string,
	/**
	 * @inheritDoc
	 */
	listeners?: ObservableListener<HtmlFieldEventMap<T>>
}

/**
 * @inheritDoc
 */
export interface HtmlFieldEventMap<T extends Observable> extends FieldEventMap<T> {
	/**
	 * Fires before adding an item. Return false to abort.
	 *
	 * @param container
	 * @param item
	 * @param index
	 */
	updatetoolbar?: (htmlfield: HtmlField) => void

	/**
	 * Fires when an image is selected, pasted or dropped into the field
	 *
	 * @param htmlfield
	 * @param file
	 * @param img The img element in the editor
	 */
	insertimage?: (htmlfield: HtmlField, file: File, img: HTMLImageElement) => void

	/**
	 * Fires when a non image is pasted or dropped into the field
	 *
	 * @param htmlfield
	 * @param file
	 * @param img
	 */
	attach?: (htmlfield: HtmlField, file: File) => void
}


export interface HtmlField {
	on<K extends keyof HtmlFieldEventMap<HtmlField>>(eventName: K, listener: HtmlFieldEventMap<HtmlField>[K], options?: ObservableListenerOpts): void

	fire<K extends keyof HtmlFieldEventMap<HtmlField>>(eventName: K, ...args: Parameters<NonNullable<HtmlFieldEventMap<HtmlField>[K]>>): boolean
}

interface CmdConfig {
	icon: MaterialIcon,
	applyFn?:(btn: Button) => void,
	updateFn?:(btn: Button) => void,
	title: string
	menu?:Menu
}

document.execCommand("styleWithCSS", false, "true");

/**
 * A HTML editor field component
 *
 * @see Form
 */
export class HtmlField extends Field {

	protected tagName = "div" as keyof HTMLElementTagNameMap;

	protected baseCls = 'go-form-field go-html-field'

	private placeholder: string | undefined;
	private editor: HTMLDivElement | undefined;

	private valueOnFocus:string | undefined;
	private toolbar?: Toolbar;

	protected value = "";

	// noinspection JSUnusedGlobalSymbols
	public getEditor() {
		if(!this.editor) {
			throw new Error("Render first");
		}
		return this.editor;
	}


	private closestStyle(el:HTMLElement, styleProp: keyof CSSStyleDeclaration) {
		while((el = el.parentElement!)) {
			if (el == this.editor) return undefined;

			if(el.style[styleProp]) {
				return <string> el.style[styleProp];
			}
		}

		return undefined;
	}

	protected toolbarItems = [
		"bold", "italic", "underline",
		"-",
		"foreColor", "backColor", "removeFormat",
		"-",
		"justifyLeft", "justifyCenter", "justifyRight",
		"-",
		"insertOrderedList",
		"insertUnorderedList",
		"-",
		"indent",
		"outdent",
		"-",
		"image"
	]

	private items:Record<string, CmdConfig> = {
		bold : {icon: 'format_bold', title: "Bold"},
		italic : {icon: 'format_italic', title: "Italic"},
		underline : {icon: 'format_underlined', title: "Underline"},
		strikeThrough: {icon: 'format_strikethrough', title: "Strikethrough"},
		foreColor: {
			title: "Text color",
			icon: 'format_color_text',
			menu: ColorMenu.create({
				listeners: {
					select: (menu, color) => {
						this.execCmd("foreColor", color || "#000000")
					},
					beforeshow: (menu) =>{
						(<ColorMenu> menu).setValue(this.toolbar!.findItem("foreColor")!.getStyle().color || "");
					}
				}
			}),
			applyFn: () => {},
			updateFn: (btn) => {
				const s = document.getSelection();
				let color = s ? this.closestStyle(<HTMLElement> s.anchorNode!, "color") : undefined;
				btn.getEl().style.color = color || "";

			}
		},
		backColor: {
			icon: 'format_color_fill',
			title: "Background color",
			menu: ColorMenu.create({
				listeners: {
					select: (menu, color) => {
						this.execCmd("backColor", color || "#ffffff")
					},
					beforeshow: (menu) =>{
						(<ColorMenu> menu).setValue(this.toolbar!.findItem("backColor")!.getStyle().color || "");
					}
				}
			}),
			applyFn: () => {},
			updateFn: (btn) => {
				const s = document.getSelection();
				let bgcolor = s ? this.closestStyle(<HTMLElement> s.anchorNode!, "backgroundColor") : undefined;
				btn.getEl().style.color = bgcolor || "";

			}
		},
		justifyLeft: {icon: 'format_align_left', title: "Align left"},
		justifyCenter: {icon: 'format_align_center', title: "Align center"},
		justifyRight: {icon: 'format_align_right', title: "Align right"},
		insertOrderedList: {icon: 'format_list_numbered', title: "Numbered list"},
		insertUnorderedList: {icon: 'format_list_bulleted', title: "Bullet list"},
		indent: {icon: 'format_indent_increase', title: "Indent"},
		outdent: {icon: 'format_indent_decrease', title: "Outdent"},
		image: {
			icon: "image",
			title: "Image",
			applyFn: () => {
				const inp = document.createElement("input");
				inp.setAttribute("type", "file");
				inp.accept = "image/*";
				inp.multiple = true;
				inp.onchange =  () => {
					if(!inp.files) {
						return;
					}
					Array.from(inp.files).forEach((file) => {
						this.handleImage(file);
					});
				}
				inp.click();
			}
		},
		removeFormat: {icon: 'format_clear', title: "Remove formatting"},
		// emoji: {icon: 'insert_emoticon'},
		// html: {icon: 'code'}
	};

	public static create<T extends typeof Observable>(this: T, config?: HtmlFieldConfig<InstanceType<T>>) {
		return <InstanceType<T>> super.create(<any> config);
	}

	private updateToolbar() {

		const t = this.toolbar!;

		for (const cmd of this.toolbarItems) {
			if(cmd == "-") continue;

			const config = this.items[cmd];

			if(config.updateFn) {
				config.updateFn.call(this, <Button> t.findItem(cmd)!);
			} else {
				t.findItem(cmd)!.getEl().classList.toggle("pressed", document.queryCommandState(cmd));
			}
		}

		this.fire("updatetoolbar", this);
	}

	private execCmd(cmd:string, value?:string) {
		document.execCommand(cmd, false, value);

		const t = this.toolbar!, config = this.items[cmd];
		if(config) {
			if (config.updateFn) {
				config.updateFn.call(this, <Button>t.findItem(cmd)!);
			} else {
				t.findItem(cmd)!.getEl().classList.toggle("pressed", document.queryCommandState(cmd));
			}
		}

		this.editor!.focus();
	}

	/**
	 * Inserts an HTML string at the insertion point (deletes selection). Requires a valid HTML string as a value argument.
	 *
	 * @param html
	 */
	public insertHtml(html:string) {
		document.execCommand("insertHTML", false, html);
	}

	// noinspection JSUnusedGlobalSymbols
	protected internalRemove() {
		if(this.toolbar) {
			this.toolbar.remove();
		}
		super.internalRemove();
	}

	protected getToolbar() {

		if(this.toolbar) {
			return this.toolbar;
		}

		this.toolbar = Toolbar.create({
			cls: "go-frame go-html-field-toolbar"
		});

		for (const cmd of this.toolbarItems) {
			if(cmd == "-") {
				this.toolbar.addItem(Component.create({tagName:"hr"}));
			} else {

				const config = this.items[cmd];

				this.toolbar.addItem(Button.create({
					itemId: cmd,
					icon: config.icon,
					menu: config.menu,
					title: config.title,
					handler: (btn) => {
						if (!config.applyFn) {
							this.execCmd(btn.itemId);
						} else {
							config.applyFn.call(this, btn);
						}
					}
				}));
			}
		}

		body.addItem(this.toolbar);

		return this.toolbar;
	}

	protected showToolbar() {
		const rect = this.getEl().getBoundingClientRect();

		//must be rendered before we can calc height
		this.getToolbar().show();
		const h = this.getToolbar().getHeight()!
		const style = this.getToolbar().getStyle();

		const maxX = window.innerWidth - this.getToolbar().getWidth()!;
		style.left = Math.min(maxX, rect.x + window.scrollX) + "px";
		style.top = (window.scrollY + rect.top - h) + "px";
	}

	protected hideToolbar() {
		this.getToolbar().hide();
	}


	protected createControl() : undefined | HTMLElement {

		const el = this.getEl();

		el.addEventListener("click", () => {
			this.editor!.focus();
		});

		this.editor = document.createElement("div");
		this.editor.contentEditable = "true";
		this.editor.classList.add("editor");
		this.editor.classList.add("text");

		if(this.placeholder) {
			this.editor.dataset.placeholder = this.placeholder;
		}

		el.appendChild(this.editor);

		//buffer a bit for performance
		const selectionChangeFn = FunctionUtil.buffer(300, () => this.updateToolbar());

		this.editor.addEventListener("focus", () => {
			this.valueOnFocus = this.getValue();
			document.addEventListener("selectionchange", selectionChangeFn);

			this.showToolbar();
		});

		this.editor.addEventListener("blur", (e) => {
			if(this.valueOnFocus != this.getValue()) {
				this.fire("change", this);
			}
			document.removeEventListener("selectionchange", selectionChangeFn);
			if(!(e.relatedTarget instanceof HTMLElement) || !this.getToolbar().getEl().contains(e.relatedTarget)) {
				this.hideToolbar();
			}
		});

		this.editor.addEventListener("keydown", (ev) => {
			this.onKeyDown(ev);
		});

		this.editor.addEventListener("drop", ev => {
			this.onDrop(ev);
		});

		this.editor.addEventListener("dragover", ev => {
			// Prevent default behavior (Prevent file from being opened)
			ev.preventDefault();
		});

		this.editor.addEventListener('paste', ev => {
			this.onPaste(ev);
		});


		return this.editor;
	}

	// private isChildOfEditor(el:Node): boolean {
	// 	let p = el.parentNode;
	// 	if(p == this.editor) {
	// 		return true;
	// 	}
	//
	// 	if(!p || p == document.body) {
	// 		return false;
	// 	}
	//
	// 	return this.isChildOfEditor(p);
	//
	// }

	setValue(v: string) {

		if (this.editor) {
			this.editor.innerHTML = v;
		}

		super.setValue(v);
	}

	public getValue() {
		if (!this.editor) {
			return super.getValue();
		} else {
			return this.editor.innerHTML;
		}
	}

	public focus(o?: FocusOptions) {
		this.editor!.focus(o);
	}

	private lineIndex = 0;
	private lineSequence = "";

	private static removeCharsFromCursorPos(count:number) {
		const sel = window.getSelection();
		const range = sel!.getRangeAt(0);
		const clone = range.cloneRange();
		clone.setStart(range.startContainer, range.startOffset);
		clone.setEnd(range.startContainer, range.startOffset + count);
		clone.deleteContents();
	}


	private onKeyDown(ev:KeyboardEvent) {

		this.clearInvalid();

		//track first 3 chars of sentence for auto lists below
		if(ev.key == Key.Enter) {
			this.lineIndex = 0;
			this.lineSequence = "";
		} else if(this.lineIndex < 3) {
			this.lineIndex++;
			this.lineSequence += ev.key;
		}

		if (
			browserDetect.isWebkit() && ev.shiftKey && ev.key == Key.Enter &&
			(document.queryCommandState('insertorderedlist') || document.queryCommandState('insertunorderedlist'))
		) {
			ev.stopPropagation();
			//Firefox wants two??
			this.execCmd('InsertHtml', browserDetect.isFirefox() ? '<br />' : '<br /><br />');
			this.focus();
		} else if (ev.key == Key.Tab) {
			ev.preventDefault();
			if (document.queryCommandState('insertorderedlist') || document.queryCommandState('insertunorderedlist')) {
				this.execCmd(ev.shiftKey ? 'outdent' : 'indent');
			} else {
				this.execCmd('InsertText', '\t');
			}
			this.focus();
		} else if(ev.key == Key.Space) {

			// Auto lists
			if(this.lineSequence == "1. ") {
				this.execCmd("insertOrderedList");
				HtmlField.removeCharsFromCursorPos(2);
				ev.preventDefault();
			} else if(this.lineSequence == "- ") {
				this.execCmd("insertUnorderedList");
				HtmlField.removeCharsFromCursorPos(1);
				ev.preventDefault();
			}

		} else if(browserDetect.isMac()) {

			if(ev.ctrlKey) {
				let cmd;
				switch(ev.key){
					case Key.b:
						cmd = 'bold';
						break;
					case Key.i:
						cmd = 'italic';
						break;
					case  Key.u:
						cmd = 'underline';
						break;
				}
				if(cmd){
					// this.focus();
					this.execCmd(cmd);
					// this.focus();
					ev.preventDefault();
				}
			}
		}
	}

	private onDrop(e:DragEvent) {
		if(!e.dataTransfer || !e.dataTransfer.files) {
			return;
		}

		//prevent browser from navigating to dropped file
		e.preventDefault();

		//make sure editor has focus
		this.editor!.focus();

		Array.from(e.dataTransfer.files).forEach((file) => {
			if (file.type.match(/^image\//)) {
				this.handleImage(file);
			} else
			{
				this.fire("attach", this, file);
			}
		});
	}

	private static _uid = 0;

	/**
	 * Generate unique ID
	 */
	private static imgUID() {
		return "go-img-" + (++HtmlField._uid);
	}

	private handleImage(file:File) {
		let imgEl: HTMLImageElement;
		if (file.type.match(/^image\//)) {
			const objectURL = URL.createObjectURL(file), uid = HtmlField.imgUID();

			const img = `<img id="${uid}" src="${objectURL}" alt="${file.name}" />`;

			this.insertHtml(img);
			imgEl = document.getElementById(uid) as HTMLImageElement;
			imgEl.removeAttribute("id");

			this.fire("insertimage", this, file, imgEl);
		}
	}

	private onPaste (e:ClipboardEvent) {

		if(!e.clipboardData || !e.clipboardData.files) {
			return;
		}

		const files = Array.from(e.clipboardData.files as FileList) ;

		//Chrome /safari has clibBoardData.items
		files.forEach((file ) => {
			if (file.type.match(/^image\//)) {
				this.handleImage(file);
			} else
			{
				this.fire("attach", this, file);
			}
			e.preventDefault();


		});

	}
}