import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

const STORAGE_KEY = 'jt_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly token = signal<string | null>(readStored());
  readonly loggedIn = () => this.token() !== null;

  authHeader(): string | null {
    const t = this.token();
    return t ? `Basic ${t}` : null;
  }

  /** Returns true when the username/password are correct. */
  async login(username: string, password: string, remember: boolean): Promise<boolean> {
    const token = btoa(unescape(encodeURIComponent(`${username}:${password}`)));
    try {
      await firstValueFrom(this.http.get('/api/auth/me', {
        headers: new HttpHeaders({ Authorization: `Basic ${token}` }),
      }));
    } catch {
      return false;
    }
    this.token.set(token);
    try {
      (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, token);
    } catch { /* storage unavailable: stay logged in for this tab only */ }
    return true;
  }

  logout(): void {
    this.token.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
    this.router.navigate(['/login']);
  }
}

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
