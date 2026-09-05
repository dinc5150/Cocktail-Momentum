import { Component, input, model } from '@angular/core';

let nextId = 0;

/**
 * STYLE_GUIDE §6.3. Two focus treatments, and the choice is meaningful: 'primary' for the
 * add-ingredient / rename inputs (full halo), 'secondary' for search/sort/mood inputs
 * (border colour only).
 *
 * `label` is required and renders as a real, visible `<label for>` (§2.4/§3's "Section /
 * card label" recipe) — not just an `aria-label`. The placeholder alone used to be the
 * only visible description of the field, and placeholders are styled in `--text-muted`,
 * which fails AA (§2.4): "must never be the only description of a form field." Phase 15.
 */
@Component({
  selector: 'cm-input',
  standalone: true,
  templateUrl: './input.html',
  styleUrl: './input.scss',
})
export class Input {
  value = model<string>('');
  placeholder = input<string>('');
  type = input<'text' | 'email' | 'search'>('text');
  focusStyle = input<'primary' | 'secondary'>('secondary');
  disabled = input(false);
  label = input.required<string>();

  protected readonly inputId = `cm-input-${nextId++}`;

  onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }
}
