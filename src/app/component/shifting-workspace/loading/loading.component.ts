import { Component, Input, OnInit } from '@angular/core';
import { ShiftInventoryService } from 'src/app/services/shift-inventory.service';

@Component({
  selector: 'app-ws-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class WsLoadingComponent implements OnInit {
  @Input() shiftId: string = '';

  items: any[] = [];
  selected: Set<any> = new Set();
  isLoading = false;
  isBulkUpdating = false;
  errorMessage = '';
  successMessage = '';

  constructor(private inventoryService: ShiftInventoryService) {}

  ngOnInit(): void {
    if (this.shiftId) this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.selected.clear();
    this.inventoryService.getInventory(this.shiftId).subscribe({
      next: (res) => {
        const raw = res?.data?.content ?? res?.dataList ?? res?.data ?? res;
        this.items = Array.isArray(raw) ? raw : [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load inventory.';
        this.isLoading = false;
      }
    });
  }

  get loadedCount(): number { return this.items.filter(i => i.status === 'LOADED').length; }
  get totalCount(): number { return this.items.length; }
  get remainingCount(): number { return this.totalCount - this.loadedCount; }

  toggleSelect(item: any): void {
    if (this.selected.has(item)) {
      this.selected.delete(item);
    } else {
      this.selected.add(item);
    }
  }

  isSelected(item: any): boolean { return this.selected.has(item); }

  selectAll(): void { this.items.forEach(i => this.selected.add(i)); }
  clearSelection(): void { this.selected.clear(); }

  markBulk(status: string): void {
    if (this.selected.size === 0) return;
    this.isBulkUpdating = true;
    const updates = Array.from(this.selected).map(item =>
      this.inventoryService.updateStatus(item.id, status).toPromise()
    );
    Promise.all(updates).then(() => {
      this.isBulkUpdating = false;
      this.successMessage = `${this.selected.size} item(s) marked as ${status}.`;
      this.load();
      setTimeout(() => this.successMessage = '', 3000);
    }).catch(() => {
      this.isBulkUpdating = false;
      this.errorMessage = 'Some updates failed.';
    });
  }
}
