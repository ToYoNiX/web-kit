import type { ComponentProps } from "react";
import { cx } from "./cx";

/** A table in a bordered, scrollable frame. Use normal <thead>/<tbody>/<tr>/<th>/<td> inside. */
export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="tx-table-wrap">
      <table className={cx("tx-table", className)} {...props} />
    </div>
  );
}
