"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Button,
  ButtonRow,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleIcon,
  CloseIcon,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  CopyIcon,
  CornerIcon,
  CursorIcon,
  DownloadIcon,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  Field,
  FitIcon,
  GridIcon,
  HandIcon,
  IconButton,
  Input,
  Kbd,
  LayersIcon,
  LinkIcon,
  MagnetIcon,
  MenuIcon,
  MinusIcon,
  MoreIcon,
  MoveIcon,
  PanelLeftIcon,
  PanelRightIcon,
  PathIcon,
  PillIcon,
  PlusIcon,
  PolygonIcon,
  RectangleIcon,
  RedoIcon,
  RotateIcon,
  RoundedRectangleIcon,
  SearchIcon,
  Select,
  Spacer,
  Stack,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  TrashIcon,
  UndoIcon,
  UploadIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "@toyonix/web-kit/react";

const ICONS = {
  PlusIcon,
  MinusIcon,
  CloseIcon,
  CheckIcon,
  UndoIcon,
  RedoIcon,
  CopyIcon,
  TrashIcon,
  DownloadIcon,
  UploadIcon,
  SearchIcon,
  ZoomInIcon,
  ZoomOutIcon,
  LinkIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon,
  MoreIcon,
  PanelLeftIcon,
  PanelRightIcon,
  CursorIcon,
  MoveIcon,
  HandIcon,
  FitIcon,
  GridIcon,
  MagnetIcon,
  RotateIcon,
  LayersIcon,
  CornerIcon,
  RectangleIcon,
  RoundedRectangleIcon,
  CircleIcon,
  PolygonIcon,
  PillIcon,
  PathIcon,
};

/** Tool-page controls, shown on a normal page. The full layout is on /workspace/. */
export function ToolUiDemo() {
  const [tool, setTool] = useState("select");
  const [grid, setGrid] = useState(true);
  const [units, setUnits] = useState("mm");
  const [operation, setOperation] = useState("add");

  return (
    <Stack>
      <p className="text-text-muted">
        For tool pages such as editors. See them together in the{" "}
        <Link href="/workspace/">workspace demo</Link>: full window, side panels that slide closed.
      </p>
      <div>
        <p className="tx-label mb-2.5">Toolbar: icon buttons with tooltips, a toggle, a menu</p>
        <Toolbar aria-label="Demo tools" className="border-[2.5px] border-border">
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
          <ToolbarSeparator />
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
              <DropdownMenuItem icon={<PlusIcon />} description="hexagon">
                Polygon
              </DropdownMenuItem>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ToolbarButton asChild>
                <IconButton label="View options">
                  <MoreIcon />
                </IconButton>
              </ToolbarButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem checked={grid} onCheckedChange={setGrid} shortcut="Ctrl '">
                Show grid
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Units</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={units} onValueChange={setUnits}>
                <DropdownMenuRadioItem value="mm">Millimetres</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="u" description="19.05 mm keyboard units">
                  Key units
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </Toolbar>
      </div>

      <div className="tx-grid-2">
        <div className="tx-compact grid gap-3">
          <p className="tx-label">Compact fields (any container with tx-compact)</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Shift x">
              <Input defaultValue="11.5" inputMode="decimal" suffix="mm" />
            </Field>
            <Field label="Rotate">
              <Input defaultValue="0" inputMode="decimal" suffix="°" />
            </Field>
          </div>
          <Field label="Outline">
            <Select defaultValue="switch_plate">
              <option>switch_plate</option>
              <option>board_edge</option>
            </Select>
          </Field>
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
        </div>
        <Stack className="gap-4">
          <div>
            <p className="tx-label mb-2.5">Sizes</p>
            <ButtonRow>
              <Button>Regular</Button>
              <Button size="sm">Small</Button>
              <Button size="sm" variant="secondary">
                <DownloadIcon /> Export
              </Button>
              <IconButton label="Copy link">
                <LinkIcon />
              </IconButton>
              <IconButton label="Close" size="sm">
                <CloseIcon />
              </IconButton>
            </ButtonRow>
          </div>
          <div>
            <p className="tx-label mb-2.5">Context menu</p>
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <div className="grid h-28 place-items-center border-[2.5px] border-dashed border-border text-text-muted">
                  right-click here
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-64">
                <ContextMenuLabel>board_edge · rectangle</ContextMenuLabel>
                <ContextMenuSeparator />
                <ContextMenuItem shortcut="R">Round all corners…</ContextMenuItem>
                <ContextMenuSub>
                  <ContextMenuSubTrigger>Round this corner</ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    <ContextMenuItem>Top left</ContextMenuItem>
                    <ContextMenuItem>Top right</ContextMenuItem>
                    <ContextMenuItem>Bottom right</ContextMenuItem>
                    <ContextMenuItem>Bottom left</ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuSeparator />
                <ContextMenuItem icon={<CopyIcon />} shortcut="Ctrl D">
                  Duplicate
                </ContextMenuItem>
                <ContextMenuItem icon={<TrashIcon />} shortcut="Del" tone="danger">
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>
        </Stack>
      </div>

      <div>
        <p className="tx-label mb-2.5">Icons</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
          {Object.entries(ICONS).map(([name, Icon]) => (
            <div key={name} className="flex items-center gap-2.5 font-mono text-xs">
              <Icon className="size-6" />
              {name}
            </div>
          ))}
        </div>
      </div>
    </Stack>
  );
}
