import { Routes } from '@angular/router';
import { authGuard, guestBlockGuard, onboardingGuard } from './core/guards';

export const routes: Routes = [
  { path: '', redirectTo: 'generate', pathMatch: 'full' },

  { path: 'welcome', loadComponent: () => import('./features/welcome/welcome').then((m) => m.Welcome) },
  {
    path: 'check-email',
    loadComponent: () => import('./features/check-email/check-email').then((m) => m.CheckEmail),
  },
  {
    path: 'onboarding',
    canActivate: [authGuard],
    loadComponent: () => import('./features/onboarding/onboarding').then((m) => m.Onboarding),
  },
  {
    path: 's/:token',
    loadComponent: () => import('./features/share-session/share-session').then((m) => m.ShareSession),
  },

  // The four cm-nav destinations. Guests are welcome on /generate but blocked everywhere
  // else (guestBlockGuard); onboardingGuard forces a not-yet-onboarded real user back to
  // /onboarding first.
  {
    path: 'generate',
    canActivate: [authGuard, onboardingGuard],
    loadComponent: () => import('./features/generate/generate').then((m) => m.Generate),
  },
  {
    path: 'pantry',
    canActivate: [authGuard, onboardingGuard, guestBlockGuard],
    loadComponent: () => import('./features/pantry/pantry').then((m) => m.Pantry),
  },
  {
    path: 'favourites',
    canActivate: [authGuard, onboardingGuard, guestBlockGuard],
    loadComponent: () => import('./features/favourites/favourites').then((m) => m.Favourites),
  },
  {
    path: 'share',
    canActivate: [authGuard, onboardingGuard, guestBlockGuard],
    loadComponent: () => import('./features/share/share').then((m) => m.Share),
  },

  { path: '**', loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound) },
];
