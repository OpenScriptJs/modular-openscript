/**
 * Counter Component with Tailwind - Simple interactive example
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
      { class: "bg-white rounded-2xl shadow-2xl p-8 min-w-[300px]" },
      h.h2(
        { class: "text-3xl font-bold text-purple-600 mb-6 text-center" },
        "Counter Example"
      ),
      h.div(
        { class: "my-8 text-center" },
        h.span({ class: "text-6xl font-bold text-gray-800" }, this.count.value)
      ),
      h.div(
        { class: "flex gap-4 justify-center" },
        h.button(
          {
            class:
              "px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 active:scale-95 transition-all",
            listeners: { click: this.decrement.bind(this) },
          },
          "-"
        ),
        h.button(
          {
            class:
              "px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 active:scale-95 transition-all",
            listeners: { click: this.reset.bind(this) },
          },
          "Reset"
        ),
        h.button(
          {
            class:
              "px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 active:scale-95 transition-all",
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
