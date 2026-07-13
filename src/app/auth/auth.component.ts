import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Import ActivatedRoute
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs'; // Import 'of' for error handling
import { AuthService, AuthUser } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { login, loadCurrentUser, loginFailure } from '../store/auth/auth.actions'; // Import loginFailure
import { AppState } from '../store/app.state';
import {
  selectCurrentUser,
  selectError,
  selectLoading,
} from '../store/auth/auth.selectors';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  mode: 'login' | 'register' = 'login';

  loginData = { email: '', password: '' };
  registerData = { username: '', email: '', password: '', confirmPassword: '' };

  showLoginPassword = false;
  showRegisterPassword = false;

  // Register UI state (kept as-is, since requirement only mandates NgRx for auth login state)
  registerIsSubmitting = false;
  registerErrorMessage = '';

  // NgRx selectors for login UI
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;
  currentUser$!: Observable<AuthUser | null>;

  // NEW: Flag to determine if we are in admin login mode
  isAdminLoginMode: boolean = false;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private store: Store<AppState>,
    private activatedRoute: ActivatedRoute // Inject ActivatedRoute
  ) {}

  ngOnInit() {
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
    this.currentUser$ = this.store.select(selectCurrentUser);

    this.activatedRoute.url.subscribe(urlSegments => {
      this.isAdminLoginMode = urlSegments.some(segment => segment.path === 'admin' && urlSegments[urlSegments.indexOf(segment) + 1]?.path === 'login');
      if (this.isAdminLoginMode) {
        this.mode = 'login'; // Force login mode for admin
        this.store.dispatch(loginFailure({ error: null })); // Clear any previous errors
      } else {
        // Navigate after successful login (only for non-admin logins)
        this.currentUser$.subscribe((user) => {
          if (!user) return;
          // Only navigate when we are in login mode (avoids unwanted navigation during other flows)
          if (this.mode === 'login') {
            this.handlePostLoginNavigation(user);
          }
        });
      }
    });
  }

  switchTo(mode: 'login' | 'register') {
    // Prevent switching to register mode if in admin login mode
    if (this.isAdminLoginMode && mode === 'register') {
      return;
    }
    this.mode = mode;
    this.registerErrorMessage = '';
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  onLoginSubmit() {
    if (this.isAdminLoginMode) {
      // Admin login flow
      this.store.dispatch(login({ payload: { ...this.loginData } })); // Dispatch to show loading/clear error
      this.authService.adminLogin(this.loginData.email, this.loginData.password).subscribe({
        next: () => {
          this.router.navigate(['/admin/dashboard']);
          this.store.dispatch(loginFailure({ error: null })); // Clear error on success
        },
        error: (err) => {
          const errorMessage = err?.error?.message || 'Admin login failed. Please check your credentials.';
          this.store.dispatch(loginFailure({ error: errorMessage })); // Set error for display
        },
      });
    } else {
      // Regular user login flow
      this.store.dispatch(login({ payload: { ...this.loginData } }));
    }
  }

  private handlePostLoginNavigation(user: AuthUser) {
    if (user.role === 'pendingSeller') {
      this.router.navigate(['/become-seller']);
      return;
    }

    if (user.role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else if (user.role === 'courier') {
      this.router.navigate(['/courier/dashboard']);
    } else {
      this.router.navigate(['/products']);
    }
  }

  onRegisterSubmit() {
    this.registerErrorMessage = '';
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.registerErrorMessage = 'Passwords do not match.';
      return;
    }

    this.registerIsSubmitting = true;

    this.authService.register({
      username: this.registerData.username,
      email: this.registerData.email,
      password: this.registerData.password,
    }).subscribe({
      next: () => {
        this.registerIsSubmitting = false;
        this.cartService.reset();
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.registerIsSubmitting = false;
        this.registerErrorMessage =
          err?.error?.message || 'Registration failed. Please try again.';
      },
    });
  }
}