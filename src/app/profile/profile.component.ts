import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, AuthUser } from '../auth/auth.service';
import { CartService } from '../cart/cart.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: AuthUser | null = null;
  application: any = null;
  loadingApplication = false;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Always get a fresh copy from the server so role changes
    // (e.g. approved → storeOwner) are reflected without a re-login.
    this.authService.getMe().subscribe({
      next: (freshUser) => {
        this.user = freshUser;
        if (freshUser.role === 'pendingSeller') {
          this.loadApplication();
        }
      },
      error: () => {
        // Fall back to the cached version if /auth/me fails
        this.user = this.authService.getUser();
      }
    });
  }

  private loadApplication(): void {
    this.loadingApplication = true;
    this.authService.getMyApplication().subscribe({
      next: (app) => {
        this.application = app;
        this.loadingApplication = false;
      },
      error: () => {
        this.loadingApplication = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.cartService.reset();
    this.router.navigate(['/auth']);
  }
}