import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { ThemeService } from './theme-toggle.service';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss',
  imports: [MatMenuModule, MatIconModule, MatButtonModule],
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);

  readonly theme = this.themeService.theme;

  readonly icon = computed(() => {
    const current = this.theme();
    if (current === 'light') return 'wb_sunny';
    if (current === 'dark') return 'brightness_3';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'brightness_3' : 'wb_sunny';
  });

  changeTheme(theme: 'light' | 'dark' | 'system') {
    this.themeService.setTheme(theme);
  }
}
