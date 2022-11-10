class Browser {
	readonly ua:string;

	private cache: Record<string, boolean> = {};


	constructor() {
		this.ua = navigator.userAgent.toLowerCase();
	}

	private check(r:RegExp, cacheKey:string){
		if(!this.cache[cacheKey]){
			this.cache[cacheKey] = r.test(this.ua);
		}
		return this.cache[cacheKey];
	}

	isWebkit() {
		return this.check(/webkit/, 'isWebkit');
	}

	isChrome() {
		return this.check(/\bchrome\b/, 'isChrome');
	}

	isSafari() {
		return !this.isChrome() && this.check(/safari/, 'isSafari');
	}

	isFirefox() {

		return this.check(/gecko/, 'isFirefox');
	}

	isMac() {
		return this.check(/macintosh|mac os x/, 'isMac');
	}

	isLinux() {
		return this.check(/linux/, 'isLinux');
	}

	isWindows() {
		return this.check(/windows|win32/, 'isWindows');
	}

	/**
	 * Open file upload dialog
	 *
	 * @param accept eg. "image/*"
	 * @param directory Allow directory upload
	 * @param multiple Allow multiple files
	 */
	public pickLocalFiles(multiple = false, directory = false, accept:string|undefined = undefined) : Promise<File[]> {

		return new Promise((resolve, reject) => {
			const input = document.createElement("input");
			input.style.display = "none";
			input.setAttribute("type", "file");
			input.addEventListener("change", (e) => {
				if(input.files) {
					resolve(Array.from(input.files));
				}
				input.value = "";
			});

			// must be added to the DOM for iOS!
			document.body.appendChild(input);

			if(accept) {
				input.setAttribute('accept', accept);
			}

			if(directory) {
				input.setAttribute('webkitdirectory', "true");
				input.setAttribute('directory', "true");
			}
			if(multiple) {
				input.setAttribute('multiple', "true");
			}

			input.click();
			input.remove();
		});

	}
}

export const browser = new Browser();