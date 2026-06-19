import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';
import { TranslocoHttpLoader } from './transloco-loader';

export interface QuantaTranslocoOptions {
  /** Set true in production builds for smaller bundles. */
  prodMode?: boolean;
  availableLangs?: string[];
}

/**
 * Registers Transloco for a Quanta Ops app.
 * Call once in `app.config.ts`. The app must already provide `HttpClient`
 * (e.g. `provideHttpClient(withInterceptors([...]))`).
 */
export function provideQuantaTransloco(
  options: QuantaTranslocoOptions = {}
): EnvironmentProviders {
  const { prodMode = false, availableLangs = ['en'] } = options;

  return makeEnvironmentProviders([
    provideTransloco({
      config: {
        availableLangs,
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode,
        missingHandler: { useFallbackTranslation: true },
      },
      loader: TranslocoHttpLoader,
    }),
  ]);
}
