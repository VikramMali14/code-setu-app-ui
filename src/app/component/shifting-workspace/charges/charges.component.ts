import { Component, Input, OnInit } from '@angular/core';
import { ShiftingWorkspaceService } from 'src/app/services/shifting-workspace.service';

@Component({
  selector: 'app-ws-charges',
  templateUrl: './charges.component.html',
  styleUrls: ['./charges.component.css']
})
export class WsChargesComponent implements OnInit {
  @Input() shiftId: string = '';

  shift: any = null;
  charges: any = {};
  isLoading = false;
  isSaving = false;
  editMode = false;
  errorMessage = '';
  successMessage = '';

  readonly CHARGE_FIELDS = [
    { key: 'transportCharge', label: 'Transport' },
    { key: 'packingCharge',   label: 'Packing' },
    { key: 'loadingCharge',   label: 'Loading' },
    { key: 'unloadingCharge', label: 'Unloading' },
    { key: 'unpacking',       label: 'Unpacking' },
    { key: 'carTransport',    label: 'Car Transport' },
    { key: 'riskInsure',      label: 'Insurance' },
    { key: 'storage',         label: 'Storage' },
    { key: 'gstCharge',       label: 'GST' },
  ];

  constructor(private workspaceService: ShiftingWorkspaceService) {}

  ngOnInit(): void {
    if (this.shiftId) this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.workspaceService.getShift(this.shiftId).subscribe({
      next: (res) => {
        this.shift = res?.data ?? res;
        this.charges = this.extractCharges(this.shift);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load charges.';
        this.isLoading = false;
      }
    });
  }

  extractCharges(shift: any): any {
    if (!shift) return {};
    const c: any = {};
    this.CHARGE_FIELDS.forEach(f => { c[f.key] = shift[f.key] ?? 0; });
    return c;
  }

  get grandTotal(): number {
    return this.CHARGE_FIELDS.reduce((sum, f) => sum + (Number(this.charges[f.key]) || 0), 0);
  }

  save(): void {
    this.isSaving = true;
    const payload = { ...this.shift, ...this.charges };
    this.workspaceService.updateShift(this.shiftId, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.editMode = false;
        this.successMessage = 'Charges saved successfully.';
        this.load();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'Unable to save charges.';
      }
    });
  }

  cancel(): void {
    this.charges = this.extractCharges(this.shift);
    this.editMode = false;
  }
}
