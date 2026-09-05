import { Component, input } from '@angular/core';

/** STYLE_GUIDE §6.5 — always say what to do next, e.g. "Your pantry is empty. Add an ingredient above." */
@Component({
  selector: 'cm-empty-state',
  standalone: true,
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
})
export class EmptyState {
  message = input.required<string>();
}
