// import {LanguageKeys} from "../locale/LanguageKeys";

type lang = {[key: string]: string}

export class Translate {
	private static lang: lang;

	public static missing: any = {};

	public static load(lang:lang) {
		this.lang = lang;
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

