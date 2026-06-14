"use client";

import { ShiftStatusBadge } from "@/components/ui/StatusBadge";
import { formatShiftDate, formatShiftTime } from "@/lib/mock/format";
import type { Shift } from "@/lib/mock/types";

export function ShiftCard({
  shift,
  employeeName,
  actions,
}: {
  shift: Shift;
  employeeName?: string;
  actions?: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{shift.role}</h3>
            <ShiftStatusBadge status={shift.status} />
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {formatShiftDate(shift.date)} · {formatShiftTime(shift.startTime, shift.endTime)}
          </p>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {shift.location}
            {employeeName ? ` · ${employeeName}` : ""}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </article>
  );
}
