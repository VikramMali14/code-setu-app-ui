import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VehicleManagementService } from 'src/app/services/vehicle-management.service';

@Component({
  selector: 'app-vehicle',
  standalone: true,
  imports: [
    CommonModule,ReactiveFormsModule   
  ],
  templateUrl: './vehicle.component.html',
  styleUrls: ['./vehicle.component.css']
})
export class VehicleComponent implements OnInit {

  editingVehicle: any = null;
  isEditMode = false;
  searchText = '';
  newVehicle: any = {
    registrationNumber: '',
    model: '',
    manufacturer: '',
    status: 'AVAILABLE'
  };
    vehicles: any[] = [];

  vehicleForm!: FormGroup;

  editId!: number;


  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleManagementService
  ) {}


  ngOnInit(): void {
    this.loadVehicles();
  }
    initForm() {
    this.vehicleForm = this.fb.group({
      registrationNumber: ['', Validators.required],
      model: ['', Validators.required],
      manufacturer: ['', Validators.required],
      capacityKg: [0, [Validators.required, Validators.min(1)]],
      fuelType: ['', Validators.required],
      status: ['AVAILABLE', Validators.required]
    });
  }

  loadVehicles() {
    this.vehicleService.getAllVehicles().subscribe(res => {
      this.vehicles = res;
    });
  }
  editVehicle(vehicle: any) {
    this.isEditMode = true;
    this.editingVehicle = vehicle;

    this.vehicleForm.patchValue(vehicle);
  }
  submit() {
    if (this.vehicleForm.invalid) return;

    if (this.isEditMode) {
      this.vehicleService.updateVehicle(this.editId, this.vehicleForm.value)
        .subscribe(() => this.reset());
    } else {
      this.vehicleService.createVehicle(this.vehicleForm.value)
        .subscribe(() => this.reset());
    }
  }

  resetForm() {
    this.vehicleForm.reset({ status: 'AVAILABLE' });
    this.isEditMode = false;
    this.loadVehicles();
  }

  get filteredVehicles() {
    return this.vehicles.filter(v =>
      v.registrationNumber?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

    applyFilter() {
    this.filteredVehicles = this.vehicles.filter(v =>
      v.registrationNumber?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
  page = 1;
  pageSize = 5;

  get paginatedVehicles() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredVehicles.slice(start, start + this.pageSize);
  }
 

  createVehicle() {
    this.vehicleService.createVehicle(this.newVehicle).subscribe(() => {
      this.loadVehicles();
    });
  }

  deleteVehicle(id: number) {
    this.vehicleService.deleteVehicle(id).subscribe(() => {
      this.loadVehicles();
    });
  }
edit(v: any) {
    this.isEditMode = true;
    this.editId = v.id;
    this.vehicleForm.patchValue(v);
  }

  delete(id: number) {
    if (!confirm('Delete this vehicle?')) return;

    this.vehicleService.deleteVehicle(id).subscribe(() => this.loadVehicles());
  }

  reset() {
    this.vehicleForm.reset({ status: 'AVAILABLE' });
    this.isEditMode = false;
    this.loadVehicles();
  }
}
