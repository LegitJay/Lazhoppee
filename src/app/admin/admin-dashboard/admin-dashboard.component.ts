import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, SellerApplication } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  applications: SellerApplication[] = [];
  filter: 'pending' | 'approved' | 'rejected' = 'pending';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadApplications();
  }

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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}