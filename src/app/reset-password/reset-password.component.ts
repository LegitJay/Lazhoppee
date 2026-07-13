import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  password = '';
  confirmPassword = '';
  isSubmitting = false;
  errorMessage = '';
  success = false;
  showPassword = false;
  showConfirm = false;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const routeToken = this.route.snapshot.paramMap.get('token');
    if (routeToken) {
      this.token = routeToken;
    }
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters.';
      return;
    }

    this.isSubmitting = true;
    this.authService.resetPassword(this.token, this.password).subscribe({
      next: () => {
        this.success = true;
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/auth']), 2000);
      },
      error: (err) => {
        this.errorMessage = err?.error?.msg || err?.error?.message || 'Token is invalid or has expired.';
        this.isSubmitting = false;
      },
    });
  }
}