import { Component, input, output } from '@angular/core';

/** STYLE_GUIDE §6.2. One primary button per card maximum — see the guide, not enforced here. */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'icon' | 'icon-danger' | 'destructive';

@Component({
  selector: 'cm-button',
  standalone: true,
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  variant = input<ButtonVariant>('primary');
  type = input<'button' | 'submit'>('button');
  disabled = input(false);
  ariaLabel = input<string>();

  pressed = output<void>();

  onClick(): void {
    if (!this.disabled()) {
      this.pressed.emit();
    }
  }
}
