import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Card } from '../../shared/ui/card/card';
import { Input } from '../../shared/ui/input/input';
import { Button } from '../../shared/ui/button/button';
import { Pill } from '../../shared/ui/pill/pill';
import { Spinner } from '../../shared/ui/spinner/spinner';
import { Notice } from '../../shared/ui/notice/notice';
import { AuthStore } from '../../core/auth.store';
import { FavouriteStore } from '../../core/favourites.store';
import { ApiErrorBody, Cocktail, GenerateResponse, Strictness } from '../../core/models';

@Component({
  selector: 'app-generate',
  standalone: true,
  imports: [Card, Input, Button, Pill, Spinner, Notice, DatePipe],
  templateUrl: './generate.html',
  styleUrl: './generate.scss',
})
export class Generate {
  readonly prompt = signal('');
  readonly strictness = signal<Strictness>('nearly');
  readonly generating = signal(false);
  readonly cocktails = signal<Cocktail[]>([]);
  readonly notice = signal<string | null>(null);
  readonly errorNotice = signal<string | null>(null);
  readonly savedNames = signal<ReadonlySet<string>>(new Set());

  private readonly http = inject(HttpClient);
  protected readonly auth = inject(AuthStore);
  private readonly favourites = inject(FavouriteStore);

  readonly me = this.auth.me;

  // quota.unlimited hides the line entirely — a whitelisted user never sees a counter.
  // See docs/IMPLEMENTATION_PLAN.md Phase 12 (Quota indicator).
  readonly quotaLine = computed(() => {
    const me = this.me();
    if (!me || me.quota.unlimited) return null;
    const limit = me.quota.limit ?? 0;
    const remaining = Math.max(0, limit - me.quota.used);
    return `${remaining} of ${limit} left today`;
  });

  readonly quotaExhausted = computed(() => {
    const me = this.me();
    if (!me || me.quota.unlimited) return false;
    return me.quota.used >= (me.quota.limit ?? 0);
  });

  // Announced via an always-present sr-only live region (generate.html) — the results
  // themselves aren't, since reading a screen reader through 3-5 full recipes unprompted
  // would be overwhelming. Phase 15 accessibility pass.
  readonly resultsAnnouncement = computed(() => {
    const count = this.cocktails().length;
    return count > 0 ? `${count} cocktail suggestion${count === 1 ? '' : 's'} ready below.` : '';
  });

  async generate(): Promise<void> {
    const prompt = this.prompt().trim();
    if (!prompt || this.generating() || this.quotaExhausted()) return;

    this.generating.set(true);
    this.errorNotice.set(null);
    this.notice.set(null);
    try {
      const response = await firstValueFrom(
        this.http.post<GenerateResponse>('/api/cocktails/generate', {
          prompt,
          strictness: this.strictness(),
        }),
      );
      this.cocktails.set(response.cocktails);
      this.notice.set(response.notice);
      this.savedNames.set(new Set());
      // The response already carries the post-generation quota, but AuthStore has no
      // partial-update path — a refresh keeps one source of truth rather than adding a
      // second way to mutate `me`.
      await this.auth.refresh();
    } catch (err) {
      this.cocktails.set([]);
      this.errorNotice.set(this.messageFor(err));
    } finally {
      this.generating.set(false);
    }
  }

  async save(cocktail: Cocktail): Promise<void> {
    if (this.savedNames().has(cocktail.name)) return;
    await this.favourites.save(cocktail, this.prompt().trim());
    this.savedNames.update((set) => new Set(set).add(cocktail.name));
  }

  private messageFor(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as ApiErrorBody | undefined;
      switch (body?.error?.code) {
        case 'quota_exceeded':
          // The API's own message already distinguishes "Your" vs "This bar's" daily
          // limit for guests — see api/Functions/CocktailFunctions.cs.
          return body.error.message;
        case 'ai_timeout':
          return 'That took too long — try a simpler request.';
        case 'ai_unavailable':
          return 'The AI service is unavailable right now — try again in a moment.';
        case 'rate_limited':
          return "You're generating a bit fast — wait a moment and try again.";
        case 'invalid_request':
          return body.error.message;
        default:
          return 'Something went wrong generating cocktails. Try again in a moment.';
      }
    }
    return 'Something went wrong generating cocktails. Try again in a moment.';
  }
}
