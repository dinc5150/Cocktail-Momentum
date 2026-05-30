import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { Ingredient } from '../types';
import { loadIngredients, saveIngredients } from '../store/pantry-store';
import './ingredient-form';
import './ingredient-list';

@customElement('pantry-app')
export class PantryApp extends LitElement {
  @state() private ingredients: Ingredient[] = [];

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;

      /* Design tokens — inherited by all child shadow DOMs */
      --bg-page: #0d0d0d;
      --bg-card: #161616;
      --bg-surface: #1e1e1e;
      --bg-hover: #262626;
      --border: #2e2e2e;
      --text-primary: #e8dcc8;
      --text-secondary: #8a7d6e;
      --text-muted: #5a5045;
      --accent: #c8922a;
      --accent-light: #f0b544;
      --accent-glow: rgba(200, 146, 42, 0.25);
    }

    .app {
      max-width: 680px;
      margin: 0 auto;
      padding: 48px 20px 80px;
    }

    header {
      text-align: center;
      margin-bottom: 44px;
    }

    .app-title {
      font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
      font-size: 2.6rem;
      font-weight: 600;
      color: var(--accent-light);
      letter-spacing: 0.02em;
      line-height: 1.1;
      margin-bottom: 4px;
    }

    .divider {
      width: 48px;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        var(--accent),
        transparent
      );
      margin: 14px auto;
      opacity: 0.7;
    }

    .app-subtitle {
      color: var(--text-muted);
      font-size: 0.72rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
    }

    .card-label {
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: var(--text-secondary);
      margin-bottom: 14px;
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this.ingredients = loadIngredients();
  }

  private _handleAdd(e: Event): void {
    const { name } = (e as CustomEvent<{ name: string }>).detail;
    const newIngredient: Ingredient = {
      id: crypto.randomUUID(),
      name,
      addedAt: Date.now(),
      inStock: true,
    };
    this.ingredients = [newIngredient, ...this.ingredients];
    saveIngredients(this.ingredients);
  }

  private _handleUpdate(e: Event): void {
    const { ingredient } = (e as CustomEvent<{ ingredient: Ingredient }>).detail;
    this.ingredients = this.ingredients.map(i =>
      i.id === ingredient.id ? ingredient : i
    );
    saveIngredients(this.ingredients);
  }

  private _handleRemove(e: Event): void {
    const { id } = (e as CustomEvent<{ id: string }>).detail;
    this.ingredients = this.ingredients.filter(i => i.id !== id);
    saveIngredients(this.ingredients);
  }

  override render() {
    return html`
      <div
        class="app"
        @ingredient-add=${this._handleAdd}
        @ingredient-update=${this._handleUpdate}
        @ingredient-remove=${this._handleRemove}
      >
        <header>
          <h1 class="app-title">Cocktail Pantry</h1>
          <div class="divider"></div>
          <p class="app-subtitle">Your home bar inventory</p>
        </header>

        <div class="card">
          <p class="card-label">Add Ingredient</p>
          <ingredient-form></ingredient-form>
        </div>

        <div class="card">
          <ingredient-list .ingredients=${this.ingredients}></ingredient-list>
        </div>
      </div>
    `;
  }
}
