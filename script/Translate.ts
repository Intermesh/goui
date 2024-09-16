/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {ObjectUtil} from "./util/index.js";

// import {LanguageKeys} from "../locale/LanguageKeys";



type lang = { [key: string]: { [key: string]: { [key: string]: string } } };

export class Translate {
	private lang: lang = {};
	public missing: any = {};
	private defaultPkg = "core";
	private defaultModule = "core";

	public setDefaultModule(pkg: string, module: string) {
		this.defaultModule = module;
		this.defaultPkg = pkg;
	}

	public load(lang: lang, pkg = "core", module = "core") {

		if (!this.lang[pkg]) {
			this.lang[pkg] = {};
		}

		if (!this.lang[pkg][module]) {
			this.lang[pkg][module] = {};
		}

		ObjectUtil.merge(this.lang[pkg][module], lang);

		this.setDefaultModule(pkg, module);
	}

	/**
	 * Translate a string
	 *
	 * @param key Translate key. Usually the english text.
	 * @param pkg The module package
	 * @param module The module name
	 */
	public static t(key: string, pkg?: string, module?: string): any {


		if (!pkg) {
			pkg = translate.defaultPkg;
		}

		if (!module) {
			module = translate.defaultModule;
		}

		if (translate.lang?.[pkg]?.[module]?.[key]) {
			return translate.lang[pkg][module][key];
		} else if (pkg == "core" && module == "core") {
			if (!translate.missing[pkg]) {
				translate.missing[pkg] = {};
			}

			if (!translate.missing[pkg][module]) {
				translate.missing[pkg][module] = {};
			}

			translate.missing[pkg][module][key] = key;

			return key;
		} else {
			return t(key, "core", "core");
		}
	}
}

export const translate = new Translate();

export const t = Translate.t;

