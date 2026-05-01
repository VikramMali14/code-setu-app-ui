import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { Subject, takeUntil } from 'rxjs';
import { VehicleLocationService } from 'src/app/services/vehicle-location.service';

@Component({
  selector: 'app-vehicle-management',
  standalone: true,
  imports: [GoogleMapsModule, CommonModule],
  templateUrl: './vehicle-management.component.html',
  styleUrls: ['./vehicle-management.component.css']
})
export class VehicleManagementComponent implements OnInit, OnDestroy {

  vehicleId = 1; // 🔥 replace with route param later

  private destroy$ = new Subject<void>();

  center: google.maps.LatLngLiteral = {
    lat: 21.1702,
    lng: 72.8311
  };

  markerPosition: google.maps.LatLngLiteral = {
    lat: 21.1702,
    lng: 72.8311
  };

  vehicleIcon = 'assets/images/APP_Icon.png';

  path: google.maps.LatLngLiteral[] = [];

  constructor(private vehicleService: VehicleLocationService) {}

  ngOnInit(): void {
    this.loadInitialLocation();

    this.vehicleService.connect(this.vehicleId);

    this.vehicleService.location$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (!data) return;

        this.animateMarker(data.latitude, data.longitude);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.vehicleService.disconnect();
  }

  loadInitialLocation() {
    this.vehicleService.loadInitialLocation(this.vehicleId)
      .subscribe(res => {
        if (res) {
          this.updateMarker(res.latitude, res.longitude);
        }
      });
  }

  updateMarker(lat: number, lng: number) {
    const position = { lat, lng };

    this.markerPosition = position;
    this.center = position;

    this.addToPath(position);
  }

  animateMarker(targetLat: number, targetLng: number) {
    const startLat = this.markerPosition.lat;
    const startLng = this.markerPosition.lng;

    const frames = 60;
    const duration = 1000;
    const interval = duration / frames;

    let frame = 0;

    const deltaLat = (targetLat - startLat) / frames;
    const deltaLng = (targetLng - startLng) / frames;

    const animation = setInterval(() => {
      frame++;

      this.markerPosition = {
        lat: startLat + deltaLat * frame,
        lng: startLng + deltaLng * frame
      };

      this.center = this.markerPosition;

      if (frame >= frames) {
        clearInterval(animation);

        this.markerPosition = { lat: targetLat, lng: targetLng };
        this.addToPath(this.markerPosition);
      }
    }, interval);
  }

  addToPath(position: google.maps.LatLngLiteral) {
    this.path.push(position);

    if (this.path.length > 200) {
      this.path.shift();
    }
  }

  getRotation(from: any, to: any) {
    const dy = to.lat - from.lat;
    const dx = to.lng - from.lng;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }
}
