import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { AuthService, AuthUser } from '../../services/auth.service';
import { ProductService } from '../product.service';
import { Product } from '../../models/product';
import { StoreService } from '../../services/store.service';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface Store {
  _id: string;
  storeName: string;
  storeDescription: string;
  storeAddress: string;
  storeContact: string;
  storeEmail: string;
  location: { lat: number; lng: number };
  owner: string;
}

@Component({
  selector: 'app-store-profile',
  templateUrl: './store-profile.component.html',
  styleUrls: ['./store-profile.component.css']
})
export class StoreProfileComponent implements OnInit, OnDestroy {
  sellerId: string | null = null;
  seller: (AuthUser & { totalReviews?: number; rating?: number }) | null = null;
  store: Store | null = null;
  sellerProducts: Product[] = [];
  loading = true;
  productsLoading = true;
  error = '';

  private map: L.Map | null = null;
  private mapContainer: HTMLElement | null = null;

  @ViewChild('storeMap') set storeMap(el: ElementRef<HTMLElement> | undefined) {
    if (el) {
      this.mapContainer = el.nativeElement;
      this.initMap();
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private productService: ProductService,
    private storeService: StoreService
  ) { }

  ngOnInit(): void {
    this.sellerId = this.route.snapshot.paramMap.get('sellerId');
    if (!this.sellerId) {
      this.error = 'Invalid store ID';
      this.loading = false;
      return;
    }

    this.loadSellerData();
    this.loadStoreData();
    this.loadSellerProducts();
  }

  ngOnDestroy(): void {
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
      },
      error: () => {
        this.error = 'Failed to load store profile';
        this.loading = false;
      }
    });
  }

  private loadStoreData(): void {
    this.storeService.getStoreByOwnerId(this.sellerId!).subscribe({
      next: (storeData) => {
        this.store = storeData;
        this.initMap();
      },
      error: () => {
        this.store = null;
      }
    });
  }

  private initMap(): void {
    if (!this.mapContainer || !this.store || this.map) return;

    const lat = this.store.location?.lat;
    const lng = this.store.location?.lng;

    if (typeof lat !== 'number' || typeof lng !== 'number') return;

    this.map = L.map(this.mapContainer, {
      dragging: true,
      scrollWheelZoom: false,
    }).setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    L.marker([lat, lng]).addTo(this.map);

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  private loadSellerProducts(): void {
    this.productService.getProducts().subscribe({
      next: (allProducts) => {
        this.sellerProducts = allProducts.filter(p => {
          const id = (p.sellerId as any)?._id ?? p.sellerId;
          return id?.toString() === this.sellerId;
        });
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