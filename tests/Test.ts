import {expect} from "chai";
import {comp, Component} from "../script/component/Component.js";

describe('Test', () => {
	describe("Create", () => {

		it('Create a component', function () {

interface BaseEvents<me extends Base> {
	render: (me:me) => void
}

class Base {
	public listeners?:BaseEvents<this>
}

class Child extends Base {
	foo() {
	}
}

function create<T extends typeof Base>(cls: T) {
	return new cls;
};

const c = create(Child);

/**
 * Argument of type 'typeof Child' is not assignable to parameter of type 'typeof Base'.
	Construct signature return types 'Child' and 'Base' are incompatible.
	The types of 'listeners' are incompatible between these types.
	Type 'BaseEvents<Child> | undefined' is not assignable to type 'BaseEvents<Base> | undefined'.
		Type 'BaseEvents<Child>' is not assignable to type 'BaseEvents<Base>'.
		Property 'foo' is missing in type 'Base' but required in type 'Child'.ts(2345)
Test.ts(18, 5): 'foo' is declared here.
*/

			/*
			
			 */

		  // function create<T extends typeof Base>(cls: T, config:Config<InstanceType<T>>) : InstanceType<T> {
			// 	const i = new cls as InstanceType<T>;
			// 	Object.assign(i, config);
			// 	return i;
		  // };






			type Config<T> = {
				[P in keyof T as (T[P] extends Function ? never : P)]?: T[P];
			};

			class Person {
				/**
				 * JSdoc must show for ID;
				 */
				public name = "";

				/**
				 * I don't want to have this one in Config
				 */
				public fn() {

				}
			}

			const config: Config<Person> = {name : "test"};
			const config2 : Partial<Person> = {name: "test"};

			expect(c2.id).to.equal("test");


		});

	});


});