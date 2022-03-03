import {expect} from "chai";
import {Component} from "../../../ts/lib/component/Component.js";
import {body} from "../../../ts/lib/component/Body.js";

describe('Component class', () => {
	describe("Create", () => {

		it('Create a component', function () {
			const comp = Component.create();

			body.addItem(comp);

			expect(document.body.children.length).to.equal(1);

		});

	});
});