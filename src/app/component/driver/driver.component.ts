import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DriverPayload, DriverService } from 'src/app/services/driver.service';

@Component({
  selector: 'app-driver',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.css']
})
export class DriverComponent implements OnInit {
  drivers: any[] = [];
  driverForm!: FormGroup;
  isEditMode = false;
  editId: number | null = null;
  searchText = '';
  statusFilter = 'ALL';
  isLoading = false;
  isSaving = false;
  isDeleting = false;
  message = '';
  error = '';

  constructor(
    private fb: FormBuilder,
    private driverService: DriverService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadDrivers();
  }

  get filteredDrivers(): any[] {
    const search = this.searchText.trim().toLowerCase();

    return this.drivers.filter(driver => {
      const matchesSearch = !search || [
        driver.name,
        driver.phoneNumber,
        driver.email,
        driver.licenseNumber
      ].join(' ').toLowerCase().includes(search);
      const matchesStatus = this.statusFilter === 'ALL' || driver.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  initForm(): void {
    this.driverForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      licenseNumber: ['', Validators.required],
      licenseExpiryDate: ['', Validators.required],
      experienceYears: [0, [Validators.required, Validators.min(0)]],
      address: ['', Validators.required],
      status: ['AVAILABLE', Validators.required],
      joiningDate: [new Date().toISOString().slice(0, 10), Validators.required]
    });
  }

  loadDrivers(): void {
    this.isLoading = true;
    this.error = '';

    this.driverService.getDrivers().subscribe({
      next: response => {
        this.drivers = this.extractList(response);
        this.isLoading = false;
      },
      error: error => {
        console.error('Driver API failed:', error);
        this.error = this.getApiError(error, 'Unable to load drivers.');
        this.isLoading = false;
      }
    });
  }

  submit(): void {
    if (this.driverForm.invalid) {
      this.driverForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.message = '';
    this.error = '';

    const payload = this.driverForm.value as DriverPayload;
    const request = this.isEditMode && this.editId
      ? this.driverService.updateDriver(this.editId, payload)
      : this.driverService.createDriver(payload);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.message = this.isEditMode ? 'Driver updated successfully.' : 'Driver created successfully.';
        this.reset();
      },
      error: error => {
        console.error('Save driver failed:', error);
        this.error = this.getApiError(error, 'Unable to save driver.');
        this.isSaving = false;
      }
    });
  }

  edit(driver: any): void {
    this.isEditMode = true;
    this.editId = driver.id || driver.driverId;
    this.driverForm.patchValue({
      name: driver.name || '',
      phoneNumber: driver.phoneNumber || '',
      email: driver.email || '',
      licenseNumber: driver.licenseNumber || '',
      licenseExpiryDate: driver.licenseExpiryDate || '',
      experienceYears: driver.experienceYears || 0,
      address: driver.address || '',
      status: driver.status || 'AVAILABLE',
      joiningDate: driver.joiningDate || ''
    });
  }

  delete(id: number): void {
    if (!id || !confirm('Delete this driver?')) return;

    this.isDeleting = true;
    this.message = '';
    this.error = '';

    this.driverService.deleteDriver(id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.message = 'Driver deleted successfully.';
        this.loadDrivers();
      },
      error: error => {
        console.error('Delete driver failed:', error);
        this.error = this.getApiError(error, 'Unable to delete driver.');
        this.isDeleting = false;
      }
    });
  }

  reset(): void {
    this.driverForm.reset({
      experienceYears: 0,
      status: 'AVAILABLE',
      joiningDate: new Date().toISOString().slice(0, 10)
    });
    this.isEditMode = false;
    this.editId = null;
    this.loadDrivers();
  }

  private extractList(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data?.content)) return response.data.content;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.dataList)) return response.dataList;
    return [];
  }

  private getApiError(error: any, fallback: string): string {
    return error?.error?.responseMessege || error?.error?.message || error?.message || fallback;
  }
}
