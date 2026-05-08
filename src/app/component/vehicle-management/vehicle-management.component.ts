import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Assignments } from 'src/app/models/assignments';
import { VehicleService } from 'src/app/services/vehicle.service';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-vehicle-management',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, FormsModule, PaginationComponent],
  templateUrl: './vehicle-management.component.html',
  styleUrls: ['./vehicle-management.component.css']
})
export class VehicleManagementComponent implements OnInit {
  // 1. Data storage
  private allAssignments: Assignments[] = []; 
  public assignments: Assignments[] = []; 

  // 2. Pagination State
  public currentPageNumber: number = 0; 
  public pageSize: number = 5;
  public totalElements: number = 0;
  public totalPages: number = 0;
  public Math = Math;

  public cards = [
    { icon: 'local_shipping', title: 'Vehicles', description: 'Manage all vehicles', route: '/vehicle-management/vehicles', accent: 'blue' },
    { icon: 'person', title: 'Drivers', description: 'Manage all drivers', route: '/vehicle-management/drivers', accent: 'orange' },
    { icon: 'link', title: 'Assignments', description: 'Assign vehicle to driver', route: '/vehicle-management/assignments', accent: 'green' }
  ];

  constructor(
    private vehicleService: VehicleService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Initial data fetch
    this.handlePageChange(0);
  }

  // 3. FIXED: Renamed method to avoid conflict with potential EventEmitters
  handlePageChange(page: number): void {
    this.currentPageNumber = page;
    
    // Ensure getAssignment() returns an Observable from HttpClient
    this.vehicleService.getAssignment().subscribe({
      next: (data: Assignments[]) => {
        this.allAssignments = data;
        this.totalElements = data.length;
        this.totalPages = Math.ceil(this.totalElements / this.pageSize);
        this.updatePagedView();
      },
      error: (err) => console.error('API Error:', err)
    });
  }

  updatePagedView(): void {
    const start = this.currentPageNumber * this.pageSize;
    const end = start + this.pageSize;
    this.assignments = this.allAssignments.slice(start, end);
  }

  // 4. FIXED: Logic for size change
  handleSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPageNumber = 0; // Reset to page 1
    this.updatePagedView();
  }

  addAssigne(): void {
    this.router.navigate(['/vehicle-management/assignments']);
  }
}