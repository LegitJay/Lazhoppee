// c:\Angular Projects\Lazhoppee\src\app\profile\profile.component.ts (COMPLETE FIXED VERSION)
import { Component, ElementRef, ViewChild } from '@angular/core';
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


export class ProfileComponent {
  user: any = null;
  application: any = null;
  loadingApplication = false;
  profileImageUrl: string | null = null;
  isEditMode = false;
  isStoreEditMode = false;
  editForm = { email: '', username: '' };

  // COMPLETELY FIXED storeEditForm WITH ALL FIELDS
  storeEditForm = {
    storeName: '',
    storeDescription: '',
    storeAddress: '',
    storeContact: '',
    storeEmail: ''
  };

  // Map properties
  private map!: L.Map;
  private mapMarker: L.Marker | null = null;
  readonly defaultLat = 12.8797;
  readonly defaultLng = 121.7740;
  readonly defaultZoom = 12;

  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;
  @ViewChild('storeMap') storeMapEl!: ElementRef<HTMLElement>;

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
        // Prefer the image saved in the database; fall back to any legacy
        // localStorage-cached copy only if the server doesn't have one.
        if (freshUser.id) {
          this.profileImageUrl = freshUser.profileImage || localStorage.getItem(`profileImageUrl_${freshUser.id}`);
        }
        // Load application for both pending sellers AND approved store owners
        // so store details (name, location, description) persist in profile
        if (freshUser.role === 'pendingSeller' || freshUser.role === 'storeOwner') {
          this.loadApplication();
        }
      },
      error: () => {
        this.user = this.authService.getUser();
        if (this.user?.id) {
          this.profileImageUrl = this.user?.profileImage || localStorage.getItem(`profileImageUrl_${this.user.id}`);
        }
        // Fallback: if getMe fails, still try to load app if user is seller
        if (this.user?.role === 'pendingSeller' || this.user?.role === 'storeOwner') {
          this.loadApplication();
        }
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.user?.role === 'storeOwner') {
      setTimeout(() => this.initStoreMap(), 100);
    }
  }

  private initStoreMap(): void {
    if (!this.storeMapEl?.nativeElement) return;
    if (this.map) {
      this.map.remove();
    }

    let lat = this.defaultLat;
    let lng = this.defaultLng;

    if (this.application?.location?.lat && this.application?.location?.lng) {
      lat = this.application.location.lat;
      lng = this.application.location.lng;
    }

    this.map = L.map(this.storeMapEl.nativeElement).setView([lat, lng], this.defaultZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    setTimeout(() => this.map.invalidateSize(), 0);

    this.addMapMarker(lat, lng);

    // Only allow pin-dragging while actively editing
    if (this.user?.role === 'storeOwner' && this.isStoreEditMode) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.updateStoreLocation(e.latlng.lat, e.latlng.lng);
      });
    }
  }
  private addMapMarker(lat: number, lng: number): void {
    if (this.mapMarker) {
      this.mapMarker.setLatLng([lat, lng]);
    } else {
      this.mapMarker = L.marker([lat, lng]).addTo(this.map);
    }
  }

  private updateStoreLocation(lat: number, lng: number): void {
    if (this.application && this.mapMarker && this.user?.id) {
      // Update application object with NEW coordinates
      this.application.location = { lat, lng };
      // Move the marker
      this.addMapMarker(lat, lng);
      // SAVE TO LOCALSTORAGE for THIS SPECIFIC USER only
      const allApps = JSON.parse(localStorage.getItem('sellerApplications') || '{}');
      allApps[this.user.id] = this.application;
      localStorage.setItem('sellerApplications', JSON.stringify(allApps));
      console.log('New location saved:', this.application.location);
    }
  }

  loadApplication(): void {
    if (!this.user?.id) return;
    this.loadingApplication = true;

    if (this.user.role === 'storeOwner') {
      // For approved store owners, fetch the live Store document.
      this.storeService.getStoreByOwnerId(this.user.id).subscribe({
        next: (storeData) => {
          this.application = storeData;
          this.loadingApplication = false;
          setTimeout(() => this.initStoreMap(), 0);
        },
        error: (err: any) => {
          console.error('Failed to load store data:', err);
          this.application = null; // Ensure fallback works
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

  // --- GETTERS FOR TEMPLATE ACCESS ---
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

  // Store getters for storeOwner profiles
  get storeLocation(): string {
    if (!this.application?.location) return 'Location not provided';
    // If location is the coordinates object from the map, format it nicely
    if (typeof this.application.location === 'object' && this.application.location.lat && this.application.location.lng) {
      return `${this.application.location.lat.toFixed(4)}, ${this.application.location.lng.toFixed(4)}`;
    }
    if (typeof this.application.location === 'string') return this.application.location;
    return 'Location set on map';
  }

  get storeDescription(): string {
    return this.application?.storeDescription || 'A polished storefront is on the way.';
  }

  // NEW GETTERS FOR CONTACT FIELDS - ALWAYS PRESENT
  get storeAddress(): string {
    return this.application?.storeAddress || 'Address not provided';
  }

  get storeContact(): string {
    return this.application?.storeContact || 'Contact not provided';
  }

  get storeEmail(): string {
    return this.application?.storeEmail || 'Email not provided';
  }

  // --- CUSTOMER EDIT MODE ---
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
      // Save to backend
      this.authService.updateUserProfile(updatedData).subscribe({
        next: () => console.log('Profile updated successfully'),
        error: (err) => console.error('Update failed:', err)
      });
    }
    this.toggleEditMode();
  }

  // --- STORE OWNER EDIT MODE ---
  toggleStoreEditMode(): void {
    this.isStoreEditMode = !this.isStoreEditMode;
    if (this.isStoreEditMode) {
      this.storeEditForm.storeName = this.application?.storeName || '';
      this.storeEditForm.storeDescription = this.application?.storeDescription || '';
      this.storeEditForm.storeAddress = this.application?.storeAddress || '';
      this.storeEditForm.storeContact = this.application?.storeContact || '';
      this.storeEditForm.storeEmail = this.application?.storeEmail || '';
    }
    // Re-initialize map to enable/disable click events
    this.initStoreMap();
  }

  saveStoreChanges(): void {
    if (!this.user?.id || !this.application?._id) return;

    const updatedStoreData = {
      ...this.storeEditForm,
      location: this.application.location // Keep the updated location
    };

    this.storeService.updateStore(this.application._id, updatedStoreData).subscribe({
      next: (updatedStore) => {
        this.application = updatedStore;
        this.notificationService.show('Store details updated!', 'success');
        this.toggleStoreEditMode(); // Exit edit mode
      },
      error: (err) => {
        console.error('Failed to update store:', err);
        this.notificationService.show('Failed to update store. Please try again.', 'error');
      }
    });
  }

  // --- PROFILE PICTURE UPLOAD ---
  triggerAvatarUpload(): void {
    this.avatarInput?.nativeElement.click();
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

  // Converts the selected file to base64 and uploads it to the backend,
  // which stores it directly on the User document (profileImage field).
  // Update your onAvatarSelected method to use real backend upload
  // Update your onAvatarSelected method to work without the backend endpoint for now
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
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        const resizedImage = canvas.toDataURL('image/jpeg', 0.7);

        // Show it immediately in the UI without waiting for the network round trip
        this.profileImageUrl = resizedImage;
        if (this.user) this.user.profileImage = resizedImage;

        // Persist to the backend so OTHER users (customers viewing your store card,
        // the messages inbox, etc.) actually see it — localStorage alone only
        // helps your own browser, not anyone else looking at your seller profile.
        this.authService.updateUserProfile({ profileImage: resizedImage }).subscribe({
          next: () => {
            localStorage.setItem(`profileImageUrl_${this.user.id}`, resizedImage);
            console.log('Profile image saved to database');
          },
          error: (err) => console.error('Failed to save profile image to database:', err)
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  confirmDeleteAccount(): void {
    if (confirm('⚠️ WARNING: This will PERMANENTLY delete your account AND ALL your listed products. This action cannot be undone!')) {
      const deleteObservable = this.user.role === 'storeOwner'
        ? this.authService.deleteSellerAccountAndProducts()
        : this.authService.deleteAccount();

      deleteObservable.subscribe({
        next: () => {
          // Clear all local storage data and redirect to the public product list
          localStorage.clear();
          this.authService.logout();
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

}