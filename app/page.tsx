"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ShiftCard } from "@/components/shifts/ShiftCard";
import { SwapRequestCard } from "@/components/swaps/SwapRequestCard";
import { useSwapStore } from "@/context/SwapStoreContext";
import { formatShiftDate, formatShiftTime, isUpcomingShift } from "@/lib/mock/format";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{hint}</p>
    </div>
  );
}

export default function DashboardPage() {
  const {
    currentUser,
    getMyShifts,
    getOpenSwaps,
    getPendingRequestsForMe,
    getMyOutgoingRequests,
  } = useSwapStore();

  const upcomingShifts = getMyShifts()
    .filter((shift) => isUpcomingShift(shift.date))
    .slice(0, 3);
  const incomingRequests = getPendingRequestsForMe();
  const outgoingRequests = getMyOutgoingRequests();

  return (
    <AppShell
      title={`Welcome back, ${currentUser.name.split(" ")[0]}`}
      description="Review your upcoming shifts, respond to swap requests, and browse open shifts from your team."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Upcoming shifts"
          value={getMyShifts().filter((shift) => isUpcomingShift(shift.date)).length}
          hint="Shifts assigned to you in the next two weeks."
        />
        <StatCard
          label="Requests for you"
          value={incomingRequests.length}
          hint="Pending swaps waiting for your response."
        />
        <StatCard
          label="Open team swaps"
          value={getOpenSwaps().length}
          hint="Shifts coworkers have posted for swap."
        />
      </div>

      <section className="mt-10 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Upcoming shifts</h2>
          <Link
            href="/my-shifts"
            className="text-sm font-medium text-teal-700 hover:text-teal-600 dark:text-teal-300"
          >
            View all
          </Link>
        </div>
        {upcomingShifts.length > 0 ? (
          <div className="grid gap-4">
            {upcomingShifts.map((shift) => (
              <ShiftCard key={shift.id} shift={shift} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-400">
            No upcoming shifts on your schedule.
          </p>
        )}
      </section>

      <section className="mt-10 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Needs your response</h2>
          <Link
            href="/swaps"
            className="text-sm font-medium text-teal-700 hover:text-teal-600 dark:text-teal-300"
          >
            Manage swaps
          </Link>
        </div>
        {incomingRequests.length > 0 ? (
          <div className="grid gap-4">
            {incomingRequests.map((request) => (
              <SwapRequestCard key={request.id} request={request} mode="incoming" />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-400">
            You&apos;re all caught up. No pending swap requests right now.
          </p>
        )}
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/my-shifts"
            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-teal-500 dark:border-stone-800 dark:bg-stone-900"
          >
            <p className="font-semibold">Offer one of your shifts</p>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              Mark a shift as open so teammates can request a swap.
            </p>
          </Link>
          <Link
            href="/swaps"
            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-teal-500 dark:border-stone-800 dark:bg-stone-900"
          >
            <p className="font-semibold">Browse open swaps</p>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              {getOpenSwaps()[0]
                ? `Next open shift: ${formatShiftDate(getOpenSwaps()[0].date)} · ${formatShiftTime(getOpenSwaps()[0].startTime, getOpenSwaps()[0].endTime)}`
                : "No open shifts posted yet."}
            </p>
          </Link>
        </div>
      </section>

      {outgoingRequests.length > 0 ? (
        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold">Your outgoing requests</h2>
          <div className="grid gap-4">
            {outgoingRequests.map((request) => (
              <SwapRequestCard key={request.id} request={request} mode="outgoing" />
            ))}
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
