/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

export class QuoteStripper {

	private bodyWithoutQuote?: string
	private quote?: string
	private lines?: string[]
	private quoteIndex?: number

	constructor(readonly body: string) {
	}

	public getBodyWithoutQuote() {
		if (this.quote === undefined) {
			this.split();
		}

		return this.bodyWithoutQuote!;
	}

	public getQuote() {
		if (this.quote === undefined) {
			this.split();
		}

		return this.quote!;
	}

	private split() {
		let quoteIndex = this.findByBlockQuote();

		if (quoteIndex < 1) {
			quoteIndex = this.findQuoteByHeaderBlock();
		}

		if (quoteIndex > 0) {
			this.bodyWithoutQuote = this.body.substring(0, quoteIndex);
			this.quote = this.body.substring(quoteIndex);
		} else {
			this.bodyWithoutQuote = this.body;
			this.quote = "";
		}
	}


	private findByBlockQuote() {
		this.quoteIndex = this.body.indexOf("<blockquote");

		return this.quoteIndex;
	};

	private splitLines() {
		if (!this.lines) {
			const br = '|BR|';

			const html = this.body
				.replace(/<\/(p|div|ul|ol|table|dl)>/ig, "$&" + br)
				.replace(/<br[^>]*>/ig, "$&" + br);

			this.lines = html.split(br);
		}
		return this.lines;
	}


	/**
	 * eg
	 *
	 * Van: Merijn Schering [mailto:mschering@intermesh.nl]
	  Verzonden: donderdag 20 november 2014 16:40
	  Aan: Someone
	  Onderwerp: Subject
	 *
	 * @return int|boolean
	 */
	private findQuoteByHeaderBlock() {

		const lines = this.splitLines();

		const greaterThan = /^&gt;(\s|&nbsp;)/;
		const header = /^[a-z]+:(\s|&nbsp;)+.*&lt;[a-z0-9._\-+&]+@[a-z0-9.\-_]+&gt;/i;

		const maybeHeader = /^[a-z]+:(\s|&nbsp;)+.*/i;

		let pos = 0, maybePos = 0;

		for (let i = 0, c = lines.length; i < c; i++) {
			const plain = lines[i].replace(/(<([^>]+)>)/ig, ""); //strip html tags

			if(plain.match(maybeHeader)) {
				if(!maybePos) {
					maybePos = pos;
				}
			} else {
				maybePos = 0;
			}

			//Match:
			//ABC: email@domain.com
			if (plain.match(header)) {
				return maybePos || pos;
			}

			if (plain.match(greaterThan)) {
				return pos;
			}

			pos += lines[i].length;
		}
		return -1;
	}
}