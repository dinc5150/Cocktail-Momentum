import { Injectable, computed, signal } from '@angular/core';

/** Not in the standard DOM lib — Chromium-only, deferred so we control when it's shown. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Captures the browser's install prompt so it can be triggered from our own outline
 * button (STYLE_GUIDE §6.2) instead of a mini-infobar — see docs/IMPLEMENTATION_PLAN.md
 * Phase 14. `preventDefault()` on the event is what suppresses the browser's own UI and
 * lets us replay `prompt()` later, on a click.
 */
@Injectable({ providedIn: 'root' })
export class InstallPromptStore {
  private readonly deferredEvent = signal<BeforeInstallPromptEvent | null>(null);

  readonly available = computed(() => this.deferredEvent() !== null);

  constructor() {
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.deferredEvent.set(event as BeforeInstallPromptEvent);
    });
    window.addEventListener('appinstalled', () => this.deferredEvent.set(null));
  }

  async promptInstall(): Promise<void> {
    const event = this.deferredEvent();
    if (!event) return;
    // One-shot: a BeforeInstallPromptEvent can only be prompted once.
    this.deferredEvent.set(null);
    await event.prompt();
  }
}
