import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TranslocoService } from '@jsverse/transloco';
import { authInterceptor } from '@qo/auth-lib';
import { provideQuantaTransloco } from '@qo/lang';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { firstValueFrom, forkJoin } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideQuantaTransloco({ prodMode: environment.production }),
    provideAppInitializer(() => {
      const transloco = inject(TranslocoService);
      return firstValueFrom(forkJoin([
        transloco.load('en'),
        transloco.load('deployer/en'),
      ]));
    }),
  ],
};
