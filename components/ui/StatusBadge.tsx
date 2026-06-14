import type { ShiftStatus, SwapRequestStatus } from "@/lib/mock/types";

const shiftStatusStyles: Record<
  ShiftStatus,
  { label: string; className: string }
> = {
  scheduled: {
    label: "Scheduled",
    className:
      "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200",
  },
  open_for_swap: {
    label: "Open for swap",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  },
  swap_pending: {
    label: "Swap pending",
    className:
      "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  },
};

const swapStatusStyles: Record<
  SwapRequestStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className:
      "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  },
  accepted: {
    label: "Accepted",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  },
  declined: {
    label: "Declined",
    className:
      "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  },
};

export function ShiftStatusBadge({ status }: { status: ShiftStatus }) {
  const config = shiftStatusStyles[status];
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export function SwapStatusBadge({ status }: { status: SwapRequestStatus }) {
  const config = swapStatusStyles[status];
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
