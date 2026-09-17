import {expect} from "chai";
import {describe} from "mocha";
import {ObjectUtil} from "../../../script/index.js";


describe('ObjectUtil class', () => {

	describe('explodePointer', () => {

		it('Should decode escaped slash and tilde tokens', () => {
			expect(ObjectUtil.explodePointer("a~1b/c~0d")).to.deep.equal(["a/b", "c~d"]);
		});

		it('Should decode repeated escapes within a token', () => {
			expect(ObjectUtil.explodePointer("a~1b~1c/d~0e~0f")).to.deep.equal(["a/b/c", "d~e~f"]);
		});

		it('Should decode ~01 to literal ~1', () => {
			expect(ObjectUtil.explodePointer("~01")).to.deep.equal(["~1"]);
		});

		it('Should ignore the implicit leading slash', () => {
			expect(ObjectUtil.explodePointer("/foo/bar")).to.deep.equal(["foo", "bar"]);
		});
	});

	describe('get', () => {

		it('Should read a property with an escaped key', () => {
			const obj = {"a/b": {"c~d": 1}};
			expect(ObjectUtil.get(obj, "a~1b/c~0d")).to.equal(1);
		});
	});

	describe('patch', () => {

		it('Should patch a property with an escaped key', () => {
			const doc = {"a/b": {"c~d": 1, other: 2}};
			const result = ObjectUtil.patch(doc, {"a~1b/c~0d": 3});
			expect(result).to.deep.equal({"a/b": {"c~d": 3, other: 2}});
		});

		it('Should still patch and delete plain nested keys', () => {
			const doc: any = {foo: {bar: 1, baz: 2}};
			ObjectUtil.patch(doc, {"foo/bar": 5, "foo/baz": null});
			expect(doc).to.deep.equal({foo: {bar: 5}});
		});

		it('Should create a map when patching into a null property', () => {
			const doc: any = {foo: null};
			ObjectUtil.patch(doc, {"foo/bar": 1});
			expect(doc).to.deep.equal({foo: {bar: 1}});
		});
	});

	describe('prototype pollution', () => {

		let originalWarn: typeof console.warn;
		let warnings: number;

		beforeEach(() => {
			warnings = 0;
			originalWarn = console.warn;
			console.warn = () => { warnings++; };
		});

		afterEach(() => {
			console.warn = originalWarn;
			delete (Object.prototype as any).polluted;
		});

		it('Should not merge a JSON __proto__ key into the prototype', () => {
			const dest: any = {};
			ObjectUtil.merge(dest, JSON.parse('{"__proto__": {"polluted": true}}'));

			expect(({} as any).polluted).to.be.undefined;
			expect(dest.polluted).to.be.undefined;
			expect(Object.getPrototypeOf(dest)).to.equal(Object.prototype);
		});

		it('Should not merge constructor or prototype keys', () => {
			const dest: any = {};
			ObjectUtil.merge(dest, JSON.parse('{"constructor": {"prototype": {"polluted": true}}, "prototype": {"polluted": true}}'));

			expect(({} as any).polluted).to.be.undefined;
			expect(Object.hasOwn(dest, "constructor")).to.be.false;
			expect(Object.hasOwn(dest, "prototype")).to.be.false;
		});

		it('Should not merge inherited source properties', () => {
			const src = Object.create({inherited: 1});
			src.own = 2;
			expect(ObjectUtil.merge({}, src)).to.deep.equal({own: 2});
		});

		it('Should not traverse inherited destination properties', () => {
			const proto = {nested: {a: 1}};
			const dest: any = Object.create(proto);
			ObjectUtil.merge(dest, {nested: {b: 2}});

			expect(proto.nested).to.deep.equal({a: 1});
			expect(Object.hasOwn(dest, "nested")).to.be.true;
			expect(dest.nested).to.deep.equal({b: 2});
		});

		it('Should still deep merge own nested objects', () => {
			expect(ObjectUtil.merge({a: {x: 1}}, {a: {y: 2}, b: 3})).to.deep.equal({a: {x: 1, y: 2}, b: 3});
		});

		it('Should reject a __proto__ patch path', () => {
			const doc: any = {};
			ObjectUtil.patch(doc, {"__proto__/polluted": true});

			expect(({} as any).polluted).to.be.undefined;
			expect(doc.polluted).to.be.undefined;
			expect(warnings).to.equal(1);
		});

		it('Should reject a constructor/prototype patch path', () => {
			const doc: any = {};
			ObjectUtil.patch(doc, {"constructor/prototype/polluted": true});

			expect(({} as any).polluted).to.be.undefined;
			expect(warnings).to.equal(1);
		});

		it('Should reject an escaped __proto__ key at the leaf', () => {
			const doc: any = {foo: {}};
			ObjectUtil.patch(doc, {"foo/__proto__": {polluted: true}});

			expect(Object.getPrototypeOf(doc.foo)).to.equal(Object.prototype);
			expect(doc.foo.polluted).to.be.undefined;
			expect(warnings).to.equal(1);
		});

		it('Should not patch through inherited properties', () => {
			const proto = {nested: {a: 1}};
			const doc: any = Object.create(proto);
			ObjectUtil.patch(doc, {"nested/a": 2});

			expect(proto.nested.a).to.equal(1);
			expect(warnings).to.equal(1);
		});
	});
});
