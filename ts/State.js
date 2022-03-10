/**
 * State object to store component state
 *
 * @see Component.saveState
 */
export class State {
    static get() {
        return new State();
    }
    getItem(id) {
        const json = localStorage.getItem("state-" + id);
        if (!json) {
            return {};
        }
        return JSON.parse(json);
    }
    setItem(id, state) {
        localStorage.setItem("state-" + id, JSON.stringify(state));
    }
}
//# sourceMappingURL=State.js.map