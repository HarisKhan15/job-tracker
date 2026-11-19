import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="login-wrap">
      <form class="card login-card" (ngSubmit)="submit()">
        <div class="brand big">
          <span class="logo">JT</span>
          <span>Job Tracker</span>
        </div>
        <p class="muted">Sign in to see your applications.</p>

        <label>Username
          <input name="username" [(ngModel)]="username" autocomplete="username" required autofocus />
        </label>
        <label>Password
          <input name="password" type="password" [(ngModel)]="password" autocomplete="current-password" required />
        </label>
        <label class="check">
          <input type="checkbox" name="remember" [(ngModel)]="remember" /> Keep me signed in on this device
        </label>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <button class="btn primary full" type="submit" [disabled]="loading() || !username || !password">
          {{ loading() ? 'Signing in…' : 'Sign in' }}
        </button>
        @if (loading()) {
          <p class="muted small">First load after a break can take up to a minute while the free server wakes up.</p>
        }
      </form>
    </div>
  `,
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  remember = true;
  loading = signal(false);
  error = signal('');

  async submit() {
    this.loading.set(true);
    this.error.set('');
    const ok = await this.auth.login(this.username.trim(), this.password, this.remember);
    this.loading.set(false);
    if (ok) {
      this.router.navigate(['/']);
    } else {
      this.error.set('Wrong username or password.');
    }
  }
}
