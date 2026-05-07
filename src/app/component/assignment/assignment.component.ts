import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AssignmentService } from 'src/app/services/assignment.service';
import { DriverService } from 'src/app/services/driver.service';
import { VehicleService } from 'src/app/services/vehicle.service';

@Component({
  selector: 'app-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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

  get filteredDrivers(): any[] {
    const search = this.driverSearch.trim().toLowerCase();

    return this.drivers.filter(driver => {
      const matchesSearch = !search || [
        driver.name,
        driver.licenseNumber,
        driver.phoneNumber
      ].join(' ').toLowerCase().includes(search);
      const matchesStatus = this.driverStatusFilter === 'ALL' || driver.status === this.driverStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  get filteredVehicles(): any[] {
    const search = this.vehicleSearch.trim().toLowerCase();

    return this.vehicles.filter(vehicle => {
      const matchesSearch = !search || [
        vehicle.registrationNumber,
        vehicle.vehicleType,
        vehicle.model
      ].join(' ').toLowerCase().includes(search);
      const matchesStatus = this.vehicleStatusFilter === 'ALL' || vehicle.status === this.vehicleStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.error = '';

    this.driverService.getDrivers().subscribe({
      next: driverResponse => {
        this.drivers = this.extractList(driverResponse);
        this.vehicleService.getVehicles().subscribe({
          next: vehicleResponse => {
            this.vehicles = this.extractList(vehicleResponse);
            this.isLoading = false;
          },
          error: error => this.handleLoadError(error)
        });
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
        this.message = `${this.selectedDriver.name} assigned to ${this.selectedVehicle.registrationNumber}.`;
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

  private handleLoadError(error: any): void {
    console.error('Assignment data failed:', error);
    this.error = error?.error?.responseMessege || error?.error?.message || 'Unable to load assignment data.';
    this.isLoading = false;
  }

  private clearSelectionAfterAssign(): void {
    this.selectedDriver = null;
    this.selectedVehicle = null;
  }

  private extractList(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data?.content)) return response.data.content;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.dataList)) return response.dataList;
    return [];
  }
}
