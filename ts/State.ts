/**
 * State object to store component state
 *
 * @see Component.saveState
 */
export class State {
	public static get() {
		return new State();
	}

	getItem(id: string): Record<string, any> {
		const json = localStorage.getItem("state-" + id);
		if (!json) {
			return {}
		}

		return JSON.parse(json);
	}

	setItem(id: string, state: Record<string, any>) {
		localStorage.setItem("state-" + id, JSON.stringify(state));
	}
}