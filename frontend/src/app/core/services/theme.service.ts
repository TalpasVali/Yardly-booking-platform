import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'yardly-theme';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly theme = signal<Theme>(this.getSavedTheme());

  constructor() {
    effect(() => {
      const t = this.theme();
      if (this.isBrowser) {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem(this.STORAGE_KEY, t);
      }
    });
  }

  toggle(): void {
    this.theme.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  isDark(): boolean {
    return this.theme() === 'dark';
  }

  private getSavedTheme(): Theme {
    if (!this.isBrowser) return 'dark';
    const saved = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  }
}
