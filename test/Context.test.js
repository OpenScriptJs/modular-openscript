import { describe, it, expect } from "vitest";
import { Context, putContext, context } from "../src/core/Context.js";
import { State } from "../src/core/State.js";

describe("Context", () => {
  describe("Context Creation", () => {
    it("should create context with putContext", () => {
      putContext("test", "TestContext");
      const ctx = context("test");

      expect(ctx).toBeInstanceOf(Context);
    });

    it("should create multiple contexts from array", () => {
      putContext(["ctx1", "ctx2", "ctx3"], "MultiContext");

      const ctx1 = context("ctx1");
      const ctx2 = context("ctx2");
      const ctx3 = context("ctx3");

      expect(ctx1).toBeInstanceOf(Context);
      expect(ctx2).toBeInstanceOf(Context);
      expect(ctx3).toBeInstanceOf(Context);
    });
  });

  describe("Context State Management", () => {
    it("should add states to context with states() helper", () => {
      putContext("app", "AppContext");
      const ctx = context("app");

      ctx.states({
        loading: false,
        user: null,
        count: 0,
      });

      expect(ctx.loading).toBeDefined();
      expect(ctx.user).toBeDefined();
      expect(ctx.count).toBeDefined();
      expect(ctx.loading.value).toBe(false);
    });

    it("should create reactive state properties", () => {
      putContext("user", "UserContext");
      const ctx = context("user");

      ctx.states({ isLoggedIn: false });

      let changeDetected = false;
      ctx.isLoggedIn.listener(() => {
        changeDetected = true;
      });

      ctx.isLoggedIn.value = true;

      expect(changeDetected).toBe(true);
      expect(ctx.isLoggedIn.value).toBe(true);
    });
  });

  describe("Context Properties", () => {
    it("should allow adding non-reactive properties", () => {
      putContext("global", "GlobalContext");
      const ctx = context("global");

      ctx.appName = "TestApp";
      ctx.version = "1.0.0";

      expect(ctx.appName).toBe("TestApp");
      expect(ctx.version).toBe("1.0.0");
    });

    it("should allow mixing reactive and non-reactive properties", () => {
      putContext("config", "ConfigContext");
      const ctx = context("config");

      ctx.apiUrl = "https://api.example.com";
      ctx.states({ authenticated: false });

      expect(ctx.apiUrl).toBe("https://api.example.com");
      expect(ctx.authenticated.value).toBe(false);
    });
  });

  describe("Context Retrieval", () => {
    it("should retrieve same context instance", () => {
      putContext("singleton", "SingletonContext");

      const ctx1 = context("singleton");
      const ctx2 = context("singleton");

      expect(ctx1).toBe(ctx2);
    });
  });
});
