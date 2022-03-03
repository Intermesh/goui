class BrowserDetect {
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
}

export const browserDetect = new BrowserDetect();