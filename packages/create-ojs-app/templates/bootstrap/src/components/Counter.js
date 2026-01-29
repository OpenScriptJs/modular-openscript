/**
 * Counter Component with Bootstrap - Simple interactive example
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

  get badgeClass() {
    if (this.count.value > 0) return "bg-success";
    if (this.count.value < 0) return "bg-danger";
    return "bg-secondary";
  }

  render(...args) {
    return h.div(
      { class: "card shadow-lg border-0" },

      // Card header
      h.div(
        { class: "card-header bg-primary text-white" },
        h.h3(
          { class: "mb-0 d-flex align-items-center justify-content-center" },
          h.i({ class: "fas fa-calculator me-2" }),
          "Counter Example"
        )
      ),

      // Card body
      h.div(
        { class: "card-body text-center py-5" },

        // Count display with badge
        h.div(
          { class: "mb-4" },
          h.span(
            { class: `badge ${this.badgeClass} fs-1 px-5 py-3` },
            this.count.value
          )
        ),

        // Progress bar
        h.div(
          { class: "progress mb-4", style: "height: 10px;" },
          h.div({
            class: `progress-bar ${
              this.count.value >= 0 ? "bg-success" : "bg-danger"
            }`,
            style: `width: ${Math.min(Math.abs(this.count.value) * 10, 100)}%`,
            role: "progressbar",
          })
        ),

        // Button group
        h.div(
          { class: "btn-group", role: "group" },
          h.button(
            {
              class: "btn btn-outline-danger btn-lg",
              listeners: { click: this.decrement.bind(this) },
            },
            h.i({ class: "fas fa-minus me-2" }),
            "Decrement"
          ),
          h.button(
            {
              class: "btn btn-outline-secondary btn-lg",
              listeners: { click: this.reset.bind(this) },
            },
            h.i({ class: "fas fa-redo me-2" }),
            "Reset"
          ),
          h.button(
            {
              class: "btn btn-outline-success btn-lg",
              listeners: { click: this.increment.bind(this) },
            },
            h.i({ class: "fas fa-plus me-2" }),
            "Increment"
          )
        )
      ),

      // Card footer
      h.div(
        { class: "card-footer text-muted text-center" },
        h.small(
          h.i({ class: "fas fa-info-circle me-1" }),
          "Click the buttons to update the counter"
        )
      ),

      ...args
    );
  }
}

ojs(Counter);
