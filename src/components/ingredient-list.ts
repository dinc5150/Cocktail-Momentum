import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Ingredient, SortMode, StockFilter } from '../types';
import './ingredient-item';

@customElement('ingredient-list')
export class IngredientList extends LitElement {
  @property({ type: Array }) ingredients: Ingredient[] = [];

  @state() private query = '';
  @state() private sort: SortMode = 'alpha-asc';
  @state() private stockFilter: StockFilter = 'all';

  static styles = css`
    :host {
      display: block;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 16px;
    }

    .section-label {
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: var(--text-secondary, #8a7d6e);
    }

    .count-badge {
      font-size: 0.72rem;
      color: var(--text-muted, #5a5045);
      letter-spacing: 0.03em;
    }

    .controls {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }

    .search-input {
      flex: 1;
      min-width: 0;
      background: var(--bg-surface, #242424);
      border: 1px solid var(--border, #333333);
      border-radius: 8px;
      color: var(--text-primary, #e8dcc8);
      font-size: 0.875rem;
      font-family: inherit;
      padding: 8px 12px;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .search-input::placeholder {
      color: var(--text-muted, #5a5045);
    }

    .search-input:focus {
      border-color: var(--accent, #c8922a);
    }

    /* Remove default search-input clear button styling */
    .search-input::-webkit-search-cancel-button {
      filter: invert(0.4);
    }

    .sort-select {
      background: var(--bg-surface, #242424);
      border: 1px solid var(--border, #333333);
      border-radius: 8px;
      color: var(--text-primary, #e8dcc8);
      font-size: 0.875rem;
      font-family: inherit;
      padding: 8px 32px 8px 12px;
      outline: none;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238a7d6e' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
      transition: border-color 0.2s ease;
      flex-shrink: 0;
    }

    .sort-select:focus {
      border-color: var(--accent, #c8922a);
    }

    .sort-select option {
      background: #242424;
    }

    .stock-filters {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 5px 13px;
      border-radius: 20px;
      border: 1px solid var(--border, #333333);
      background: transparent;
      color: var(--text-secondary, #8a7d6e);
      font-size: 0.75rem;
      font-family: inherit;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s, color 0.2s;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }

    .filter-btn:hover {
      border-color: var(--accent, #c8922a);
      color: var(--text-primary, #e8dcc8);
    }

    .filter-btn.active {
      background: var(--accent, #c8922a);
      border-color: var(--accent, #c8922a);
      color: #0d0d0d;
      font-weight: 500;
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .empty {
      text-align: center;
      color: var(--text-muted, #5a5045);
      font-size: 0.875rem;
      padding: 36px 0;
      font-style: italic;
      line-height: 1.6;
    }
  `;

  private get _filtered(): Ingredient[] {
    let list = [...this.ingredients];

    if (this.stockFilter === 'in-stock') {
      list = list.filter(i => i.inStock);
    } else if (this.stockFilter === 'out-of-stock') {
      list = list.filter(i => !i.inStock);
    }

    const q = this.query.trim().toLowerCase();
    if (q) {
      list = list.filter(i => i.name.toLowerCase().includes(q));
    }

    switch (this.sort) {
      case 'alpha-asc':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'alpha-desc':
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        list.sort((a, b) => b.addedAt - a.addedAt);
        break;
      case 'oldest':
        list.sort((a, b) => a.addedAt - b.addedAt);
        break;
    }

    return list;
  }

  override render() {
    const filtered = this._filtered;
    const total = this.ingredients.length;
    const inStockCount = this.ingredients.filter(i => i.inStock).length;

    const filterLabels: Record<StockFilter, string> = {
      'all': `All (${total})`,
      'in-stock': `In Stock (${inStockCount})`,
      'out-of-stock': `Out of Stock (${total - inStockCount})`,
    };

    return html`
      <div class="section-header">
        <span class="section-label">Your Pantry</span>
        <span class="count-badge">
          ${total} ingredient${total !== 1 ? 's' : ''} · ${inStockCount} in stock
        </span>
      </div>

      <div class="controls">
        <input
          class="search-input"
          type="search"
          placeholder="Search ingredients…"
          .value=${this.query}
          @input=${(e: InputEvent) => {
            this.query = (e.target as HTMLInputElement).value;
          }}
        />
        <select
          class="sort-select"
          @change=${(e: Event) => {
            this.sort = (e.target as HTMLSelectElement).value as SortMode;
          }}
        >
          <option value="newest" ?selected=${this.sort === 'newest'}>Newest first</option>
          <option value="oldest" ?selected=${this.sort === 'oldest'}>Oldest first</option>
          <option value="alpha-asc" ?selected=${this.sort === 'alpha-asc'}>A → Z</option>
          <option value="alpha-desc" ?selected=${this.sort === 'alpha-desc'}>Z → A</option>
        </select>
      </div>

      <div class="stock-filters">
        ${(['all', 'in-stock', 'out-of-stock'] as StockFilter[]).map(
          f => html`
            <button
              class="filter-btn ${this.stockFilter === f ? 'active' : ''}"
              @click=${() => {
                this.stockFilter = f;
              }}
            >
              ${filterLabels[f]}
            </button>
          `
        )}
      </div>

      <div class="list">
        ${filtered.length === 0
          ? html`
              <p class="empty">
                ${total === 0
                  ? 'Your pantry is empty.\nAdd an ingredient above.'
                  : 'No ingredients match your filters.'}
              </p>
            `
          : filtered.map(
              ing => html`<ingredient-item .ingredient=${ing}></ingredient-item>`
            )}
      </div>
    `;
  }
}
