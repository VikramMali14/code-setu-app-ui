import { Component, Input, OnInit } from '@angular/core';
import { ShiftInventoryService } from 'src/app/services/shift-inventory.service';

@Component({
  selector: 'app-ws-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class WsInventoryComponent implements OnInit {
  @Input() shiftId: string = '';

  items: any[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Filters
  filterRoom = '';
  filterCategory = '';
  filterStatus = '';
  filterSearch = '';

  // Add form
  showAddForm = false;
  isSaving = false;
  newItem = this.emptyItem();

  // Drawer
  drawerItem: any = null;

  readonly CONDITIONS = ['Good', 'Fair', 'Damaged', 'Fragile'];
  readonly STATUSES = ['', 'PACKED', 'LOADED', 'UNLOADED', 'DELIVERED'];

  constructor(private inventoryService: ShiftInventoryService) {}

  ngOnInit(): void {
    if (this.shiftId) this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
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

  get filteredItems(): any[] {
    return this.items.filter(item => {
      const matchRoom = !this.filterRoom || (item.room || '').toLowerCase().includes(this.filterRoom.toLowerCase());
      const matchCat = !this.filterCategory || (item.category || '').toLowerCase().includes(this.filterCategory.toLowerCase());
      const matchStatus = !this.filterStatus || item.status === this.filterStatus;
      const matchSearch = !this.filterSearch
        || (item.itemName || item.item || '').toLowerCase().includes(this.filterSearch.toLowerCase())
        || (item.packageNumber || '').toString().includes(this.filterSearch);
      return matchRoom && matchCat && matchStatus && matchSearch;
    });
  }

  get uniqueRooms(): string[] {
    return [...new Set(this.items.map(i => i.room).filter(Boolean))];
  }

  get uniqueCategories(): string[] {
    return [...new Set(this.items.map(i => i.category).filter(Boolean))];
  }

  openDrawer(item: any): void {
    this.drawerItem = { ...item };
  }

  closeDrawer(): void {
    this.drawerItem = null;
  }

  saveDrawer(): void {
    if (!this.drawerItem?.id) return;
    this.inventoryService.updateInventory(this.drawerItem.id, this.drawerItem).subscribe({
      next: () => {
        this.successMessage = 'Item updated successfully.';
        this.closeDrawer();
        this.load();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => this.errorMessage = 'Unable to update item.'
    });
  }

  deleteItem(item: any): void {
    if (!confirm(`Delete "${item.itemName || item.item}"?`)) return;
    this.inventoryService.deleteInventory(item.id).subscribe({
      next: () => { this.load(); this.successMessage = 'Item deleted.'; setTimeout(() => this.successMessage = '', 3000); },
      error: () => this.errorMessage = 'Unable to delete item.'
    });
  }

  emptyItem(): any {
    return { room: '', itemName: '', category: '', packageNumber: '', condition: 'Good', remarks: '' };
  }

  openAddForm(): void {
    this.newItem = this.emptyItem();
    this.showAddForm = true;
  }

  cancelAdd(): void {
    this.showAddForm = false;
  }

  isPackageNumberDuplicate(): boolean {
    const pkg = (this.newItem.packageNumber || '').toString().trim();
    if (!pkg) return false;
    return this.items.some(i => (i.packageNumber || '').toString().trim() === pkg);
  }

  saveNewItem(): void {
    if (this.isPackageNumberDuplicate()) {
      this.errorMessage = 'Package number must be unique.';
      return;
    }
    this.isSaving = true;
    const payload = { ...this.newItem, shiftingId: this.shiftId };
    this.inventoryService.createInventory(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.showAddForm = false;
        this.successMessage = 'Item added successfully.';
        this.load();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'Unable to add item.';
      }
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      PACKED: 'Packed', LOADED: 'Loaded', UNLOADED: 'Unloaded', DELIVERED: 'Delivered'
    };
    return map[status] || status || 'Pending';
  }
}
