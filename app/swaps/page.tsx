"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ShiftCard } from "@/components/shifts/ShiftCard";
import { OfferSwapModal } from "@/components/swaps/OfferSwapModal";
import { SwapRequestCard } from "@/components/swaps/SwapRequestCard";
import { useSwapStore } from "@/context/SwapStoreContext";
import type { Shift } from "@/lib/mock/types";

function SwapActionButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-600 dark:bg-teal-500 dark:hover:bg-teal-400"
    >
      {children}
    </button>
  );
}

export default function SwapsPage() {
  const {
    getOpenSwaps,
    getEmployee,
    getPendingRequestsForMe,
    getMyOutgoingRequests,
    swapRequests,
  } = useSwapStore();
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const openSwaps = getOpenSwaps();
  const incomingRequests = getPendingRequestsForMe();
  const outgoingRequests = getMyOutgoingRequests();
  const recentHistory = swapRequests.filter(
    (request) => request.status !== "pending",
  );

  return (
    <AppShell
      title="Swap Board"
      description="Browse open shifts, respond to requests, and track completed swap activity."
    >
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Open shifts</h2>
        {openSwaps.length > 0 ? (
          <div className="grid gap-4">
            {openSwaps.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                employeeName={getEmployee(shift.employeeId)?.name}
                actions={
                  <SwapActionButton onClick={() => setSelectedShift(shift)}>
                    Request swap
                  </SwapActionButton>
                }
              />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-400">
            No coworkers have posted open shifts right now.
          </p>
        )}
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Incoming requests</h2>
        {incomingRequests.length > 0 ? (
          <div className="grid gap-4">
            {incomingRequests.map((request) => (
              <SwapRequestCard key={request.id} request={request} mode="incoming" />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-400">
            No incoming swap requests at the moment.
          </p>
        )}
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Outgoing requests</h2>
        {outgoingRequests.length > 0 ? (
          <div className="grid gap-4">
            {outgoingRequests.map((request) => (
              <SwapRequestCard key={request.id} request={request} mode="outgoing" />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-400">
            You haven&apos;t sent any pending swap requests.
          </p>
        )}
      </section>

      {recentHistory.length > 0 ? (
        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold">Recent activity</h2>
          <div className="grid gap-4">
            {recentHistory.map((request) => (
              <SwapRequestCard key={request.id} request={request} mode="history" />
            ))}
          </div>
        </section>
      ) : null}

      {selectedShift ? (
        <OfferSwapModal
          targetShift={selectedShift}
          onClose={() => setSelectedShift(null)}
        />
      ) : null}
    </AppShell>
  );
}
