/**
 * State Management Example
 * Demonstrates various state patterns in OpenScript
 */

import { Component, app, state } from "../index.js";

const h = app("h");

// ============================================
// 1. Basic Counter Component with State
// ============================================
class Counter extends Component {
  // Create state directly in the component
  count = state(0);

  // Regular component methods (NOT event listeners)
  increment() {
    this.count.value++;
  }

  decrement() {
    this.count.value--;
  }

  reset() {
    this.count.value = 0;
  }

  // Component automatically re-renders when state changes
  render(...args) {
    return h.div(
      { class: "counter-container" },
      h.h3("Counter Example"),
      h.p({ class: "count-display" }, "Count: ", h.strong(this.count.value)),
      h.div(
        { class: "button-group" },
        // Using listeners attribute
        h.button(
          {
            class: "btn btn-success",
            listeners: { click: this.increment },
          },
          "+"
        ),
        h.button(
          {
            class: "btn btn-danger",
            listeners: { click: this.decrement },
          },
          "-"
        ),
        // Alternative: using this.method()
        h.button(
          {
            class: "btn btn-secondary",
            onclick: this.method("reset"),
          },
          "Reset"
        )
      ),
      ...args
    );
  }
}

// ============================================
// 2. Todo List Component with Array State
// ============================================
class TodoList extends Component {
  todos = state([]);
  inputValue = state("");

  addTodo() {
    if (this.inputValue.value.trim()) {
      // Push new todo to the array
      this.todos.value = [
        ...this.todos.value,
        {
          id: Date.now(),
          text: this.inputValue.value,
          completed: false,
        },
      ];
      this.inputValue.value = "";
    }
  }

  toggleTodo(id) {
    this.todos.value = this.todos.value.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  }

  deleteTodo(id) {
    this.todos.value = this.todos.value.filter((todo) => todo.id !== id);
  }

  updateInput(e) {
    this.inputValue.value = e.target.value;
  }

  render(...args) {
    return h.div(
      { class: "todo-container" },
      h.h3("Todo List Example"),

      // Input form
      h.div(
        { class: "input-group mb-3" },
        h.input({
          type: "text",
          class: "form-control",
          placeholder: "Enter a todo...",
          value: this.inputValue.value,
          listeners: {
            input: this.updateInput,
            keypress: (e) => {
              if (e.key === "Enter") this.addTodo();
            },
          },
        }),
        h.button(
          {
            class: "btn btn-primary",
            listeners: { click: this.addTodo },
          },
          "Add"
        )
      ),

      // Todo list
      h.ul(
        { class: "list-group" },
        ...this.todos.value.map((todo) =>
          h.li(
            {
              class:
                "list-group-item d-flex justify-content-between align-items-center",
              style: todo.completed
                ? "text-decoration: line-through; opacity: 0.6"
                : "",
            },
            h.span(
              {
                onclick: () => this.toggleTodo(todo.id),
                style: "cursor: pointer; flex: 1",
              },
              todo.text
            ),
            h.button(
              {
                class: "btn btn-sm btn-danger",
                onclick: () => this.deleteTodo(todo.id),
              },
              "Delete"
            )
          )
        )
      ),

      // Stats
      h.p(
        { class: "mt-3" },
        `Total: ${this.todos.value.length} | `,
        `Completed: ${this.todos.value.filter((t) => t.completed).length}`
      ),
      ...args
    );
  }
}

// ============================================
// 3. Form Component with Object State
// ============================================
class UserForm extends Component {
  formData = state({
    name: "",
    email: "",
    age: "",
  });

  submitted = state(false);

  updateField(field, value) {
    this.formData.value = {
      ...this.formData.value,
      [field]: value,
    };
  }

  handleSubmit(e) {
    e.preventDefault();
    console.log("Form submitted:", this.formData.value);
    this.submitted.value = true;

    // Reset after 2 seconds
    setTimeout(() => {
      this.submitted.value = false;
    }, 2000);
  }

  render(...args) {
    return h.div(
      { class: "form-container" },
      h.h3("User Form Example"),

      h.form(
        { listeners: { submit: this.handleSubmit } },
        h.div(
          { class: "mb-3" },
          h.label({ class: "form-label" }, "Name"),
          h.input({
            type: "text",
            class: "form-control",
            value: this.formData.value.name,
            listeners: {
              input: (e) => this.updateField("name", e.target.value),
            },
          })
        ),
        h.div(
          { class: "mb-3" },
          h.label({ class: "form-label" }, "Email"),
          h.input({
            type: "email",
            class: "form-control",
            value: this.formData.value.email,
            listeners: {
              input: (e) => this.updateField("email", e.target.value),
            },
          })
        ),
        h.div(
          { class: "mb-3" },
          h.label({ class: "form-label" }, "Age"),
          h.input({
            type: "number",
            class: "form-control",
            value: this.formData.value.age,
            listeners: {
              input: (e) => this.updateField("age", e.target.value),
            },
          })
        ),
        h.button({ type: "submit", class: "btn btn-primary" }, "Submit"),
        this.submitted.value
          ? h.div(
              { class: "alert alert-success mt-3" },
              "Form submitted successfully!"
            )
          : null
      ),
      ...args
    );
  }
}

// ============================================
// 4. State with Listeners
// ============================================
class StateListenerExample extends Component {
  temperature = state(20);

  constructor() {
    super();

    // Add a listener that fires whenever temperature changes
    this.temperature.listener((tempState) => {
      console.log(`Temperature changed to: ${tempState.value}°C`);

      // You could trigger side effects here
      if (tempState.value > 30) {
        console.warn("Temperature is getting high!");
      }
    });
  }

  increase() {
    this.temperature.value += 5;
  }

  decrease() {
    this.temperature.value -= 5;
  }

  render(...args) {
    const temp = this.temperature.value;
    let status = "Normal";
    let statusClass = "badge bg-success";

    if (temp > 30) {
      status = "Hot";
      statusClass = "badge bg-danger";
    } else if (temp < 10) {
      status = "Cold";
      statusClass = "badge bg-primary";
    }

    return h.div(
      { class: "temperature-container" },
      h.h3("State Listener Example"),
      h.p("Check console for state change logs"),
      h.div(
        { class: "display-4" },
        `${temp}°C `,
        h.span({ class: statusClass }, status)
      ),
      h.div(
        { class: "button-group mt-3" },
        h.button(
          {
            class: "btn btn-primary",
            listeners: { click: this.increase },
          },
          "Increase"
        ),
        h.button(
          {
            class: "btn btn-info",
            listeners: { click: this.decrease },
          },
          "Decrease"
        )
      ),
      ...args
    );
  }
}

// ============================================
// 5. Demo Page - All Examples Together
// ============================================
class StateDemo extends Component {
  render(...args) {
    return h.div(
      { class: "container mt-4" },
      h.h1("OpenScript State Management Examples"),
      h.hr(),

      h.div(
        { class: "row" },
        h.div({ class: "col-md-6 mb-4" }, h.Counter()),
        h.div({ class: "col-md-6 mb-4" }, h.StateListenerExample())
      ),

      h.div(
        { class: "row" },
        h.div({ class: "col-md-6 mb-4" }, h.TodoList()),
        h.div({ class: "col-md-6 mb-4" }, h.UserForm())
      ),
      ...args
    );
  }
}

export { Counter, TodoList, UserForm, StateListenerExample, StateDemo };
