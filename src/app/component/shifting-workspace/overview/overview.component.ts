import { Component, Input, OnInit } from '@angular/core';
import { ShiftingWorkspaceService } from 'src/app/services/shifting-workspace.service';
import { ShiftInventoryService } from 'src/app/services/shift-inventory.service';
import { TripService } from 'src/app/services/trip.service';
import { CustomersService } from 'src/app/services/customers.service';

@Component({
  selector: 'app-ws-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class WsOverviewComponent implements OnInit {
  @Input() shiftId: string = '';
  @Input() customerId: string = '';

  shift: any = null;
  customer: any = null;
  trip: any = null;
  inventoryItems: any[] = [];

  isLoading = false;
  errorMessage = '';

  constructor(
    private workspaceService: ShiftingWorkspaceService,
    private inventoryService: ShiftInventoryService,
    private tripService: TripService,
    private customersService: CustomersService
  ) {}

  ngOnInit(): void {
    if (this.shiftId) {
      this.isLoading = true;
      this.loadShift();
      this.loadInventory();
      this.loadTrip();
    }
    if (this.customerId) this.loadCustomer();
  }

  loadShift(): void {
    this.workspaceService.getShift(this.shiftId).subscribe({
      next: (res) => { this.shift = res?.data ?? res; this.isLoading = false; },
      error: () => { this.errorMessage = 'Unable to load shift details.'; this.isLoading = false; }
    });
  }

  loadCustomer(): void {
    this.customersService.getCustomerByUuid(this.customerId).subscribe({
      next: (res) => { this.customer = res?.data ?? res; },
      error: () => { this.customer = null; }
    });
  }

  loadInventory(): void {
    this.inventoryService.getInventory(this.shiftId).subscribe({
      next: (res) => {
        const raw = res?.data?.content ?? res?.dataList ?? res?.data ?? res;
        this.inventoryItems = Array.isArray(raw) ? raw : (raw?.id ? [raw] : []);
      },
      error: () => { this.inventoryItems = []; }
    });
  }

  loadTrip(): void {
    this.tripService.getTrips(0, 100).subscribe({
      next: (res) => {
        const list = res?.data?.content ?? res?.dataList ?? res?.data ?? [];
        const trips = Array.isArray(list) ? list : [];
        this.trip = trips.find((t: any) =>
          String(t.shiftId) === String(this.shiftId) ||
          String(t.shiftingId) === String(this.shiftId)
        ) || null;
      },
      error: () => { this.trip = null; }
    });
  }

  // ── Customer ─────────────────────────────────────────────────
  get customerName(): string {
    if (this.customer) {
      return [this.customer.firstName, this.customer.lastName].filter(Boolean).join(' ')
        || this.customer.customerFirstName && [this.customer.customerFirstName, this.customer.customerLastName].filter(Boolean).join(' ')
        || this.customer.name || this.customer.customerName || '—';
    }
    return '—';
  }

  get customerMobile(): string {
    return this.customer?.phoneNumber || this.customer?.mobile
      || this.customer?.customerPhone || this.customer?.customerMobile || '—';
  }

  get customerEmail(): string {
    return this.customer?.email || this.customer?.customerEmail || '—';
  }

  // ── Charges (nested under shift.charges) ──────────────────────
  get charges(): any { return this.shift?.charges || {}; }

  get grandTotal(): number {
    const c = this.charges;
    return (c.transportCharge || 0) + (c.packingCharge || 0)
      + (c.loadingCharge || 0) + (c.unloadingCharge || 0)
      + (c.unpackingCharge || 0) + (c.carTransportCharge || 0)
      + (c.riskInsureCharge || 0) + (c.storageCharge || 0)
      + (c.statisticalCharge || 0) + (c.serviceCharge || 0)
      + (c.gstCharge || 0);
  }

  // ── Inventory counts ──────────────────────────────────────────
  get totalItems(): number { return this.inventoryItems.length; }

  get uniqueRooms(): number {
    return new Set(this.inventoryItems.map(i => i.roomName || i.room).filter(Boolean)).size;
  }

  get packedCount(): number { return this.inventoryItems.filter(i => i.packed).length; }
  get loadedCount(): number { return this.inventoryItems.filter(i => i.loaded).length; }

  // ── Trip ──────────────────────────────────────────────────────
  get tripDriver(): string {
    if (!this.trip) return '—';
    return this.trip.driverName
      || [this.trip.driverFirstName, this.trip.driverLastName].filter(Boolean).join(' ')
      || this.trip.driver?.name || '—';
  }

  get tripVehicle(): string {
    if (!this.trip) return '—';
    return this.trip.vehicleNumber || this.trip.vehicleRegistrationNumber
      || this.trip.vehicle?.registrationNumber || '—';
  }

  get tripStatus(): string {
    return this.trip?.tripStatus || this.trip?.status || '—';
  }

  // ── Company ───────────────────────────────────────────────────
  get companyDisplay(): string {
    const s = this.shift;
    return s?.companyName || s?.company?.companyName
      || (s?.companyId ? `Company ID: ${s.companyId}` : 'Not assigned');
  }
}
