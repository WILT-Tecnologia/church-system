import { effect, Injectable, signal } from '@angular/core';

type ThemePreference = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'theme';

  theme = signal<ThemePreference>(this.getInitialTheme());

  constructor() {
    this.applyTheme(this.theme());

    effect(() => {
      const value = this.theme();
      localStorage.setItem(this.STORAGE_KEY, value);
      this.applyTheme(value);
    });

    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.theme() === 'system') {
        this.applyTheme('system');
      }
    });
  }

  setTheme(theme: ThemePreference) {
    this.theme.set(theme);
  }

  private getInitialTheme(): ThemePreference {
    const stored = localStorage.getItem(this.STORAGE_KEY) as ThemePreference | null;
    return stored ?? 'system';
  }

  private applyTheme(theme: ThemePreference) {
    const classList = document.body.classList;
    classList.remove('light-theme', 'dark-theme');

    if (theme === 'light') {
      classList.add('light-theme');
    } else if (theme === 'dark') {
      classList.add('dark-theme');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      classList.add(prefersDark ? 'dark-theme' : 'light-theme');
    }
  }
}
