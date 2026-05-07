import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Driver } from 'src/app/models/driver';
import { VehicleManagementService } from 'src/app/services/vehicle-management.service';

@Component({
  selector: 'app-driver',
  standalone: true,
  imports: [
    CommonModule // 🔥 THIS FIXES ngClass
  ],
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.css']
})
export class DriverComponent implements OnInit {

    drivers: any[] = [];
  newDriver: Driver = {
    name: '',
    phoneNumber: '',
    email: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    experienceYears: 0,
    address: '',
    status: 'ACTIVE',
    joiningDate: ''
  };

  constructor(private driverService: VehicleManagementService) {}

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers() {
    this.driverService.getAllDrivers().subscribe(res => {
      this.drivers = res;
    });
  }

  createDriver() {
    this.driverService.createDriver(this.newDriver).subscribe(() => {
      this.loadDrivers();
    });
  }

  deleteDriver(id: number) {
    this.driverService.deleteDriver(id).subscribe(() => {
      this.loadDrivers();
    });
  }

}
