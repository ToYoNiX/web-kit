"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  moveTreeItem,
  UndoIcon,
  Workspace,
  WorkspaceBody,
  WorkspaceMain,
  CircleIcon,
  FitIcon,
  HandIcon,
  PillIcon,
  RectangleIcon,
  RoundedRectangleIcon,
  ZoomInIcon,
  ZoomOutIcon,
  type CanvasApi,
  type CanvasPoint,
  type TreeListItem,
} from "@toyonix/web-kit/react";
import { CodeEditor } from "./code-editor";
import { ShapeCanvas } from "./shape-canvas";

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

export default function WorkspaceDemo() {
  const [left, setLeft] = useState(true);
  const [right, setRight] = useState(true);
  const [tool, setTool] = useState<"select" | "pan">("select");
  const [operation, setOperation] = useState("add");
  const [cursor, setCursor] = useState<CanvasPoint | null>(null);
  const [zoom, setZoom] = useState<number | null>(null);
  const canvas = useRef<CanvasApi>(null);
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
            <HandIcon />
          </IconButton>
        </ToolbarButton>
        <ToolbarButton asChild>
          <IconButton label="Zoom out" onClick={() => canvas.current?.zoomOut()}>
            <ZoomOutIcon />
          </IconButton>
        </ToolbarButton>
        <ToolbarButton asChild>
          <IconButton label="Zoom in" onClick={() => canvas.current?.zoomIn()}>
            <ZoomInIcon />
          </IconButton>
        </ToolbarButton>
        <ToolbarButton asChild>
          <IconButton label="Fit the drawing" onClick={() => canvas.current?.fit()}>
            <FitIcon />
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
            <DropdownMenuItem icon={<RectangleIcon />}>Rectangle</DropdownMenuItem>
            <DropdownMenuItem icon={<RoundedRectangleIcon />}>Rounded rectangle</DropdownMenuItem>
            <DropdownMenuItem icon={<CircleIcon />}>Circle</DropdownMenuItem>
            <DropdownMenuItem icon={<PillIcon />}>Pill / slot</DropdownMenuItem>
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
              <div className="flex min-h-0 flex-1">
                <ShapeCanvas ref={canvas} tool={tool} onCursorMove={setCursor} onZoom={setZoom} />
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
                onMove={(id, index) => setLayers((current) => moveTreeItem(current, id, index))}
              />
              <p className="text-sm text-text-muted">
                Drag a row, or select it and press <Kbd>Alt ↑</Kbd> / <Kbd>Alt ↓</Kbd>.
              </p>
            </TabsContent>
          </Tabs>
        </SidePanel>
      </WorkspaceBody>

      <StatusBar>
        <span>{cursor ? `x ${cursor.x.toFixed(1)} · y ${cursor.y.toFixed(1)} mm` : "x – · y –"}</span>
        <span>tool: {tool}</span>
        {/* 100% is real size: 1 mm is 96 / 25.4 px on a standard screen. */}
        <span>{zoom ? `${Math.round((zoom / (96 / 25.4)) * 100)}%` : "fit"}</span>
        <Spacer />
        <span>Alt 1 / Alt 2 toggle the panels</span>
      </StatusBar>
    </Workspace>
  );
}
