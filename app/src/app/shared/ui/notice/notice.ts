import { Component, input } from '@angular/core';

/** STYLE_GUIDE §6.5 — amber for informational, red for unsupported/error. */
export type NoticeKind = 'info' | 'error';

@Component({
  selector: 'cm-notice',
  standalone: true,
  templateUrl: './notice.html',
  styleUrl: './notice.scss',
})
export class Notice {
  kind = input<NoticeKind>('info');
}
