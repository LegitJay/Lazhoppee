import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  forgotEmail = '';
  resetToken = '';
  errorMessage = '';
  isSubmitting = false;
  tokenCopied = false;

  constructor(
    private authService: AuthService,
    public router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.isSubmitting = true;
    this.authService.forgotPassword(this.forgotEmail).subscribe({
      next: (res: any) => {
        this.resetToken = res.token ?? res.resetToken ?? '';
        this.isSubmitting = false;
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || err?.error?.msg || 'Something went wrong.';
        this.isSubmitting = false;
      },
    });
  }

  copyToken(): void {
    navigator.clipboard.writeText(this.resetToken).then(() => {
      this.tokenCopied = true;
      setTimeout(() => (this.tokenCopied = false), 2000);
    });
  }

  goToReset(): void {
    this.router.navigate(['/reset-password', this.resetToken]);
  }
}