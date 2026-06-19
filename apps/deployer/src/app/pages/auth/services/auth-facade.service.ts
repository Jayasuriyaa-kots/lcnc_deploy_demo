import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@qo/auth-lib';
import { QoToastService } from '@qo/ui-components';
import { DeployerI18nService } from '../../../services/deployer-i18n.service';
import { LoginCredentials } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthFacadeService {
  readonly loading = signal(false);

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(QoToastService);
  private readonly i18n = inject(DeployerI18nService);

  showValidationError(): void {
    this.toast.error(this.i18n.translate('auth.validationError'), this.i18n.translate('auth.validationErrorMessage'));
  }

  login(credentials: LoginCredentials): void {
    this.loading.set(true);

    setTimeout(() => {
      this.loading.set(false);
      const user = {
        id: 'admin',
        email: credentials.email,
        firstName: this.i18n.translate('auth.systemFirstName'),
        lastName: this.i18n.translate('auth.adminLastName'),
        role: 'admin',
        status: 'active',
        lastActiveAt: new Date().toISOString(),
        organisationId: 'qo-platform'
      } as const;

      this.auth.login(this.createDevelopmentToken(user.id, user.email, ['platform']), user);
      this.toast.success(
        this.i18n.translate('auth.loginSuccessful'),
        this.i18n.translate('auth.welcomeBack', { email: credentials.email })
      );
      this.router.navigate(['/']);
    }, 800);
  }

  private createDevelopmentToken(sub: string, email: string, scopes: string[]): string {
    const header = this.encodeTokenPart({ alg: 'none', typ: 'JWT' });
    const payload = this.encodeTokenPart({
      sub,
      email,
      scopes,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      iat: Math.floor(Date.now() / 1000),
    });

    return `${header}.${payload}.`;
  }

  private encodeTokenPart(value: unknown): string {
    return btoa(JSON.stringify(value))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }
}
