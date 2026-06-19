import { Injectable } from '@angular/core';
import { DeployerTheme } from '../models/deployer-theme.model';

const DEPLOYER_THEME_STORAGE_KEY = 'qo_deployer_theme';

@Injectable({ providedIn: 'root' })
export class ThemeStorageService {
  getTheme(): DeployerTheme | null {
    if (!this.hasStorage()) {
      return null;
    }

    const storedTheme = localStorage.getItem(DEPLOYER_THEME_STORAGE_KEY);

    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }

    return null;
  }

  saveTheme(theme: DeployerTheme): void {
    if (!this.hasStorage()) {
      return;
    }

    localStorage.setItem(DEPLOYER_THEME_STORAGE_KEY, theme);
  }

  private hasStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }
}
