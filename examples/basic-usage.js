import { Runner, Component, h, State } from "../index.js";

// Define a State
const counter = State.state(0);

// Define a Component
class CounterComponent extends Component {
    render(...args) {
        return h.div(
            h.h1(`Counter: ${counter.value}`),
            h.button(
                {
                    onclick: () => counter.value++,
                },
                "Increment"
            ),
            ...args
        );
    }
}

// Mount the Component
new Runner().run(CounterComponent);
