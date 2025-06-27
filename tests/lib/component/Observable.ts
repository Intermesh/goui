import {expect} from "chai";
import {describe} from "mocha";
import {comp, root} from "../../../script";


describe('Observale class', () => {


	describe("Listener", () => {

		it('Fires an event once', function () {
			const c = comp({
				hidden: true
			});

			root.items.add(c);

			let fired = false;
			c.on("show", () => {
				fired = true;
			}, {once: true});

			c.show();

			expect(fired).to.equal(true);

			fired = false;
			c.show();
			expect(fired).to.equal(false);

		});


		it('Buffers event', function (done) {
			const c = comp({
				hidden: true
			});

			root.items.add(c);

			let bufferedFire = 0;
			c.on("show", () => {

				bufferedFire++;

				console.log(bufferedFire);
			}, {buffer: 10});

			c.show();
			c.hide();
			c.show();
			c.hide();
			c.show();
			c.hide();

			setTimeout(() => {
				expect(bufferedFire).to.equal(1);
				c.show();
				done();
			}, 11);

		});

		it('Unsubscribes buffered event', function (done) {
			const c = comp({
				hidden: true
			});

			root.items.add(c);

			const lsnr = () => {
				fired++;
			};

			let fired = 0;
			c.on("show", lsnr, {buffer: 10});

			c.show();


			setTimeout(() => {
				expect(fired).to.equal(1);

				const ret = c.un("show", lsnr);
				expect(ret).to.equal(true);
				c.show();

				setTimeout(() => {
					expect(fired).to.equal(1);
					done();
				},11);
			}, 11);

		});

	});
});