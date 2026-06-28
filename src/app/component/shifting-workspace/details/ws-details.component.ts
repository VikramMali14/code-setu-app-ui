import { Component, Input, OnInit } from '@angular/core';
import { ShiftingWorkspaceService } from 'src/app/services/shifting-workspace.service';

@Component({
  selector: 'app-ws-details',
  templateUrl: './ws-details.component.html',
  styleUrls: ['./ws-details.component.css']
})
export class WsDetailsComponent implements OnInit {
  @Input() shiftId: string = '';

  isLoading = false;
  isSaving = false;
  isEditMode = false;
  errorMessage = '';
  successMessage = '';
  shift: any = null;

  formData: any = {};

  shiftTypes = ['LOCAL', 'DOMESTIC', 'INTERNATIONAL', 'OFFICE', 'VEHICLE'];
  statusOptions = [
    'PENDING', 'PACKING_IN_PROGRESS', 'PACKED',
    'LOADING_IN_PROGRESS', 'LOADED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'
  ];

  constructor(private workspaceService: ShiftingWorkspaceService) {}

  ngOnInit(): void {
    if (this.shiftId) this.loadShift();
  }

  loadShift(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.workspaceService.getShift(this.shiftId).subscribe({
      next: (response) => {
        this.shift = response?.data ?? response;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load shifting details.';
        this.isLoading = false;
      }
    });
  }

  get customerName(): string {
    const s = this.shift;
    if (!s) return '—';
    return [s.customerFirstName, s.customerLastName].filter(Boolean).join(' ')
      || s.customerName || '—';
  }

  formatDate(val: any): string {
    if (!val) return '—';
    try {
      return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '—';
    }
  }

  private toDateStr(val: any): string {
    if (!val) return '';
    try { return new Date(val).toISOString().split('T')[0]; } catch { return ''; }
  }

  enterEdit(): void {
    const s = this.shift || {};
    this.formData = {
      shiftFromCity: s.shiftFromCity || '',
      shiftToCity: s.shiftToCity || '',
      fromAddress: s.fromAddress || '',
      toAddress: s.toAddress || '',
      shiftingStartDate: this.toDateStr(s.shiftingStartDate),
      shiftingEndDate: this.toDateStr(s.shiftingEndDate || s.shiftReachedDate),
      shiftingType: s.shiftingType || '',
      status: s.status || '',
    };
    this.isEditMode = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.errorMessage = '';
  }

  save(): void {
    this.isSaving = true;
    this.errorMessage = '';
    this.workspaceService.updateShift(this.shiftId, this.formData).subscribe({
      next: (response) => {
        this.shift = response?.data ?? { ...this.shift, ...this.formData };
        this.isEditMode = false;
        this.isSaving = false;
        this.successMessage = 'Shifting details updated successfully.';
        setTimeout(() => { this.successMessage = ''; }, 3500);
      },
      error: () => {
        this.errorMessage = 'Failed to save. Please try again.';
        this.isSaving = false;
      }
    });
  }
}
