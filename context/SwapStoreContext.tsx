"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { initialStoreState } from "@/lib/mock/data";
import type {
  Employee,
  EmployeeId,
  Shift,
  ShiftId,
  ShiftStatus,
  SwapRequest,
  SwapRequestId,
  SwapRequestStatus,
  SwapStoreState,
} from "@/lib/mock/types";

interface SwapStoreContextValue extends SwapStoreState {
  currentUser: Employee;
  getEmployee: (id: EmployeeId) => Employee | undefined;
  getShift: (id: ShiftId) => Shift | undefined;
  getMyShifts: () => Shift[];
  getOpenSwaps: () => Shift[];
  getPendingRequestsForMe: () => SwapRequest[];
  getMyOutgoingRequests: () => SwapRequest[];
  offerShiftForSwap: (shiftId: ShiftId) => void;
  cancelOpenShift: (shiftId: ShiftId) => void;
  requestSwap: (input: {
    myShiftId: ShiftId;
    targetShiftId: ShiftId;
    message?: string;
  }) => void;
  respondToRequest: (
    requestId: SwapRequestId,
    response: Extract<SwapRequestStatus, "accepted" | "declined">,
  ) => void;
  cancelRequest: (requestId: SwapRequestId) => void;
}

const SwapStoreContext = createContext<SwapStoreContextValue | null>(null);

function updateShiftStatus(
  shifts: Shift[],
  shiftId: ShiftId,
  status: ShiftStatus,
): Shift[] {
  return shifts.map((shift) =>
    shift.id === shiftId ? { ...shift, status } : shift,
  );
}

function swapShiftOwners(
  shifts: Shift[],
  firstShiftId: ShiftId,
  secondShiftId: ShiftId,
): Shift[] {
  const first = shifts.find((shift) => shift.id === firstShiftId);
  const second = shifts.find((shift) => shift.id === secondShiftId);

  if (!first || !second) {
    return shifts;
  }

  return shifts.map((shift) => {
    if (shift.id === firstShiftId) {
      return {
        ...shift,
        employeeId: second.employeeId,
        status: "scheduled" as const,
      };
    }

    if (shift.id === secondShiftId) {
      return {
        ...shift,
        employeeId: first.employeeId,
        status: "scheduled" as const,
      };
    }

    return shift;
  });
}

export function SwapStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SwapStoreState>(initialStoreState);

  const currentUser = useMemo(() => {
    const user = state.employees.find(
      (employee) => employee.id === state.currentUserId,
    );
    if (!user) {
      throw new Error("Current user not found in mock data.");
    }
    return user;
  }, [state.currentUserId, state.employees]);

  const getEmployee = useCallback(
    (id: EmployeeId) => state.employees.find((employee) => employee.id === id),
    [state.employees],
  );

  const getShift = useCallback(
    (id: ShiftId) => state.shifts.find((shift) => shift.id === id),
    [state.shifts],
  );

  const getMyShifts = useCallback(
    () =>
      state.shifts
        .filter((shift) => shift.employeeId === state.currentUserId)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [state.currentUserId, state.shifts],
  );

  const getOpenSwaps = useCallback(
    () =>
      state.shifts
        .filter(
          (shift) =>
            shift.status === "open_for_swap" &&
            shift.employeeId !== state.currentUserId,
        )
        .sort((a, b) => a.date.localeCompare(b.date)),
    [state.currentUserId, state.shifts],
  );

  const getPendingRequestsForMe = useCallback(
    () =>
      state.swapRequests.filter(
        (request) =>
          request.status === "pending" &&
          request.targetEmployeeId === state.currentUserId,
      ),
    [state.currentUserId, state.swapRequests],
  );

  const getMyOutgoingRequests = useCallback(
    () =>
      state.swapRequests.filter(
        (request) =>
          request.requesterId === state.currentUserId &&
          request.status === "pending",
      ),
    [state.currentUserId, state.swapRequests],
  );

  const offerShiftForSwap = useCallback((shiftId: ShiftId) => {
    setState((current) => ({
      ...current,
      shifts: updateShiftStatus(current.shifts, shiftId, "open_for_swap"),
    }));
  }, []);

  const cancelOpenShift = useCallback((shiftId: ShiftId) => {
    setState((current) => ({
      ...current,
      shifts: updateShiftStatus(current.shifts, shiftId, "scheduled"),
    }));
  }, []);

  const requestSwap = useCallback(
    (input: { myShiftId: ShiftId; targetShiftId: ShiftId; message?: string }) => {
      const myShift = state.shifts.find((shift) => shift.id === input.myShiftId);
      const targetShift = state.shifts.find(
        (shift) => shift.id === input.targetShiftId,
      );

      if (!myShift || !targetShift) {
        return;
      }

      const request: SwapRequest = {
        id: crypto.randomUUID(),
        requesterId: state.currentUserId,
        requesterShiftId: input.myShiftId,
        requesterShiftStatusBefore: myShift.status,
        targetEmployeeId: targetShift.employeeId,
        targetShiftId: input.targetShiftId,
        targetShiftStatusBefore: targetShift.status,
        status: "pending",
        message: input.message,
        createdAt: new Date().toISOString(),
      };

      setState((current) => ({
        ...current,
        shifts: current.shifts.map((shift) => {
          if (shift.id === input.myShiftId || shift.id === input.targetShiftId) {
            return { ...shift, status: "swap_pending" as const };
          }
          return shift;
        }),
        swapRequests: [request, ...current.swapRequests],
      }));
    },
    [state.currentUserId, state.shifts],
  );

  const respondToRequest = useCallback(
    (
      requestId: SwapRequestId,
      response: Extract<SwapRequestStatus, "accepted" | "declined">,
    ) => {
      setState((current) => {
        const request = current.swapRequests.find((item) => item.id === requestId);
        if (!request || request.status !== "pending") {
          return current;
        }

        if (response === "declined") {
          return {
            ...current,
            swapRequests: current.swapRequests.map((item) =>
              item.id === requestId ? { ...item, status: "declined" } : item,
            ),
            shifts: current.shifts.map((shift) => {
              if (shift.id === request.requesterShiftId) {
                return {
                  ...shift,
                  status: request.requesterShiftStatusBefore,
                };
              }

              if (shift.id === request.targetShiftId) {
                return {
                  ...shift,
                  status: request.targetShiftStatusBefore ?? "scheduled",
                };
              }

              return shift;
            }),
          };
        }

        return {
          ...current,
          swapRequests: current.swapRequests.map((item) =>
            item.id === requestId ? { ...item, status: "accepted" } : item,
          ),
          shifts: swapShiftOwners(
            current.shifts,
            request.requesterShiftId,
            request.targetShiftId ?? "",
          ),
        };
      });
    },
    [],
  );

  const cancelRequest = useCallback((requestId: SwapRequestId) => {
    setState((current) => {
      const request = current.swapRequests.find((item) => item.id === requestId);
      if (!request || request.status !== "pending") {
        return current;
      }

      return {
        ...current,
        swapRequests: current.swapRequests.map((item) =>
          item.id === requestId ? { ...item, status: "cancelled" } : item,
        ),
        shifts: current.shifts.map((shift) => {
          if (shift.id === request.requesterShiftId) {
            return {
              ...shift,
              status: request.requesterShiftStatusBefore,
            };
          }

          if (shift.id === request.targetShiftId) {
            return {
              ...shift,
              status: request.targetShiftStatusBefore ?? "scheduled",
            };
          }

          return shift;
        }),
      };
    });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      currentUser,
      getEmployee,
      getShift,
      getMyShifts,
      getOpenSwaps,
      getPendingRequestsForMe,
      getMyOutgoingRequests,
      offerShiftForSwap,
      cancelOpenShift,
      requestSwap,
      respondToRequest,
      cancelRequest,
    }),
    [
      state,
      currentUser,
      getEmployee,
      getShift,
      getMyShifts,
      getOpenSwaps,
      getPendingRequestsForMe,
      getMyOutgoingRequests,
      offerShiftForSwap,
      cancelOpenShift,
      requestSwap,
      respondToRequest,
      cancelRequest,
    ],
  );

  return (
    <SwapStoreContext.Provider value={value}>
      {children}
    </SwapStoreContext.Provider>
  );
}

export function useSwapStore() {
  const context = useContext(SwapStoreContext);
  if (!context) {
    throw new Error("useSwapStore must be used within SwapStoreProvider.");
  }
  return context;
}
