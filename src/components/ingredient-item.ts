import { LitElement, html, css, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Ingredient } from '../types';

@customElement('ingredient-item')
export class IngredientItem extends LitElement {
  @property({ type: Object }) ingredient!: Ingredient;

  @state() private editing = false;
  @state() private editValue = '';

  static styles = css`
    :host {
      display: block;
    }

    .item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--bg-surface, #242424);
      border: 1px solid var(--border, #333333);
      border-radius: 8px;
      transition: border-color 0.2s ease, background 0.2s ease;
    }

    .item:hover {
      border-color: var(--accent, #c8922a);
      background: var(--bg-hover, #2a2a2a);
    }

    /* .item.out-of-stock {
      opacity: 0.55;
    } */

    .stock-pill {
      flex-shrink: 0;
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid;
      font-size: 0.68rem;
      font-weight: 500;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      cursor: pointer;
      transition: background 0.2s, box-shadow 0.2s;
      font-family: inherit;
      white-space: nowrap;
    }

    .pill-in {
      background: rgba(74, 158, 92, 0.15);
      border-color: #4a9e5c;
      color: #6bbf7a;
    }

    .pill-in:hover {
      background: rgba(74, 158, 92, 0.28);
      box-shadow: 0 0 8px rgba(74, 158, 92, 0.3);
    }

    .pill-out {
      background: rgba(90, 80, 69, 0.2);
      border-color: #5a5045;
      color: #7a6e60;
    }

    .pill-out:hover {
      background: rgba(90, 80, 69, 0.35);
    }

    .name {
      flex: 1;
      font-size: 0.95rem;
      color: var(--text-primary, #e8dcc8);
      font-weight: 400;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item.out-of-stock .name {
      text-decoration: line-through;
      color: var(--text-muted, #5a5045);
    }

    .edit-input {
      flex: 1;
      min-width: 0;
      background: var(--bg-page, #0d0d0d);
      border: 1px solid var(--accent, #c8922a);
      border-radius: 5px;
      color: var(--text-primary, #e8dcc8);
      font-size: 0.95rem;
      font-family: inherit;
      padding: 5px 10px;
      outline: none;
      box-shadow: 0 0 10px var(--accent-glow, rgba(200, 146, 42, 0.25));
    }

    .actions {
      display: flex;
      gap: 2px;
      flex-shrink: 0;
    }

    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border: none;
      border-radius: 6px;
      background: transparent;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      color: var(--text-muted, #5a5045);
      font-size: 0.85rem;
      line-height: 1;
    }

    .icon-btn:hover {
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-primary, #e8dcc8);
    }

    .icon-btn.danger:hover {
      background: rgba(160, 48, 48, 0.22);
      color: #e06060;
    }
  `;

  protected override updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('editing') && this.editing) {
      const input = this.shadowRoot?.querySelector<HTMLInputElement>('.edit-input');
      if (input) {
        input.focus();
        input.select();
      }
    }
  }

  private _startEdit(): void {
    this.editValue = this.ingredient.name;
    this.editing = true;
  }

  private _confirmEdit(): void {
    const trimmed = this.editValue.trim();
    if (trimmed && trimmed !== this.ingredient.name) {
      this.dispatchEvent(
        new CustomEvent('ingredient-update', {
          bubbles: true,
          composed: true,
          detail: { ingredient: { ...this.ingredient, name: trimmed } },
        })
      );
    }
    this.editing = false;
  }

  private _onEditKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      this._confirmEdit();
    } else if (e.key === 'Escape') {
      this.editing = false;
    }
  }

  private _toggleStock(): void {
    this.dispatchEvent(
      new CustomEvent('ingredient-update', {
        bubbles: true,
        composed: true,
        detail: { ingredient: { ...this.ingredient, inStock: !this.ingredient.inStock } },
      })
    );
  }

  private _remove(): void {
    this.dispatchEvent(
      new CustomEvent('ingredient-remove', {
        bubbles: true,
        composed: true,
        detail: { id: this.ingredient.id },
      })
    );
  }

  override render() {
    const { name, inStock } = this.ingredient;
    return html`
      <div class="item ${inStock ? 'in-stock' : 'out-of-stock'}">
        <button
          class="stock-pill ${inStock ? 'pill-in' : 'pill-out'}"
          @click=${this._toggleStock}
          title="Toggle stock status"
        >
          ${inStock ? 'In Stock' : 'Out of Stock'}
        </button>

        ${this.editing
          ? html`
              <input
                class="edit-input"
                type="text"
                .value=${this.editValue}
                @input=${(e: InputEvent) => {
                  this.editValue = (e.target as HTMLInputElement).value;
                }}
                @keydown=${this._onEditKeydown}
                @blur=${this._confirmEdit}
              />
            `
          : html`<span class="name">${name}</span>`}

        <div class="actions">
          <button class="icon-btn" title="Edit name" @click=${this._startEdit}>✎</button>
          <button class="icon-btn danger" title="Delete" @click=${this._remove}>✕</button>
        </div>
      </div>
    `;
  }
}
