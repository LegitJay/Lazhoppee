import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reset-shell">
      <div class="reset-card">

        <!-- Left: form -->
        <div class="reset-form-side">
          <button class="back-btn" (click)="router.navigate(['/forgot-password'])">← Back</button>

          <p class="reset-eyebrow">Account recovery</p>
          <h1 class="reset-title">New password</h1>
          <p class="reset-subtitle">Paste the token from the previous step, then choose a new password.</p>

          <p class="reset-error" *ngIf="errorMessage">{{ errorMessage }}</p>

          <div class="reset-success" *ngIf="success">
            <span>✓</span> Password updated! Redirecting to login…
          </div>

          <form (ngSubmit)="onSubmit(); $event.preventDefault()" *ngIf="!success" novalidate>

            <label class="reset-field">
              <span class="reset-label">Reset Token</span>
              <input
                type="text"
                name="token"
                [(ngModel)]="token"
                required
                placeholder="Paste your reset token here"
                autocomplete="off" />
            </label>

            <label class="reset-field">
              <span class="reset-label">New Password</span>
              <div class="reset-password-wrap">
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  name="password"
                  [(ngModel)]="password"
                  required
                  placeholder="At least 8 characters"
                  autocomplete="new-password" />
                <button type="button" class="reset-toggle" (click)="showPassword = !showPassword">
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </label>

            <label class="reset-field">
              <span class="reset-label">Confirm Password</span>
              <div class="reset-password-wrap">
                <input
                  [type]="showConfirm ? 'text' : 'password'"
                  name="confirmPassword"
                  [(ngModel)]="confirmPassword"
                  required
                  placeholder="Type it again"
                  autocomplete="new-password" />
                <button type="button" class="reset-toggle" (click)="showConfirm = !showConfirm">
                  {{ showConfirm ? 'Hide' : 'Show' }}
                </button>
              </div>
            </label>

            <button
              type="submit"
              class="reset-submit"
              [disabled]="isSubmitting || !token || !password || !confirmPassword">
              {{ isSubmitting ? 'Updating…' : 'Update Password' }}
            </button>
          </form>
        </div>

        <!-- Right: decorative dark panel -->
        <div class="reset-deco-side">
          <div class="deco-content">
            <p class="deco-eyebrow">Almost there</p>
            <h2 class="deco-title">Choose a strong password.</h2>
            <p class="deco-copy">Use the token from the previous step and pick a password you have not used before.</p>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      --navy: #0b1b3a;
      --crimson: #d6293a;
      --cream: #f5f2ea;
      --card: #ffffff;
      --border: #e5e0d4;
      --muted: #8b8f98;
      --ink: #1a1a1a;
      --success: #1e7a4c;
      --success-tint: #e6f4ec;
    }
    .reset-shell {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--cream);
      padding: 2rem 1rem;
      font-family: Roboto, 'Helvetica Neue', sans-serif;
    }
    .reset-card {
      width: 100%;
      max-width: 880px;
      min-height: 480px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid var(--border);
      box-shadow: 0 30px 60px -20px rgba(11, 27, 58, 0.25);
    }
    .reset-form-side {
      background: var(--card);
      padding: 3rem 3.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      overflow-y: auto;
    }
    .back-btn {
      align-self: flex-start;
      background: none;
      border: none;
      padding: 0;
      font-size: 13px;
      font-weight: 600;
      color: var(--muted);
      cursor: pointer;
      font-family: inherit;
      margin-bottom: 0.5rem;
      transition: color 150ms ease;
    }
    .back-btn:hover { color: var(--crimson); }
    .reset-eyebrow {
      margin: 0;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--crimson);
    }
    .reset-title {
      margin: 0;
      font-family: 'Anton', 'Arial Narrow', sans-serif;
      font-size: 2rem;
      font-weight: 400;
      color: var(--navy);
    }
    .reset-subtitle {
      margin: 0 0 0.5rem;
      font-size: 13px;
      color: var(--muted);
      line-height: 1.55;
    }
    .reset-error {
      margin: 0;
      padding: 10px 12px;
      background: rgba(214, 41, 58, 0.08);
      border: 1px solid var(--crimson);
      border-radius: 8px;
      color: var(--crimson);
      font-size: 13px;
    }
    .reset-success {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 12px 14px;
      background: var(--success-tint);
      border: 1px solid var(--success);
      border-radius: 8px;
      color: var(--success);
      font-size: 14px;
      font-weight: 600;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
    }
    .reset-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .reset-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--navy);
    }
    .reset-field input {
      width: 100%;
      padding: 13px 14px;
      border: 1.5px solid var(--border);
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      background: #fff;
      color: var(--ink);
      outline: none;
      box-sizing: border-box;
      transition: border-color 150ms ease;
    }
    .reset-field input::placeholder { color: var(--muted); }
    .reset-field input:focus { border-color: var(--crimson); }
    .reset-password-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .reset-password-wrap input { padding-right: 60px; }
    .reset-toggle {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--muted);
      cursor: pointer;
      padding: 4px;
    }
    .reset-toggle:hover { color: var(--ink); }
    .reset-submit {
      margin-top: 0.25rem;
      padding: 14px 20px;
      background: var(--navy);
      color: var(--cream);
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      transition: background 150ms ease, transform 150ms ease;
    }
    .reset-submit:hover:not(:disabled) { background: var(--crimson); }
    .reset-submit:active:not(:disabled) { transform: scale(0.97); }
    .reset-submit:disabled {
      background: var(--border);
      color: var(--muted);
      cursor: not-allowed;
    }
    .reset-deco-side {
      background: var(--navy);
      position: relative;
      display: flex;
      align-items: center;
      padding: 3rem;
      overflow: hidden;
    }
    .reset-deco-side::before {
      content: '';
      position: absolute;
      inset: -20%;
      background:
        radial-gradient(circle at 25% 15%, rgba(214, 41, 58, 0.45), transparent 55%),
        radial-gradient(circle at 80% 85%, rgba(42, 91, 204, 0.35), transparent 55%);
    }
    .deco-content {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .deco-eyebrow {
      margin: 0;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--crimson);
    }
    .deco-title {
      margin: 0;
      font-family: 'Anton', 'Arial Narrow', sans-serif;
      font-size: 2rem;
      font-weight: 400;
      color: var(--cream);
      line-height: 1.15;
    }
    .deco-copy {
      margin: 0;
      font-size: 14px;
      color: rgba(245, 242, 234, 0.7);
      line-height: 1.6;
    }
    @media (max-width: 760px) {
      .reset-card {
        grid-template-columns: 1fr;
        border: none;
        box-shadow: none;
      }
      .reset-deco-side { display: none; }
      .reset-form-side {
        padding: 2rem 1.5rem;
        border-radius: 14px;
        border: 1px solid var(--border);
        box-shadow: 0 30px 60px -20px rgba(11, 27, 58, 0.18);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      * { transition: none !important; }
    }
  `]
})
export class ResetPasswordComponent {
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
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

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