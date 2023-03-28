/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

/**
 * State object to store component state
 *
 * @see Component.saveState
 */
export class State {
	public static get() {
		return new State();
	}

	hasItem(id: string) {
		return localStorage.getItem("state-" + id) !== null;
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