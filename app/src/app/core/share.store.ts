import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CreatedShareLink, ShareLink } from './models';

@Injectable({ providedIn: 'root' })
export class ShareStore {
  private readonly linksSignal = signal<ShareLink[]>([]);
  private readonly loadedSignal = signal(false);

  readonly links = this.linksSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();

  constructor(private readonly http: HttpClient) {}

  async load(): Promise<void> {
    const links = await firstValueFrom(this.http.get<ShareLink[]>('/api/share'));
    this.linksSignal.set(links);
    this.loadedSignal.set(true);
  }

  /** The returned URL is shown exactly once — the API never stores or re-serves the raw token. */
  async create(label?: string): Promise<CreatedShareLink> {
    const result = await firstValueFrom(this.http.post<CreatedShareLink>('/api/share', { label }));
    await this.load();
    return result;
  }

  async revoke(id: string): Promise<void> {
    const previous = this.linksSignal();
    this.linksSignal.update((links) => links.filter((l) => l.id !== id));
    try {
      await firstValueFrom(this.http.delete(`/api/share/${id}`));
    } catch (err) {
      this.linksSignal.set(previous);
      throw err;
    }
  }
}
