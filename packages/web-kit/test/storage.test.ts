import { beforeEach, describe, expect, it, vi } from "vitest";
import { cookiePath, dbName, storage, storageKey } from "../src/storage";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/gen");
  vi.stubEnv("NEXT_PUBLIC_APP_ID", "gen");
});

describe("storage keys", () => {
  it("namespaces app keys by app id and shared keys by 'shared'", () => {
    storage.app.set("draft", { a: 1 });
    storage.shared.set("theme", "dark");
    expect(Object.keys(localStorage).sort()).toEqual(["toyonix:gen:draft", "toyonix:shared:theme"]);
  });

  it("rejects keys that could break the namespace", () => {
    expect(() => storageKey("gen", "a:b")).toThrow();
    expect(() => storage.app.set("bad key", 1)).toThrow();
  });

  it("derives IndexedDB names and cookie paths from the app", () => {
    expect(dbName("layouts")).toBe("toyonix:gen:layouts");
    expect(cookiePath()).toBe("/gen/");
  });
});

describe("envelope", () => {
  it("round-trips values in a v1 envelope", () => {
    storage.app.set("draft", { name: "corne" });
    expect(JSON.parse(localStorage.getItem("toyonix:gen:draft")!)).toEqual({ v: 1, data: { name: "corne" } });
    expect(storage.app.get("draft")).toEqual({ name: "corne" });
  });

  it("treats corrupt, foreign, or future-version values as missing", () => {
    localStorage.setItem("toyonix:gen:a", "not json");
    localStorage.setItem("toyonix:gen:b", JSON.stringify("raw"));
    localStorage.setItem("toyonix:gen:c", JSON.stringify({ v: 2, data: 1 }));
    expect(storage.app.get("a")).toBeUndefined();
    expect(storage.app.get("b")).toBeUndefined();
    expect(storage.app.get("c")).toBeUndefined();
  });

  it("keeps session data separate from local data", () => {
    storage.session.set("tab", 1);
    expect(sessionStorage.getItem("toyonix:gen:tab")).not.toBeNull();
    expect(storage.app.get("tab")).toBeUndefined();
  });

  it("returns false instead of throwing when storage is full", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    expect(storage.app.set("big", "x")).toBe(false);
  });
});

describe("shared keys", () => {
  it("validates values on write and read", () => {
    // @ts-expect-error not a valid theme
    expect(() => storage.shared.set("theme", "blue")).toThrow();
    localStorage.setItem("toyonix:shared:theme", JSON.stringify({ v: 1, data: "blue" }));
    expect(storage.shared.get("theme")).toBeUndefined();
  });
});

describe("subscribe", () => {
  it("fires for changes in this tab and other tabs", () => {
    const listener = vi.fn();
    const unsubscribe = storage.shared.subscribe("theme", listener);
    storage.shared.set("theme", "light");
    expect(listener).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new StorageEvent("storage", { key: "toyonix:shared:theme" }));
    expect(listener).toHaveBeenCalledTimes(2);
    window.dispatchEvent(new StorageEvent("storage", { key: "toyonix:gen:other" }));
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    storage.shared.set("theme", "dark");
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
