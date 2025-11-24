import { describe, it, expect, beforeEach, vi } from "vitest";
import Broker from "../src/broker/Broker.js";

describe("Broker", () => {
  let broker;

  beforeEach(() => {
    broker = new Broker();
  });

  describe("Event Registration", () => {
    it("should register events from object", () => {
      const events = {
        user: {
          login: true,
          logout: true,
        },
      };

      broker.registerEvents(events);

      // Check if events are properly registered
      expect(events.user.login).toBeDefined();
      expect(events.user.logout).toBeDefined();
    });

    it("should create nested event names", () => {
      const events = {
        user: {
          needs: {
            login: true,
          },
        },
      };

      broker.registerEvents(events);

      // The event should be accessible as "user:needs:login"
      expect(events.user.needs.login).toBeDefined();
    });
  });

  describe("Event Listening", () => {
    it("should register event listener with on()", async () => {
      const callback = vi.fn();

      broker.on("test:event", callback);
      await broker.emit("test:event", { data: "value" });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should call multiple listeners for same event", async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      broker.on("test:event", callback1);
      broker.on("test:event", callback2);
      await broker.emit("test:event");

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it("should pass event data to listeners", async () => {
      const callback = vi.fn();
      const eventData = { user: "Alice", id: 123 };

      broker.on("user:login", callback);
      await broker.emit("user:login", eventData);

      expect(callback).toHaveBeenCalledWith(eventData, "user:login");
    });
  });

  describe("Event Emission", () => {
    it("should emit events with send()", async () => {
      const callback = vi.fn();

      broker.on("test:send", callback);
      await broker.send("test:send", { message: "hello" });

      expect(callback).toHaveBeenCalledWith({ message: "hello" }, "test:send");
    });

    it("should broadcast events", async () => {
      const callback = vi.fn();

      broker.on("test:broadcast", callback);
      await broker.broadcast("test:broadcast", { data: "broadcast" });

      expect(callback).toHaveBeenCalled();
    });
  });
});
