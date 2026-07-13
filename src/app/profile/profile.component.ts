// c:\Angular Projects\Lazhoppee\src\app\profile\profile.component.ts
import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import * as L from 'leaflet';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { StoreService } from '../services/store.service';
import { SellerService } from '../services/seller.service';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: any = null;
  application: any = null;
  loadingApplication = false;
  profileImageUrl: string | null = null;
  isEditMode = false;
  isStoreEditMode = false;
  editForm = { email: '', username: '' };

  storeEditForm = {
    storeName: '',
    storeDescription: '',
    storeAddress: '',
    storeContact: '',
    storeEmail: ''
  };

  // Map state
  private map: L.Map | null = null;
  private mapMarker: L.Marker | null = null;
  private currentMapContainer: HTMLElement | null = null;

  // FIX: MutationObserver removed — it was a workaround for [hidden] keeping the
  // edit container in the DOM while invisible. Now that both panels use *ngIf,
  // the ViewChild reactive setters fire exactly when the element enters the DOM
  // with real dimensions, so no observer is needed.

  readonly defaultLat = 12.8797;
  readonly defaultLng = 121.7740;
  readonly defaultZoom = 12;

  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;

  /**
   * Reactive ViewChild setters capture the map container the instant *ngIf
   * adds it to the DOM. At that point the element is visible and has real
   * dimensions, so Leaflet can measure and render tiles correctly.
   */
  @ViewChild('storeMapView') set storeMapView(el: ElementRef<HTMLElement> | undefined) {
    if (el) {
      this.currentMapContainer = el.nativeElement;
      this.buildMap(false);
    }
  }

  @ViewChild('storeMapEdit') set storeMapEdit(el: ElementRef<HTMLElement> | undefined) {
    if (el) {
      this.currentMapContainer = el.nativeElement;
      this.buildMap(true);
    }
  }

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private notificationService: NotificationService,
    private storeService: StoreService,
    private sellerService: SellerService
  ) { }

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: (freshUser) => {
        this.user = freshUser;
        if (freshUser.id) {
          this.profileImageUrl = freshUser.profileImage
            || localStorage.getItem(`profileImageUrl_${freshUser.id}`);
        }
        if (freshUser.role === 'pendingSeller' || freshUser.role === 'storeOwner') {
          this.loadApplication();
        }
      },
      error: () => {
        this.user = this.authService.getUser();
        if (this.user?.id) {
          this.profileImageUrl = this.user?.profileImage
            || localStorage.getItem(`profileImageUrl_${this.user.id}`);
        }
        if (this.user?.role === 'pendingSeller' || this.user?.role === 'storeOwner') {
          this.loadApplication();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.cleanupMap();
  }

  // ---------------------------------------------------------------
  // MAP ENGINE (ONE SOURCE OF TRUTH)
  // ---------------------------------------------------------------

  /**
   * Builds or rebuilds the Leaflet map inside the currently active container.
   * Only runs when both the DOM container and the application data are ready.
   * Because both panels now use *ngIf (not [hidden]), the container always has
   * real pixel dimensions when this method is called.
   */
  private buildMap(editMode: boolean): void {
    if (!this.currentMapContainer || !this.application) {
      return;
    }

    this.cleanupMap();

    const lat = this.application?.location?.lat ?? this.defaultLat;
    const lng = this.application?.location?.lng ?? this.defaultLng;

    this.map = L.map(this.currentMapContainer).setView([lat, lng], this.defaultZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.addMapMarker(lat, lng);

    if (editMode) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.updateStoreLocation(e.latlng.lat, e.latlng.lng);
      });
    }

    // Forces Leaflet to recalculate geometries after the browser finishes painting
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  /**
   * Safely removes Leaflet event listeners and tears down the map instance
   * to prevent memory leaks before mounting a new one.
   */
  private cleanupMap(): void {
    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null;
    }
    this.mapMarker = null;
  }

  private addMapMarker(lat: number, lng: number): void {
    if (!this.map) return;

    if (this.mapMarker) {
      this.mapMarker.setLatLng([lat, lng]);
    } else {
      this.mapMarker = L.marker([lat, lng]).addTo(this.map);
    }
  }

  private updateStoreLocation(lat: number, lng: number): void {
    if (!this.application || !this.user?.id) return;
    this.application.location = { lat, lng };
    this.addMapMarker(lat, lng);

    const allApps = JSON.parse(localStorage.getItem('sellerApplications') || '{}');
    allApps[this.user.id] = this.application;
    localStorage.setItem('sellerApplications', JSON.stringify(allApps));
  }

  // ---------------------------------------------------------------
  // DATA LOADING
  // ---------------------------------------------------------------

  loadApplication(): void {
    if (!this.user?.id) return;
    this.loadingApplication = true;

    if (this.user.role === 'storeOwner') {
      this.storeService.getStoreByOwnerId(this.user.id).subscribe({
        next: (storeData) => {
          this.application = storeData;
          this.loadingApplication = false;
          // Re-evaluate map in case the ViewChild setter fired before data arrived
          this.buildMap(this.isStoreEditMode);
        },
        error: (err: any) => {
          console.error('Failed to load store data:', err);
          this.application = null;
          this.loadingApplication = false;
        }
      });
    } else if (this.user.role === 'pendingSeller') {
      this.sellerService.getApplicationByUserId(this.user.id).subscribe({
        next: (applicationData: any) => {
          this.application = applicationData;
          this.loadingApplication = false;
        },
        error: (err: any) => {
          console.error('Failed to load application data:', err);
          this.application = null;
          this.loadingApplication = false;
        }
      });
    } else {
      this.loadingApplication = false;
    }
  }

  // ---------------------------------------------------------------
  // GETTERS
  // ---------------------------------------------------------------

  get fullName(): string {
    return this.user?.username || 'Guest User';
  }

  get userEmail(): string {
    return this.user?.email || 'guest@example.com';
  }

  get userRole(): string {
    if (!this.user?.role) return 'Customer';
    const roleMap: Record<string, string> = {
      customer: 'Customer',
      storeOwner: 'Store Owner',
      pendingSeller: 'Seller Application Pending'
    };
    return roleMap[this.user.role] || this.user.role;
  }

  get joinedDate(): string {
    if (!this.user?.createdAt) return 'N/A';
    return new Date(this.user.createdAt).toLocaleDateString();
  }

  get storeLocation(): string {
    if (!this.application?.location) return 'Location not provided';
    if (
      typeof this.application.location === 'object'
      && this.application.location.lat
      && this.application.location.lng
    ) {
      return `${this.application.location.lat.toFixed(4)}, ${this.application.location.lng.toFixed(4)}`;
    }
    if (typeof this.application.location === 'string') return this.application.location;
    return 'Location set on map';
  }

  get storeDescription(): string {
    return this.application?.storeDescription || 'A polished storefront is on the way.';
  }

  get storeAddress(): string {
    return this.application?.storeAddress || 'Address not provided';
  }

  get storeContact(): string {
    return this.application?.storeContact || 'Contact not provided';
  }

  get storeEmail(): string {
    return this.application?.storeEmail || 'Email not provided';
  }

  get roleLabel(): string {
    return this.userRole;
  }

  get emailLabel(): string {
    return this.userEmail;
  }

  get storeName(): string {
    return this.application?.storeName || this.fullName;
  }

  getAvatarInitial(): string {
    const source = this.storeName || this.fullName || this.userEmail;
    return source ? source.charAt(0).toUpperCase() : '?';
  }

  // ---------------------------------------------------------------
  // EDIT MODES
  // ---------------------------------------------------------------

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.editForm.email = this.userEmail;
      this.editForm.username = this.user?.username || '';
    }
  }

  saveAccountChanges(): void {
    if (this.user) {
      const updatedData = {
        username: this.editForm.username,
        email: this.editForm.email
      };
      this.user.username = this.editForm.username;
      this.user.email = this.editForm.email;
      this.authService.updateUserProfile(updatedData).subscribe({
        next: () => console.log('Profile updated successfully'),
        error: (err) => console.error('Update failed:', err)
      });
    }
    this.toggleEditMode();
  }

  toggleStoreEditMode(): void {
    this.isStoreEditMode = !this.isStoreEditMode;

    // Nulling the container reference here triggers a clean teardown cycle
    // before *ngIf swaps the structural panels in the DOM.
    this.currentMapContainer = null;

    if (this.isStoreEditMode) {
      this.storeEditForm.storeName = this.application?.storeName || '';
      this.storeEditForm.storeDescription = this.application?.storeDescription || '';
      this.storeEditForm.storeAddress = this.application?.storeAddress || '';
      this.storeEditForm.storeContact = this.application?.storeContact || '';
      this.storeEditForm.storeEmail = this.application?.storeEmail || '';
      // FIX: setupMapObserver() call removed — the MutationObserver was only needed
      // because [hidden] kept the edit container in the DOM while invisible.
      // With *ngIf, the #storeMapEdit ViewChild setter fires automatically
      // the moment Angular stamps the edit panel into the DOM.
    }
  }

  saveStoreChanges(): void {
    if (!this.user?.id || !this.application?._id) return;

    const updatedStoreData = {
      ...this.storeEditForm,
      location: this.application.location
    };

    this.storeService.updateStore(this.application._id, updatedStoreData).subscribe({
      next: (updatedStore) => {
        this.application = updatedStore;
        this.notificationService.show('Store details updated!', 'success');
        this.toggleStoreEditMode();
      },
      error: (err) => {
        console.error('Failed to update store:', err);
        this.notificationService.show('Failed to update store. Please try again.', 'error');
      }
    });
  }

  // ---------------------------------------------------------------
  // AVATAR UPLOAD
  // ---------------------------------------------------------------

  triggerAvatarUpload(): void {
    this.avatarInput?.nativeElement.click();
  }

  onAvatarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.user?.id) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxSize = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) { height *= maxSize / width; width = maxSize; }
        } else {
          if (height > maxSize) { width *= maxSize / height; height = maxSize; }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        const resizedImage = canvas.toDataURL('image/jpeg', 0.7);

        this.profileImageUrl = resizedImage;
        if (this.user) this.user.profileImage = resizedImage;

        this.authService.updateUserProfile({ profileImage: resizedImage }).subscribe({
          next: () => {
            localStorage.setItem(`profileImageUrl_${this.user.id}`, resizedImage);
          },
          error: (err) => console.error('Failed to save profile image:', err)
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  // ---------------------------------------------------------------
  // ACCOUNT ACTIONS
  // ---------------------------------------------------------------

  confirmDeleteAccount(): void {
    if (!confirm(
      '⚠️ WARNING: This will PERMANENTLY delete your account AND ALL your listed products. This action cannot be undone!'
    )) return;

    const deleteObservable = this.user.role === 'storeOwner'
      ? this.authService.deleteSellerAccountAndProducts()
      : this.authService.deleteAccount();

    deleteObservable.subscribe({
      next: () => {
        localStorage.clear();
        this.authService['userSubject'].next(null);
        this.router.navigate(['/products']);
        this.notificationService.show('Account deleted successfully', 'success');
      },
      error: (err) => {
        console.error('Account deletion failed:', err);
        this.notificationService.show('Account deletion failed. Please try again.', 'error');
      }
    });
  }
}