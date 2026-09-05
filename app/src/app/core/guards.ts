import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';

/**
 * All three guards are synchronous — they rely on AuthStore already being populated by
 * the app initializer (app.config.ts) before the router ever evaluates a route, so there
 * is no loading race to handle here. See docs/IMPLEMENTATION_PLAN.md Phase 10.
 */

/** Redirects to /welcome when there is no session at all (guest or user). */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  return auth.isAuthenticated() || router.createUrlTree(['/welcome']);
};

/** Forces /onboarding while a real user's onboarded flag is false. Guests always report onboarded:true (MeFunctions.cs) so this never touches them. */
export const onboardingGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  const me = auth.me();
  if (!me) {
    return router.createUrlTree(['/welcome']);
  }
  if (!me.isGuest && !me.onboarded) {
    return router.createUrlTree(['/onboarding']);
  }
  return true;
};

/** Guests may only reach /generate — everything else redirects them there. */
export const guestBlockGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  return !auth.isGuest() || router.createUrlTree(['/generate']);
};
