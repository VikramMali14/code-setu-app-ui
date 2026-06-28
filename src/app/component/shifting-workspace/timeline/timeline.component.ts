import { Component, Input, OnInit } from '@angular/core';
import { TripService } from 'src/app/services/trip.service';

interface TimelineEvent {
  time: Date;
  label: string;
  icon: string;
  type: 'trip' | 'inventory' | 'document' | 'shift';
}

@Component({
  selector: 'app-ws-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class WsTimelineComponent implements OnInit {
  @Input() shiftId: string = '';

  events: TimelineEvent[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private tripService: TripService) {}

  ngOnInit(): void {
    if (this.shiftId) this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.tripService.getTrips(0, 100).subscribe({
      next: (res) => {
        const all = res?.data?.content ?? res?.dataList ?? res?.data ?? [];
        const list = Array.isArray(all) ? all : [];
        const trip = list.find((t: any) =>
          String(t.shiftingId) === String(this.shiftId)
          || String(t.shiftId) === String(this.shiftId)
        );
        if (trip?.tripId) {
          this.loadHistory(trip.tripId);
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.errorMessage = 'Unable to load timeline.';
        this.isLoading = false;
      }
    });
  }

  loadHistory(tripId: number): void {
    this.tripService.getStatusHistoryByTrip(tripId).subscribe({
      next: (res) => {
        const raw = res?.data?.content ?? res?.dataList ?? res?.data ?? res;
        const history = Array.isArray(raw) ? raw : [];
        this.events = history.map((h: any): TimelineEvent => ({
          time: new Date(h.changedAt || h.createdAt),
          label: `Status: ${h.oldStatus || '—'} → ${h.newStatus}` + (h.remarks ? ` (${h.remarks})` : ''),
          icon: 'swap_horiz',
          type: 'trip'
        })).sort((a: TimelineEvent, b: TimelineEvent) => b.time.getTime() - a.time.getTime());
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load status history.';
        this.isLoading = false;
      }
    });
  }

  formatTime(date: Date): string {
    return date.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
