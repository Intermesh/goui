import {expect} from "chai";
import {Collection} from "../../../dist/util/Collection.js";
import {Component} from "../../../dist/component/Component.js";

describe('Collection class', () => {

	const c = new Collection<Component>();


	it('Should add item', () => {

		c.add(Component.create({
			text: "test1"
		}));

		expect(c.count()).to.equal(1);
	});

	it('Should iterate', () => {

		c.clear();

		c.add(Component.create({
			text: "test1"
		}));

		for(let item of c) {
			expect(item.getText()).to.equal("test1");
		}
	});

	it('Should insert', () => {

		c.clear();

		c.add(Component.create({
			text: "test1"
		}));

		c.insert(Component.create({
			text: "test2"
		}), 0);

		expect(c.count()).to.equal(2);

		expect(c.get(0).getText()).to.equal("test2");
		expect(c.get(1).getText()).to.equal("test1");

	});



});