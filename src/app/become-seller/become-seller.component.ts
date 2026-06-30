import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-become-seller',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './become-seller.component.html',
  styleUrls: ['./become-seller.component.css'],
})
export class BecomeSellerComponent implements OnInit, AfterViewInit {
  storeName = '';
  storeDescription = '';

  selectedLat: number | null = null;
  selectedLng: number | null = null;

  isSubmitting = false;
  errorMessage = '';

  private map!: L.Map;
  private marker: L.Marker | null = null;

  // Default view: Philippines, since that's the storefront's primary market
  private defaultLat = 12.8797;
  private defaultLng = 121.7740;
  private defaultZoom = 6;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.map = L.map('seller-map').setView([this.defaultLat, this.defaultLng], this.defaultZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.setLocation(e.latlng.lat, e.latlng.lng);
    });

    // Try to center on the user's current location for convenience
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.map.setView([pos.coords.latitude, pos.coords.longitude], 13);
        },
        () => {
          // Permission denied or unavailable — keep default view, no error needed
        }
      );
    }
  }

  private setLocation(lat: number, lng: number): void {
    this.selectedLat = lat;
    this.selectedLng = lng;

    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng]).addTo(this.map);
    }
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.storeName.trim()) {
      this.errorMessage = 'Store name is required.';
      return;
    }

    if (this.selectedLat === null || this.selectedLng === null) {
      this.errorMessage = 'Please pin your store location on the map.';
      return;
    }

    this.isSubmitting = true;

    this.authService
      .becomeSeller({
        storeName: this.storeName,
        storeDescription: this.storeDescription,
        location: { lat: this.selectedLat, lng: this.selectedLng },
      })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/profile']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err?.error?.message || 'Something went wrong. Please try again.';
        },
      });
  }
}