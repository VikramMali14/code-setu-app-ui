import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ShiftingWorkspaceService } from 'src/app/services/shifting-workspace.service';

@Component({
  selector: 'app-shifting-workspace',
  templateUrl: './shifting-workspace.component.html',
  styleUrls: ['./shifting-workspace.component.css']
})
export class ShiftingWorkspaceComponent implements OnInit {
  customerId: string = '';
  shiftId: string = '';
  shift: any = null;
  isLoading = false;
  loadError = '';

  constructor(
    private route: ActivatedRoute,
    private workspaceService: ShiftingWorkspaceService
  ) {}

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('customerId') || '';
    this.shiftId = this.route.snapshot.paramMap.get('shiftId') || '';
    if (this.shiftId) {
      this.loadShift();
    }
  }

  loadShift(): void {
    this.isLoading = true;
    this.loadError = '';
    this.workspaceService.getShift(this.shiftId).subscribe({
      next: (response) => {
        this.shift = response?.data ?? response;
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Unable to load shifting details.';
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

  get shiftNumber(): string {
    return this.shift?.shiftNumber || this.shift?.shiftId || this.shiftId;
  }

  get route_display(): string {
    const from = this.shift?.shiftFromCity || '—';
    const to = this.shift?.shiftToCity || '—';
    return `${from} → ${to}`;
  }

  get shiftStatus(): string {
    return this.shift?.status || this.shift?.shiftStatus || '—';
  }

  get moveDate(): string {
    const d = this.shift?.shiftingStartDate;
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
