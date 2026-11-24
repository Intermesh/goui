import {expect} from "chai";
import {describe} from "mocha";
import "../../../script/util/String.js";

describe("String", () => {
	describe("stripTags", () => {

		it("Returns the text of HTML", () => {
			expect("<p>Hello <b>world</b></p>".stripTags()).to.equal("Hello world");
			expect("<table><tr><td>1</td><td>2</td></tr></table>".stripTags()).to.equal("12");
		});

		it("Decodes entities", () => {
			expect("a &lt; b &amp; c".stripTags()).to.equal("a < b & c");
		});

		it("Keeps plain text", () => {
			expect("Just text".stripTags()).to.equal("Just text");
			expect("".stripTags()).to.equal("");
		});

		it("Doesn't return elements of untrusted HTML", () => {
			const text = '<img src="x" onerror="alert(1)">text'.stripTags();
			expect(text).to.equal("text");
		});
	});
});
