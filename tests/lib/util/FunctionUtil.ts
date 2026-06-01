import {expect} from "chai";
import { describe } from "mocha";
import {FunctionUtil} from "../../../script/index.js";


describe('FunctionUtil class', () => {



	let count = 0;

	const fn = FunctionUtil.buffer(0, () => {
		count++;
	});

	it('Should increment one time',  async () => {
		void fn();
		void fn();
		await fn();

		expect(count).to.equal(1);
	});





});