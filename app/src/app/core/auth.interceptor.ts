import { HttpContext, HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from './auth.store';

/**
 * Set on a request to opt out of the global 401 -> /welcome redirect below.
 *
 * Real bug this exists to fix: the interceptor originally redirected on EVERY 401
 * anywhere in the app, including the app initializer's own startup GET /api/me — which
 * always 401s for a first-time anonymous visitor, since there is no session yet. That
 * meant the interceptor unconditionally bounced every fresh, unauthenticated page load to
 * /welcome BEFORE the router could activate whatever route the person actually
 * requested — breaking /s/:token specifically, since a guest opening a share link for the
 * first time is exactly this case, and ShareSession never even got to run its own
 * redemption call. Caught only by watching real network traffic during a real page load,
 * not by reading either piece of code in isolation. Used on any request whose caller
 * already handles a 401/404 itself: AuthStore.refresh() and the share-link redemption
 * call in ShareSession. See docs/IMPLEMENTATION_PLAN.md Phase 13.
 */
export const SKIP_AUTH_REDIRECT = new HttpContextToken(() => false);

/** A 401 from a request that assumed an active session means it's gone server-side — clear the store and route to /welcome. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401 && !req.context.get(SKIP_AUTH_REDIRECT)) {
        auth.clear();
        void router.navigate(['/welcome']);
      }
      return throwError(() => err);
    }),
  );
};

export function skipAuthRedirect(): { context: HttpContext } {
  return { context: new HttpContext().set(SKIP_AUTH_REDIRECT, true) };
}
