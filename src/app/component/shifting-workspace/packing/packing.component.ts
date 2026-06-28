import { Component, Input, OnInit } from '@angular/core';
import { ShiftInventoryService } from 'src/app/services/shift-inventory.service';

@Component({
  selector: 'app-ws-packing',
  templateUrl: './packing.component.html',
  styleUrls: ['./packing.component.css']
})
export class WsPackingComponent implements OnInit {
  @Input() shiftId: string = '';

  items: any[] = [];
  isLoading = false;
  errorMessage = '';

  readonly MATERIALS = ['Bubble Wrap', 'Carton', 'Tape', 'Foam', 'Stretch Film'];

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
        this.errorMessage = 'Unable to load packing data.';
        this.isLoading = false;
      }
    });
  }

  getMaterialQty(item: any, material: string): number {
    const key = material.toLowerCase().replace(/ /g, '_');
    return item?.packagingMaterials?.[key] ?? item?.[key] ?? 0;
  }

  warehouseSummary(): { material: string; total: number }[] {
    return this.MATERIALS.map(m => ({
      material: m,
      total: this.items.reduce((sum, item) => sum + this.getMaterialQty(item, m), 0)
    }));
  }
}
