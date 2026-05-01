import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatIconModule } from '@angular/material/icon';
import { log } from 'console';
import { Subject, takeUntil } from 'rxjs';
import { VehicleLocationService } from 'src/app/services/vehicle-location.service';

@Component({
  selector: 'app-vehicle-management',
  standalone: true,
  imports: [GoogleMapsModule, CommonModule, MatIconModule],
  templateUrl: './vehicle-management.component.html',
  styleUrls: ['./vehicle-management.component.css']
})
export class VehicleManagementComponent implements OnInit, OnDestroy {

  vehicleId = 1; // 🔥 replace with route param later

  mapsLoaded = typeof google !== 'undefined' && !!google.maps;
  mapsLoadError = '';

  private destroy$ = new Subject<void>();
  private readonly googleMapsScriptId = 'google-maps-js-api';

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

  polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#f97316',
    strokeOpacity: 0.9,
    strokeWeight: 4
  };

  constructor(private vehicleService: VehicleLocationService) {}

  ngOnInit(): void {
    this.loadGoogleMaps();
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
          console.log('Initial location:', res);
          this.animateMarker(res.latitude, res.longitude);
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

  private loadGoogleMaps(): void {
    if (this.mapsLoaded) {
      return;
    }

    const apiKey = (window as any).env?.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      this.mapsLoadError = 'Google Maps API key is missing.';
      return;
    }

    const existingScript = document.getElementById(this.googleMapsScriptId) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener('load', () => this.mapsLoaded = true);
      existingScript.addEventListener('error', () => this.mapsLoadError = 'Unable to load Google Maps.');
      return;
    }

    const script = document.createElement('script');
    script.id = this.googleMapsScriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => this.mapsLoaded = true;
    script.onerror = () => this.mapsLoadError = 'Unable to load Google Maps.';

    document.head.appendChild(script);
  }
}
