import { Component, input, output } from '@angular/core';

/**
 * A pill is always a button, never a static badge (STYLE_GUIDE §6.4 — "The status pill
 * is a button, not a badge: it states the current status and toggles on click"). Covers
 * both the pantry stock pill (positive/neutral) and filter pills (filter/filter-active).
 */
export type PillKind = 'filter' | 'filter-active' | 'positive' | 'neutral';

@Component({
  selector: 'cm-pill',
  standalone: true,
  templateUrl: './pill.html',
  styleUrl: './pill.scss',
})
export class Pill {
  kind = input<PillKind>('filter');
  pressed = output<void>();

  onClick(): void {
    this.pressed.emit();
  }
}
