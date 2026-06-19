import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BrowserStorageService {
  private static readonly KEY_PATTERN = /^[a-zA-Z0-9:_.-]{1,120}$/;

  getString(key: string): string | null {
    if (!this.isAllowedKey(key)) {
      return null;
    }

    const storage = this.getStorage();
    if (!storage) {
      return null;
    }

    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  }

  setString(key: string, value: string): void {
    if (!this.isAllowedKey(key)) {
      return;
    }

    const storage = this.getStorage();
    if (!storage) {
      return;
    }

    try {
      storage.setItem(key, value);
    } catch {
      // Ignore storage write failures so UI state can continue in memory.
    }
  }

  getJson<T>(key: string): T | null {
    const raw = this.getString(key);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  setJson(key: string, value: unknown): void {
    this.setString(key, JSON.stringify(value));
  }

  remove(key: string): void {
    const storage = this.getStorage();
    if (!storage) {
      return;
    }

    try {
      storage.removeItem(key);
    } catch {
      // Ignore storage delete failures so UI state can continue in memory.
    }
  }

  private getStorage(): Storage | null {
    return typeof globalThis === 'undefined' ? null : globalThis.localStorage ?? null;
  }

  private isAllowedKey(key: string): boolean {
    return BrowserStorageService.KEY_PATTERN.test(key);
  }
}

export function injectBrowserStorage(): BrowserStorageService {
  try {
    return inject(BrowserStorageService);
  } catch {
    return new BrowserStorageService();
  }
}
