import {expect} from "chai";
import {router} from "../dist/Router.js";

describe('Router class', () => {
	describe("goto", () => {

		it('Create and goto route', async() => {

			let routeNo, subRouteNo;

			// create route with a param
			router.add(/test\/(\d+)/, (no) => {

				// set param to local var
				routeNo = no;

				router.add(/test\/(\d+)\/sub\/(\d+)/, (no, subNo) => {
					subRouteNo = subNo;
				});
			});

			// goto route
			await router.goto("test/123");

			// param should be set
			expect(routeNo).to.equal("123");


			// goto route
			await router.goto("test/123/sub/456");

			// param should be set
			expect(subRouteNo).to.equal("456");

		});

	});
});