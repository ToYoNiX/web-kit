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
export { Container, Row, Section, Stack } from "./layout";
export { Display, Eyebrow, Lead, Mark, Prose, SectionLabel } from "./typography";

// primitives
export {
  Button,
  ButtonRow,
  LinkButton,
  type ButtonProps,
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
export { Checkbox, Field, Form, Input, Radio, Select, Switch, Textarea } from "./form";
export { Table } from "./Table";
export { CodeBlock } from "./CodeBlock";

// overlays (Radix)
export { Dialog, DialogClose, DialogContent, DialogTrigger, type DialogContentProps } from "./Dialog";
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";
export { Tooltip, type TooltipProps } from "./Tooltip";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";
