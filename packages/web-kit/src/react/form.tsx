import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";

export function Form({ className, ...props }: ComponentProps<"form">) {
  return <form className={cx("tx-form", className)} {...props} />;
}

/** A labelled field: the label wraps the control, so no id wiring is needed. */
export function Field({
  label,
  hint,
  className,
  children,
  ...props
}: ComponentProps<"label"> & { label: ReactNode; hint?: ReactNode }) {
  return (
    <label className={cx("tx-field", className)} {...props}>
      <span className="tx-label">{label}</span>
      {children}
      {hint ? <span className="tx-hint">{hint}</span> : null}
    </label>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cx("tx-input", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cx("tx-select", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cx("tx-textarea", className)} {...props} />;
}

type ChoiceProps = Omit<ComponentProps<"input">, "type"> & { label: ReactNode };

export function Checkbox({ label, className, ...props }: ChoiceProps) {
  return (
    <label className={cx("tx-check", className)}>
      <input type="checkbox" {...props} />
      {label}
    </label>
  );
}

export function Radio({ label, className, ...props }: ChoiceProps) {
  return (
    <label className={cx("tx-check", className)}>
      <input type="radio" {...props} />
      {label}
    </label>
  );
}

export function Switch({ label, className, ...props }: ChoiceProps) {
  return (
    <label className={cx("tx-check", className)}>
      <input type="checkbox" role="switch" className="tx-switch" {...props} />
      {label}
    </label>
  );
}
