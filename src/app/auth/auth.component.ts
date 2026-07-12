import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { CartService } from '../cart/cart.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent {
  mode: 'login' | 'register' = 'login';

  loginData = { email: '', password: '' };
  registerData = { username: '', email: '', password: '', confirmPassword: '' };

  showLoginPassword = false;
  showRegisterPassword = false;

  isSubmitting = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private location: Location
  ) { }

  switchTo(mode: 'login' | 'register') {
    this.mode = mode;
    this.errorMessage = '';
  }

  goBack(): void {
    this.location.back();
  }

  onLoginSubmit() {
    this.errorMessage = '';
    this.isSubmitting = true;

    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        if (res.user.role === 'pendingSeller') {
          this.router.navigate(['/become-seller']);
      }
        this.isSubmitting = false;
        // Fetch this user's cart immediately so the badge is correct
        this.cartService.refreshCartCount();

        if (res.user.role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else if (res.user.role === 'courier') {
          this.router.navigate(['/courier/dashboard']);
        } else {
          this.router.navigate(['/products']);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || 'Login failed. Please try again.';
      },
    });
  }

  onRegisterSubmit() {
    this.errorMessage = '';
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    this.isSubmitting = true;

      this.authService.register({
      username: this.registerData.username,
      email: this.registerData.email,
      password: this.registerData.password,
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.cartService.reset();
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || 'Registration failed. Please try again.';
      },
    });
  }
}