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

	describe("Listener", () => {

		it('Fires an event once', function () {
			const comp = Component.create();

			root.addItem(comp);

			let fired = false;
			comp.on("show", () => {
				fired = true;
			}, {once: true});

			comp.show();

			expect(fired).to.equal(true);

			fired = false;
			comp.show();
			expect(fired).to.equal(false);

		});

	});
});