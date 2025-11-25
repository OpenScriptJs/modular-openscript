import { app, State, Component, ojs } from "modular-openscriptjs";

// Define a State
const counter = State.state(0);
const h = app("h");

// Define a Component
class CounterComponent extends Component {
  render(counter, ...args) {
    return h.div(
      h.h1(`Counter: ${counter.value}`),
      h.button(
        {
          onclick: this.method("increment"),
        },
        "Increment"
      ),
      ...args
    );
  }

  increment() {
    counter.value++;
  }
}

// Mount the Component
ojs(CounterComponent);
