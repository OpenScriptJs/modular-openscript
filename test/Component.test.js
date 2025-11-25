import { describe, it, expect, beforeEach } from "vitest";
import Component from "../src/component/Component.js";
import { h } from "../src/component/h.js";
import State from "../src/core/State.js";

describe("Component", () => {
  describe("Component Creation", () => {
    it("should create a component instance", () => {
      class MyComponent extends Component {
        render() {
          return h.div("Hello");
        }
      }

      const component = new MyComponent();
      expect(component).toBeInstanceOf(Component);
    });

    it("should have default properties", () => {
      class MyComponent extends Component {
        render() {
          return h.div("Test");
        }
      }

      const component = new MyComponent();
      expect(component.rendered).toBe(false);
    });
  });

  describe("Component Rendering", () => {
    it("should render component with render method", () => {
      class MyComponent extends Component {
        render() {
          return h.div({ class: "test" }, "Hello World");
        }
      }

      const component = new MyComponent();
      const element = component.render();

      expect(element).toBeDefined();
      expect(element.tagName).toBe("DIV");
      expect(element.textContent).toBe("Hello World");
      expect(element.className).toBe("test");
    });

    it("should pass arguments to render method", () => {
      class GreetingComponent extends Component {
        render(name, age) {
          return h.div(`Hello ${name}, age ${age}`);
        }
      }

      const component = new GreetingComponent();
      const element = component.render("Alice", 25);

      expect(element.textContent).toBe("Hello Alice, age 25");
    });
  });

  describe("Component Mounting", () => {
    it("should render component in parent element", () => {
      const parent = document.createElement("div");

      class MyComponent extends Component {
        render() {
          return h.div("Mounted Content");
        }
      }

      const component = new MyComponent();
      component.mount();

      h.MyComponent({ parent });

      expect(parent.children.length).toBe(1);
      expect(parent.textContent).toBe("Mounted Content");
      expect(component.rendered).toBe(true);
    });
  });

  describe("Component with State", () => {
    it("should use state in component", () => {
      class Counter extends Component {
        constructor() {
          super();
          this.count = State.state(0);
        }

        render() {
          return h.div(`Count: ${this.count.value}`);
        }
      }

      const counter = new Counter();
      const element = counter.render();

      expect(element.textContent).toBe("Count: 0");
    });
  });

  describe("Component Lifecycle", () => {
    it("should handle rendered event", () => {
      let rendered = false;

      class RenderEventComponent extends Component {
        $_rendered() {
          rendered = true;
        }

        render() {
          return h.div("Test");
        }
      }

      const component = new RenderEventComponent();
      component.mount();
      h.RenderEventComponent();

      expect(rendered).toBe(true);
    });

    it("should handle mounted event", async () => {
      const parent = document.createElement("div");
      let mounted = false;

      class MountEventComponent extends Component {
        $_mounted() {
          mounted = true;
        }

        render() {
          return h.div("Test");
        }
      }

      
      const component = new MountEventComponent();
      await component.mount();
      h.MountEventComponent();

      expect(mounted).toBe(true);
    });
  });

  describe("Component Update", () => {
    it("should update component when render called", () => {
      const parent = document.createElement("div");
      let renderCount = 0;

      class RenderCountComponent extends Component {
        render() {
          renderCount++;
          return h.div(`Render #${renderCount}`);
        }
      }

      const component = new RenderCountComponent();
      component.mount();

      h.RenderCountComponent({ parent });

      expect(renderCount).toBe(1);
      expect(parent.textContent).toBe("Render #1");

      h.RenderCountComponent({ parent, resetParent: true });

      expect(renderCount).toBe(2);
      expect(parent.textContent).toBe("Render #2");
    });
  });
});
