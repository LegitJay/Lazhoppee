import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, SellerApplication, ManagedUser } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  // ---------- Seller Applications (unchanged) ----------
  applications: SellerApplication[] = [];
  filter: 'pending' | 'approved' | 'rejected' = 'pending';
  isLoading = false;

  // ---------- NEW: User Management ----------
  userTab: 'customer' | 'storeOwner' = 'customer';
  users: ManagedUser[] = [];
  isUsersLoading = false;
  userActionError: string | null = null;
  // Tracks which user row currently has an action (deactivate/activate) in flight,
  // so we can disable just that row's button instead of the whole table.
  userActionPendingId: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadApplications();
    this.loadUsers();
  }

  // ---------- Seller Applications methods (unchanged) ----------

  setFilter(status: 'pending' | 'approved' | 'rejected'): void {
    this.filter = status;
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.authService.getApplications(this.filter).subscribe({
      next: (apps) => { this.applications = apps; this.isLoading = false; },
      error: () => { this.isLoading = false; },
    });
  }

  approve(app: SellerApplication): void {
    this.authService.approveApplication(app._id).subscribe(() => this.loadApplications());
  }

  reject(app: SellerApplication): void {
    const reason = prompt('Reason for rejection (optional):') || '';
    this.authService.rejectApplication(app._id, reason).subscribe(() => this.loadApplications());
  }

  applicantEmail(app: SellerApplication): string {
    return typeof app.userId === 'object' ? app.userId.email : app.userId;
  }

  // ---------- NEW: User Management methods ----------

  setUserTab(tab: 'customer' | 'storeOwner'): void {
    this.userTab = tab;
    this.loadUsers();
  }

  loadUsers(): void {
    this.isUsersLoading = true;
    this.userActionError = null;
    this.authService.getUsersByRole(this.userTab).subscribe({
      next: (users) => {
        this.users = users;
        this.isUsersLoading = false;
      },
      error: () => {
        this.isUsersLoading = false;
        this.userActionError = 'Failed to load users. Please try again.';
      },
    });
  }

  toggleUserStatus(user: ManagedUser): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    const confirmMessage = user.isActive
      ? `Deactivate ${user.username || user.email}? They will no longer be able to log in.`
      : `Activate ${user.username || user.email}? They will be able to log in again.`;

    const confirmed = confirm(confirmMessage);
    if (!confirmed) return;

    this.userActionPendingId = user._id;
    this.userActionError = null;

    const request$ = action === 'deactivate'
      ? this.authService.deactivateUser(user._id)
      : this.authService.activateUser(user._id);

    request$.subscribe({
      next: (res) => {
        // Update the row in place instead of a full reload for a snappier UI
        const index = this.users.findIndex(u => u._id === user._id);
        if (index !== -1) {
          this.users[index] = res.user;
        }
        this.userActionPendingId = null;
      },
      error: () => {
        this.userActionPendingId = null;
        this.userActionError = `Failed to ${action} user. Please try again.`;
      },
    });
  }

  logout(): void {
    this.authService.adminLogout();
    this.router.navigate(['/auth']);
  }
}