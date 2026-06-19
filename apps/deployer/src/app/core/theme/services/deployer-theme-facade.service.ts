import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { DeployerTheme } from '../models/deployer-theme.model';
import { ThemeStorageService } from './theme-storage.service';

@Injectable({ providedIn: 'root' })
export class DeployerThemeFacadeService {
  private readonly document = inject(DOCUMENT);
  private readonly storage = inject(ThemeStorageService);

  readonly theme = signal<DeployerTheme>('dark');
  readonly isDarkTheme = computed(() => this.theme() === 'dark');
  readonly themeClass = computed(() => `qo-theme-${this.theme()}`);

  constructor() {
    effect(() => {
      this.applyThemeClass(this.theme());
    });
  }

  loadTheme(): void {
    this.theme.set(this.storage.getTheme() ?? 'dark');
  }

  setTheme(theme: DeployerTheme): void {
    this.theme.set(theme);
    this.storage.saveTheme(theme);
  }

  toggleTheme(): void {
    let nextTheme: DeployerTheme = 'dark';

    this.theme.update((currentTheme) => {
      nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      return nextTheme;
    });
    this.storage.saveTheme(nextTheme);
  }

  private applyThemeClass(theme: DeployerTheme): void {
    const body = this.document.body;

    body.classList.remove('qo-theme-dark', 'qo-theme-light');
    body.classList.add(`qo-theme-${theme}`);
  }
}
