import {expect} from "chai";
import {Collection, comp, Component} from "../../../script";
import {describe} from "mocha";

describe('Collection class', () => {

	const c = new Collection<Component>();


	it('Should add item', () => {

		c.add(comp({
			text: "test1"
		}));

		expect(c.count()).to.equal(1);
	});

	it('Should iterate', () => {

		c.clear();

		c.add(comp({
			text: "test1"
		}));

		for(let item of c) {
			expect(item.text).to.equal("test1");
		}
	});

	it('Should insert', () => {

		c.clear();

		c.add(comp({
			text: "test1"
		}));

		c.insert(0, comp({
			text: "test2"
		}));

		expect(c.count()).to.equal(2);

		expect(c.get(0)!.text).to.equal("test2");
		expect(c.get(1)!.text).to.equal("test1");

	});



});