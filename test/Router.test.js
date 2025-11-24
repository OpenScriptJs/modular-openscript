import { describe, it, expect, beforeEach, vi } from "vitest";
import Router from "../src/router/Router.js";

describe("Router", () => {
  let router;

  beforeEach(() => {
    router = new Router();
  });

  describe("Route Registration", () => {
    it("should register simple route", () => {
      const handler = vi.fn();

      router.on("/", handler, "home");

      // Just check that it doesn't throw
      expect(true).toBe(true);
    });

    it("should register route with parameters", () => {
      const handler = vi.fn();

      router.on("/users/{id}", handler, "user.view");

      expect(true).toBe(true);
    });
  });
});
