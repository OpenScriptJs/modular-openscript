/**
 * Counter Component - Simple interactive example
 */

import { Component, app, ojs, state } from "modular-openscriptjs";

const h = app("h");

export default class Counter extends Component {
  constructor() {
    super();
    this.count = state(0);
  }

  increment() {
    this.count.value++;
  }

  decrement() {
    this.count.value--;
  }

  reset() {
    this.count.value = 0;
  }

  render(...args) {
    return h.div(
      { class: "counter" },
      h.h2("Counter Example"),
      h.div(
        { class: "counter-display" },
        h.span({ class: "count" }, this.count.value)
      ),
      h.div(
        { class: "counter-buttons" },
        h.button(
          {
            listeners: { click: this.decrement.bind(this) },
          },
          "-"
        ),
        h.button(
          {
            listeners: { click: this.reset.bind(this) },
          },
          "Reset"
        ),
        h.button(
          {
            listeners: { click: this.increment.bind(this) },
          },
          "+"
        )
      ),
      ...args
    );
  }
}

ojs(Counter);
