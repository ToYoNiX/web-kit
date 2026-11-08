/**
 * @toyonix/web-kit/react: components and hooks. No Next.js imports, so it works in any React app.
 */
export { cx } from "./cx";

// shell & theme
export { AppShell, type AppShellProps } from "./AppShell";
export { AppLink, type AppLinkProps } from "./AppLink";
export { ThemeScript } from "./ThemeScript";
export { ThemeToggle } from "./ThemeToggle";
export { useTheme, type ThemeState } from "./use-theme";
export { useRegistry } from "./use-registry";

// layout & type
export { Container, Row, Section, Spacer, Stack } from "./layout";
export { Display, Eyebrow, Kbd, Lead, Mark, Prose, SectionLabel } from "./typography";

// primitives
export {
  Button,
  ButtonRow,
  LinkButton,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
  type LinkButtonProps,
} from "./Button";
export {
  Card,
  CardBody,
  CardCta,
  CardGrid,
  CardMeta,
  CardTitle,
  CardTop,
  LinkCard,
  type CardProps,
} from "./Card";
export { Badge, Badges, Tag, Tags, type BadgeTone } from "./Badge";
export { Alert, type AlertTone } from "./Alert";
export { Checkbox, Field, Form, Input, Radio, Select, Switch, Textarea, type InputProps } from "./form";
export { IconButton, type IconButtonProps } from "./IconButton";
export { Table } from "./Table";
export { CodeBlock } from "./CodeBlock";

// overlays (Radix)
export { Dialog, DialogClose, DialogContent, DialogTrigger, type DialogContentProps } from "./Dialog";
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  type DropdownMenuCheckboxItemProps,
  type DropdownMenuItemProps,
  type DropdownMenuRadioItemProps,
  type DropdownMenuSubTriggerProps,
} from "./DropdownMenu";
export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  type ContextMenuCheckboxItemProps,
  type ContextMenuItemProps,
  type ContextMenuRadioItemProps,
  type ContextMenuSubTriggerProps,
} from "./ContextMenu";
export type { MenuItemExtras } from "./menu-item";
export { Tooltip, type TooltipProps } from "./Tooltip";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";
export { ToggleGroup, ToggleGroupItem } from "./ToggleGroup";
export { TreeList, type TreeListItem, type TreeListProps } from "./TreeList";

// tool pages (use with <AppShell layout="app">)
export { Toolbar, ToolbarButton, ToolbarSeparator, type ToolbarButtonProps } from "./Toolbar";
export {
  SidePanel,
  StatusBar,
  Workspace,
  WorkspaceBody,
  WorkspaceMain,
  type SidePanelProps,
} from "./Workspace";

// icons (decorative: label the button around them)
export {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleIcon,
  CloseIcon,
  CopyIcon,
  CornerIcon,
  CursorIcon,
  DownloadIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  FitIcon,
  GridIcon,
  HandIcon,
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
  TrashIcon,
  UndoIcon,
  UploadIcon,
  ZoomInIcon,
  ZoomOutIcon,
  type IconProps,
} from "./icons";

// articles
export { TableOfContents, type TableOfContentsProps, type TocItem } from "./TableOfContents";
