import {expect} from "chai";
import {describe} from "mocha";
import {
	AbstractDataSource,
	Changes,
	CommitResponse,
	DefaultEntity,
	EntityID,
	GetResponse,
	MergeResponse,
	QueryResponse
} from "../../script/index.js";

/**
 * Data source whose get requests stay pending until the test answers them.
 */
class PendingDataSource extends AbstractDataSource<DefaultEntity> {

	public pending: {ids: EntityID[], answer: (r: GetResponse<DefaultEntity>) => void}[] = [];

	constructor() {
		super("Test");
		this.persist = false;
	}

	protected internalGet(ids: EntityID[], properties: string[]): Promise<GetResponse<DefaultEntity>> {
		return new Promise(answer => this.pending.push({ids, answer}));
	}

	protected internalRemoteChanges(state: string | undefined): Promise<Changes> {
		throw new Error("not used");
	}

	protected internalCommit(params: any): Promise<CommitResponse<DefaultEntity>> {
		throw new Error("not used");
	}

	protected internalQuery(params: any): Promise<QueryResponse<DefaultEntity>> {
		throw new Error("not used");
	}

	protected internalMerge(ids: EntityID[]): Promise<MergeResponse<DefaultEntity>> {
		throw new Error("not used");
	}
}

const tick = () => new Promise(resolve => setTimeout(resolve, 5));

describe("AbstractDataSource", () => {
	describe("single", () => {

		let warnings: string[];
		const warn = console.warn, error = console.error;

		beforeEach(() => {
			warnings = [];
			console.warn = console.error = (...args: any[]) => { warnings.push(args.join(" ")) };
		});

		afterEach(() => {
			console.warn = warn;
			console.error = error;
		});

		it("resolves a get made while the first get of the same id is in flight", async () => {
			const ds = new PendingDataSource();

			const first = ds.single("1");
			await tick();

			const second = ds.single("1");
			await tick();

			expect(ds.pending.length).to.equal(2);

			ds.pending[0].answer({list: [{id: "1"}]});
			ds.pending[1].answer({list: [{id: "1"}]});

			expect((await first).id).to.equal("1");
			expect((await second).id).to.equal("1");
			expect(warnings).to.deep.equal([]);
		});

		it("handles notFound for an id whose first get was already answered", async () => {
			const ds = new PendingDataSource();

			const first = ds.single("1");
			await tick();

			const second = ds.single("1");
			await tick();

			ds.pending[0].answer({list: [{id: "1"}]});
			expect((await first).id).to.equal("1");

			ds.pending[1].answer({list: [], notFound: ["1"]});

			// The second get belongs to the second fetch, so the server's answer to that fetch decides it.
			let rejected: any;
			await second.catch(e => rejected = e);

			expect(rejected?.error).to.equal("Not found");
			// Before, the first answer had resolved and deleted the entry, and the notFound handler threw on it.
			expect(warnings).to.deep.equal([]);
		});

		it("fetches from the server when the browser storage fails", async () => {
			const ds = new PendingDataSource();
			ds.persist = true;
			Object.defineProperty(ds, "browserStore", {
				// the entity read fails, the state read (in the fetch chain) works
				get: () => ({getItem: (key: string) => key == "__state__" ? Promise.resolve(undefined) : Promise.reject(new Error("storage unavailable"))})
			});

			const p = ds.single("1");
			await tick();

			expect(ds.pending.length).to.equal(1);
			ds.pending[0].answer({list: [{id: "1"}]});

			expect((await p).id).to.equal("1");
		});
	});
});
