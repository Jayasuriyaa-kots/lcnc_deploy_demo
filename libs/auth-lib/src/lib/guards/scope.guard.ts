import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const scopeGuard = (scope: string): CanActivateFn => {
  return (route, state) => {
    const auth = inject(AuthService);
    if (auth.hasScope(scope)) {
      return true;
    }

    return inject(Router).createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  };
};
