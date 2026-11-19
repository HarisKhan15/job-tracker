import { Component, inject } from '@angular/core';
import { ThemeService } from '../core/theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button type="button" class="icon-btn theme-btn" (click)="theme.toggle()"
            [title]="theme.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
            [attr.aria-label]="theme.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
      {{ theme.theme() === 'dark' ? '☀️' : '🌙' }}
    </button>
  `,
})
export class ThemeToggle {
  theme = inject(ThemeService);
}
