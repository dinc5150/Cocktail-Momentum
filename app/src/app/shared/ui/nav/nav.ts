import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../../../core/auth.store';

/**
 * The one documented extension to STYLE_GUIDE §1.3 (which describes a no-navigation,
 * single-column app) — see docs/STYLE_GUIDE.md §6.7 and
 * docs/IMPLEMENTATION_PLAN.md Phase 9. Bottom bar on mobile, inline row on desktop; both
 * layouts live in nav.scss via a single 600px breakpoint.
 *
 * Collapses to Generate only for a guest (Phase 13) — guestBlockGuard would redirect them
 * away from the other three routes anyway, so showing links to routes they can't reach
 * would just be confusing, not merely redundant.
 */
@Component({
  selector: 'cm-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
})
export class Nav {
  protected readonly auth = inject(AuthStore);
}
