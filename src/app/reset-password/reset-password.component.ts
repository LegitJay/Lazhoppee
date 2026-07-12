import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-reset-password',
  template: `
    <div class="container">
      <h2>Reset Password</h2>
      <form (ngSubmit)="onSubmit()">
        <input type="password" [(ngModel)]="password" name="password" placeholder="New Password" required>
        <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" placeholder="Confirm New Password" required>
        <button type="submit" [disabled]="isSubmitting">
          {{ isSubmitting ? 'Resetting...' : 'Reset Password' }}
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
export class ResetPasswordComponent implements OnInit {
  password = '';
  confirmPassword = '';
  token = '';
  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.params['token'];
  }

  onSubmit(): void {
    if (this.password !== this.confirmPassword) {
      this.notificationService.show('Passwords do not match', 'error');
      return;
    }

    this.isSubmitting = true;
    this.authService.resetPassword(this.token, this.password).subscribe({
      next: (res) => {
        this.notificationService.show(res.msg, 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.notificationService.show(err.error.msg, 'error');
        this.isSubmitting = false;
      },
    });
  }
}