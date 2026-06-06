import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AssignmentService } from 'src/app/services/assignment.service';
import { DriverService } from 'src/app/services/driver.service';
import { VehicleService } from 'src/app/services/vehicle.service';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoaderComponent],
  templateUrl: './assignment.component.html',
  styleUrls: ['./assignment.component.css']
})
export class AssignmentComponent implements OnInit {
  drivers: any[] = [];
  vehicles: any[] = [];
  selectedDriver: any = null;
  selectedVehicle: any = null;
  driverSearch = '';
  vehicleSearch = '';
  driverStatusFilter = 'AVAILABLE';
  vehicleStatusFilter = 'AVAILABLE';
  driverPage = 0;
  vehiclePage = 0;
  pageSize = 5;
  message = '';
  error = '';
  isLoading = false;
  isAssigning = false;

  constructor(
    private assignmentService: AssignmentService,
    private driverService: DriverService,
    private vehicleService: VehicleService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  get isApiBusy(): boolean {
    return this.isLoading || this.isAssigning;
  }

  get filteredDrivers(): any[] {
    const search = this.driverSearch.trim().toLowerCase();

    return this.drivers.filter(driver => {
      const matchesSearch = !search || [
        this.getDriverName(driver),
        driver.licenseNumber,
        driver.phoneNumber,
        driver.mobileNumber,
        driver.email
      ].join(' ').toLowerCase().includes(search);
      const matchesStatus = this.driverStatusFilter === 'ALL' || this.getStatus(driver) === this.driverStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  get filteredVehicles(): any[] {
    const search = this.vehicleSearch.trim().toLowerCase();

    return this.vehicles.filter(vehicle => {
      const matchesSearch = !search || [
        vehicle.registrationNumber,
        vehicle.vehicleType,
        vehicle.model,
        vehicle.manufacturer,
        vehicle.currentLocation
      ].join(' ').toLowerCase().includes(search);
      const matchesStatus = this.vehicleStatusFilter === 'ALL' || this.getStatus(vehicle) === this.vehicleStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  get availableDriverCount(): number {
    return this.drivers.filter(driver => this.getStatus(driver) === 'AVAILABLE').length;
  }

  get availableVehicleCount(): number {
    return this.vehicles.filter(vehicle => this.getStatus(vehicle) === 'AVAILABLE').length;
  }

  get paginatedDrivers(): any[] {
    const start = this.driverPage * this.pageSize;
    return this.filteredDrivers.slice(start, start + this.pageSize);
  }

  get paginatedVehicles(): any[] {
    const start = this.vehiclePage * this.pageSize;
    return this.filteredVehicles.slice(start, start + this.pageSize);
  }

  get driverTotalPages(): number {
    return Math.ceil(this.filteredDrivers.length / this.pageSize);
  }

  get vehicleTotalPages(): number {
    return Math.ceil(this.filteredVehicles.length / this.pageSize);
  }

  get driverStartRecord(): number {
    return this.filteredDrivers.length ? this.driverPage * this.pageSize + 1 : 0;
  }

  get driverEndRecord(): number {
    return Math.min((this.driverPage + 1) * this.pageSize, this.filteredDrivers.length);
  }

  get vehicleStartRecord(): number {
    return this.filteredVehicles.length ? this.vehiclePage * this.pageSize + 1 : 0;
  }

  get vehicleEndRecord(): number {
    return Math.min((this.vehiclePage + 1) * this.pageSize, this.filteredVehicles.length);
  }

  get canAssign(): boolean {
    return !!this.selectedDriver && !!this.selectedVehicle && !this.isAssigning;
  }

  loadData(): void {
    this.isLoading = true;
    this.error = '';

    forkJoin({
      drivers: this.driverService.getDrivers(),
      vehicles: this.vehicleService.getVehicles()
    }).subscribe({
      next: response => {
        this.drivers = this.extractList(response.drivers);
        this.vehicles = this.extractList(response.vehicles);
        this.syncPages();
        this.isLoading = false;
      },
      error: error => this.handleLoadError(error)
    });
  }

  selectDriver(driver: any): void {
    this.selectedDriver = driver;
    this.message = '';
    this.error = '';
  }

  selectVehicle(vehicle: any): void {
    this.selectedVehicle = vehicle;
    this.message = '';
    this.error = '';
  }

  onDriverFilterChange(): void {
    this.driverPage = 0;
  }

  onVehicleFilterChange(): void {
    this.vehiclePage = 0;
  }

  goToDriverPage(page: number): void {
    if (page >= 0 && page < this.driverTotalPages) {
      this.driverPage = page;
    }
  }

  goToVehiclePage(page: number): void {
    if (page >= 0 && page < this.vehicleTotalPages) {
      this.vehiclePage = page;
    }
  }

  assignSelected(): void {
    if (!this.selectedDriver || !this.selectedVehicle) {
      this.error = 'Select one driver and one vehicle before assigning.';
      return;
    }

    const driverId = this.selectedDriver.id || this.selectedDriver.driverId;
    const vehicleId = this.selectedVehicle.id || this.selectedVehicle.vehicleId;

    if (!driverId || !vehicleId) {
      this.error = 'Selected driver or vehicle is missing an id.';
      return;
    }

    this.isAssigning = true;
    this.message = '';
    this.error = '';

    this.assignmentService.assignVehicleToDriver(driverId, vehicleId).subscribe({
      next: () => {
        this.isAssigning = false;
        this.message = `${this.getDriverName(this.selectedDriver)} assigned to ${this.getVehicleName(this.selectedVehicle)}.`;
        this.clearSelectionAfterAssign();
        this.loadData();
      },
      error: error => {
        console.error('Assignment failed:', error);
        this.isAssigning = false;
        this.error = error?.error?.responseMessege || error?.error?.message || 'Unable to assign vehicle to driver.';
      }
    });
  }

  clearSelection(): void {
    this.selectedDriver = null;
    this.selectedVehicle = null;
    this.message = '';
    this.error = '';
  }

  getDriverName(driver: any): string {
    return driver?.name
      || [driver?.firstName, driver?.lastName].filter(Boolean).join(' ')
      || driver?.userName
      || 'Unnamed driver';
  }

  getDriverContact(driver: any): string {
    return driver?.phoneNumber || driver?.mobileNumber || driver?.email || '-';
  }

  getDriverCode(driver: any): string {
    return driver?.employeeCode || driver?.staffCode || driver?.driverCode || driver?.code || `ID ${driver?.id || driver?.driverId || '-'}`;
  }

  getDriverLocation(driver: any): string {
    return driver?.city || driver?.currentLocation || driver?.address || '-';
  }

  getInitials(value: string): string {
    return value
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || '--';
  }

  getVehicleName(vehicle: any): string {
    return vehicle?.registrationNumber || vehicle?.vehicleNumber || `Vehicle ${vehicle?.id || vehicle?.vehicleId || ''}`.trim();
  }

  getVehicleMeta(vehicle: any): string {
    return [vehicle?.vehicleType, vehicle?.model].filter(Boolean).join(' - ') || '-';
  }

  getVehiclePayload(vehicle: any): string {
    const payload = vehicle?.payload || vehicle?.payloadTon || vehicle?.capacityTon || vehicle?.capacityKg;
    if (!payload) {
      return '-';
    }

    return vehicle?.capacityKg ? `Payload: ${payload} Kg` : `Payload: ${payload}`;
  }

  getStatus(item: any): string {
    return String(item?.status || 'AVAILABLE').toUpperCase();
  }

  getStatusClass(item: any): string {
    return this.getStatus(item).toLowerCase();
  }

  private handleLoadError(error: any): void {
    console.error('Assignment data failed:', error);
    this.error = error?.error?.responseMessege || error?.error?.message || 'Unable to load assignment data.';
    this.isLoading = false;
  }

  getPagesArray(totalPages: number): number[] {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  getVehicleInitials(vehicle: any): string {
    const reg = this.getVehicleName(vehicle);
    return reg ? reg.substring(0, 4).toUpperCase() : '--';
  }

  private clearSelectionAfterAssign(): void {
    this.selectedDriver = null;
    this.selectedVehicle = null;
  }

  private syncPages(): void {
    this.driverPage = Math.min(this.driverPage, Math.max(this.driverTotalPages - 1, 0));
    this.vehiclePage = Math.min(this.vehiclePage, Math.max(this.vehicleTotalPages - 1, 0));
  }

  private extractList(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data?.content)) return response.data.content;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.dataList)) return response.dataList;
    return [];
  }
}
