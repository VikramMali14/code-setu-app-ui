import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VehiclePayload, VehicleService } from 'src/app/services/vehicle.service';

@Component({
  selector: 'app-vehicle',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './vehicle.component.html',
  styleUrls: ['./vehicle.component.css']
})
export class VehicleComponent implements OnInit {
  vehicles: any[] = [];
  vehicleForm!: FormGroup;
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
    private vehicleService: VehicleService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadVehicles();
  }

  get filteredVehicles(): any[] {
    const search = this.searchText.trim().toLowerCase();

    return this.vehicles.filter(vehicle => {
      const matchesSearch = !search || [
        vehicle.registrationNumber,
        vehicle.vehicleType,
        vehicle.model,
        vehicle.manufacturer,
        vehicle.currentLocation
      ].join(' ').toLowerCase().includes(search);
      const matchesStatus = this.statusFilter === 'ALL' || vehicle.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  initForm(): void {
    this.vehicleForm = this.fb.group({
      chassisNumber: ['', Validators.required],
      engineNumber: ['', Validators.required],
      registrationNumber: ['', Validators.required],
      vehicleType: ['TRUCK', Validators.required],
      model: ['', Validators.required],
      manufacturer: ['', Validators.required],
      mileage: [0, [Validators.required, Validators.min(0)]],
      capacityKg: [0, [Validators.required, Validators.min(1)]],
      status: ['AVAILABLE', Validators.required],
      fuelType: ['DIESEL', Validators.required],
      registrationDate: [new Date().toISOString().slice(0, 10), Validators.required],
      insuranceExpiryDate: ['', Validators.required],
      pollutionExpiryDate: ['', Validators.required],
      currentLocation: ['', Validators.required]
    });
  }

  loadVehicles(): void {
    this.isLoading = true;
    this.error = '';

    this.vehicleService.getVehicles().subscribe({
      next: response => {
        this.vehicles = this.extractList(response);
        this.isLoading = false;
      },
      error: error => {
        console.error('Vehicle API failed:', error);
        this.error = this.getApiError(error, 'Unable to load vehicles.');
        this.isLoading = false;
      }
    });
  }

  submit(): void {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.message = '';
    this.error = '';

    const payload = this.vehicleForm.value as VehiclePayload;
    const request = this.isEditMode && this.editId
      ? this.vehicleService.updateVehicle(this.editId, payload)
      : this.vehicleService.createVehicle(payload);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.message = this.isEditMode ? 'Vehicle updated successfully.' : 'Vehicle created successfully.';
        this.reset();
      },
      error: error => {
        console.error('Save vehicle failed:', error);
        this.error = this.getApiError(error, 'Unable to save vehicle.');
        this.isSaving = false;
      }
    });
  }

  edit(vehicle: any): void {
    this.isEditMode = true;
    this.editId = vehicle.id || vehicle.vehicleId;
    this.vehicleForm.patchValue({
      chassisNumber: vehicle.chassisNumber || '',
      engineNumber: vehicle.engineNumber || '',
      registrationNumber: vehicle.registrationNumber || '',
      vehicleType: vehicle.vehicleType || 'TRUCK',
      model: vehicle.model || '',
      manufacturer: vehicle.manufacturer || '',
      mileage: vehicle.mileage || 0,
      capacityKg: vehicle.capacityKg || 0,
      status: vehicle.status || 'AVAILABLE',
      fuelType: vehicle.fuelType || 'DIESEL',
      registrationDate: vehicle.registrationDate || '',
      insuranceExpiryDate: vehicle.insuranceExpiryDate || '',
      pollutionExpiryDate: vehicle.pollutionExpiryDate || '',
      currentLocation: vehicle.currentLocation || ''
    });
  }

  delete(id: number): void {
    if (!id || !confirm('Delete this vehicle?')) return;

    this.isDeleting = true;
    this.message = '';
    this.error = '';

    this.vehicleService.deleteVehicle(id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.message = 'Vehicle deleted successfully.';
        this.loadVehicles();
      },
      error: error => {
        console.error('Delete vehicle failed:', error);
        this.error = this.getApiError(error, 'Unable to delete vehicle.');
        this.isDeleting = false;
      }
    });
  }

  reset(): void {
    this.vehicleForm.reset({
      vehicleType: 'TRUCK',
      mileage: 0,
      capacityKg: 0,
      status: 'AVAILABLE',
      fuelType: 'DIESEL',
      registrationDate: new Date().toISOString().slice(0, 10)
    });
    this.isEditMode = false;
    this.editId = null;
    this.loadVehicles();
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
