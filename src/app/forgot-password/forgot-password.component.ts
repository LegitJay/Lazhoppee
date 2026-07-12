import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-forgot-password',
  template: `
    <div class="container">
      <h2>Forgot Password</h2>
      <p>Enter your email address and we will send you a link to reset your password.</p>
      <form (ngSubmit)="onSubmit()">
        <input type="email" [(ngModel)]="email" name="email" placeholder="Email Address" required>
        <button type="submit" [disabled]="isSubmitting">
          {{ isSubmitting ? 'Sending...' : 'Send Reset Link' }}
        </button>
      </form>
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 400px;
        margin: 50px auto;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
      }
    `,
  ],
})
export class ForgotPasswordComponent {
  email: string = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  onSubmit(): void {
    this.isSubmitting = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.notificationService.show(res.msg, 'success');
        this.isSubmitting = false;
      },
      error: (err) => {
        this.notificationService.show(err.error.msg, 'error');
        this.isSubmitting = false;
      },
    });
  }
}