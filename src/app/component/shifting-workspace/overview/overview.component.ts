import { Component, Input, OnInit } from '@angular/core';
import { ShiftingWorkspaceService } from 'src/app/services/shifting-workspace.service';

@Component({
  selector: 'app-ws-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class WsOverviewComponent implements OnInit {
  @Input() shiftId: string = '';

  shift: any = null;
  isLoading = false;
  errorMessage = '';

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
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load overview.';
        this.isLoading = false;
      }
    });
  }

  get charges(): any { return this.shift?.charges || this.shift || {}; }

  get grandTotal(): number {
    const c = this.charges;
    return (c.transportCharge || 0) + (c.packingCharge || 0) + (c.loadingCharge || 0)
      + (c.unloadingCharge || 0) + (c.riskInsure || 0) + (c.gstCharge || 0);
  }
}
