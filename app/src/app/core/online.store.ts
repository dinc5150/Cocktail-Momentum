import { Injectable, signal } from '@angular/core';

/**
 * Tracks connectivity so the app shell can show a clear offline notice instead of
 * failing silently when the service worker serves the cached shell — see
 * docs/IMPLEMENTATION_PLAN.md Phase 14's checkpoint.
 */
@Injectable({ providedIn: 'root' })
export class OnlineStore {
  private readonly onlineSignal = signal(navigator.onLine);

  readonly online = this.onlineSignal.asReadonly();

  constructor() {
    window.addEventListener('online', () => this.onlineSignal.set(true));
    window.addEventListener('offline', () => this.onlineSignal.set(false));
  }
}
