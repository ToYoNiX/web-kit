import type { ComponentProps } from "react";
import { appHref } from "../env";

export interface AppLinkProps extends Omit<ComponentProps<"a">, "href"> {
  /** Target app id: a repo name, or "root". */
  app: string;
  /** Path inside that app. Defaults to its home page. */
  path?: string;
}

/** A link to another toyonix app. Always a full page load, never client-side navigation. */
export function AppLink({ app, path, ...props }: AppLinkProps) {
  return <a href={appHref(app, path)} {...props} />;
}
