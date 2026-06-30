import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css'],
})
export class AdminLoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isSubmitting = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.isSubmitting = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.user.role !== 'admin') {
          this.errorMessage = 'This account does not have admin access.';
          this.authService.logout();
          return;
        }
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || 'Invalid email or password.';
      },
    });
  }
}