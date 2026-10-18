import { THEME_SCRIPT } from "../theme";

/**
 * Put in <head> of the root layout. Sets html[data-theme] before first paint so there's no
 * flash of the wrong theme. Pair it with <html suppressHydrationWarning>.
 */
export function ThemeScript({ nonce }: { nonce?: string }) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
