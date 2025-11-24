import { describe, it, expect, beforeEach } from "vitest";
import State from "../src/core/State.js";

describe("State", () => {
  describe("State Creation", () => {
    it("should create state with initial value", () => {
      const count = State.state(0);
      expect(count.value).toBe(0);
    });

    it("should create state with object value", () => {
      const user = State.state({ name: "John", age: 30 });
      expect(user.value).toEqual({ name: "John", age: 30 });
    });

    it("should create state with array value", () => {
      const items = State.state([1, 2, 3]);
      expect(items.value).toEqual([1, 2, 3]);
    });
  });

  describe("State Updates", () => {
    it("should update state value", () => {
      const count = State.state(0);
      count.value = 5;
      expect(count.value).toBe(5);
    });

    it("should update object state", () => {
      const user = State.state({ name: "John" });
      user.value = { name: "Jane" };
      expect(user.value.name).toBe("Jane");
    });
  });

  describe("State Listeners", () => {
    it("should trigger listener on value change", () => {
      const count = State.state(0);
      let callCount = 0;
      let lastValue = null;

      count.listener((state) => {
        callCount++;
        lastValue = state.value;
      });

      count.value = 5;
      expect(callCount).toBe(1);
      expect(lastValue).toBe(5);
    });

    it("should trigger multiple listeners", () => {
      const count = State.state(0);
      const results = [];

      count.listener((state) => results.push(`listener1: ${state.value}`));
      count.listener((state) => results.push(`listener2: ${state.value}`));

      count.value = 10;
      expect(results).toEqual(["listener1: 10", "listener2: 10"]);
    });

    it("should support one-time listener with once()", () => {
      const count = State.state(0);
      let callCount = 0;

      count.once((state) => {
        callCount++;
      });

      count.value = 1;
      count.value = 2;
      count.value = 3;

      expect(callCount).toBe(1);
    });

    it("should remove listener with off()", () => {
      const count = State.state(0);
      let callCount = 0;

      const listenerId = count.listener((state) => {
        callCount++;
      });

      count.value = 1;
      expect(callCount).toBe(1);

      count.off(listenerId);
      count.value = 2;
      expect(callCount).toBe(1); // Should still be 1
    });
  });

  describe("State Comparison", () => {
    it("should not trigger listener if value is the same", () => {
      const count = State.state(5);
      let callCount = 0;

      count.listener(() => {
        callCount++;
      });

      count.value = 5; // Same value
      expect(callCount).toBe(0);
    });

    it("should trigger listener if value changes", () => {
      const count = State.state(5);
      let callCount = 0;

      count.listener(() => {
        callCount++;
      });

      count.value = 6;
      expect(callCount).toBe(1);
    });
  });
});
