import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'; // FIXED: Import EventEmitter here
import { FormsModule } from '@angular/forms';
// REMOVED: import { EventEmitter } from 'stream'; <--- THIS WAS THE ERROR

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center justify-between p-4 bg-white border-t border-gray-100" *ngIf="totalPages > 0">
      <div class="text-sm text-gray-500 italic">
        Page <b>{{ currentPage + 1 }}</b> of <b>{{ totalPages }}</b>
        <span class="mx-2">|</span>
        <b>{{ pageRecords }}</b> records on page
      </div>

      <div class="flex items-center space-x-2">
        <button type="button" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 0"
                class="p-2 border rounded hover:bg-gray-50 disabled:opacity-30 transition">
          &laquo;
        </button>

        <div class="flex space-x-1">
          <button type="button" *ngFor="let p of pageNumbers" (click)="goToPage(p)"
                  [ngClass]="p === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'"
                  class="px-3 py-1 border rounded text-sm font-bold transition">
            {{ p + 1 }}
          </button>
        </div>

        <button type="button" (click)="goToPage(currentPage + 1)" [disabled]="currentPage >= totalPages - 1"
                class="p-2 border rounded hover:bg-gray-50 disabled:opacity-30 transition">
          &raquo;
        </button>

        <select [ngModel]="pageSize" (ngModelChange)="onSizeChange($event)"
                class="ml-4 p-1.5 border rounded text-sm bg-gray-50 font-medium focus:ring-2 focus:ring-blue-500 outline-none">
          <option [value]="5">5 / page</option>
          <option [value]="10">10 / page</option>
          <option [value]="25">25 / page</option>
        </select>
      </div>
    </div>
  `,
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit {
  @Input() currentPage: number = 0;
  @Input() totalPages: number = 0;
  @Input() totalRecords: number = 0;
  @Input() pageSize: number = 5;
  @Input() pageRecords: number = 0;

  @Output() pageChange = new EventEmitter<number>();
  @Output() sizeChange = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void { }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  goToPage(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.totalPages) {
      this.pageChange.emit(pageIndex);
    }
  }

  onSizeChange(newSize: any): void {
    this.sizeChange.emit(Number(newSize));
  }
}