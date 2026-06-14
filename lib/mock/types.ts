export type EmployeeId = string;
export type ShiftId = string;
export type SwapRequestId = string;

export type ShiftStatus = "scheduled" | "open_for_swap" | "swap_pending";
export type SwapRequestStatus = "pending" | "accepted" | "declined" | "cancelled";

export interface Employee {
  id: EmployeeId;
  name: string;
  role: string;
  department: string;
}

export interface Shift {
  id: ShiftId;
  employeeId: EmployeeId;
  date: string;
  startTime: string;
  endTime: string;
  role: string;
  location: string;
  status: ShiftStatus;
}

export interface SwapRequest {
  id: SwapRequestId;
  requesterId: EmployeeId;
  requesterShiftId: ShiftId;
  requesterShiftStatusBefore: ShiftStatus;
  targetEmployeeId?: EmployeeId;
  targetShiftId?: ShiftId;
  targetShiftStatusBefore?: ShiftStatus;
  status: SwapRequestStatus;
  message?: string;
  createdAt: string;
}

export interface SwapStoreState {
  currentUserId: EmployeeId;
  employees: Employee[];
  shifts: Shift[];
  swapRequests: SwapRequest[];
}
