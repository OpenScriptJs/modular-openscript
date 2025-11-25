import { describe, it, expect, beforeEach } from "vitest";
import Runner from "../src/core/Runner.js";
import Component from "../src/component/Component.js";
import Mediator from "../src/mediator/Mediator.js";
import Listener from "../src/broker/Listener.js";
import { container } from "../src/core/Container.js";
import { app } from "../src/index.js";

describe("Runner with IoC Container Singletons", () => {
  let runner;

  beforeEach(() => {
    runner = new Runner();
  });

  describe("Component Singletons", () => {
    it("should store Component instances in container as singletons", async () => {
      class TestComponent extends Component {
        render() {
          return "<div>Test</div>";
        }
      }

      await runner.run(TestComponent);
      const classKey = runner.getClassKey(TestComponent);
      const instance = container.resolve(classKey);

      expect(instance).toBeDefined();
      expect(instance).toBeInstanceOf(TestComponent);
    });

    it("should reuse singleton instances from container", async () => {
      class TestComponent extends Component {
        render() {
          return "<div>Test</div>";
        }
      }

      // First run
      await runner.run(TestComponent);
      const classKey = runner.getClassKey(TestComponent);
      const firstInstance = container.resolve(classKey);

      // Second run - should retrieve same instance from container
      await runner.run(TestComponent);
      const secondInstance = container.resolve(classKey);

      expect(secondInstance).toBe(firstInstance);
    });

    it("should NOT store functional components in container", async () => {
      const functionalComponent = function MyFunc() {
        return "<div>Functional</div>";
      };

      await runner.run(functionalComponent);
      const classKey = runner.getClassKey(functionalComponent);

      // Functional components are not singletons
      expect(container.has(classKey)).toBe(false);
    });
  });

  describe("Mediator Singletons", () => {
    it("should store Mediator instances in container", async () => {
      class TestMediator extends Mediator {}

      await runner.run(TestMediator);
      const classKey = runner.getClassKey(TestMediator);
      const instance = container.resolve(classKey);

      expect(instance).toBeDefined();
      expect(instance).toBeInstanceOf(TestMediator);
    });
  });

  describe("Listener Singletons", () => {
    it("should store Listener instances in container", async () => {
      class TestListener extends Listener {
        $$testEvent() {}
      }

      await runner.run(TestListener);
      const classKey = runner.getClassKey(TestListener);
      const instance = container.resolve(classKey);

      expect(instance).toBeDefined();
      expect(instance).toBeInstanceOf(TestListener);
    });
  });

  describe("Registration Guard Integration", () => {
    it("should skip re-registration using __ojsRegistered flag", async () => {
      class TestComponent extends Component {
        render() {
          return "<div>Test</div>";
        }
      }

      // First run - registers the component
      await runner.run(TestComponent);
      const classKey = runner.getClassKey(TestComponent);
      const instance = container.resolve(classKey);

      expect(instance.__ojsRegistered).toBe(true);

      // Second run - should skip because already registered
      const mountSpy = vi.spyOn(instance, "mount");
      await runner.run(TestComponent);

      expect(mountSpy).not.toHaveBeenCalled();
      mountSpy.mockRestore();
    });
  });
});
