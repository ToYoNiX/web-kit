"use client";

import { yaml } from "@codemirror/lang-yaml";
import { EditorView } from "@codemirror/view";
import { toyonixTheme } from "@toyonix/web-kit/codemirror";
import { basicSetup } from "codemirror";
import { useEffect, useRef } from "react";

/** A CodeMirror editor styled with the kit's theme (@toyonix/web-kit/codemirror). */
export function CodeEditor({ doc, label }: { doc: string; label: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    const view = new EditorView({
      parent: host.current,
      doc,
      extensions: [
        basicSetup,
        yaml(),
        toyonixTheme,
        EditorView.contentAttributes.of({ "aria-label": label }),
      ],
    });
    return () => view.destroy();
  }, [doc, label]);
  return <div ref={host} className="h-full" />;
}
