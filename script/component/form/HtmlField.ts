// noinspection JSDeprecatedSymbols

import {Field, FieldEventMap} from "./Field.js";
import {tbar, Toolbar} from "../Toolbar.js";
import {btn, Button} from "../Button.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "../Observable.js";
import {browserDetect} from "../../util/BrowserDetect.js";
import {colormenu, ColorMenu} from "../menu/ColorMenu.js";
import {Menu} from "../menu/Menu.js";
import {comp, Component, Config} from "../Component.js";
import {FunctionUtil} from "../../util/FunctionUtil.js";
import {root} from "../Root.js";
import {MaterialIcon} from "../MaterialIcon.js";
import {CheckboxField} from "./CheckboxField.js";
import {Image} from "../../api/Image.js";


/**
 * @inheritDoc
 */
export interface HtmlFieldEventMap<Sender extends Observable> extends FieldEventMap<Sender> {
	/**
	 * Fires before adding an item. Return false to abort.
	 *
	 * @param container
	 * @param item
	 * @param index
	 */
	updatetoolbar: <T extends Sender>(htmlfield: T) => void

	/**
	 * Fires when an image is selected, pasted or dropped into the field
	 *
	 * @param htmlfield
	 * @param file
	 * @param img The img element in the editor
	 */
	insertimage: <T extends Sender> (htmlfield: T, file: File, img: HTMLImageElement) => void

	/**
	 * Fires when a non image is pasted or dropped into the field
	 *
	 * @param htmlfield
	 * @param file
	 * @param img
	 */
	attach: <T extends Sender> (htmlfield: T, file: File) => void
}


export interface HtmlField extends Field {
	on<K extends keyof HtmlFieldEventMap<HtmlField>>(eventName: K, listener: Partial<HtmlFieldEventMap<HtmlField>>[K], options?: ObservableListenerOpts): void

	fire<K extends keyof HtmlFieldEventMap<HtmlField>>(eventName: K, ...args: Parameters<HtmlFieldEventMap<HtmlField>[K]>): boolean

	set listeners(listeners: ObservableListener<HtmlFieldEventMap<this>>)
}

interface CmdConfig {
	icon: MaterialIcon,
	applyFn?: (btn: Button) => void,
	updateFn?: (btn: Button) => void,
	title: string
	menu?: Menu
}

document.execCommand("styleWithCSS", false, "true");

/**
 * A HTML editor field component
 *
 * @see Form
 */
export class HtmlField extends Field {
	protected baseCls = 'form-field html-field'

	/**
	 * When the field is empty this will be dispklayed inside the field
	 */
	public placeholder: string | undefined;

	private editor: HTMLDivElement | undefined;

	private valueOnFocus: string | undefined;

	private tbar?: Toolbar;

	constructor() {
		super("div");
		this.value = "";
	}

	// noinspection JSUnusedGlobalSymbols
	public getEditor() {
		if (!this.editor) {
			throw new Error("Render first");
		}
		return this.editor;
	}


	private closestStyle(el: HTMLElement, styleProp: keyof CSSStyleDeclaration) {
		while ((el = el.parentElement!)) {
			if (el == this.editor) return undefined;

			if (el.style[styleProp]) {
				return <string>el.style[styleProp];
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

	private commands: Record<string, CmdConfig> = {
		bold: {icon: 'format_bold', title: "Bold"},
		italic: {icon: 'format_italic', title: "Italic"},
		underline: {icon: 'format_underlined', title: "Underline"},
		strikeThrough: {icon: 'format_strikethrough', title: "Strikethrough"},
		foreColor: {
			title: "Text color",
			icon: 'format_color_text',
			menu: colormenu({
				listeners: {
					select: (menu, color) => {
						this.execCmd("foreColor", color || "#000000")
					},
					beforeshow: (menu) => {
						(<ColorMenu>menu).value = (this.tbar!.findItem("foreColor")!.el.style.color || "");
					}
				}
			}),
			applyFn: () => {
			},
			updateFn: (btn) => {
				const s = document.getSelection();
				let color = s ? this.closestStyle(<HTMLElement>s.anchorNode!, "color") : undefined;
				btn.el.style.color = color || "";

			}
		},
		backColor: {
			icon: 'format_color_fill',
			title: "Background color",
			menu: colormenu({
				listeners: {
					select: (menu, color) => {
						this.execCmd("backColor", color || "#ffffff")
					},
					beforeshow: (menu) => {
						(<ColorMenu>menu).value = (this.tbar!.findItem("backColor")!.el.style.color || "");
					}
				}
			}),
			applyFn: () => {
			},
			updateFn: (btn) => {
				const s = document.getSelection();
				let bgcolor = s ? this.closestStyle(<HTMLElement>s.anchorNode!, "backgroundColor") : undefined;
				btn.el.style.color = bgcolor || "";

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
				inp.onchange = () => {
					if (!inp.files) {
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

	private updateToolbar() {

		const t = this.tbar!;

		for (const cmd of this.toolbarItems) {
			if (cmd == "-") continue;

			const config = this.commands[cmd];

			if (config.updateFn) {
				config.updateFn.call(this, <Button>t.findItem(cmd)!);
			} else {
				t.findItem(cmd)!.el.classList.toggle("pressed", document.queryCommandState(cmd));
			}
		}

		this.fire("updatetoolbar", this);
	}

	private execCmd(cmd: string, value?: string) {
		document.execCommand(cmd, false, value);

		const t = this.tbar!, config = this.commands[cmd];
		if (config) {
			if (config.updateFn) {
				config.updateFn.call(this, <Button>t.findItem(cmd)!);
			} else {
				t.findItem(cmd)!.el.classList.toggle("pressed", document.queryCommandState(cmd));
			}
		}

		this.editor!.focus();
	}

	/**
	 * Inserts an HTML string at the insertion point (deletes selection). Requires a valid HTML string as a value argument.
	 *
	 * @param html
	 */
	public insertHtml(html: string) {
		document.execCommand("insertHTML", false, html);
	}

	// noinspection JSUnusedGlobalSymbols
	protected internalRemove() {
		if (this.tbar) {
			this.tbar.remove();
		}
		super.internalRemove();
	}

	protected getToolbar() {

		if (this.tbar) {
			return this.tbar;
		}

		this.tbar = tbar({
			cls: "frame html-field-toolbar"
		});

		for (const cmd of this.toolbarItems) {
			if (cmd == "-") {
				this.tbar.items.add(comp({tagName: "hr"}));
			} else {

				const config = this.commands[cmd];

				this.tbar.items.add(btn({
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

		root.items.add(this.tbar);

		return this.tbar;
	}

	protected showToolbar() {
		const rect = this.el.getBoundingClientRect();

		//must be rendered before we can calc height
		this.getToolbar().show();
		const h = this.getToolbar().height;
		const style = this.getToolbar().el.style;

		const maxX = window.innerWidth - this.getToolbar().width;
		style.left = Math.min(maxX, rect.x + window.scrollX) + "px";
		style.top = (window.scrollY + rect.top - h) + "px";
	}

	protected hideToolbar() {
		this.getToolbar().hide();
	}


	protected createControl(): undefined | HTMLElement {

		const el = this.el;

		el.addEventListener("click", () => {
			this.editor!.focus();
		});

		//grab value before creating this.editor otherwise it will return the input value
		const v = this.value;

		this.editor = document.createElement("div");
		this.editor.contentEditable = "true";
		this.editor.classList.add("editor");
		this.editor.classList.add("text");

		if (this.placeholder) {
			this.editor.dataset.placeholder = this.placeholder;
		}

		if(v) {
			this.editor.innerHTML = v;
			Image.replaceImages(this.editor);
		}

		el.appendChild(this.editor);

		//buffer a bit for performance
		const selectionChangeFn = FunctionUtil.buffer(300, () => this.updateToolbar());

		this.editor.addEventListener("focus", () => {
			this.valueOnFocus = this.value;
			document.addEventListener("selectionchange", selectionChangeFn);

			this.showToolbar();
		});

		this.editor.addEventListener("blur", (e) => {
			if (this.valueOnFocus != this.value) {
				this.fireChange();
			}
			document.removeEventListener("selectionchange", selectionChangeFn);
			if (!(e.relatedTarget instanceof HTMLElement) || !this.getToolbar().el.contains(e.relatedTarget)) {
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

	set value(v: string) {

		if (this.editor) {
			this.editor.innerHTML = v;
			Image.replaceImages(this.editor);
		}

		super.value = v;
	}

	get value() {
		if (!this.editor) {
			return super.value;
		} else {
			return this.editor.innerHTML;
		}
	}

	public focus(o?: FocusOptions) {
		this.editor!.focus(o);
	}

	private lineIndex = 0;
	private lineSequence = "";

	private static removeCharsFromCursorPos(count: number) {
		const sel = window.getSelection();
		const range = sel!.getRangeAt(0);
		const clone = range.cloneRange();
		clone.setStart(range.startContainer, range.startOffset);
		clone.setEnd(range.startContainer, range.startOffset + count);
		clone.deleteContents();
	}


	private onKeyDown(ev: KeyboardEvent) {

		this.clearInvalid();

		//track first 3 chars of sentence for auto lists below
		if (ev.key == "Enter") {
			this.lineIndex = 0;
			this.lineSequence = "";
		} else if (this.lineIndex < 3) {
			this.lineIndex++;
			this.lineSequence += ev.key;
		}

		if (
			browserDetect.isWebkit() && ev.shiftKey && ev.key == "Enter" &&
			(document.queryCommandState('insertorderedlist') || document.queryCommandState('insertunorderedlist'))
		) {
			ev.stopPropagation();
			//Firefox wants two??
			this.execCmd('InsertHtml', browserDetect.isFirefox() ? '<br />' : '<br /><br />');
			this.focus();
		} else if (ev.key == "Tab") {
			ev.preventDefault();
			if (document.queryCommandState('insertorderedlist') || document.queryCommandState('insertunorderedlist')) {
				this.execCmd(ev.shiftKey ? 'outdent' : 'indent');
			} else {
				this.execCmd('InsertText', '\t');
			}
			this.focus();
		} else if (ev.key == "Space") {

			// Auto lists
			if (this.lineSequence == "1. ") {
				this.execCmd("insertOrderedList");
				HtmlField.removeCharsFromCursorPos(2);
				ev.preventDefault();
			} else if (this.lineSequence == "- ") {
				this.execCmd("insertUnorderedList");
				HtmlField.removeCharsFromCursorPos(1);
				ev.preventDefault();
			}

		} else if (browserDetect.isMac()) {

			if (ev.ctrlKey) {
				let cmd;
				switch (ev.key) {
					case "b":
						cmd = 'bold';
						break;
					case "i":
						cmd = 'italic';
						break;
					case  "u":
						cmd = 'underline';
						break;
				}
				if (cmd) {
					// this.focus();
					this.execCmd(cmd);
					// this.focus();
					ev.preventDefault();
				}
			}
		}
	}

	private onDrop(e: DragEvent) {
		if (!e.dataTransfer || !e.dataTransfer.files) {
			return;
		}

		//prevent browser from navigating to dropped file
		e.preventDefault();

		//make sure editor has focus
		this.editor!.focus();

		Array.from(e.dataTransfer.files).forEach((file) => {
			if (file.type.match(/^image\//)) {
				this.handleImage(file);
			} else {
				this.fire("attach", this, file);
			}
		});
	}

	private static _uid = 0;

	/**
	 * Generate unique ID
	 */
	private static imgUID() {
		return "img-" + (++HtmlField._uid);
	}

	private handleImage(file: File) {
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

	private onPaste(e: ClipboardEvent) {

		if (!e.clipboardData || !e.clipboardData.files) {
			return;
		}

		const files = Array.from(e.clipboardData.files as FileList);

		//Chrome /safari has clibBoardData.commands
		files.forEach((file) => {
			if (file.type.match(/^image\//)) {
				this.handleImage(file);
			} else {
				this.fire("attach", this, file);
			}
			e.preventDefault();


		});

	}
}


/**
 * Shorthand function to create {@see HtmlField}
 *
 * @param config
 */
export const htmlfield = (config?: Config<HtmlField>) => Object.assign(new HtmlField(), config);