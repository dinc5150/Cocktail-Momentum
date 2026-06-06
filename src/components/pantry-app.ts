import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
import type { Ingredient } from '../types';
import { loadIngredients, saveIngredients } from '../store/pantry-store';
import './ingredient-form';
import './ingredient-list';
import './cocktail-ai';

@customElement('pantry-app')
export class PantryApp extends LitElement {
  @state() private ingredients: Ingredient[] = [];
  @state() private _installPrompt: BeforeInstallPromptEvent | null = null;

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

    .example-bar-row {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
    }

    .btn-example {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-family: inherit;
      font-size: 0.78rem;
      letter-spacing: 0.03em;
      padding: 4px 0;
      transition: color 0.15s;
    }

    .btn-example:hover {
      color: var(--accent-light);
    }

    .btn-install {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 14px;
      padding: 7px 18px;
      background: none;
      border: 1px solid var(--accent);
      border-radius: 20px;
      color: var(--accent-light);
      cursor: pointer;
      font-family: inherit;
      font-size: 0.75rem;
      font-weight: 500;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      transition: background 0.15s, color 0.15s;
    }

    .btn-install:hover {
      background: var(--accent-glow);
    }
  `;

  private static readonly EXAMPLE_ITEMS: string[] = [
    // Base spirits
    'Vodka', 'Gin', 'White Rum', 'Dark Rum', 'Tequila', 'Bourbon',
    'Scotch Whisky', 'Brandy', 'Cognac', 'Dry Vermouth', 'Sweet Vermouth',
    // Wines
    'Red Wine', 'White Wine', 'Rosé Wine', 'Champagne', 'Prosecco', 'Port Wine', 'Sherry',
    // Liqueurs
    'Triple Sec', 'Amaretto', 'Kahlúa', 'Campari', 'Aperol',
    'Peach Schnapps', 'Blue Curaçao', 'Melon Liqueur', 'Coconut Rum', 'Creme de Menthe', 'Aperol', 
    'Vermouth',
    // Mixers
    'Club Soda', 'Tonic Water', 'Ginger Beer', 'Ginger Ale', 'Cola',
    'Orange Juice', 'Cranberry Juice', 'Pineapple Juice', 'Grapefruit Juice', 'Coconut Cream',
    // Citrus & syrups
    'Lemon Juice', 'Lime Juice', 'Simple Syrup', 'Grenadine', 'Honey',
    // Bitters
    'Angostura Bitters', 'Orange Bitters',
    // Garnishes & extras
    'Maraschino Cherries', 'Olives', 'Mint', 'Ice', 'Salt', 'Sugar'
  ];

  private _boundBeforeInstall = (e: Event) => {
    e.preventDefault();
    this._installPrompt = e as BeforeInstallPromptEvent;
  };

  private _boundAppInstalled = () => {
    this._installPrompt = null;
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.ingredients = loadIngredients();
    window.addEventListener('beforeinstallprompt', this._boundBeforeInstall);
    window.addEventListener('appinstalled', this._boundAppInstalled);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('beforeinstallprompt', this._boundBeforeInstall);
    window.removeEventListener('appinstalled', this._boundAppInstalled);
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

  private async _installPwa(): Promise<void> {
    if (!this._installPrompt) return;
    const { outcome } = await this._installPrompt.prompt();
    if (outcome === 'accepted') this._installPrompt = null;
  }

  private _addExampleItems(): void {
    const existing = new Set(
      this.ingredients.map(i => i.name.toLowerCase())
    );
    const toAdd = PantryApp.EXAMPLE_ITEMS
      .filter(name => !existing.has(name.toLowerCase()))
      .map(name => ({
        id: crypto.randomUUID(),
        name,
        addedAt: Date.now(),
        inStock: true,
      } satisfies Ingredient));
    if (toAdd.length === 0) return;
    this.ingredients = [...toAdd, ...this.ingredients];
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
          ${this._installPrompt ? html`
            <button class="btn-install" @click=${this._installPwa}>
              ⊕ Install App
            </button>
          ` : ''}
        </header>

        <div class="card">
          <p class="card-label">Add Ingredient</p>
          <ingredient-form></ingredient-form>
          <div class="example-bar-row">
            <button class="btn-example" @click=${this._addExampleItems}>
              + Add example bar items
            </button>
          </div>
        </div>

        <div class="card">
          <ingredient-list .ingredients=${this.ingredients}></ingredient-list>
        </div>

        <div class="card">
          <cocktail-ai .ingredients=${this.ingredients}></cocktail-ai>
        </div>
      </div>
    `;
  }
}
