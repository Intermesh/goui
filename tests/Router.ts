import {expect} from "chai";
import {router} from "../script/Router.js";
import { describe } from "mocha";
describe('Router class', () => {
	describe("goto", () => {

		it('Create and goto route', async() => {

			let routeNo;

			// To ignore/supress jsdom not imnlemented error
			window.scrollTo = () => {};

			// create route with a param
			router.add(/^test\/(\d+)$/, (no) => {

				// set param to local var
				routeNo = no;
			});

			// goto route
			await router.goto("test/123");

			// param should be set
			expect(routeNo).to.equal("123");

		});

	});
});