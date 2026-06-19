import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TranslocoService } from '@jsverse/transloco';
import { authInterceptor } from '@qo/auth-lib';
import { provideQuantaTransloco } from '@qo/lang';
import { routes } from '@builder/app.routes';
import { environment } from '../environments/environment';
import { firstValueFrom, forkJoin } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideQuantaTransloco({ prodMode: environment.production }),
    provideAppInitializer(() => {
      const transloco = inject(TranslocoService);
      return firstValueFrom(forkJoin([
        transloco.load('en'),
        transloco.load('form-builder/en'),
        transloco.load('page-builder/en'),
        transloco.load('datasources/en'),
        transloco.load('report-builder/en'),
        transloco.load('workflow-builder/en'),
      ]));
    }),
  ],
};
