import {expect} from "chai";
import {BrowserStore} from "../../../script/util/BrowserStorage.js";
import {comp, Component} from "../../../script/component/Component.js";
import {indexedDB} from "fake-indexeddb";

window["indexedDB"] = indexedDB;

describe('BrowserStore class', () => {


	const browserStorage = new BrowserStore("mocha");

	it('Should add item',  async() => {

		const ret = await browserStorage.setItem("key1", "val1");

		expect(ret).to.equal(true);

		const val = await browserStorage.getItem("key1");

		expect(val).to.equal("val1");

		await browserStorage.setItem("key2", "val2");

		const keys = await browserStorage.keys();
		expect(keys).deep.equal(["key1", "key2"]);
	});



	// it('Should iterate', () => {
	//
	// 	c.clear();
	//
	// 	c.add(comp({
	// 		text: "test1"
	// 	}));
	//
	// 	for(let item of c) {
	// 		expect(item.text).to.equal("test1");
	// 	}
	// });
	//
	// it('Should insert', () => {
	//
	// 	c.clear();
	//
	// 	c.add(comp({
	// 		text: "test1"
	// 	}));
	//
	// 	c.insert(0, comp({
	// 		text: "test2"
	// 	}));
	//
	// 	expect(c.count()).to.equal(2);
	//
	// 	expect(c.get(0).text).to.equal("test2");
	// 	expect(c.get(1).text).to.equal("test1");
	//
	// });



});