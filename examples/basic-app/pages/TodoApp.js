/**
 * TodoApp - Root Layout Component
 * Main page layout for the todo application
 */

import { Component, app } from "../../../index.js";
import { gc, tc } from "../contexts.js";

const h = app("h");

export default class TodoApp extends Component {
  render(...args) {
    return h.div(
      { class: "container py-5" },

      // Header
      h.div(
        { class: "row mb-4" },
        h.div(
          { class: "col-12 text-center" },
          h.h1(
            { class: "display-4 mb-2" },
            h.i({ class: "fas fa-check-circle text-primary me-3" }),
            gc.appName.value
          ),
          h.p(
            { class: "text-muted" },
            "A simple and elegant todo list built with OpenScript"
          )
        )
      ),

      // Main content area
      h.div(
        { class: "row" },
        h.div(
          { class: "col-md-8 offset-md-2 col-lg-6 offset-lg-3" },

          // Card container
          h.div(
            { class: "card shadow-sm" },

            // Card body
            h.div(
              { class: "card-body p-4" },

              // Todo input form placeholder
              h.div(
                { class: "mb-4" },
                h.div(
                  { class: "input-group" },
                  h.input({
                    type: "text",
                    class: "form-control form-control-lg",
                    placeholder: "What needs to be done?",
                    id: "todo-input",
                  }),
                  h.button(
                    {
                      class: "btn btn-primary",
                      type: "button",
                    },
                    h.i({ class: "fas fa-plus me-2" }),
                    "Add"
                  )
                )
              ),

              // Filter tabs
              h.ul(
                { class: "nav nav-pills mb-4" },
                h.li(
                  { class: "nav-item" },
                  h.a(
                    {
                      class: "nav-link active",
                      href: "#",
                    },
                    "All"
                  )
                ),
                h.li(
                  { class: "nav-item" },
                  h.a(
                    {
                      class: "nav-link",
                      href: "#",
                    },
                    "Active"
                  )
                ),
                h.li(
                  { class: "nav-item" },
                  h.a(
                    {
                      class: "nav-link",
                      href: "#",
                    },
                    "Completed"
                  )
                )
              ),

              // Todo list placeholder
              h.div(
                { class: "todo-list" },
                tc.todos.value.length === 0
                  ? h.div(
                      { class: "text-center text-muted py-5" },
                      h.i({ class: "fas fa-inbox fa-3x mb-3 d-block" }),
                      h.p("No todos yet. Add one above to get started!")
                    )
                  : h.div(
                      { class: "list-group" },
                      ...tc.todos.value.map((todo) =>
                        h.div(
                          {
                            class: `list-group-item d-flex align-items-center ${
                              todo.completed ? "bg-light" : ""
                            }`,
                          },
                          h.input({
                            type: "checkbox",
                            class: "form-check-input me-3",
                            checked: todo.completed,
                          }),
                          h.span(
                            {
                              class: todo.completed
                                ? "text-decoration-line-through text-muted flex-grow-1"
                                : "flex-grow-1",
                            },
                            todo.text
                          ),
                          h.button(
                            {
                              class: "btn btn-sm btn-outline-danger",
                              type: "button",
                            },
                            h.i({ class: "fas fa-trash" })
                          )
                        )
                      )
                    )
              )
            ),

            // Card footer with stats
            h.div(
              { class: "card-footer bg-transparent" },
              h.div(
                { class: "d-flex justify-content-between align-items-center" },
                h.small(
                  { class: "text-muted" },
                  `${
                    tc.todos.value.filter((t) => !t.completed).length
                  } items left`
                ),
                h.small(
                  { class: "text-muted" },
                  h.i({ class: "fas fa-info-circle me-1" }),
                  `Total: ${tc.todos.value.length}`
                )
              )
            )
          )
        )
      ),

      // Footer
      h.div(
        { class: "row mt-5" },
        h.div(
          { class: "col-12 text-center" },
          h.p(
            { class: "text-muted small" },
            "Built with ",
            h.i({ class: "fas fa-heart text-danger" }),
            " using OpenScript Framework"
          )
        )
      ),

      ...args
    );
  }
}
