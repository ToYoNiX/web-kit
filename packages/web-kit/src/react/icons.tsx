import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";

export type IconProps = ComponentProps<"svg">;

/**
 * Builds an icon in the kit's line style: 24×24, 2px strokes in currentColor, square ends and
 * sharp joins (the zine look). Icons are decorative: give the button around them a label.
 */
function icon(name: string, body: ReactNode) {
  function Icon({ className, ...props }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="square"
        strokeLinejoin="miter"
        aria-hidden="true"
        focusable="false"
        className={cx("tx-icon", className)}
        {...props}
      >
        {body}
      </svg>
    );
  }
  Icon.displayName = name;
  return Icon;
}

const dots = (
  <>
    <rect x="3.5" y="10.5" width="3" height="3" fill="currentColor" stroke="none" />
    <rect x="10.5" y="10.5" width="3" height="3" fill="currentColor" stroke="none" />
    <rect x="17.5" y="10.5" width="3" height="3" fill="currentColor" stroke="none" />
  </>
);

// actions
export const PlusIcon = icon("PlusIcon", <path d="M12 5v14M5 12h14" />);
export const MinusIcon = icon("MinusIcon", <path d="M5 12h14" />);
export const CloseIcon = icon("CloseIcon", <path d="m6 6 12 12M18 6 6 18" />);
export const CheckIcon = icon("CheckIcon", <path d="m5 12.5 4.5 4.5L19 7" />);
export const UndoIcon = icon(
  "UndoIcon",
  <>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h11a5 5 0 0 1 0 10h-4" />
  </>,
);
export const RedoIcon = icon(
  "RedoIcon",
  <>
    <path d="m15 14 5-5-5-5" />
    <path d="M20 9H9a5 5 0 0 0 0 10h4" />
  </>,
);
export const CopyIcon = icon(
  "CopyIcon",
  <>
    <rect x="8" y="8" width="12" height="12" />
    <path d="M16 8V4H4v12h4" />
  </>,
);
export const TrashIcon = icon("TrashIcon", <path d="M4 7h16M10 3h4M6 7l1 14h10l1-14M10 11v6M14 11v6" />);
export const DownloadIcon = icon("DownloadIcon", <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />);
export const UploadIcon = icon("UploadIcon", <path d="M12 16V5M7 10l5-5 5 5M5 20h14" />);
export const SearchIcon = icon(
  "SearchIcon",
  <>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  </>,
);
export const ZoomInIcon = icon(
  "ZoomInIcon",
  <>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5M10.5 7.5v6M7.5 10.5h6" />
  </>,
);
export const ZoomOutIcon = icon(
  "ZoomOutIcon",
  <>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5M7.5 10.5h6" />
  </>,
);
export const LinkIcon = icon(
  "LinkIcon",
  <>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </>,
);
export const ExternalLinkIcon = icon("ExternalLinkIcon", <path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" />);
export const EyeIcon = icon(
  "EyeIcon",
  <>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </>,
);
export const EyeOffIcon = icon(
  "EyeOffIcon",
  <>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    <path d="m4 4 16 16" />
  </>,
);

// navigation
export const ChevronDownIcon = icon("ChevronDownIcon", <path d="m6 9 6 6 6-6" />);
export const ChevronUpIcon = icon("ChevronUpIcon", <path d="m6 15 6-6 6 6" />);
export const ChevronLeftIcon = icon("ChevronLeftIcon", <path d="m15 6-6 6 6 6" />);
export const ChevronRightIcon = icon("ChevronRightIcon", <path d="m9 6 6 6-6 6" />);
export const MenuIcon = icon("MenuIcon", <path d="M4 6h16M4 12h16M4 18h16" />);
export const MoreIcon = icon("MoreIcon", dots);

// workspace
export const PanelLeftIcon = icon(
  "PanelLeftIcon",
  <>
    <rect x="3" y="4" width="18" height="16" />
    <path d="M9 4v16" />
  </>,
);
export const PanelRightIcon = icon(
  "PanelRightIcon",
  <>
    <rect x="3" y="4" width="18" height="16" />
    <path d="M15 4v16" />
  </>,
);
export const CursorIcon = icon("CursorIcon", <path d="M6 3v16l4-4 3.5 6.5 2.5-1.2-3.4-6.5H18Z" />);
export const MoveIcon = icon(
  "MoveIcon",
  <path d="M12 3v18M3 12h18M12 3 9 6M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3" />,
);

// canvas tools
export const HandIcon = icon(
  "HandIcon",
  <path d="M8 12V5a1.5 1.5 0 0 1 3 0v6M11 11V3.5a1.5 1.5 0 0 1 3 0V11M14 11V5.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6.5 7-2.5 0-4-1.2-5.3-3.2L3 13.6a1.5 1.5 0 0 1 2.4-1.8L8 15" />,
);
export const FitIcon = icon("FitIcon", <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />);
export const GridIcon = icon(
  "GridIcon",
  <path d="M4 4h16v16H4ZM9.33 4v16M14.67 4v16M4 9.33h16M4 14.67h16" />,
);
export const MagnetIcon = icon(
  "MagnetIcon",
  <path d="M5 4h5v8a2 2 0 0 0 4 0V4h5v8a7 7 0 0 1-14 0ZM5 8h5M14 8h5" />,
);
export const RotateIcon = icon(
  "RotateIcon",
  <>
    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    <path d="M20 4v5h-5" />
  </>,
);
export const LayersIcon = icon(
  "LayersIcon",
  <>
    <path d="m12 4 9 5-9 5-9-5Z" />
    <path d="m3 14 9 5 9-5" />
  </>,
);
/** A rounded corner: for corner radius controls. */
export const CornerIcon = icon("CornerIcon", <path d="M4 20v-7a9 9 0 0 1 9-9h7" />);

// shapes
export const RectangleIcon = icon("RectangleIcon", <rect x="4" y="6" width="16" height="12" />);
export const RoundedRectangleIcon = icon(
  "RoundedRectangleIcon",
  <rect x="4" y="6" width="16" height="12" rx="4" />,
);
export const CircleIcon = icon("CircleIcon", <circle cx="12" cy="12" r="8" />);
export const PolygonIcon = icon("PolygonIcon", <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9Z" />);
export const PillIcon = icon("PillIcon", <rect x="3" y="8" width="18" height="8" rx="4" />);
/** A free path: a curve with its two end points. */
export const PathIcon = icon(
  "PathIcon",
  <>
    <path d="M5 18C7 6 17 6 19 18" />
    <rect x="3" y="17" width="4" height="4" fill="currentColor" stroke="none" />
    <rect x="17" y="17" width="4" height="4" fill="currentColor" stroke="none" />
  </>,
);
