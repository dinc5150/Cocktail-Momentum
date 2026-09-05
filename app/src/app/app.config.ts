import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
  withXsrfConfiguration,
} from '@angular/common/http';
import { routes } from './app.routes';
import { AuthStore } from './core/auth.store';
import { authInterceptor } from './core/auth.interceptor';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      // Exact cookie/header names the API's CookieWriter uses — matching these means
      // Angular attaches the CSRF header to every mutating request with zero per-call
      // code. See CLAUDE.md "Security" and api/Security/CookieWriter.cs.
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
      withInterceptors([authInterceptor]),
    ),
    // Runs once, before the app renders, so every guard can read AuthStore synchronously
    // — see core/guards.ts.
    provideAppInitializer(() => {
      const auth = inject(AuthStore);
      return auth.refresh();
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
