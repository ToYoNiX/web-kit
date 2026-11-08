"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Button,
  ChevronDownIcon,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  CursorIcon,
  DownloadIcon,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Field,
  IconButton,
  Input,
  Kbd,
  MoveIcon,
  PanelLeftIcon,
  PanelRightIcon,
  PlusIcon,
  RedoIcon,
  SidePanel,
  Spacer,
  StatusBar,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ThemeToggle,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  TrashIcon,
  TreeList,
  UndoIcon,
  Workspace,
  WorkspaceBody,
  WorkspaceMain,
  type TreeListItem,
} from "@toyonix/web-kit/react";
import { CodeEditor } from "./code-editor";

const YAML = `# A config drives the canvas; edits on the canvas write back here.
outlines:
  board_edge:
    - what: rectangle
      adjust:
        ref: matrix_middle_bottom
        shift: [11.5, -40.5]
      size: [119, 100]
      fillet: 3 # rounded corners
`;

const LAYERS: TreeListItem[] = [
  { id: "plate", label: "plate_cutout", leading: "+", meta: "outline" },
  { id: "footprints", label: "key_footprints", depth: 1, leading: "+", meta: "rect ×18" },
  { id: "board", label: "board_edge", depth: 1, leading: "+", meta: "rectangle" },
  { id: "cavity", label: "controller_cavity", depth: 1, leading: "−", meta: "outline" },
  { id: "switches", label: "key_switch_cutouts", leading: "−", meta: "rect ×18" },
  { id: "holes", label: "mounting_holes", leading: "⧉", meta: "circle ×5" },
];

/** Moves the row `id` (and its children) to position `index` among its siblings. */
function moveLayer(items: TreeListItem[], id: string, index: number): TreeListItem[] {
  const depth = (item: TreeListItem | undefined) => item?.depth ?? 0;
  const from = items.findIndex((item) => item.id === id);
  const level = depth(items[from]);
  // The block: the row and the rows nested under it.
  let end = from + 1;
  while (end < items.length && depth(items[end]) > level) end++;
  const block = items.slice(from, end);
  const rest = [...items.slice(0, from), ...items.slice(end)];
  // Its siblings, in the remaining rows: same level, same parent.
  let start = from;
  while (start > 0 && depth(rest[start - 1]) >= level) start--;
  const siblings: number[] = [];
  for (let i = start; i < rest.length && depth(rest[i]) >= level; i++) {
    if (depth(rest[i]) === level) siblings.push(i);
  }
  let at = siblings[index];
  if (at === undefined) {
    // After the last sibling and everything nested under it.
    at = siblings.length > 0 ? (siblings.at(-1) ?? start) + 1 : start;
    while (at < rest.length && depth(rest[at]) > level) at++;
  }
  return [...rest.slice(0, at), ...block, ...rest.slice(at)];
}

export default function WorkspaceDemo() {
  const [left, setLeft] = useState(true);
  const [right, setRight] = useState(true);
  const [tool, setTool] = useState("select");
  const [operation, setOperation] = useState("add");
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [layers, setLayers] = useState(LAYERS);
  const [layer, setLayer] = useState<string | null>("board");

  // The kit doesn't bind keys; the page decides its shortcuts.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!event.altKey) return;
      if (event.key === "1") setLeft((open) => !open);
      if (event.key === "2") setRight((open) => !open);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Workspace>
      <Toolbar aria-label="Project">
        <ToolbarButton asChild>
          <IconButton
            label="Show or hide the YAML"
            shortcut="Alt 1"
            pressed={left}
            onClick={() => setLeft(!left)}
          >
            <PanelLeftIcon />
          </IconButton>
        </ToolbarButton>
        <ToolbarButton asChild>
          <Button asChild variant="ghost" size="sm">
            <Link href="/">← Showcase</Link>
          </Button>
        </ToolbarButton>
        <ToolbarSeparator />
        <ToolbarButton asChild>
          <IconButton
            label="Select"
            shortcut="V"
            pressed={tool === "select"}
            onClick={() => setTool("select")}
          >
            <CursorIcon />
          </IconButton>
        </ToolbarButton>
        <ToolbarButton asChild>
          <IconButton label="Pan" shortcut="H" pressed={tool === "pan"} onClick={() => setTool("pan")}>
            <MoveIcon />
          </IconButton>
        </ToolbarButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ToolbarButton variant="primary">
              <PlusIcon /> Add shape <Kbd>A</Kbd>
              <ChevronDownIcon />
            </ToolbarButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72">
            <DropdownMenuLabel>Shapes</DropdownMenuLabel>
            <DropdownMenuItem icon={<PlusIcon />}>Rectangle</DropdownMenuItem>
            <DropdownMenuItem icon={<PlusIcon />}>Circle</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Presets</DropdownMenuLabel>
            <DropdownMenuItem icon={<PlusIcon />} description="nice!nano / Pro Micro">
              MCU cutout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Spacer />
        <ToolbarButton asChild>
          <IconButton label="Undo" shortcut="Ctrl Z">
            <UndoIcon />
          </IconButton>
        </ToolbarButton>
        <ToolbarButton asChild>
          <IconButton label="Redo" shortcut="Ctrl Shift Z">
            <RedoIcon />
          </IconButton>
        </ToolbarButton>
        <ToolbarButton>
          <DownloadIcon /> Export
        </ToolbarButton>
        <ThemeToggle />
        <ToolbarButton asChild>
          <IconButton
            label="Show or hide the controls"
            shortcut="Alt 2"
            pressed={right}
            onClick={() => setRight(!right)}
          >
            <PanelRightIcon />
          </IconButton>
        </ToolbarButton>
      </Toolbar>

      <WorkspaceBody>
        <SidePanel
          side="left"
          title="YAML"
          width={380}
          resizable
          open={left}
          onOpenChange={setLeft}
          shortcut="Alt 1"
        >
          <CodeEditor doc={YAML} label="Config" />
        </SidePanel>

        <WorkspaceMain>
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div
                className="grid flex-1 place-items-center bg-bg text-text-muted"
                style={{
                  backgroundImage: "radial-gradient(var(--tx-text-muted) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
                onPointerMove={(event) => {
                  const box = event.currentTarget.getBoundingClientRect();
                  setCursor({ x: event.clientX - box.left, y: event.clientY - box.top });
                }}
              >
                <div className="border-[2.5px] border-accent bg-surface px-6 py-10 font-mono text-sm">
                  canvas · right-click for actions
                </div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-60">
              <ContextMenuItem shortcut="R">Round all corners…</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem icon={<TrashIcon />} shortcut="Del" tone="danger">
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </WorkspaceMain>

        <SidePanel
          side="right"
          title="Controls"
          resizable
          open={right}
          onOpenChange={setRight}
          shortcut="Alt 2"
        >
          <Tabs defaultValue="shape" className="p-3.5">
            <TabsList>
              <TabsTrigger value="shape">Shape</TabsTrigger>
              <TabsTrigger value="layers">Layers</TabsTrigger>
            </TabsList>
            <TabsContent value="shape" className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Shift x">
                  <Input defaultValue="11.5" inputMode="decimal" suffix="mm" />
                </Field>
                <Field label="Shift y">
                  <Input defaultValue="-40.5" inputMode="decimal" suffix="mm" />
                </Field>
                <Field label="Width">
                  <Input defaultValue="119" inputMode="decimal" suffix="mm" />
                </Field>
                <Field label="Height">
                  <Input defaultValue="100" inputMode="decimal" suffix="mm" />
                </Field>
              </div>
              <div className="grid gap-1">
                <span className="tx-label">Operation</span>
                <ToggleGroup
                  type="single"
                  value={operation}
                  onValueChange={(value) => value && setOperation(value)}
                  aria-label="Operation"
                >
                  <ToggleGroupItem value="add">Add</ToggleGroupItem>
                  <ToggleGroupItem value="subtract">Subtract</ToggleGroupItem>
                  <ToggleGroupItem value="intersect">Intersect</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </TabsContent>
            <TabsContent value="layers" className="grid gap-2">
              <TreeList
                aria-label="Shapes in switch_plate"
                items={layers}
                selected={layer}
                onSelect={setLayer}
                onMove={(id, index) => setLayers((current) => moveLayer(current, id, index))}
              />
              <p className="text-sm text-text-muted">
                Drag a row, or select it and press <Kbd>Alt ↑</Kbd> / <Kbd>Alt ↓</Kbd>.
              </p>
            </TabsContent>
          </Tabs>
        </SidePanel>
      </WorkspaceBody>

      <StatusBar>
        <span>
          x {cursor.x.toFixed(0)} · y {cursor.y.toFixed(0)} px
        </span>
        <span>tool: {tool}</span>
        <Spacer />
        <span>Alt 1 / Alt 2 toggle the panels</span>
      </StatusBar>
    </Workspace>
  );
}
