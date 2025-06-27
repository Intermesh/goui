/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

// noinspection JSDeprecatedSymbols

import {Field, FieldConfig, FieldEventMap} from "./Field.js";
import {tbar, Toolbar} from "../Toolbar.js";
import {btn, Button} from "../Button.js";
import {Listener, ObservableListenerOpts} from "../Observable.js";
import {browser} from "../../util/Browser.js";
import {colormenu, ColorMenu} from "../menu/ColorMenu.js";
import {Menu} from "../menu/Menu.js";
import {comp, Component, createComponent} from "../Component.js";
import {FunctionUtil} from "../../util/FunctionUtil.js";
import {MaterialIcon} from "../MaterialIcon.js";
import {Window} from "../Window.js";
import {t} from "../../Translate.js";
import {fieldset} from "./Fieldset";
import {textarea, TextAreaField} from "./TextareaField";
import {draggable} from "../DraggableComponent";
import {Format} from "../../util/index";


/**
 * @inheritDoc
 */
export interface HtmlFieldEventMap extends FieldEventMap {
	/**
	 * Fires before adding an item. Return false to abort.
	 *
	 * @param container
	 * @param item
	 * @param index
	 */
	updatetoolbar: {}

	/**
	 * Fires when an image is selected, pasted or dropped into the field
	 *
	 * @param htmlfield
	 * @param file
	 * @param img The img element in the editor
	 */
	insertimage: {file: File, img: HTMLImageElement}

	/**
	 * Fires when a non image is pasted or dropped into the field
	 *
	 * @param htmlfield
	 * @param file
	 * @param img
	 */
	attach: {file: File}
}


export interface HtmlField extends Field<HtmlFieldEventMap> {
	set value(v: string)
	get value(): string
}

interface CmdConfig {
	icon: MaterialIcon,
	applyFn?: (btn: Button) => void,
	updateFn?: (btn: Button) => void,
	title: string
	menu?: Menu
}

/**
 * Available toolbar items
 */
type ToolbarItems = "-" | "bold" | "italic" | "underline" | "strikeThrough" |
	"foreColor" | "backColor" | "removeFormat" |
	"justifyLeft" | "justifyCenter" | "justifyRight" |
	"insertOrderedList" |
	"insertUnorderedList" |
	"indent" |
	"outdent" |
	"image" |
	"createLink" |
	"sourceEdit"


/**
 * A HTML editor field component
 *
 * @see Form
 */
export class HtmlField extends Field<HtmlFieldEventMap> {
	protected baseCls = 'goui-form-field goui-html-field'

	/**
	 * When the field is empty this will be displayed inside the field
	 */
	public placeholder: string | undefined;

	/**
	 * Automatically detect URL input and change them into anchor tags
	 */
	public autoLink = true;

	private editor: HTMLDivElement | undefined;

	private tbar?: Toolbar;
	private imageResizer: ImageResizer;

	constructor() {
		super("div");
		this.value = "";

		document.execCommand("useCSS", false, "true");
		document.execCommand("styleWithCSS", false, "false");
		document.execCommand("AutoUrlDetect", false, "true");

		this.imageResizer = new ImageResizer(this);
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

	/**
	 * Toolbar items to enable.
	 *
	 * If you can't use inline css then use:
	 *
	 * ```
	 * [
	 * 		"bold", "italic", "underline",
	 * 		"-",
	 * 		"foreColor", "removeFormat",
	 * 		"-",
	 * 		"insertOrderedList",
	 * 		"insertUnorderedList",
	 * 		"-",
	 * 		"indent",
	 * 		"outdent",
	 * 		"-",
	 * 		"image"
	 * 	]
	 * ```
	 */
	public toolbarItems: ToolbarItems[] = [
		"bold", "italic", "underline", "strikeThrough",
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
		"image",
		"createLink",
		"-",
		"sourceEdit"

	];

	private commands: Record<string, CmdConfig> = {
		bold: {icon: 'format_bold', title: "Bold"},
		italic: {icon: 'format_italic', title: "Italic"},
		underline: {icon: 'format_underlined', title: "Underline"},
		strikeThrough: {icon: 'format_strikethrough', title: "Strikethrough"},
		foreColor: {
			title: "Text color",
			icon: 'format_color_text',
			menu: colormenu({
				updateButton: false,
				listeners: {
					select: ( {color}) => {
						this.execCmd("foreColor", color || "#000000")
					},
					beforeshow: ({target}) => {
						target.value = (this.tbar!.findChild("foreColor")!.el.style.color || "");
					}
				}
			}),
			applyFn: () => {
			},
			updateFn: (btn) => {
				const s = document.getSelection();

				if (!s || !s.anchorNode) {
					btn.el.style.color = "";
					return;
				}
				let el: Node | HTMLElement | null = s.anchorNode;

				while (!(el instanceof HTMLElement) && el != null) {
					el = el.parentElement;
				}

				if (!el) {
					btn.el.style.color = "";
					return;
				}
				// let color = s ? this.closestStyle(<HTMLElement>s.anchorNode!, "color") : undefined;
				const closest = el.closest("[color]");

				if (!closest) {
					btn.el.style.color = "";
					return;
				}

				btn.el.style.color = closest.getAttribute("color") + "";

			}
		},
		backColor: {
			icon: 'format_color_fill',
			title: "Background color",
			menu: colormenu({
				updateButton: false,
				listeners: {
					select: ( {color}) => {
						this.execCmd("backColor", color || "#ffffff")
					},
					beforeshow: ({target}) => {
						target.value = (this.tbar!.findChild("backColor")!.el.style.color || "");
					}
				}
			}),
			applyFn: () => {
			},
			updateFn: (btn) => {
				const s = document.getSelection();
				let bgcolor = s ? this.closestStyle(<HTMLElement>s.anchorNode!, "backgroundColor") : undefined;

				btn.el.style.backgroundColor = bgcolor || "";

			}
		},
		justifyLeft: {icon: 'format_align_left', title: "Align left"},
		justifyCenter: {icon: 'format_align_center', title: "Align center"},
		justifyRight: {icon: 'format_align_right', title: "Align right"},
		insertOrderedList: {icon: 'format_list_numbered', title: "Numbered list"},
		insertUnorderedList: {icon: 'format_list_bulleted', title: "Bullet list"},
		indent: {icon: 'format_indent_increase', title: "Indent"},
		outdent: {icon: 'format_indent_decrease', title: "Outdent"},

		sourceEdit: {
			icon: "code",
			title: t("Edit source"),
			applyFn: () => {
				const w = new SourceEditWindow(this);
				w.show();
			}
		},
		createLink: {
			icon: "link",
			title: "Create link",
			applyFn: () => {
				const url = prompt(t("Enter URL"), "https://");
				if(url)
					this.execCmd("createLink", url);
			}
		},
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
						this.editor!.focus();
						return;
					}
					Array.from(inp.files).forEach((file) => {
						this.handleImage(file);
					});
				}

				window.addEventListener("focus", () => {
					// this puts focus back on editor if cancel was clicked when uploading files
					this.editor!.focus();
				}, {once: true});

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
				config.updateFn.call(this, <Button>t.findChild(cmd)!);
			} else {
				t.findChild(cmd)!.el.classList.toggle("pressed", document.queryCommandState(cmd));
			}
		}

		this.fire("updatetoolbar", {});
	}

	private execCmd(cmd: string, value?: any) {
		document.execCommand(cmd, false, value);

		const t = this.tbar!, config = this.commands[cmd];
		if (config) {
			if (config.updateFn) {
				config.updateFn.call(this, <Button>t.findChild(cmd)!);
			} else {
				t.findChild(cmd)!.el.classList.toggle("pressed", document.queryCommandState(cmd));
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
			cls: "frame html-field-toolbar",
			overflowMenu: true,
			overflowMenuBtnConfig: {tabIndex: -1}
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
					tabIndex: -1, // We don't want to tab through all tb buttons. Needed for Safari as well, otherwise the blur event doesn't have this button as relatedTarget.
												// See in this.editor.addEventListener("blur", below
					handler: (btn) => {
						if (!config.applyFn) {
							this.execCmd(btn.itemId + "");
						} else {
							config.applyFn.call(this, btn);
						}
					}
				}));
			}
		}

		return this.tbar;
	}

	protected createControl(): undefined | HTMLElement {


		const el = this.el;



		//grab value before creating this.editor otherwise it will return the input value
		const v = this.value;

		this.editor = document.createElement("div");
		this.editor.contentEditable = "true";
		this.editor.classList.add("editor");
		this.editor.classList.add("text");

		if (this.placeholder) {
			this.editor.dataset.placeholder = this.placeholder;
		}

		if (v) {
			this.editor.innerHTML = v;
			// Image.replaceImages(this.editor);
		}

		el.appendChild(this.editor);



		return this.editor;
	}

	protected internalRender(): HTMLElement {
		this.getToolbar().render(this.wrap);
		const el = super.internalRender();


		el.addEventListener("click", () => {
			this.editor!.focus();
		});

		//buffer a bit for performance
		const selectionChangeFn = FunctionUtil.buffer(300, () => this.updateToolbar());

		this.editor!.addEventListener("focus", () => {
			document.addEventListener("selectionchange", selectionChangeFn);
		});

		this.editor!.addEventListener("blur", (e) => {
			document.removeEventListener("selectionchange", selectionChangeFn);
			if (!(e.relatedTarget instanceof HTMLElement) || !this.getToolbar().el.contains(e.relatedTarget)) {

			} else {
				this.editor!.focus();
			}
		});

		this.editor!.addEventListener("keydown", (ev) => {
			this.onKeyDown(ev);
		});

		if(this.autoLink) {
			const bufferedKeyUp = FunctionUtil.buffer(500, (ev) => {
				this.onKeyUp(ev);
			});

			this.editor!.addEventListener("keyup", bufferedKeyUp);
		}

		this.editor!.addEventListener("drop", ev => {
			this.onDrop(ev);
		});

		this.editor!.addEventListener("dragover", ev => {
			// Prevent default behavior (Prevent file from being opened)
			ev.preventDefault();
		});

		this.editor!.addEventListener('paste', ev => {
			this.onPaste(ev);
		});

		return el;
	}

	protected internalSetValue(v?: any) {
		if (this.editor) {
			this.editor.innerHTML = v;
		}
	}

	protected internalGetValue(): string | number | boolean | any[] | Record<string, any> | undefined {

		if (!this.editor) {
			return this._value as string;
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

		clone.setStart(range.startContainer, range.startOffset - count);
		clone.setEnd(range.startContainer, range.startOffset);
		clone.deleteContents();
	}


	private onKeyDown(ev: KeyboardEvent) {

		this.clearInvalid();

		//track first 3 chars of sentence for auto lists below
		if (ev.key == "Enter") {
			this.lineIndex = 0;
			this.lineSequence = "";

		} else if (this.lineIndex < 5) {

			if(ev.key == "Backspace") {
				if (this.lineIndex > 0) {
					this.lineIndex--;
					this.lineSequence = this.lineSequence.substring(0, this.lineSequence.length - 1);
				}
			} else if(ev.key.length == 1) {
				this.lineIndex++;
				this.lineSequence += ev.key;
			} else if(ev.key == "Tab") {
				// for auto list code below 1. becomes list
				this.lineIndex++;
				this.lineSequence += " ";
			}
		}

		if (
			browser.isWebkit() && ev.shiftKey && ev.key == "Enter" &&
			(document.queryCommandState('insertorderedlist') || document.queryCommandState('insertunorderedlist'))
		) {
			ev.stopPropagation();
			//Firefox wants two??
			this.execCmd('InsertHtml', browser.isFirefox() ? '<br />' : '<br /><br />');
			this.focus();
		} if (ev.key == " " || ev.key == "Tab") {

			// Auto lists
			if (this.lineSequence == "1. ") {
				HtmlField.removeCharsFromCursorPos(2);
				this.execCmd("insertOrderedList");

				this.lineIndex = 0;
				this.lineSequence = "";

				ev.preventDefault();
			} else if (this.lineSequence == "- ") {
				HtmlField.removeCharsFromCursorPos(1);
				this.execCmd("insertUnorderedList");

				this.lineIndex = 0;
				this.lineSequence = "";
				ev.preventDefault();
			} else if(ev.key == "Tab") {
				ev.preventDefault();
				if (document.queryCommandState('insertorderedlist') || document.queryCommandState('insertunorderedlist')) {
					this.execCmd(ev.shiftKey ? 'outdent' : 'indent');
				} else {
					this.execCmd('InsertText', '\t');
				}
				this.focus();
			}

		} else if (browser.isMac()) {

			if (ev.ctrlKey || ev.metaKey) {
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
				this.fire("attach", {file});
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
			imgEl.addEventListener("load", () => {

				const width = imgEl.offsetWidth, height = imgEl.offsetHeight;
				imgEl.setAttribute('style', `max-width: 100%;height:auto;aspect-ratio: ${width} / ${height};`);
			})

			this.fire("insertimage", {file, img: imgEl});
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
				this.fire("attach", {file});
			}
			e.preventDefault();


		});

	}

	private onKeyUp(ev: KeyboardEvent) {

		if(ev.key != "Enter" && ev.key != " " && ev.key != "Tab") {
			return;
		}

		const caretIndex = this.getCaretPosition();
		const v = this.value;
		const anchored = Format.convertUrisToAnchors(v);

		if(anchored == v) {
			return;
		}

		this.value = anchored;

		this.setCaretPosition(caretIndex);
	}


	private getCaretPosition(): number {
		let caretOffset = 0;
		const selection = window.getSelection();
		if (selection && selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			const preCaretRange = range.cloneRange();
			preCaretRange.selectNodeContents(this.editor!);
			preCaretRange.setEnd(range.endContainer, range.endOffset);
			caretOffset = preCaretRange.toString().length;
		}
		return caretOffset;
	}


	private setCaretPosition( offset: number): void {
		const element = this.editor!;
		element.focus();
		const selection = window.getSelection();
		if (!selection) return;

		// Helper to recursively find the node and offset
		function setRange(node: Node, chars: { count: number }): boolean {
			if (node.nodeType === Node.TEXT_NODE) {
				if (node.textContent) {
					if (chars.count <= node.textContent.length) {
						const range = document.createRange();
						range.setStart(node, chars.count);
						range.collapse(true);
						selection!.removeAllRanges();
						selection!.addRange(range);
						return true;
					} else {
						chars.count -= node.textContent.length;
					}
				}
			} else {
				for (let i = 0; i < node.childNodes.length; i++) {
					if (setRange(node.childNodes[i], chars)) {
						return true;
					}
				}
			}
			return false;
		}

		setRange(element, { count: offset });
	}

}


class SourceEditWindow extends Window {
	private textArea: TextAreaField;
	constructor(private field:HtmlField) {
		super();

		this.title = t("Source edit");
		this.modal = true;

		this.width = 1000;
		this.height = 800;

		this.items.add(fieldset({flex: 1, cls: "vbox"},

			this.textArea = textarea({
				flex: 1,
				name: "source",
				value: field.value
			}),

			tbar({},
				"->",
				btn({
					text: t("Save"),
					cls: "filled primary",
					handler: () => {
						this.field.value = this.textArea.value + "";
						this.close();
					}
				})
				)

			))
	}
}


class ImageResizer {
	private wrapper?: HTMLDivElement;
	private img?:HTMLImageElement
	constructor(private field:HtmlField) {
		field.el.addEventListener("mousedown", ev => this.onMouseDown(ev as MouseEvent & {target:HTMLElement}));
		field.el.addEventListener("keydown", ev => this.onKeyDown(ev));
	}

	private onMouseDown(ev:MouseEvent & {target:HTMLElement}) {
		if (ev.target && ev.target.tagName === 'IMG' && !ev.target.closest('.img-wrapper')) {
			ev.preventDefault();

			this.img = ev.target as HTMLImageElement;
			this.wrap()
			return;
		}

		const closestWrapper = ev.target.closest('.img-wrapper');
		if (!closestWrapper) {
			this.unwrap();
		}
	}

	private wrap() {
		if(!this.img) {
			return;
		}
		if(!this.wrapper) {
			this.wrapper = document.createElement("div");
			this.wrapper.classList.add("img-wrapper");

			let startWidth = 0, startHeight = 0;

			['left', 'right', 'top', 'bottom'].forEach((pos) => {
				draggable({
					cls: "resizer " + pos,
					setPosition: false,
					listeners: {
						dragstart: () => {
							startWidth = this.wrapper!.offsetWidth;
							startHeight = this.wrapper!.offsetHeight;
						},
						drag: ({dragData}) => {

							if(pos == "left" || pos == "right") {
								let deltaX = dragData.x - dragData.startX;
								if (pos == "left") {
									deltaX = 0 - deltaX;
								}
								const newWidth = Math.max(50, startWidth + deltaX),
									newHeight = Math.floor(newWidth * startHeight / startWidth);
								this.img!.style.width = newWidth + "px";
								this.img!.style.height = newHeight + "px";
							} else {
								let deltaY = dragData.y - dragData.startY;
								if (pos == "top") {
									deltaY = 0 - deltaY;
								}
								const newHeight = Math.max(50, startHeight + deltaY),
									newWidth = Math.floor(newHeight * startWidth / startHeight);
								this.img!.style.width = newWidth + "px";
								this.img!.style.height = newHeight + "px";
							}
						}
					}
				}).render(this.wrapper);
			})
		}

		if(!this.img.parentElement) {
			return;
		}
		this.img.parentElement.insertBefore(this.wrapper, this.img);
		this.wrapper.appendChild(this.img);
	}

	private unwrap() {
		if(!this.wrapper || !this.wrapper.parentElement) {
			return;
		}
		this.wrapper.parentElement.insertBefore(this.img!, this.wrapper);
		this.wrapper.remove();
	}

	private onKeyDown(ev: KeyboardEvent) {
		if(ev.key == "Delete" || ev.key == "Backspace") {
			if(this.img && this.wrapper?.parentElement) {
				this.unwrap();
				this.img!.remove();
				ev.preventDefault();
				return;
			}
		}
		this.unwrap();
	}
}



/**
 * Shorthand function to create {@link HtmlField}
 *
 * @param config
 */
export const htmlfield = (config?: FieldConfig<HtmlField>) => createComponent(new HtmlField(), config);