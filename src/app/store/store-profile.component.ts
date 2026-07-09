import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { AuthService, AuthUser } from '../auth/auth.service';
import { ProductService } from '../product/product.service';
import { Product } from '../models/product';

@Component({
  selector: 'app-store-profile',
  templateUrl: './store-profile.component.html',
  styleUrls: ['./store-profile.component.css']
})
export class StoreProfileComponent implements OnInit, OnDestroy {
  sellerId: string | null = null;
  seller: (AuthUser & { storeDetails?: any; totalReviews?: number; rating?: number }) | null = null;
  sellerProducts: Product[] = [];
  loading = true;
  productsLoading = true;
  error = '';

  private map: L.Map | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.sellerId = this.route.snapshot.paramMap.get('sellerId');
    if (!this.sellerId) {
      this.error = 'Invalid store ID';
      this.loading = false;
      return;
    }

    this.loadSellerData();
    this.loadSellerProducts();
  }

  ngOnDestroy(): void {
    // Prevent Leaflet memory leaks / "map container already initialized" errors
    // if the user navigates away and back to this component.
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private loadSellerData(): void {
    this.authService.getSellerById(this.sellerId!).subscribe({
      next: (sellerData) => {
        this.seller = sellerData;
        this.loading = false;

        const lat = sellerData?.storeDetails?.location?.lat;
        const lng = sellerData?.storeDetails?.location?.lng;
        if (typeof lat === 'number' && typeof lng === 'number') {
          // The #store-map div is behind *ngIf, so it doesn't exist in the DOM
          // yet on this exact tick. Deferring with setTimeout lets Angular
          // finish rendering it first (same pattern as BecomeSellerComponent).
          setTimeout(() => this.initMap(lat, lng), 0);
        }
      },
      error: () => {
        this.error = 'Failed to load store profile';
        this.loading = false;
      }
    });
  }

  private initMap(lat: number, lng: number): void {
    const mapEl = document.getElementById('store-map');
    if (!mapEl || this.map) return;

    this.map = L.map('store-map', {
      dragging: true,
      scrollWheelZoom: false, // avoids hijacking page scroll while browsing the profile
    }).setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    L.marker([lat, lng]).addTo(this.map);

    setTimeout(() => this.map?.invalidateSize(), 0);
  }

  private loadSellerProducts(): void {
    this.productService.getProducts().subscribe({
      next: (allProducts) => {
        this.sellerProducts = allProducts.filter(p => p.sellerId === this.sellerId);
        this.productsLoading = false;
      },
      error: () => {
        this.productsLoading = false;
      }
    });
  }

  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return 'assets/images/default-avatar.png';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:image')) {
      return imagePath;
    }
    return `http://localhost:3002/${imagePath.replace(/^\//, '')}`;
  }

  formatRole(role: string | undefined): string {
    if (!role) return 'Not provided';
    const map: Record<string, string> = {
      storeOwner: 'Store Owner',
      admin: 'Administrator',
      customer: 'Customer',
      pendingSeller: 'Pending Seller'
    };
    return map[role] || role;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}