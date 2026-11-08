/**
 * @toyonix/web-kit/codemirror: CodeMirror 6 styling from the kit's tokens, so editors follow
 * the toyonix theme (light/dark included) like the static CodeBlock does.
 *
 *   new EditorView({ extensions: [basicSetup, yaml(), toyonixTheme] })
 *
 * Needs `@codemirror/view`, `@codemirror/language`, `@codemirror/state` and `@lezer/highlight`
 * (optional peer dependencies: only sites with an editor install them).
 */
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";

// The code background is dark in both themes, so secondary text is mixed from the code text
// (the page's --tx-text-muted is too dark on it in the light theme).
const dim = "color-mix(in srgb, var(--tx-code-text) 55%, var(--tx-code-bg))";
const faint = "color-mix(in srgb, var(--tx-code-text) 20%, var(--tx-code-bg))";
const accentWash = (percent: number) => `color-mix(in srgb, var(--tx-accent) ${percent}%, transparent)`;

/** Editor chrome: colors, fonts, gutters, cursor, selection, panels and tooltips. */
export const toyonixEditorTheme: Extension = EditorView.theme(
  {
    "&": {
      height: "100%",
      color: "var(--tx-code-text)",
      backgroundColor: "var(--tx-code-bg)",
      fontSize: "0.875rem",
    },
    "&.cm-focused": { outline: "var(--tx-border-width) solid var(--tx-ring)", outlineOffset: "-2px" },
    ".cm-scroller": { fontFamily: "var(--tx-font-mono)", lineHeight: "1.6" },
    ".cm-content": { caretColor: "var(--tx-accent)" },
    ".cm-cursor, .cm-dropCursor": { borderLeft: "2px solid var(--tx-accent)" },
    ".cm-gutters": {
      color: dim,
      backgroundColor: "var(--tx-code-bg)",
      borderRight: `1px solid ${faint}`,
    },
    ".cm-activeLine": { backgroundColor: accentWash(8) },
    ".cm-activeLineGutter": { backgroundColor: accentWash(8), color: "var(--tx-code-text)" },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: accentWash(30) },
    ".cm-selectionMatch": { backgroundColor: accentWash(15) },
    ".cm-searchMatch": { backgroundColor: "color-mix(in srgb, var(--tx-code-key) 30%, transparent)" },
    ".cm-searchMatch.cm-searchMatch-selected": { backgroundColor: accentWash(45) },
    "&.cm-focused .cm-matchingBracket": {
      backgroundColor: "transparent",
      outline: `1px solid ${dim}`,
    },
    ".cm-foldPlaceholder": {
      backgroundColor: faint,
      border: "none",
      color: "var(--tx-code-text)",
    },
    ".cm-panels": {
      backgroundColor: "var(--tx-surface)",
      color: "var(--tx-text)",
      fontFamily: "var(--tx-font-sans)",
    },
    ".cm-panels.cm-panels-top": { borderBottom: "var(--tx-border-width) solid var(--tx-border)" },
    ".cm-panels.cm-panels-bottom": { borderTop: "var(--tx-border-width) solid var(--tx-border)" },
    ".cm-tooltip": {
      border: "var(--tx-border-width) solid var(--tx-border)",
      backgroundColor: "var(--tx-surface)",
      color: "var(--tx-text)",
      boxShadow: "var(--tx-btn-shadow)",
    },
    ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
      backgroundColor: "var(--tx-accent)",
      color: "var(--tx-accent-contrast)",
    },
    ".cm-diagnostic-error": { borderLeftColor: "var(--tx-danger)" },
    ".cm-diagnostic-warning": { borderLeftColor: "var(--tx-warning)" },
    ".cm-lintRange-error": { textDecoration: "underline wavy var(--tx-danger)" },
  },
  { dark: true },
);

/** Syntax colors: the riso trio on the code background (keys yellow, strings pink, values blue). */
export const toyonixHighlightStyle: HighlightStyle = HighlightStyle.define([
  {
    tag: [tags.propertyName, tags.definition(tags.propertyName), tags.attributeName],
    color: "var(--tx-code-key)",
  },
  { tag: [tags.string, tags.special(tags.string), tags.regexp], color: "var(--tx-code-string)" },
  {
    tag: [tags.number, tags.bool, tags.null, tags.atom, tags.unit, tags.color],
    color: "var(--tx-card-3)",
  },
  {
    tag: [tags.keyword, tags.controlKeyword, tags.operatorKeyword, tags.modifier],
    color: "var(--tx-accent)",
    fontWeight: "700",
  },
  { tag: [tags.typeName, tags.className, tags.namespace, tags.tagName], color: "var(--tx-card-3)" },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: "var(--tx-code-key)" },
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: dim, fontStyle: "italic" },
  { tag: [tags.meta, tags.punctuation, tags.separator, tags.operator, tags.bracket], color: dim },
  { tag: tags.heading, color: "var(--tx-code-key)", fontWeight: "700" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strong, fontWeight: "700" },
  { tag: [tags.link, tags.url], color: "var(--tx-card-3)", textDecoration: "underline" },
  { tag: tags.invalid, color: "var(--tx-danger)" },
]);

/** Both of the above: add this one extension to an editor. */
export const toyonixTheme: Extension = [toyonixEditorTheme, syntaxHighlighting(toyonixHighlightStyle)];
