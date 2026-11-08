import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AppShell,
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
  Input,
  SidePanel,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarButton,
  UndoIcon,
  Workspace,
  WorkspaceBody,
} from "../src/react";

beforeEach(() => {
  // Radix measures popper content; jsdom has no ResizeObserver.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(new Response("", { status: 404 }))),
  );
});

afterEach(cleanup);

describe("AppShell layouts", () => {
  it("app layout fills the window: no footer, main marked for the app layout", () => {
    // Arrange / Act
    const { container } = render(<AppShell layout="app">tool</AppShell>);

    // Assert
    expect(container.firstElementChild?.className).toBe("tx-app-shell");
    expect(screen.getByRole("main").className).toBe("tx-main tx-main--app");
    expect(screen.queryByRole("contentinfo")).toBeNull();
    expect(screen.getByRole("banner")).toBeTruthy();
  });

  it("can leave out the shared header", () => {
    // Arrange / Act
    render(
      <AppShell layout="app" header={false}>
        tool
      </AppShell>,
    );

    // Assert
    expect(screen.queryByRole("banner")).toBeNull();
    expect(screen.getByRole("link", { name: "Skip to content" }).getAttribute("href")).toBe("#main");
  });

  it("page layout is unchanged by default", () => {
    // Arrange / Act
    render(<AppShell>page</AppShell>);

    // Assert
    expect(screen.getByRole("main").className).toBe("tx-main");
    expect(screen.getByRole("contentinfo")).toBeTruthy();
  });
});

describe("compact controls", () => {
  it("Button size sm adds the small class", () => {
    // Arrange / Act
    render(<Button size="sm">Generate</Button>);

    // Assert
    expect(screen.getByRole("button").className).toBe("tx-btn tx-btn--primary tx-btn--sm");
  });

  it("Input without a suffix is a plain input", () => {
    // Arrange / Act
    const { container } = render(<Input aria-label="Width" />);

    // Assert
    expect(container.innerHTML).toBe('<input class="tx-input" aria-label="Width">');
  });

  it("Input with a suffix shows it inside the box", () => {
    // Arrange / Act
    render(<Input aria-label="Width" defaultValue="119" suffix="mm" />);

    // Assert
    const input = screen.getByRole("textbox", { name: "Width" });
    expect(input.parentElement?.className).toBe("tx-input-group");
    expect(input.nextElementSibling?.textContent).toBe("mm");
  });
});

describe("IconButton", () => {
  it("is named by its label and shows the label and shortcut as a tooltip", async () => {
    // Arrange
    render(
      <IconButton label="Undo" shortcut="Ctrl Z">
        <UndoIcon />
      </IconButton>,
    );
    const button = screen.getByRole("button", { name: "Undo" });

    // Act
    await act(async () => {
      fireEvent.focus(button);
      await Promise.resolve();
    });

    // Assert
    expect(screen.getByRole("tooltip").textContent).toBe("Undo Ctrl Z");
    expect(button.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("reports its pressed state when used as a toggle", () => {
    // Arrange / Act
    render(
      <IconButton label="Select" pressed>
        <UndoIcon />
      </IconButton>,
    );

    // Assert
    expect(screen.getByRole("button", { name: "Select" }).getAttribute("aria-pressed")).toBe("true");
  });
});

describe("menus", () => {
  it("dropdown items show an icon, a description, a shortcut and a danger tone", () => {
    // Arrange
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Add</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem icon={<UndoIcon />} description="nice!nano / Pro Micro" shortcut="M">
            MCU cutout
          </DropdownMenuItem>
          <DropdownMenuItem tone="danger">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    // Act
    fireEvent.keyDown(screen.getByRole("button", { name: "Add" }), { key: "Enter" });

    // Assert
    const [mcu, del] = screen.getAllByRole("menuitem");
    expect(mcu?.querySelector(".tx-menu__icon svg")).toBeTruthy();
    expect(mcu?.querySelector(".tx-menu__description")?.textContent).toBe("nice!nano / Pro Micro");
    expect(mcu?.querySelector("kbd.tx-menu__shortcut")?.textContent).toBe("M");
    expect(del?.className).toContain("tx-menu__item--danger");
    expect(del?.textContent).toBe("Delete");
  });

  it("checkbox items report their state", () => {
    // Arrange
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>View</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Grid</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    // Act
    fireEvent.keyDown(screen.getByRole("button", { name: "View" }), { key: "Enter" });

    // Assert
    const item = screen.getByRole("menuitemcheckbox", { name: "Grid" });
    expect(item.getAttribute("aria-checked")).toBe("true");
    expect(item.querySelector(".tx-menu__icon svg")).toBeTruthy();
  });

  it("a context menu opens on right-click with the same item styling", () => {
    // Arrange
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div>canvas</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem shortcut="Ctrl D">Duplicate</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    // Act
    fireEvent.contextMenu(screen.getByText("canvas"));

    // Assert
    const menu = screen.getByRole("menu");
    expect(menu.className).toContain("tx-menu");
    const item = within(menu).getByRole("menuitem");
    expect(item.className).toBe("tx-menu__item");
    expect(item.textContent).toBe("DuplicateCtrl D");
  });
});

describe("Toolbar and ToggleGroup", () => {
  it("toolbar is compact and arrow keys move between its items", async () => {
    // Arrange
    render(
      <Toolbar aria-label="Edit">
        <ToolbarButton>Generate</ToolbarButton>
        <ToolbarButton asChild>
          <IconButton label="Undo">
            <UndoIcon />
          </IconButton>
        </ToolbarButton>
      </Toolbar>,
    );

    const toolbar = screen.getByRole("toolbar", { name: "Edit" });
    expect(toolbar.className).toBe("tx-toolbar tx-compact");
    const generate = screen.getByRole("button", { name: "Generate" });
    const undo = screen.getByRole("button", { name: "Undo" });

    // Assert
    expect(generate.className).toBe("tx-btn tx-btn--secondary");
    expect(undo.className).toBe("tx-icon-btn");

    // Act
    generate.focus();
    await act(async () => {
      fireEvent.keyDown(generate, { key: "ArrowRight" });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Assert
    expect(document.activeElement).toBe(undo);
  });

  it("toggle group switches the chosen option", () => {
    // Arrange
    const onValueChange = vi.fn();
    render(
      <ToggleGroup type="single" defaultValue="add" onValueChange={onValueChange} aria-label="Operation">
        <ToggleGroupItem value="add">Add</ToggleGroupItem>
        <ToggleGroupItem value="subtract">Subtract</ToggleGroupItem>
      </ToggleGroup>,
    );
    const subtract = screen.getByRole("radio", { name: "Subtract" });

    // Act
    fireEvent.click(subtract);

    // Assert
    expect(onValueChange).toHaveBeenCalledWith("subtract");
    expect(subtract.getAttribute("data-state")).toBe("on");
    expect(screen.getByRole("radio", { name: "Add" }).getAttribute("data-state")).toBe("off");
  });
});

describe("SidePanel", () => {
  const panel = (props: Partial<Parameters<typeof SidePanel>[0]> = {}) => (
    <Workspace>
      <WorkspaceBody>
        <SidePanel side="left" title="YAML" shortcut="Ctrl [" {...props}>
          <button type="button">inside</button>
        </SidePanel>
      </WorkspaceBody>
    </Workspace>
  );

  it("hides to a tab and comes back, moving focus along", () => {
    // Arrange
    render(panel());
    const aside = screen.getByRole("complementary", { name: "YAML" });
    expect(aside.getAttribute("data-state")).toBe("open");

    // Act: hide
    fireEvent.click(screen.getByRole("button", { name: "Hide YAML" }));

    // Assert
    expect(aside.getAttribute("data-state")).toBe("closed");
    expect(aside.querySelector(".tx-side-panel__content")?.hasAttribute("inert")).toBe(true);
    const tab = screen.getByRole("button", { name: "Show YAML" });
    expect(document.activeElement).toBe(tab);

    // Act: show again
    fireEvent.click(tab);

    // Assert
    expect(aside.getAttribute("data-state")).toBe("open");
    expect(tab.hasAttribute("inert")).toBe(true);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Hide YAML" }));
  });

  it("can be controlled by the app (e.g. a toolbar toggle)", () => {
    // Arrange
    const onOpenChange = vi.fn();
    const { rerender } = render(panel({ open: false, onOpenChange, width: 400 }));
    const aside = screen.getByRole("complementary", { name: "YAML" });

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Show YAML" }));

    // Assert: it asks, and stays closed until the app says otherwise
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(aside.getAttribute("data-state")).toBe("closed");
    expect(aside.style.getPropertyValue("--tx-side-panel-width")).toBe("400px");

    // Act
    rerender(panel({ open: true, onOpenChange, width: 400 }));

    // Assert
    expect(aside.getAttribute("data-state")).toBe("open");
  });

  it("has no resize handle unless asked for one", () => {
    // Arrange / Act
    render(panel());

    // Assert
    expect(screen.queryByRole("separator")).toBeNull();
  });

  it("resizes from the keyboard within its limits and reports the width", () => {
    // Arrange
    const onWidthChange = vi.fn();
    render(panel({ resizable: true, width: 300, minWidth: 250, maxWidth: 330, onWidthChange }));
    const handle = screen.getByRole("separator", { name: "Resize YAML" });
    const aside = screen.getByRole("complementary", { name: "YAML" });

    // Act: a left panel grows to the right
    fireEvent.keyDown(handle, { key: "ArrowRight" });

    // Assert
    expect(onWidthChange).toHaveBeenLastCalledWith(316);
    expect(aside.style.getPropertyValue("--tx-side-panel-width")).toBe("316px");
    expect(handle.getAttribute("aria-valuenow")).toBe("316");
    expect(handle.getAttribute("aria-valuemin")).toBe("250");
    expect(handle.getAttribute("aria-valuemax")).toBe("330");

    // Act: clamped at both ends
    fireEvent.keyDown(handle, { key: "ArrowRight", shiftKey: true });
    const atMax = aside.style.getPropertyValue("--tx-side-panel-width");
    fireEvent.keyDown(handle, { key: "Home" });

    // Assert
    expect(atMax).toBe("330px");
    expect(onWidthChange).toHaveBeenLastCalledWith(250);
  });

  it("resizes by dragging its inner edge; a right panel grows to the left", () => {
    // Arrange
    const onWidthChange = vi.fn();
    render(panel({ side: "right", resizable: true, width: 300, onWidthChange }));
    const handle = screen.getByRole("separator", { name: "Resize YAML" });
    const aside = screen.getByRole("complementary", { name: "YAML" });

    // Act
    fireEvent.pointerDown(handle, { button: 0, clientX: 500, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 440, pointerId: 1 });
    const whileDragging = aside.style.getPropertyValue("--tx-side-panel-width");
    const reportedWhileDragging = onWidthChange.mock.calls.length;
    fireEvent.pointerUp(handle, { clientX: 440, pointerId: 1 });

    // Assert: live while dragging, reported once at the end
    expect(whileDragging).toBe("360px");
    expect(aside.hasAttribute("data-resizing")).toBe(false);
    expect(reportedWhileDragging).toBe(0);
    expect(onWidthChange).toHaveBeenCalledTimes(1);
    expect(onWidthChange).toHaveBeenCalledWith(360);
  });

  it("goes back to the app's width on double-click, and follows a new width from the app", () => {
    // Arrange
    const onWidthChange = vi.fn();
    const { rerender } = render(panel({ resizable: true, width: 300, onWidthChange }));
    const handle = screen.getByRole("separator", { name: "Resize YAML" });
    const aside = screen.getByRole("complementary", { name: "YAML" });
    fireEvent.keyDown(handle, { key: "End" });

    // Act
    fireEvent.doubleClick(handle);
    const afterReset = aside.style.getPropertyValue("--tx-side-panel-width");
    rerender(panel({ resizable: true, width: 420, onWidthChange }));

    // Assert
    expect(afterReset).toBe("300px");
    expect(onWidthChange).toHaveBeenLastCalledWith(300);
    expect(aside.style.getPropertyValue("--tx-side-panel-width")).toBe("420px");
  });
});

describe("@toyonix/web-kit/codemirror", () => {
  it("themes an editor", async () => {
    // Arrange
    const { EditorView } = await import("@codemirror/view");
    const { toyonixTheme } = await import("../src/codemirror");
    const parent = document.createElement("div");

    // Act
    const view = new EditorView({ parent, doc: "key: value", extensions: [toyonixTheme] });

    // Assert: the theme class is applied, and it is marked dark (the code background is dark)
    expect(view.dom.className.split(" ").length).toBeGreaterThan(1);
    expect(view.state.facet(EditorView.darkTheme)).toBe(true);
    view.destroy();
  });
});
