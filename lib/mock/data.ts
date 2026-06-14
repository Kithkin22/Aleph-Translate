import type { Employee, Shift, SwapRequest, SwapStoreState } from "./types";

export const CURRENT_USER_ID = "emp-alex";

export const employees: Employee[] = [
  {
    id: CURRENT_USER_ID,
    name: "Alex Rivera",
    role: "Barista",
    department: "Cafe Floor",
  },
  {
    id: "emp-jordan",
    name: "Jordan Lee",
    role: "Shift Lead",
    department: "Cafe Floor",
  },
  {
    id: "emp-sam",
    name: "Sam Patel",
    role: "Barista",
    department: "Cafe Floor",
  },
  {
    id: "emp-taylor",
    name: "Taylor Brooks",
    role: "Cashier",
    department: "Front Counter",
  },
  {
    id: "emp-morgan",
    name: "Morgan Chen",
    role: "Barista",
    department: "Cafe Floor",
  },
];

export const shifts: Shift[] = [
  {
    id: "shift-1",
    employeeId: CURRENT_USER_ID,
    date: "2026-06-16",
    startTime: "07:00",
    endTime: "15:00",
    role: "Opening Barista",
    location: "Downtown Cafe",
    status: "scheduled",
  },
  {
    id: "shift-2",
    employeeId: CURRENT_USER_ID,
    date: "2026-06-18",
    startTime: "12:00",
    endTime: "20:00",
    role: "Closing Barista",
    location: "Downtown Cafe",
    status: "scheduled",
  },
  {
    id: "shift-3",
    employeeId: CURRENT_USER_ID,
    date: "2026-06-21",
    startTime: "08:00",
    endTime: "16:00",
    role: "Mid Shift",
    location: "Downtown Cafe",
    status: "scheduled",
  },
  {
    id: "shift-4",
    employeeId: "emp-jordan",
    date: "2026-06-17",
    startTime: "06:00",
    endTime: "14:00",
    role: "Opening Lead",
    location: "Downtown Cafe",
    status: "open_for_swap",
  },
  {
    id: "shift-5",
    employeeId: "emp-sam",
    date: "2026-06-19",
    startTime: "14:00",
    endTime: "22:00",
    role: "Closing Barista",
    location: "Downtown Cafe",
    status: "open_for_swap",
  },
  {
    id: "shift-6",
    employeeId: "emp-taylor",
    date: "2026-06-20",
    startTime: "10:00",
    endTime: "18:00",
    role: "Front Counter",
    location: "Downtown Cafe",
    status: "scheduled",
  },
  {
    id: "shift-7",
    employeeId: "emp-morgan",
    date: "2026-06-22",
    startTime: "07:00",
    endTime: "15:00",
    role: "Opening Barista",
    location: "Downtown Cafe",
    status: "open_for_swap",
  },
  {
    id: "shift-8",
    employeeId: "emp-jordan",
    date: "2026-06-23",
    startTime: "12:00",
    endTime: "20:00",
    role: "Closing Lead",
    location: "Downtown Cafe",
    status: "scheduled",
  },
];

export const swapRequests: SwapRequest[] = [
  {
    id: "swap-1",
    requesterId: "emp-sam",
    requesterShiftId: "shift-5",
    requesterShiftStatusBefore: "open_for_swap",
    targetEmployeeId: CURRENT_USER_ID,
    targetShiftId: "shift-2",
    targetShiftStatusBefore: "scheduled",
    status: "pending",
    message: "Need to swap — family event that evening.",
    createdAt: "2026-06-14T09:30:00.000Z",
  },
  {
    id: "swap-2",
    requesterId: CURRENT_USER_ID,
    requesterShiftId: "shift-1",
    requesterShiftStatusBefore: "scheduled",
    targetEmployeeId: "emp-morgan",
    targetShiftId: "shift-7",
    targetShiftStatusBefore: "open_for_swap",
    status: "pending",
    message: "Can we swap Monday opening shifts?",
    createdAt: "2026-06-13T16:45:00.000Z",
  },
];

export const initialStoreState: SwapStoreState = {
  currentUserId: CURRENT_USER_ID,
  employees,
  shifts,
  swapRequests,
};
