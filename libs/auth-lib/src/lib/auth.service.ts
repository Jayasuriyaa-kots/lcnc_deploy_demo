import { Injectable, signal } from '@angular/core';
import { PlatformUser } from '@qo/models';
import { JwtPayload } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private static readonly USER_KEY = 'qo_current_user';

  private accessToken = signal<string | null>(null);
  currentUser = signal<PlatformUser | null>(null);

  constructor() {
    if (typeof window !== 'undefined') {
      const rawUser = sessionStorage.getItem(AuthService.USER_KEY);
      if (rawUser) {
        try {
          this.currentUser.set(JSON.parse(rawUser) as PlatformUser);
        } catch {
          sessionStorage.removeItem(AuthService.USER_KEY);
        }
      }
    }
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return Boolean(token && this.isTokenValid(token) && this.currentUser());
  }

  isTokenValid(token: string): boolean {
    const payload = this.decodePayload(token);
    if (!payload?.exp) {
      return false;
    }

    return payload.exp > Math.floor(Date.now() / 1000);
  }

  hasScope(scope: string): boolean {
    const token = this.getAccessToken();
    if (!token || !this.isTokenValid(token)) {
      return false;
    }

    const payload = this.decodePayload(token);
    const scopes = new Set<string>(payload?.scopes ?? []);
    if (payload?.scope) {
      payload.scope.split(/\s+/).filter(Boolean).forEach((item) => scopes.add(item));
    }

    return scopes.has(scope);
  }

  getAccessToken() {
    return this.accessToken();
  }

  login(token: string, user: PlatformUser) {
    this.accessToken.set(token);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
    }
    this.currentUser.set(user);
  }

  logout() {
    this.accessToken.set(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(AuthService.USER_KEY);
    }
    this.currentUser.set(null);
  }

  private decodePayload(token: string): JwtPayload | null {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }

    try {
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
      return JSON.parse(atob(padded)) as JwtPayload;
    } catch {
      return null;
    }
  }
}

