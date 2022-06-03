// import {LanguageKeys} from "../locale/LanguageKeys";

export class Translate {
	private static lang: any;

	public static missing: any = {};

	public static async load(lang:string) {
		const mods = await import("../locale/" + lang + ".js");


		this.lang = mods.lang;
	}

	public static t(key:any | string) {
		if(Translate.lang && Translate.lang[key]) {
			return Translate.lang[key];
		} else
		{
			Translate.missing[key] = key;

			return key;
		}
	}
}

export const t = Translate.t;

