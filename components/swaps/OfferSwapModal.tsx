"use client";

import { useState } from "react";
import { useSwapStore } from "@/context/SwapStoreContext";
import { formatShiftDate, formatShiftTime } from "@/lib/mock/format";
import type { Shift } from "@/lib/mock/types";

export function OfferSwapModal({
  targetShift,
  onClose,
}: {
  targetShift: Shift;
  onClose: () => void;
}) {
  const { getMyShifts, getEmployee, requestSwap } = useSwapStore();
  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [message, setMessage] = useState("");

  const availableShifts = getMyShifts().filter(
    (shift) => shift.status === "scheduled" || shift.status === "open_for_swap",
  );
  const owner = getEmployee(targetShift.employeeId);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedShiftId) {
      return;
    }

    requestSwap({
      myShiftId: selectedShiftId,
      targetShiftId: targetShift.id,
      message: message.trim() || undefined,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/50 p-4 sm:items-center">
      <div
        className="absolute inset-0"
        aria-hidden
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 shadow-xl dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Request this swap</h2>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Offer one of your shifts for {owner?.name ?? "this coworker"}&apos;s{" "}
              {targetShift.role} on {formatShiftDate(targetShift.date)}.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Close
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Your shift to offer</span>
            <select
              value={selectedShiftId}
              onChange={(event) => setSelectedShiftId(event.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm dark:border-stone-700 dark:bg-stone-950"
              required
            >
              <option value="">Select a shift</option>
              {availableShifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {formatShiftDate(shift.date)} · {formatShiftTime(shift.startTime, shift.endTime)} · {shift.role}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Message (optional)</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={3}
              placeholder="Share why you want to swap."
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
          </label>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 dark:bg-teal-500 dark:hover:bg-teal-400"
            >
              Send swap request
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 dark:border-stone-700 dark:text-stone-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
