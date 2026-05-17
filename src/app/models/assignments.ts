export interface Assignments {
  id: number;
  driverId: number;
  driverName: string;
  vehicleId: number;
  registrationNumber: string;
  assignedAt: string;
  unassignedAt: string | null;
  active: boolean;
  remarks: string | null;
}