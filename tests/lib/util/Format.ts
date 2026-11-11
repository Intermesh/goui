import {expect} from "chai";
import {describe} from "mocha";
import {Format} from "../../../script/util/Format.js";

/**
 * Parses the HTML and checks that it only contains the elements and attributes the formatter may create
 */
function expectSafeHtml(html: string) {
	const div = document.createElement("div");
	div.innerHTML = html;
	div.querySelectorAll("*").forEach((el) => {
		expect(["A", "BR"]).to.include(el.tagName);
		for (const attr of Array.from(el.attributes)) {
			expect(["href", "target", "rel"]).to.include(attr.name);
			if (attr.name == "href") {
				expect(attr.value).to.match(/^(https?:\/\/|mailto:)/);
			}
		}
	});
	return div;
}

describe('Format class', () => {

	describe("htmlEncode", () => {
		it('Encodes quotes so values can be used in attributes', () => {
			expect(Format.htmlEncode(`<b a="1" b='2'>&</b>`)).to.equal("&lt;b a=&quot;1&quot; b=&#39;2&#39;&gt;&amp;&lt;/b&gt;");
			expect("\"'".htmlEncode()).to.equal("&quot;&#39;");
		});

		it('Handles empty values', () => {
			expect(Format.htmlEncode(undefined as any)).to.equal("");
			expect(Format.htmlEncode(null as any)).to.equal("");
			expect(Format.htmlEncode(1 as any)).to.equal("1");
		});
	});

	describe("textToHtml", () => {
		it('Creates links and line breaks', () => {
			const div = expectSafeHtml(Format.textToHtml("Visit https://example.com/?a=1&b=2\nor mail info@example.com"));
			const a = div.querySelectorAll("a");
			expect(a.length).to.equal(2);
			expect(a[0].getAttribute("href")).to.equal("https://example.com/?a=1&b=2");
			expect(a[1].getAttribute("href")).to.equal("mailto:info@example.com");
			expect(div.querySelectorAll("br").length).to.equal(1);
		});

		it('Does not turn placeholder markers into markup', () => {
			const div = expectSafeHtml(Format.textToHtml("_%O%_img src=x onerror=alert(1)_%C%_ http://a"));
			expect(div.textContent).to.contain("_%O%_img src=x onerror=alert(1)_%C%_");
		});

		it('Does not let an URL break out of the href attribute', () => {
			expectSafeHtml(Format.textToHtml(`https://x"onmouseover="alert(1)" x`));
			expectSafeHtml(Format.textToHtml(`https://x'onmouseover='alert(1)' x`));
		});

		it('Does not nest a mail link in an URL', () => {
			const div = expectSafeHtml(Format.textToHtml("https://x/a@b.com\""));
			expect(div.querySelectorAll("a").length).to.equal(1);
		});

		it('Ends an URL at a bracket or quote', () => {
			for (const text of ["<https://example.com>", '"https://example.com"', "'https://example.com'", "(<https://example.com>)"]) {
				const a = expectSafeHtml(Format.textToHtml(text)).querySelectorAll("a");
				expect(a.length).to.equal(1);
				expect(a[0].getAttribute("href")).to.equal("https://example.com");
			}
		});

		it('Encodes HTML', () => {
			const div = expectSafeHtml(Format.textToHtml("<img src=x onerror=alert(1)> info@example.com"));
			expect(div.textContent).to.contain("<img src=x onerror=alert(1)>");
		});
	});

	describe("convertUrisToAnchors", () => {
		it('Encodes the plain text it converts', () => {
			const div = expectSafeHtml(Format.convertUrisToAnchors("<img src=x onerror=alert(1)> http://a"));
			expect(div.querySelectorAll("a").length).to.equal(1);
			expect(div.textContent).to.equal("<img src=x onerror=alert(1)> http://a");
		});
	});
});
