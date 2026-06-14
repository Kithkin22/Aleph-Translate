"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ShiftCard } from "@/components/shifts/ShiftCard";
import { useSwapStore } from "@/context/SwapStoreContext";
import { isUpcomingShift } from "@/lib/mock/format";

function ShiftActionButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
}) {
  const styles = {
    primary:
      "bg-teal-700 text-white hover:bg-teal-600 dark:bg-teal-500 dark:hover:bg-teal-400",
    secondary:
      "border border-stone-300 bg-white text-stone-700 hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200",
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

export default function MyShiftsPage() {
  const { getMyShifts, offerShiftForSwap, cancelOpenShift } = useSwapStore();
  const myShifts = getMyShifts().filter((shift) => isUpcomingShift(shift.date));

  return (
    <AppShell
      title="My Shifts"
      description="See your schedule and mark shifts as open when you need coverage."
    >
      {myShifts.length > 0 ? (
        <div className="grid gap-4">
          {myShifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              actions={
                shift.status === "scheduled" ? (
                  <ShiftActionButton onClick={() => offerShiftForSwap(shift.id)}>
                    Offer for swap
                  </ShiftActionButton>
                ) : shift.status === "open_for_swap" ? (
                  <ShiftActionButton
                    variant="secondary"
                    onClick={() => cancelOpenShift(shift.id)}
                  >
                    Remove from board
                  </ShiftActionButton>
                ) : (
                  <p className="text-sm text-stone-500">
                    Waiting on a pending swap request.
                  </p>
                )
              }
            />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-400">
          You don&apos;t have any upcoming shifts in the mock schedule.
        </p>
      )}
    </AppShell>
  );
}
