"use client";

import { SwapStatusBadge } from "@/components/ui/StatusBadge";
import { useSwapStore } from "@/context/SwapStoreContext";
import { formatRelativeTime, formatShiftDate, formatShiftTime } from "@/lib/mock/format";
import type { SwapRequest } from "@/lib/mock/types";

function ActionButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
}) {
  const styles = {
    primary:
      "bg-teal-700 text-white hover:bg-teal-600 dark:bg-teal-500 dark:hover:bg-teal-400",
    secondary:
      "border border-stone-300 bg-white text-stone-700 hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200",
    danger:
      "border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

export function SwapRequestCard({
  request,
  mode,
}: {
  request: SwapRequest;
  mode: "incoming" | "outgoing" | "history";
}) {
  const {
    getEmployee,
    getShift,
    respondToRequest,
    cancelRequest,
    currentUserId,
  } = useSwapStore();

  const requesterShift = getShift(request.requesterShiftId);
  const targetShift = request.targetShiftId
    ? getShift(request.targetShiftId)
    : undefined;
  const requester = getEmployee(request.requesterId);
  const targetEmployee = request.targetEmployeeId
    ? getEmployee(request.targetEmployeeId)
    : undefined;

  if (!requesterShift || !requester) {
    return null;
  }

  const counterparty =
    request.requesterId === currentUserId ? targetEmployee : requester;

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold">
          {mode === "incoming"
            ? `Request from ${requester.name}`
            : mode === "outgoing"
              ? `Request to ${counterparty?.name ?? "coworker"}`
              : `Swap with ${counterparty?.name ?? "coworker"}`}
        </h3>
        <SwapStatusBadge status={request.status} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-stone-50 p-4 dark:bg-stone-950">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Offered shift
          </p>
          <p className="mt-2 font-medium">{requesterShift.role}</p>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {formatShiftDate(requesterShift.date)} ·{" "}
            {formatShiftTime(requesterShift.startTime, requesterShift.endTime)}
          </p>
        </div>
        {targetShift ? (
          <div className="rounded-xl bg-stone-50 p-4 dark:bg-stone-950">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Requested shift
            </p>
            <p className="mt-2 font-medium">{targetShift.role}</p>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {formatShiftDate(targetShift.date)} ·{" "}
              {formatShiftTime(targetShift.startTime, targetShift.endTime)}
            </p>
          </div>
        ) : null}
      </div>

      {request.message ? (
        <p className="mt-4 rounded-xl border border-dashed border-stone-300 px-4 py-3 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-400">
          {request.message}
        </p>
      ) : null}

      <p className="mt-4 text-xs text-stone-500">
        Requested {formatRelativeTime(request.createdAt)}
      </p>

      {mode === "incoming" && request.status === "pending" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton onClick={() => respondToRequest(request.id, "accepted")}>
            Accept swap
          </ActionButton>
          <ActionButton
            variant="danger"
            onClick={() => respondToRequest(request.id, "declined")}
          >
            Decline
          </ActionButton>
        </div>
      ) : null}

      {mode === "outgoing" && request.status === "pending" ? (
        <div className="mt-4">
          <ActionButton variant="secondary" onClick={() => cancelRequest(request.id)}>
            Cancel request
          </ActionButton>
        </div>
      ) : null}
    </article>
  );
}
