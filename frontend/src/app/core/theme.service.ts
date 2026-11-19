import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'jt_theme';

/**
 * Light / dark mode. Follows the system setting until you press the toggle;
 * after that your choice is remembered on this device.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(initialTheme());

  constructor() {
    apply(this.theme());

    // Keep following the system setting while the user has not chosen manually
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!stored()) this.set(e.matches ? 'dark' : 'light', false);
      });
    } catch { /* old browser */ }
  }

  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark', true);
  }

  private set(theme: Theme, remember: boolean): void {
    this.theme.set(theme);
    apply(theme);
    if (remember) {
      try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
    }
  }
}

function stored(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'dark' || v === 'light' ? v : null;
  } catch {
    return null;
  }
}

function initialTheme(): Theme {
  const s = stored();
  if (s) return s;
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function apply(theme: Theme): void {
  document.documentElement.dataset['theme'] = theme;
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#14171f' : '#3b5bdb');
}
