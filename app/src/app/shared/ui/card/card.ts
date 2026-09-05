import { Component, input } from '@angular/core';

/** STYLE_GUIDE §6.1 — the card chrome only; callers compose their own header inside. */
@Component({
  selector: 'cm-card',
  standalone: true,
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class Card {
  label = input<string>();
}
