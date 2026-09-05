import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Card } from '../../shared/ui/card/card';
import { Notice } from '../../shared/ui/notice/notice';
import { Spinner } from '../../shared/ui/spinner/spinner';
import { AuthStore } from '../../core/auth.store';
import { skipAuthRedirect } from '../../core/auth.interceptor';
import { ApiErrorBody } from '../../core/models';

/**
 * Redeems a share link and starts a guest session — see
 * docs/IMPLEMENTATION_PLAN.md Phase 13. No XSRF header here: this call, like
 * AuthCallback, happens before the caller has any session to have gotten a token from.
 * skipAuthRedirect() because a failed redemption (bad/expired/revoked token) is an
 * EXPECTED outcome this component already displays itself — see auth.interceptor.ts for
 * why letting the interceptor react too actively fights the router.
 */
@Component({
  selector: 'app-share-session',
  standalone: true,
  imports: [Card, Notice, Spinner],
  templateUrl: './share-session.html',
  styleUrl: './share-session.scss',
})
export class ShareSession implements OnInit {
  readonly error = signal<string | null>(null);

  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.error.set('This link is invalid.');
      return;
    }

    try {
      await firstValueFrom(this.http.post(`/api/share/${token}/session`, {}, skipAuthRedirect()));
      await this.auth.refresh();
      await this.router.navigate(['/generate']);
    } catch (err) {
      const body = err instanceof HttpErrorResponse ? (err.error as ApiErrorBody | undefined) : undefined;
      this.error.set(body?.error?.message ?? 'This link is invalid, expired, or has been revoked.');
    }
  }
}
