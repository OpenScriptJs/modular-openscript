import { describe, it, expect, beforeEach } from "vitest";
import { app, MarkupHandler } from "../src/index.js";

// Get h inside each test, not at module level
let h;

describe("Markup Engine (h)", () => {
  beforeEach(() => {
    // Initialize h from container
    h = MarkupHandler.proxy();
  });

  describe("Basic Element Creation", () => {
    it("should create div element", () => {
      const element = h.div("Hello");

      expect(element.tagName).toBe("DIV");
      expect(element.textContent).toBe("Hello");
    });

    it("should create element with attributes", () => {
      const element = h.div({ class: "container", id: "main" }, "Content");

      expect(element.className).toBe("container");
      expect(element.id).toBe("main");
      expect(element.textContent).toBe("Content");
    });

    it("should create nested elements", () => {
      const element = h.div(h.h1("Title"), h.p("Paragraph"));

      expect(element.children.length).toBe(2);
      expect(element.children[0].tagName).toBe("H1");
      expect(element.children[1].tagName).toBe("P");
    });
  });

  describe("Element with Multiple Children", () => {
    it("should handle multiple text children", () => {
      const element = h.div("First", "Second", "Third");

      expect(element.textContent).toBe("FirstSecondThird");
    });

    it("should handle mixed children types", () => {
      const element = h.div("Text", h.span("Span"), "More text");

      expect(element.childNodes.length).toBe(3);
    });
  });

  describe("Attributes and Properties", () => {
    it("should set boolean attributes", () => {
      const element = h.input({ type: "checkbox", checked: true });

      expect(element.checked).toBe(true);
    });

    it("should set data attributes", () => {
      const element = h.div({ "data-id": "123", "data-name": "test" });

      expect(element.dataset.id).toBe("123");
      expect(element.dataset.name).toBe("test");
    });

    it("should set style object", () => {
      const element = h.div({ style: "color: red; font-size: 16px;" });

      expect(element.style.color).toBe("red");
      expect(element.style.fontSize).toBe("16px");
    });
  });

  describe("Event Listeners", () => {
    it("should attach onclick handler", () => {
      let clicked = false;
      const element = h.button(
        {
          listeners: {
            click: () => {
              clicked = true;
            },
          },
        },
        "Click"
      );

      element.click();
      expect(clicked).toBe(true);
    });

    it("should attach multiple event handlers", () => {
      let clickCount = 0;
      let hoverCount = 0;

      const element = h.div({
        listeners: {
          click: () => {
            clickCount++;
          },
          mouseover: () => {
            hoverCount++;
          },
        },
      });

      element.click();
      element.dispatchEvent(new Event("mouseover"));

      expect(clickCount).toBe(1);
      expect(hoverCount).toBe(1);
    });
  });

  describe("Document Fragments", () => {
    it("should create fragment with h.$()", () => {
      const fragment = h.$(h.div("First"), h.div("Second"));

      expect(fragment.tagName).toBe("OJS-SPECIAL-FRAGMENT");
      expect(fragment.childNodes.length).toBe(2);
    });

    it("should create fragment with h._()", () => {
      const fragment = h._(h.span("A"), h.span("B"));

      expect(fragment.tagName).toBe("OJS-SPECIAL-FRAGMENT");
      expect(fragment.childNodes.length).toBe(2);
    });
  });

  describe("Common Elements", () => {
    it("should create heading elements", () => {
      const h1 = h.h1("Title");
      const h2 = h.h2("Subtitle");

      expect(h1.tagName).toBe("H1");
      expect(h2.tagName).toBe("H2");
    });

    it("should create form elements", () => {
      const input = h.input({ type: "text", placeholder: "Enter name" });
      const button = h.button("Submit");

      expect(input.tagName).toBe("INPUT");
      expect(input.type).toBe("text");
      expect(button.tagName).toBe("BUTTON");
    });

    it("should create list elements", () => {
      const ul = h.ul(h.li("Item 1"), h.li("Item 2"));

      expect(ul.tagName).toBe("UL");
      expect(ul.children.length).toBe(2);
      expect(ul.children[0].tagName).toBe("LI");
    });
  });

  describe("Special Attributes", () => {
    it("should handle parent attribute", () => {
      const parent = document.createElement("div");
      const child = h.div({ parent: parent }, "Child");

      expect(parent.children.length).toBe(1);
      expect(parent.firstChild).toBe(child);
    });

    it("should handle resetParent attribute", () => {
      const parent = document.createElement("div");
      parent.innerHTML = "<span>Old</span>";

      const child = h.div({ parent: parent, resetParent: true }, "New");

      expect(parent.children.length).toBe(1);
      expect(parent.textContent).toBe("New");
    });
  });

  describe("Text Content", () => {
    it("should handle string content", () => {
      const element = h.p("Simple text");
      expect(element.textContent).toBe("Simple text");
    });

    it("should handle number content", () => {
      const element = h.span(42);
      expect(element.textContent).toBe("42");
    });

    it("should handle empty content", () => {
      const element = h.div();
      expect(element.textContent).toBe("");
    });
  });
});
