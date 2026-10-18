import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell, Button, Card, CardGrid, ThemeToggle } from "../src/react";
import type { Registry } from "../src/registry";

const snapshot: Registry = {
  version: 1,
  generatedAt: "2026-10-18T00:00:00Z",
  apps: [
    {
      id: "articles",
      title: "Articles",
      description: "",
      path: "/articles/",
      status: "live",
      nav: true,
      order: 10,
    },
    { id: "gen", title: "Gen", description: "", path: "/gen/", status: "beta", nav: true, order: 20 },
  ],
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(new Response("", { status: 404 }))),
  );
});

afterEach(cleanup);

describe("AppShell", () => {
  it("renders the shared nav from the snapshot and marks the current app", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ID", "gen");
    render(<AppShell registry={snapshot}>content</AppShell>);
    const links = screen.getAllByRole("link").filter((a) => a.closest(".tx-nav"));
    expect(links.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["Home", "/"],
      ["Articles", "/articles/"],
      ["Gen", "/gen/"],
    ]);
    expect(screen.getByRole("link", { name: "Gen" })).toHaveProperty("ariaCurrent", "true");
    expect(screen.getByRole("main").textContent).toBe("content");
  });

  it("adds the current app if the registry doesn't know it yet", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ID", "brand-new");
    render(
      <AppShell registry={snapshot} appTitle="Brand New">
        content
      </AppShell>,
    );
    expect(screen.getByRole("link", { name: "Brand New" }).getAttribute("href")).toBe("/brand-new/");
  });

  it("adopts a newer registry from the session cache", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ID", "root");
    const newer = { ...snapshot, generatedAt: "2026-10-19T00:00:00Z", apps: [...snapshot.apps] };
    newer.apps.push({
      id: "z",
      title: "Zed",
      description: "",
      path: "/z/",
      status: "live",
      nav: true,
      order: 99,
    });
    sessionStorage.setItem("toyonix:root:registry", JSON.stringify({ v: 1, data: newer }));
    render(<AppShell registry={snapshot}>content</AppShell>);
    expect(await screen.findByRole("link", { name: "Zed" })).toBeTruthy();
  });
});

describe("ThemeToggle", () => {
  it("stores an explicit preference and applies it", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Switch to dark theme" });
    act(() => {
      fireEvent.click(button);
    });
    expect(JSON.parse(localStorage.getItem("toyonix:shared:theme")!)).toEqual({ v: 1, data: "dark" });
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(screen.getByRole("button", { name: "Switch to light theme" })).toBeTruthy();
  });
});

describe("primitives", () => {
  it("Button defaults to type=button and supports asChild", () => {
    render(
      <>
        <Button>Save</Button>
        <Button asChild variant="secondary">
          <a href="/x">Go</a>
        </Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "Save" }).getAttribute("type")).toBe("button");
    expect(screen.getByRole("link", { name: "Go" }).className).toBe("tx-btn tx-btn--secondary");
  });

  it("Card becomes interactive with asChild", () => {
    render(
      <CardGrid>
        <Card asChild>
          <a href="/gen/">Gen</a>
        </Card>
        <Card>Static</Card>
      </CardGrid>,
    );
    expect(screen.getByRole("link", { name: "Gen" }).className).toBe("tx-card tx-card--link");
    expect(screen.getByText("Static").className).toBe("tx-card");
  });
});
