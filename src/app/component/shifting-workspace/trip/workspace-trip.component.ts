import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TripService } from 'src/app/services/trip.service';

const TRIP_STATUS_TRANSITIONS: Record<string, string[]> = {
  CREATED:              ['DRIVER_ASSIGNED', 'CANCELLED'],
  DRIVER_ASSIGNED:      ['VEHICLE_ASSIGNED', 'CANCELLED'],
  VEHICLE_ASSIGNED:     ['READY_FOR_DISPATCH', 'CANCELLED'],
  READY_FOR_DISPATCH:   ['STARTED', 'ON_HOLD', 'CANCELLED'],
  STARTED:              ['REACHED_PICKUP', 'ON_HOLD', 'BREAKDOWN', 'DELAYED'],
  REACHED_PICKUP:       ['LOADING', 'ON_HOLD'],
  LOADING:              ['IN_TRANSIT', 'ON_HOLD'],
  IN_TRANSIT:           ['REACHED_DESTINATION', 'ON_HOLD', 'BREAKDOWN', 'DELAYED'],
  REACHED_DESTINATION:  ['UNLOADING'],
  UNLOADING:            ['COMPLETED'],
  COMPLETED:            ['CLOSED'],
  ON_HOLD:              ['STARTED'],
  BREAKDOWN:            ['STARTED'],
  DELAYED:              ['STARTED'],
  CLOSED:               [],
  CANCELLED:            [],
};

@Component({
  selector: 'app-ws-trip',
  templateUrl: './workspace-trip.component.html',
  styleUrls: ['./workspace-trip.component.css']
})
export class WsWorkspaceTripComponent implements OnInit {
  @Input() shiftId: string = '';

  trip: any = null;
  isLoading = false;
  isTransitioning = false;
  errorMessage = '';
  successMessage = '';

  showCreateForm = false;
  isCreating = false;
  newTrip: any = { sourceCity: '', destinationCity: '', plannedStartTime: '', plannedEndTime: '', plannedDistanceKm: '' };
  transitionRemarks = '';

  constructor(private tripService: TripService, private router: Router) {}

  ngOnInit(): void {
    if (this.shiftId) this.loadTrip();
  }

  loadTrip(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.tripService.getTrips(0, 100).subscribe({
      next: (res) => {
        const all = res?.data?.content ?? res?.dataList ?? res?.data ?? [];
        const list = Array.isArray(all) ? all : [];
        this.trip = list.find((t: any) =>
          String(t.shiftingId) === String(this.shiftId)
          || String(t.shiftId) === String(this.shiftId)
        ) || null;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load trip.';
        this.isLoading = false;
      }
    });
  }

  get allowedTransitions(): string[] {
    if (!this.trip?.status) return [];
    return TRIP_STATUS_TRANSITIONS[this.trip.status] || [];
  }

  transitionTo(status: string): void {
    if (!this.trip?.tripId) return;
    this.isTransitioning = true;
    const payload = { ...this.trip, status, remarks: this.transitionRemarks || undefined };
    this.tripService.updateTrip(this.trip.tripId, payload).subscribe({
      next: () => {
        this.successMessage = `Status updated to ${status}.`;
        this.transitionRemarks = '';
        this.loadTrip();
        this.isTransitioning = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Status update failed.';
        this.isTransitioning = false;
      }
    });
  }

  openTrip(): void {
    this.router.navigate(['/trips']);
  }

  createTrip(): void {
    this.isCreating = true;
    const payload = { ...this.newTrip, shiftingId: this.shiftId };
    this.tripService.createTrip(payload).subscribe({
      next: () => {
        this.isCreating = false;
        this.showCreateForm = false;
        this.successMessage = 'Trip created successfully.';
        this.loadTrip();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.isCreating = false;
        this.errorMessage = 'Unable to create trip.';
      }
    });
  }
}
