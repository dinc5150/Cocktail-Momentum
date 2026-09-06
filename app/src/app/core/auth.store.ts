import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Me } from './models';
import { skipAuthRedirect } from './auth.interceptor';

/** Accepts either a pasted magic-link URL or a bare token and returns the raw token. */
function extractMagicLinkToken(pastedLink: string): string {
  const trimmed = pastedLink.trim();
  try {
    return new URL(trimmed).searchParams.get('token') || trimmed;
  } catch {
    return trimmed;
  }
}

/**
 * The signal store every guard and page reads from. `refresh()` is called once at
 * bootstrap (see app.config.ts's provideAppInitializer) so `loading()` is settled and
 * `me()` reflects reality before any guard runs — guards themselves stay synchronous.
 * See docs/IMPLEMENTATION_PLAN.md Phase 10.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly meSignal = signal<Me | null>(null);
  private readonly loadingSignal = signal(true);

  readonly me = this.meSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.meSignal() !== null);
  readonly isGuest = computed(() => this.meSignal()?.isGuest ?? false);

  constructor(private readonly http: HttpClient) {}

  /**
   * Re-reads GET /me. A 401 (or any failure) just means "not signed in" — handled right
   * here, never thrown onward. Uses skipAuthRedirect() so the interceptor doesn't ALSO
   * react to the same 401 — every fresh, unauthenticated page load hits this on startup,
   * and letting the interceptor redirect on top of it would fight the router over
   * wherever the visitor was actually trying to go (see auth.interceptor.ts).
   */
  async refresh(): Promise<void> {
    this.loadingSignal.set(true);
    try {
      const me = await firstValueFrom(this.http.get<Me>('/api/me', skipAuthRedirect()));
      this.meSignal.set(me);
    } catch {
      this.meSignal.set(null);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async requestLink(email: string): Promise<void> {
    await firstValueFrom(this.http.post('/api/auth/request-link', { email }));
  }

  /**
   * Fallback for installed-PWA users: a magic link opened from a mail app almost never
   * lands in the installed app window (unreliable OS link capturing, and iOS's
   * "Add to Home Screen" apps don't share cookie storage with Safari at all), so
   * CheckEmail lets someone paste the link — or just the token — back into the app.
   * Hits the same /api/auth/callback the emailed link uses, but with an Accept header
   * that makes it respond with JSON instead of a redirect. Throws on an invalid/expired/
   * already-used token.
   */
  async consumeMagicLink(pastedLink: string): Promise<string> {
    const token = extractMagicLinkToken(pastedLink);
    const { destination } = await firstValueFrom(
      this.http.get<{ destination: string }>('/api/auth/callback', {
        params: { token },
        headers: { Accept: 'application/json' },
      }),
    );
    await this.refresh();
    return destination;
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post('/api/auth/logout', {}));
    this.meSignal.set(null);
  }

  async markOnboarded(): Promise<void> {
    await firstValueFrom(this.http.post('/api/me/onboarded', {}));
    await this.refresh();
  }

  /** Called by the 401 interceptor — the session is already gone server-side, this just catches the store up. */
  clear(): void {
    this.meSignal.set(null);
  }
}
