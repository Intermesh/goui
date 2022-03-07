import {expect} from "chai";
import {Component} from "../../../dist/component/Component.js";
import {root} from "../../../dist/component/Root.js";

describe('Component class', () => {
	describe("Create", () => {

		it('Create a component', function () {
			const comp = Component.create();

			root.addItem(comp);

			expect(root.getEl().children.length).to.equal(1);

		});

	});
});