import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DriverService } from 'src/app/services/driver.service';
import { VehicleService } from 'src/app/services/vehicle.service';
import { AssignmentService } from 'src/app/services/assignment.service';
import { forkJoin } from 'rxjs';

export interface ManageAssignmentDialogData {
  assignment: {
    id: number;
    driverId: number;
    driverName: string;
    vehicleId: number;
    registrationNumber: string;
    active: boolean;
  };
}

@Component({
  selector: 'app-manage-assignment-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  template: `
    <div class="manage-dialog-container">
      <!-- Header -->
      <header class="dialog-header">
        <h2>Manage Assignment</h2>
        <button type="button" class="close-btn" (click)="close()">
          <span class="material-icons">close</span>
        </button>
      </header>

      <!-- Body -->
      <div class="dialog-body">
        <div class="api-messages" *ngIf="error || success">
          <div class="msg error-msg" *ngIf="error">
            <span class="material-icons">error</span>
            <span>{{ error }}</span>
          </div>
          <div class="msg success-msg" *ngIf="success">
            <span class="material-icons">check_circle</span>
            <span>{{ success }}</span>
          </div>
        </div>

        <p class="dialog-sub">Current active assignment details</p>
        
        <!-- Current Details Display -->
        <div class="current-details-box">
          <div class="detail-row">
            <span class="label">Driver</span>
            <div class="val-container">
              <span class="material-icons val-icon">person</span>
              <strong class="val-text">{{ data.assignment.driverName }} (ID: {{ data.assignment.driverId }})</strong>
            </div>
          </div>
          <div class="detail-divider"></div>
          <div class="detail-row">
            <span class="label">Vehicle</span>
            <div class="val-container">
              <span class="material-icons val-icon">local_shipping</span>
              <strong class="val-text">{{ data.assignment.registrationNumber | uppercase }} (ID: {{ data.assignment.vehicleId }})</strong>
            </div>
          </div>
        </div>

        <!-- Reassignment Actions Form -->
        <div class="reassign-form-section">
          <h3>Reassign Driver or Vehicle</h3>
          <p class="section-desc">Select an available driver or vehicle to change the assignee.</p>

          <div class="form-group">
            <label for="newDriverSelect">Change Driver</label>
            <div class="select-wrapper">
              <select 
                id="newDriverSelect" 
                [(ngModel)]="selectedDriverId"
                [disabled]="isBusy">
                <option [value]="data.assignment.driverId">Keep Current Driver</option>
                <option *ngFor="let driver of availableDrivers" [value]="driver.id || driver.driverId">
                  {{ driver.name }} ({{ driver.employeeCode || driver.driverCode || 'ID: ' + driver.id }})
                </option>
              </select>
              <span class="material-icons select-arrow">expand_more</span>
            </div>
          </div>

          <div class="form-group">
            <label for="newVehicleSelect">Change Vehicle</label>
            <div class="select-wrapper">
              <select 
                id="newVehicleSelect" 
                [(ngModel)]="selectedVehicleId"
                [disabled]="isBusy">
                <option [value]="data.assignment.vehicleId">Keep Current Vehicle</option>
                <option *ngFor="let vehicle of availableVehicles" [value]="vehicle.id || vehicle.vehicleId">
                  {{ vehicle.registrationNumber | uppercase }} ({{ vehicle.model || 'Vehicle' }})
                </option>
              </select>
              <span class="material-icons select-arrow">expand_more</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <footer class="dialog-footer">
        <button 
          type="button" 
          class="dialog-btn complete-btn" 
          (click)="completeRide()"
          [disabled]="isBusy">
          <span class="material-icons">done_all</span>
          <span>Complete Ride & Unassign</span>
        </button>

        <div class="right-buttons">
          <button 
            type="button" 
            class="dialog-btn cancel-btn" 
            (click)="close()"
            [disabled]="isBusy">
            Cancel
          </button>
          
          <button 
            type="button" 
            class="dialog-btn save-btn" 
            (click)="saveChanges()"
            [disabled]="isBusy || !hasChanges">
            {{ isBusy ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .manage-dialog-container {
      font-family: 'Outfit', 'Inter', sans-serif;
      background-color: var(--app-surface, #ffffff);
      color: var(--app-text, #1e293b);
      padding: 24px;
      border-radius: 12px;
      max-width: 480px;
      box-sizing: border-box;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .dialog-header h2 {
      font-size: 18px;
      font-weight: 700;
      color: var(--app-text, #0f172a);
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      color: var(--app-muted-text, #64748b);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background-color: var(--app-surface-muted, #f8fafc);
      color: var(--app-text, #0f172a);
    }

    .dialog-sub {
      font-size: 13px;
      color: var(--app-muted-text, #64748b);
      margin: 0 0 12px 0;
    }

    /* Current Details Box */
    .current-details-box {
      background-color: var(--app-surface-muted, #f8fafc);
      border: 1px solid var(--app-border, #e2e8f0);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .detail-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .detail-row .label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--app-muted-text, #64748b);
      letter-spacing: 0.8px;
    }

    .val-container {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--app-text, #0f172a);
    }

    .val-icon {
      font-size: 18px;
      color: var(--app-primary, #667eea);
    }

    .val-text {
      font-size: 14px;
      font-weight: 600;
    }

    .detail-divider {
      height: 1px;
      background-color: var(--app-border, #e2e8f0);
      margin: 12px 0;
    }

    /* Reassign Form */
    .reassign-form-section h3 {
      font-size: 14px;
      font-weight: 700;
      color: var(--app-text, #0f172a);
      margin: 0 0 4px 0;
    }

    .section-desc {
      font-size: 12px;
      color: var(--app-muted-text, #64748b);
      margin: 0 0 16px 0;
    }

    .form-group {
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-size: 12px;
      font-weight: 600;
      color: var(--app-text, #1e293b);
    }

    .select-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .select-wrapper select {
      width: 100%;
      height: 40px;
      border: 1px solid var(--app-border, #e2e8f0);
      border-radius: 8px;
      padding: 0 36px 0 12px;
      font-size: 14px;
      color: var(--app-text, #0f172a);
      background-color: var(--app-surface-muted, #f8fafc);
      outline: none;
      appearance: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .select-wrapper select:focus {
      border-color: var(--app-primary, #667eea);
      box-shadow: 0 0 0 3px var(--app-primary-soft);
    }

    .select-arrow {
      position: absolute;
      right: 12px;
      color: var(--app-muted-text, #64748b);
      pointer-events: none;
    }

    /* Messages */
    .api-messages {
      margin-bottom: 16px;
    }

    .msg {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
    }

    .error-msg {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }

    body.app-dark-theme .error-msg {
      background-color: rgba(239, 68, 68, 0.12);
      border-color: rgba(239, 68, 68, 0.3);
      color: #f87171;
    }

    .success-msg {
      background-color: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
    }

    body.app-dark-theme .success-msg {
      background-color: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.3);
      color: #34d399;
    }

    .msg .material-icons {
      font-size: 18px;
    }

    /* Footer Buttons */
    .dialog-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--app-border, #e2e8f0);
      flex-wrap: wrap;
      gap: 12px;
    }

    .right-buttons {
      display: flex;
      gap: 8px;
    }

    .dialog-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      min-height: 38px;
      padding: 0 16px;
    }

    .cancel-btn {
      background-color: var(--app-surface-muted, #f8fafc);
      border: 1px solid var(--app-border, #e2e8f0);
      color: var(--app-text, #1e293b);
    }

    .cancel-btn:hover {
      background-color: var(--app-border, #e2e8f0);
    }

    .save-btn {
      background: var(--app-action-gradient, #667eea);
      color: #ffffff !important;
      border: none;
    }

    .save-btn:hover:not(:disabled) {
      opacity: 0.95;
    }

    .save-btn:disabled {
      background-color: var(--app-border, #e2e8f0);
      color: var(--app-muted-text, #64748b) !important;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .complete-btn {
      background-color: transparent;
      border: 1px solid #ef4444;
      color: #ef4444 !important;
    }

    .complete-btn:hover:not(:disabled) {
      background-color: #fee2e2;
    }

    body.app-dark-theme .complete-btn:hover:not(:disabled) {
      background-color: rgba(239, 68, 68, 0.15);
    }

    .complete-btn:disabled {
      border-color: var(--app-border, #e2e8f0);
      color: var(--app-muted-text, #64748b) !important;
      cursor: not-allowed;
      opacity: 0.6;
    }
  `]
})
export class ManageAssignmentDialogComponent implements OnInit {
  // Available list
  availableDrivers: any[] = [];
  availableVehicles: any[] = [];

  // Dropdown bindings
  selectedDriverId: number;
  selectedVehicleId: number;

  // States
  isBusy = false;
  error = '';
  success = '';

  constructor(
    public dialogRef: MatDialogRef<ManageAssignmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ManageAssignmentDialogData,
    private driverService: DriverService,
    private vehicleService: VehicleService,
    private assignmentService: AssignmentService
  ) {
    this.selectedDriverId = data.assignment.driverId;
    this.selectedVehicleId = data.assignment.vehicleId;
  }

  ngOnInit(): void {
    this.loadAvailableEntities();
  }

  get hasChanges(): boolean {
    return this.selectedDriverId !== this.data.assignment.driverId || 
           this.selectedVehicleId !== this.data.assignment.vehicleId;
  }

  loadAvailableEntities(): void {
    this.isBusy = true;
    this.error = '';

    forkJoin({
      drivers: this.driverService.getDrivers(),
      vehicles: this.vehicleService.getVehicles()
    }).subscribe({
      next: (res) => {
        // Extract lists
        const allDrivers = this.extractList(res.drivers);
        const allVehicles = this.extractList(res.vehicles);

        // Filter to available only
        this.availableDrivers = allDrivers.filter(d => this.getStatus(d) === 'AVAILABLE');
        this.availableVehicles = allVehicles.filter(v => this.getStatus(v) === 'AVAILABLE');

        this.isBusy = false;
      },
      error: (err) => {
        console.error('Failed to load available entities for dialog:', err);
        this.error = 'Unable to load available drivers or vehicles.';
        this.isBusy = false;
      }
    });
  }

  completeUnassign(callback: () => void): void {
    this.assignmentService.unassign(this.data.assignment.id).subscribe({
      next: () => {
        callback();
      },
      error: (err) => {
        console.error('Unassignment failed:', err);
        this.isBusy = false;
        this.error = err?.error?.responseMessege || err?.error?.message || 'Unable to unassign active mapping.';
      }
    });
  }

  completeRide(): void {
    this.isBusy = true;
    this.error = '';
    this.success = '';

    this.completeUnassign(() => {
      this.isBusy = false;
      this.success = 'Ride marked as completed and unassigned successfully.';
      setTimeout(() => {
        this.dialogRef.close({ completed: true });
      }, 1500);
    });
  }

  saveChanges(): void {
    if (!this.hasChanges) return;

    this.isBusy = true;
    this.error = '';
    this.success = '';

    // Step 1: Unassign the current mapping
    this.completeUnassign(() => {
      // Step 2: Create a new mapping with the updated pair
      this.assignmentService.assignVehicleToDriver(this.selectedDriverId, this.selectedVehicleId).subscribe({
        next: () => {
          this.isBusy = false;
          this.success = 'Assignment updated successfully.';
          setTimeout(() => {
            this.dialogRef.close({ updated: true });
          }, 1500);
        },
        error: (err) => {
          console.error('Reassignment failed:', err);
          this.isBusy = false;
          this.error = err?.error?.responseMessege || err?.error?.message || 'Unassigned original, but failed to create new assignment. Please create it manually.';
        }
      });
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  private getStatus(item: any): string {
    return String(item?.status || 'AVAILABLE').toUpperCase();
  }

  private extractList(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data?.content)) return response.data.content;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.dataList)) return response.dataList;
    return [];
  }
}
