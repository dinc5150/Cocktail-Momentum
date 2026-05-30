import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('ingredient-form')
export class IngredientForm extends LitElement {
  @state() private value = '';

  static styles = css`
    :host {
      display: block;
    }

    .form {
      display: flex;
      gap: 10px;
    }

    .input {
      flex: 1;
      min-width: 0;
      background: var(--bg-surface, #242424);
      border: 1px solid var(--border, #333333);
      border-radius: 8px;
      color: var(--text-primary, #e8dcc8);
      font-size: 0.95rem;
      font-family: inherit;
      padding: 10px 14px;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .input::placeholder {
      color: var(--text-muted, #5a5045);
    }

    .input:focus {
      border-color: var(--accent, #c8922a);
      box-shadow: 0 0 0 3px var(--accent-glow, rgba(200, 146, 42, 0.2));
    }

    .btn-add {
      flex-shrink: 0;
      padding: 10px 22px;
      background: var(--accent, #c8922a);
      border: none;
      border-radius: 8px;
      color: #0d0d0d;
      font-size: 0.875rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      letter-spacing: 0.04em;
      transition: background 0.2s ease, box-shadow 0.2s ease;
      white-space: nowrap;
    }

    .btn-add:hover:not(:disabled) {
      background: var(--accent-light, #f0b544);
      box-shadow: 0 0 14px var(--accent-glow, rgba(200, 146, 42, 0.4));
    }

    .btn-add:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  `;

  private _submit(): void {
    const trimmed = this.value.trim();
    if (!trimmed) return;
    this.dispatchEvent(
      new CustomEvent('ingredient-add', {
        bubbles: true,
        composed: true,
        detail: { name: trimmed },
      })
    );
    this.value = '';
  }

  private _onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      this._submit();
    }
  }

  override render() {
    return html`
      <div class="form">
        <input
          class="input"
          type="text"
          placeholder="e.g. Bourbon, Campari, Sweet Vermouth…"
          .value=${this.value}
          @input=${(e: InputEvent) => {
            this.value = (e.target as HTMLInputElement).value;
          }}
          @keydown=${this._onKeydown}
        />
        <button
          class="btn-add"
          ?disabled=${!this.value.trim()}
          @click=${this._submit}
        >
          Add
        </button>
      </div>
    `;
  }
}
