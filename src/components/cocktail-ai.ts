import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { Ingredient } from '../types';

type Availability = 'checking' | 'available' | 'downloadable' | 'unsupported';
type GenStatus = 'idle' | 'loading' | 'streaming' | 'done' | 'error';
type FavouriteRecipe = { name: string; text: string; savedAt: number };

@customElement('cocktail-ai')
export class CocktailAi extends LitElement {
  @property({ type: Array }) ingredients: Ingredient[] = [];

  @state() private query = '';
  @state() private availability: Availability = 'checking';
  @state() private genStatus: GenStatus = 'idle';
  @state() private streamedText = '';
  @state() private downloadPct = 0;
  @state() private errorMsg = '';
  @state() private _favourites: FavouriteRecipe[] = [];
  @state() private _parsedRecipes: Array<{ name: string; body: string }> = [];
  @state() private _savedNames = new Set<string>();
  @state() private _expandedFavs = new Set<number>();
  @state() private _showFavourites = true;

  private _controller: AbortController | null = null;

  static styles = css`
    :host {
      display: block;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }

    .section-title {
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: var(--text-secondary);
    }

    .badge {
      font-size: 0.62rem;
      font-weight: 500;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--accent);
      border: 1px solid var(--accent);
      border-radius: 4px;
      padding: 2px 6px;
      opacity: 0.8;
    }

    .notice {
      padding: 14px 16px;
      border-radius: 8px;
      font-size: 0.82rem;
      line-height: 1.5;
      color: var(--text-secondary);
    }

    .notice.unsupported {
      background: rgba(180, 60, 60, 0.08);
      border: 1px solid rgba(180, 60, 60, 0.25);
    }

    .notice.downloadable {
      background: rgba(200, 146, 42, 0.08);
      border: 1px solid rgba(200, 146, 42, 0.2);
    }

    .notice a {
      color: var(--accent-light);
      text-decoration: none;
    }

    .notice a:hover {
      text-decoration: underline;
    }

    .checking {
      color: var(--text-muted);
      font-size: 0.82rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      flex-shrink: 0;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .form-row {
      display: flex;
      gap: 10px;
    }

    .mood-input {
      flex: 1;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 0.9rem;
      padding: 10px 14px;
      outline: none;
      transition: border-color 0.15s;
      font-family: inherit;
    }

    .mood-input::placeholder {
      color: var(--text-muted);
    }

    .mood-input:focus {
      border-color: var(--accent);
    }

    .btn {
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.82rem;
      font-weight: 500;
      letter-spacing: 0.04em;
      padding: 10px 18px;
      transition: opacity 0.15s, background 0.15s;
      white-space: nowrap;
    }

    .btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .btn-generate {
      background: var(--accent);
      color: #0d0d0d;
    }

    .btn-generate:hover:not(:disabled) {
      background: var(--accent-light);
    }

    .btn-stop {
      background: rgba(180, 60, 60, 0.15);
      color: #e07070;
      border: 1px solid rgba(180, 60, 60, 0.3);
    }

    .btn-stop:hover:not(:disabled) {
      background: rgba(180, 60, 60, 0.25);
    }

    .btn-secondary {
      background: var(--bg-surface);
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .hint {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 8px;
    }

    .progress-wrap {
      margin-top: 12px;
    }

    .progress-label {
      font-size: 0.72rem;
      color: var(--text-muted);
      margin-bottom: 6px;
    }

    .progress-track {
      height: 3px;
      background: var(--bg-surface);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--accent);
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    .result-area {
      margin-top: 16px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 16px;
      font-size: 0.85rem;
      line-height: 1.65;
      color: var(--text-primary);
      white-space: pre-wrap;
      word-break: break-word;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .result-area.streaming {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }

    .cursor {
      display: inline-block;
      width: 2px;
      height: 0.9em;
      background: var(--accent);
      margin-left: 2px;
      vertical-align: text-bottom;
      animation: blink 0.9s step-end infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }

    .result-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .error-msg {
      margin-top: 12px;
      padding: 10px 14px;
      background: rgba(180, 60, 60, 0.08);
      border: 1px solid rgba(180, 60, 60, 0.25);
      border-radius: 8px;
      font-size: 0.8rem;
      color: #e07070;
    }

    .empty-notice {
      font-size: 0.82rem;
      color: var(--text-muted);
      padding: 10px 0 2px;
    }

    .recipe-cards {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .recipe-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
    }

    .recipe-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      gap: 10px;
    }

    .recipe-card-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
      flex: 1;
    }

    .btn-save {
      background: none;
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-muted);
      cursor: pointer;
      font-family: inherit;
      font-size: 0.75rem;
      padding: 4px 10px;
      transition: all 0.15s;
      white-space: nowrap;
    }

    .btn-save:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    .btn-save.saved {
      border-color: var(--accent);
      color: var(--accent);
    }

    .recipe-card-body {
      padding: 14px 16px;
      font-size: 0.85rem;
      line-height: 1.65;
      color: var(--text-primary);
      white-space: pre-wrap;
      word-break: break-word;
    }

    .fav-section {
      margin-top: 28px;
      border-top: 1px solid var(--border);
      padding-top: 20px;
    }

    .fav-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .fav-title {
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: var(--text-secondary);
    }

    .fav-count {
      font-size: 0.72rem;
      color: var(--text-muted);
      margin-left: 6px;
    }

    .fav-toggle {
      background: none;
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-muted);
      cursor: pointer;
      font-family: inherit;
      font-size: 0.72rem;
      padding: 3px 8px;
    }

    .fav-toggle:hover {
      color: var(--text-primary);
      background: var(--bg-hover);
    }

    .fav-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .fav-item {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
    }

    .fav-item-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      cursor: pointer;
      gap: 10px;
    }

    .fav-item-header:hover {
      background: var(--bg-hover);
    }

    .fav-item-name {
      font-size: 0.87rem;
      font-weight: 600;
      color: var(--text-primary);
      flex: 1;
    }

    .fav-item-meta {
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    .btn-remove {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 0.82rem;
      padding: 2px 6px;
      border-radius: 4px;
      transition: color 0.15s;
      line-height: 1;
    }

    .btn-remove:hover {
      color: #e07070;
    }

    .fav-item-body {
      padding: 12px 14px;
      border-top: 1px solid var(--border);
      font-size: 0.82rem;
      line-height: 1.65;
      color: var(--text-secondary);
      white-space: pre-wrap;
      word-break: break-word;
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this._checkAvailability();
    this._loadFavourites();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._controller?.abort();
  }

  private async _checkAvailability(): Promise<void> {
    try {
      if (!('LanguageModel' in globalThis)) {
        this.availability = 'unsupported';
        return;
      }
      const result = await LanguageModel.availability();
      if (result === 'unavailable') {
        this.availability = 'unsupported';
      } else if (result === 'downloadable' || result === 'downloading') {
        this.availability = 'downloadable';
      } else {
        this.availability = 'available';
      }
    } catch {
      this.availability = 'unsupported';
    }
  }

  private _loadFavourites(): void {
    try {
      const raw = localStorage.getItem('cocktail-favourites');
      if (raw) {
        this._favourites = JSON.parse(raw) as FavouriteRecipe[];
        this._savedNames = new Set(this._favourites.map(f => f.name));
      }
    } catch {
      this._favourites = [];
    }
  }

  private _parseRecipes(text: string): Array<{ name: string; body: string }> {
    const parts = text.split(/\n(?=#{1,2}\s)/);
    const recipes = parts
      .map(part => {
        const firstNewline = part.indexOf('\n');
        const header = firstNewline === -1 ? part : part.slice(0, firstNewline);
        const body = firstNewline === -1 ? '' : part.slice(firstNewline + 1).trim();
        const nameMatch = header.match(/^#{1,2}\s+(?:\d+[.)\s]*)?(.+?)(?:\s*\*+)?$/);
        if (!nameMatch || body.length < 30) return null;
        return { name: nameMatch[1].trim(), body };
      })
      .filter((r): r is { name: string; body: string } => r !== null);
    return recipes.length >= 2 ? recipes : [];
  }

  private _saveFavourite(name: string, text: string): void {
    if (this._savedNames.has(name)) return;
    const entry: FavouriteRecipe = { name, text, savedAt: Date.now() };
    this._favourites = [...this._favourites, entry];
    this._savedNames = new Set(this._favourites.map(f => f.name));
    localStorage.setItem('cocktail-favourites', JSON.stringify(this._favourites));
  }

  private _removeFavourite(name: string): void {
    this._favourites = this._favourites.filter(f => f.name !== name);
    this._savedNames = new Set(this._favourites.map(f => f.name));
    localStorage.setItem('cocktail-favourites', JSON.stringify(this._favourites));
  }

  private _toggleFavExpand(savedAt: number): void {
    const next = new Set(this._expandedFavs);
    if (next.has(savedAt)) {
      next.delete(savedAt);
    } else {
      next.add(savedAt);
    }
    this._expandedFavs = next;
  }

  private async _generate(): Promise<void> {
    const inStock = this.ingredients.filter(i => i.inStock);
    if (inStock.length === 0 || this.genStatus === 'loading' || this.genStatus === 'streaming') {
      return;
    }

    this._controller = new AbortController();
    const signal = this._controller.signal;

    this.genStatus = 'loading';
    this.streamedText = '';
    this.errorMsg = '';
    this.downloadPct = 0;

    const ingredientList = inStock.map(i => `"${i.name}"`).join(', ');
    const systemContent =
      `You are an expert cocktail mixologist. ` +
      `The user's pantry contains ONLY these ingredients: ${ingredientList}. ` +
      `Each quoted item is a single, complete ingredient — treat multi-word names (e.g. "Coconut Rum", "Triple Sec", "Blue Curacao") as one indivisible ingredient, not as individual words. ` +
      `STRICT RULES you must follow: ` +
      `(1) Only suggest cocktails that can be made using EXCLUSIVELY ingredients from the quoted list above. ` +
      `(2) Do NOT introduce any ingredient that does not appear verbatim in the list — no bitters, no vermouth, no syrups, no juices, no garnishes, no ice, no water, no additional spirits or liqueurs unless they are explicitly listed. ` +
      `(3) Do NOT infer or substitute related ingredients. For example, if "Coconut Rum" is listed, do NOT use coconut milk, coconut cream, or plain rum — only "Coconut Rum" itself. ` +
      `(4) When writing each cocktail's ingredient list, only include items from the provided pantry list. ` +
      `(5) If a classic recipe would require an unlisted ingredient, skip that cocktail entirely. ` +
      `Suggest 3 to 5 cocktails. For each cocktail provide: the cocktail name as a heading, ` +
      `a one-sentence description, the ingredients with measurements (only from the pantry list), and numbered step-by-step instructions.`;

    const userQuery = this.query.trim()
      ? `I want something ${this.query.trim()}. What cocktails can I make?`
      : 'What cocktails can I make with my ingredients?';

    let session: LanguageModelSession | undefined;

    try {
      session = await LanguageModel.create({
        signal,
        initialPrompts: [{ role: 'system', content: systemContent }],
        monitor: (m: EventTarget) => {
          m.addEventListener('downloadprogress', (e: Event) => {
            const progress = e as ProgressEvent;
            this.downloadPct = Math.round(progress.loaded * 100);
          });
        },
      });

      this.genStatus = 'streaming';
      const stream = session.promptStreaming(userQuery, { signal });

      for await (const chunk of stream) {
        this.streamedText += chunk;
      }

      this.genStatus = 'done';
    } catch (err: unknown) {
      if (signal.aborted) {
        this.genStatus = 'done';
      } else {
        this.genStatus = 'error';
        this.errorMsg =
          err instanceof Error ? err.message : 'An unknown error occurred.';
      }
    } finally {
      this._parsedRecipes = this._parseRecipes(this.streamedText);
      session?.destroy();
      this._controller = null;
    }
  }

  private _stop(): void {
    this._controller?.abort();
    this.genStatus = 'done';
  }

  private _clear(): void {
    this._controller?.abort();
    this.genStatus = 'idle';
    this.streamedText = '';
    this.errorMsg = '';
    this.downloadPct = 0;
    this._parsedRecipes = [];
  }

  override render() {
    const inStockCount = this.ingredients.filter(i => i.inStock).length;
    const isGenerating =
      this.genStatus === 'loading' || this.genStatus === 'streaming';

    return html`
      <div class="section-header">
        <span class="section-title">Cocktail Suggestions</span>
        <span class="badge">Gemini Nano</span>
      </div>

      ${this.availability === 'checking'
        ? html`
            <div class="checking">
              <div class="spinner"></div>
              Checking AI availability…
            </div>
          `
        : this.availability === 'unsupported'
        ? html`
            <div class="notice unsupported">
              Chrome's built-in AI (Gemini Nano) is not available in this
              browser. This feature requires Chrome&nbsp;127+ on Windows&nbsp;10/11
              or macOS&nbsp;13+ with the Prompt API enabled.
              <br /><br />
              <a
                href="https://developer.chrome.com/docs/ai/get-started"
                target="_blank"
                rel="noopener noreferrer"
                >Learn how to enable Chrome AI →</a
              >
            </div>
          `
        : inStockCount === 0
        ? html`
            <p class="empty-notice">
              Mark some ingredients as <strong>In Stock</strong> in your pantry
              to generate cocktail suggestions.
            </p>
          `
        : html`
            ${this.availability === 'downloadable'
              ? html`
                  <div class="notice downloadable">
                    Gemini Nano will be downloaded (~1.7 GB) the first time you
                    generate suggestions. A progress bar will appear below.
                  </div>
                `
              : ''}

            <div class="form-row">
              <input
                class="mood-input"
                type="text"
                placeholder="e.g. refreshing, tropical, citrusy, stirred &amp; spirit-forward…"
                .value=${this.query}
                ?disabled=${isGenerating}
                @input=${(e: Event) => {
                  this.query = (e.target as HTMLInputElement).value;
                }}
                @keydown=${(e: KeyboardEvent) => {
                  if (e.key === 'Enter' && !isGenerating) this._generate();
                }}
              />
              ${isGenerating
                ? html`
                    <button class="btn btn-stop" @click=${this._stop}>
                      Stop
                    </button>
                  `
                : html`
                    <button
                      class="btn btn-generate"
                      ?disabled=${inStockCount === 0}
                      @click=${this._generate}
                    >
                      Generate
                    </button>
                  `}
            </div>

            <p class="hint">
              ${inStockCount} ingredient${inStockCount === 1 ? '' : 's'} in
              stock · press Enter or click Generate
            </p>

            ${this.downloadPct > 0 && this.downloadPct < 100
              ? html`
                  <div class="progress-wrap">
                    <p class="progress-label">
                      Downloading Gemini Nano… ${this.downloadPct}%
                    </p>
                    <div class="progress-track">
                      <div
                        class="progress-fill"
                        style=${styleMap({ width: `${this.downloadPct}%` })}
                      ></div>
                    </div>
                  </div>
                `
              : ''}

            ${this.genStatus === 'streaming' || (this.genStatus === 'done' && this._parsedRecipes.length < 2 && this.streamedText)
              ? html`
                  <div
                    class="result-area ${this.genStatus === 'streaming'
                      ? 'streaming'
                      : ''}"
                  >${this.streamedText}${this.genStatus === 'streaming'
                      ? html`<span class="cursor"></span>`
                      : ''}</div>
                `
              : ''}

            ${this.genStatus === 'done' && this._parsedRecipes.length >= 2
              ? html`
                  <div class="recipe-cards">
                    ${this._parsedRecipes.map(recipe => {
                      const isSaved = this._savedNames.has(recipe.name);
                      return html`
                        <div class="recipe-card">
                          <div class="recipe-card-header">
                            <span class="recipe-card-name">${recipe.name}</span>
                            <button
                              class="btn-save ${isSaved ? 'saved' : ''}"
                              @click=${() => isSaved
                                ? this._removeFavourite(recipe.name)
                                : this._saveFavourite(recipe.name, recipe.body)}
                            >${isSaved ? '♥ Saved' : '♡ Save'}</button>
                          </div>
                          <div class="recipe-card-body">${recipe.body}</div>
                        </div>
                      `;
                    })}
                  </div>
                `
              : ''}

            ${this.genStatus === 'error'
              ? html`<div class="error-msg">${this.errorMsg}</div>`
              : ''}

            ${this.genStatus === 'done' && this.streamedText
              ? html`
                  <div class="result-actions">
                    <button class="btn btn-secondary" @click=${this._clear}>
                      Clear
                    </button>
                    <button class="btn btn-generate" @click=${this._generate}>
                      Generate Again
                    </button>
                  </div>
                `
              : ''}
          `}

      ${this._favourites.length > 0 ? html`
        <div class="fav-section">
          <div class="fav-header">
            <div>
              <span class="fav-title">Favourites</span>
              <span class="fav-count">(${this._favourites.length})</span>
            </div>
            <button class="fav-toggle" @click=${() => { this._showFavourites = !this._showFavourites; }}>
              ${this._showFavourites ? 'Hide' : 'Show'}
            </button>
          </div>
          ${this._showFavourites ? html`
            <div class="fav-list">
              ${this._favourites.map(fav => {
                const expanded = this._expandedFavs.has(fav.savedAt);
                return html`
                  <div class="fav-item">
                    <div class="fav-item-header" @click=${() => this._toggleFavExpand(fav.savedAt)}>
                      <span class="fav-item-name">${fav.name}</span>
                      <span class="fav-item-meta">${new Date(fav.savedAt).toLocaleDateString()}</span>
                      <button
                        class="btn-remove"
                        title="Remove from favourites"
                        @click=${(e: Event) => { e.stopPropagation(); this._removeFavourite(fav.name); }}
                      >✕</button>
                    </div>
                    ${expanded ? html`<div class="fav-item-body">${fav.text}</div>` : ''}
                  </div>
                `;
              })}
            </div>
          ` : ''}
        </div>
      ` : ''}
    `;
  }
}
