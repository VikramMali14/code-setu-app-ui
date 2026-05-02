import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatIconModule } from '@angular/material/icon';
import { DriverPayload, DriverService } from 'src/app/services/driver.service';
import { VehicleLocationService } from 'src/app/services/vehicle-location.service';

interface DriverCard {
  id: number;
  name: string;
  phone: string;
  email: string;
  licenseNo: string;
  licenseExpiryDate: string;
  experienceYears: number;
  address: string;
  joiningDate: string;
  status: string;
}

interface VehicleCard {
  id: number;
  vehicleNo: string;
  vehicleType: string;
  capacity: string;
  status: 'Active' | 'Maintenance' | 'Inactive';
}

interface VehicleAssignment {
  id: number;
  route: string;
  assignedAt: string;
  driver: DriverCard;
  vehicle: VehicleCard;
}

@Component({
  selector: 'app-vehicle-management',
  standalone: true,
  imports: [GoogleMapsModule, CommonModule, FormsModule, MatIconModule],
  templateUrl: './vehicle-management.component.html',
  styleUrls: ['./vehicle-management.component.css']
})
export class VehicleManagementComponent implements OnInit, OnDestroy {

  drivers: DriverCard[] = [];
  isLoadingDrivers = false;
  isSavingDriver = false;
  isDeletingDriver = false;
  driverMessage = '';
  driverError = '';
  showDriverForm = false;
  editingDriverId: number | null = null;
  driverForm: DriverPayload = this.getEmptyDriverForm();

  vehicles: VehicleCard[] = [
    {
      id: 1,
      vehicleNo: 'GJ 05 AB 1234',
      vehicleType: 'Container Truck',
      capacity: '12 Ton',
      status: 'Active'
    },
    {
      id: 2,
      vehicleNo: 'GJ 01 CD 8945',
      vehicleType: 'Mini Truck',
      capacity: '3 Ton',
      status: 'Maintenance'
    }
  ];

  assignments: VehicleAssignment[] = [
    {
      id: 1,
      route: 'Surat to Ahmedabad',
      assignedAt: '02 May 2026, 10:30 AM',
      driver: this.getFallbackDriver(),
      vehicle: this.vehicles[0]
    }
  ];


  constructor(
    private vehicleService: VehicleLocationService,
    private driverService: DriverService
  ) {}

  ngOnInit(): void {
    this.loadDrivers();
  }

  ngOnDestroy(): void {
  
  }

  loadDrivers(): void {
    this.isLoadingDrivers = true;
    this.driverError = '';

    this.driverService.getDrivers().subscribe({
      next: response => {
        const apiDrivers = this.extractDrivers(response);
        this.drivers = apiDrivers.map(driver => this.toDriverCard(driver));
        this.syncAssignmentDriver();
        this.isLoadingDrivers = false;
      },
      error: error => {
        console.error('Driver API failed:', error);
        this.driverError = this.getApiError(error, 'Unable to load drivers.');
        this.isLoadingDrivers = false;
      }
    });
  }

  openCreateDriver(): void {
    this.showDriverForm = true;
    this.editingDriverId = null;
    this.driverForm = this.getEmptyDriverForm();
    this.driverMessage = '';
    this.driverError = '';
  }

  openEditDriver(driver: DriverCard): void {
    this.showDriverForm = true;
    this.editingDriverId = driver.id;
    this.driverForm = {
      id: driver.id,
      name: driver.name,
      phoneNumber: driver.phone,
      email: driver.email,
      licenseNumber: driver.licenseNo,
      licenseExpiryDate: driver.licenseExpiryDate,
      experienceYears: driver.experienceYears,
      address: driver.address,
      status: driver.status || 'ACTIVE',
      joiningDate: driver.joiningDate
    };
    this.driverMessage = '';
    this.driverError = '';
  }

  closeDriverForm(): void {
    this.showDriverForm = false;
    this.editingDriverId = null;
  }

  saveDriver(): void {
    this.isSavingDriver = true;
    this.driverMessage = '';
    this.driverError = '';

    const request = this.editingDriverId
      ? this.driverService.updateDriver(this.editingDriverId, this.driverForm)
      : this.driverService.createDriver(this.driverForm);

    request.subscribe({
      next: () => {
        this.isSavingDriver = false;
        this.driverMessage = this.editingDriverId ? 'Driver updated successfully.' : 'Driver created successfully.';
        this.closeDriverForm();
        this.loadDrivers();
      },
      error: error => {
        console.error('Save driver failed:', error);
        this.isSavingDriver = false;
        this.driverError = this.getApiError(error, 'Unable to save driver.');
      }
    });
  }

  deleteDriver(driver: DriverCard): void {
    this.isDeletingDriver = true;
    this.driverMessage = '';
    this.driverError = '';

    this.driverService.deleteDriver(driver.id).subscribe({
      next: () => {
        this.isDeletingDriver = false;
        this.driverMessage = 'Driver deleted successfully.';
        this.loadDrivers();
      },
      error: error => {
        console.error('Delete driver failed:', error);
        this.isDeletingDriver = false;
        this.driverError = this.getApiError(error, 'Unable to delete driver.');
      }
    });
  }

  private extractDrivers(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data?.content)) return response.data.content;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.dataList)) return response.dataList;
    if (response?.data && typeof response.data === 'object') return [response.data];
    return [];
  }

  private toDriverCard(driver: any): DriverCard {
    return {
      id: driver.id || driver.driverId || 0,
      name: driver.name || 'Driver',
      phone: driver.phoneNumber || driver.mobileNo || driver.phone || '',
      email: driver.email || '',
      licenseNo: driver.licenseNumber || driver.licenseNo || '',
      licenseExpiryDate: driver.licenseExpiryDate || '',
      experienceYears: Number(driver.experienceYears || 0),
      address: driver.address || '',
      status: driver.status || 'ACTIVE',
      joiningDate: driver.joiningDate || ''
    };
  }

  private syncAssignmentDriver(): void {
    this.assignments = this.assignments.map(assignment => ({
      ...assignment,
      driver: this.drivers[0] || this.getFallbackDriver()
    }));
  }

  private getFallbackDriver(): DriverCard {
    return {
      id: 0,
      name: 'No driver assigned',
      phone: '',
      email: '',
      licenseNo: '',
      licenseExpiryDate: '',
      experienceYears: 0,
      address: '',
      status: 'UNASSIGNED',
      joiningDate: ''
    };
  }

  private getEmptyDriverForm(): DriverPayload {
    return {
      name: '',
      phoneNumber: '',
      email: '',
      licenseNumber: '',
      licenseExpiryDate: '',
      experienceYears: 0,
      address: '',
      status: 'ACTIVE',
      joiningDate: new Date().toISOString().slice(0, 10)
    };
  }

  private getApiError(error: any, fallback: string): string {
    return error?.error?.responseMessege || error?.error?.message || error?.message || fallback;
  }

}
