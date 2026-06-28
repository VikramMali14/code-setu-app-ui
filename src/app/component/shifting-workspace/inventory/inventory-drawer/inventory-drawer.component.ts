import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ws-inventory-drawer',
  templateUrl: './inventory-drawer.component.html',
  styleUrls: ['./inventory-drawer.component.css']
})
export class WsInventoryDrawerComponent {
  @Input() item: any = null;
  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  readonly CONDITIONS = ['Good', 'Fair', 'Damaged', 'Fragile'];

  onSave(): void { this.save.emit(this.item); }
  onClose(): void { this.close.emit(); }
}
