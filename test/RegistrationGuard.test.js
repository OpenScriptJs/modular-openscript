import { describe, it, expect, vi } from "vitest";
import Component from "../src/component/Component.js";
import Mediator from "../src/mediator/Mediator.js";
import Listener from "../src/broker/Listener.js";
import { app } from "../src/index.js";

console.log("Running RegistrationGuard.test.js");

describe("Registration Guards", () => {
  describe("Component Registration Guard", () => {
    it("should allow initial registration", async () => {
      class TestComponent extends Component {
        render() {
          return "<div>Test</div>";
        }
      }

      const instance = new TestComponent();
      expect(instance.__ojsRegistered).toBeUndefined();

      await instance.mount();

      expect(instance.__ojsRegistered).toBe(true);
    });

    it("should prevent duplicate component registration", async () => {
      class TestComponent2 extends Component {
        render() {
          return "<div>Test2</div>";
        }
      }

      const instance = new TestComponent2();

      // First registration
      await instance.mount();
      expect(instance.__ojsRegistered).toBe(true);

      // Attempt duplicate registration
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});
      await instance.mount();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("already registered")
      );
      consoleWarnSpy.mockRestore();
    });
  });

  describe("Mediator Registration Guard", () => {
    it("should allow initial registration", async () => {
      class TestMediator extends Mediator {}

      const instance = new TestMediator();
      expect(instance.__ojsRegistered).toBeUndefined();

      await instance.register();

      expect(instance.__ojsRegistered).toBe(true);
    });

    it("should prevent duplicate mediator registration", async () => {
      class TestMediator2 extends Mediator {}

      const instance = new TestMediator2();

      // First registration
      await instance.register();
      expect(instance.__ojsRegistered).toBe(true);

      // Attempt duplicate registration
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});
      await instance.register();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("already registered")
      );
      consoleWarnSpy.mockRestore();
    });
  });

  describe("Listener Registration Guard", () => {
    it("should allow initial registration", async () => {
      class TestListener extends Listener {
        $$testEvent() {
          // Event handler
        }
      }

      const instance = new TestListener();
      expect(instance.__ojsRegistered).toBeUndefined();

      await instance.register();

      expect(instance.__ojsRegistered).toBe(true);
    });

    it("should prevent duplicate listener registration", async () => {
      class TestListener2 extends Listener {
        $$anotherEvent() {
          // Event handler
        }
      }

      const instance = new TestListener2();

      // First registration
      await instance.register();
      expect(instance.__ojsRegistered).toBe(true);

      // Attempt duplicate registration
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});
      await instance.register();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("already registered")
      );
      consoleWarnSpy.mockRestore();
    });
  });
});
