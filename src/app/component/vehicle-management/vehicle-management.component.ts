import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatIconModule } from '@angular/material/icon';
import { log } from 'console';
import { Subject, takeUntil } from 'rxjs';
import { VehicleLocationService } from 'src/app/services/vehicle-location.service';

@Component({
  selector: 'app-vehicle-management',
  standalone: true,
  imports: [GoogleMapsModule, CommonModule, MatIconModule],
  templateUrl: './vehicle-management.component.html',
  styleUrls: ['./vehicle-management.component.css']
})
export class VehicleManagementComponent implements OnInit, OnDestroy {



  constructor(private vehicleService: VehicleLocationService) {}

  ngOnInit(): void {
   
  }

  ngOnDestroy(): void {
  
  }

}
