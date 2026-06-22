import { LitElement, html } from 'lit';

export class OutlineHeader extends LitElement {
  static properties = {
    searchValue: { type: String },
    searchPlaceholder: { type: String },
    groupingMode: { type: String }
  };

  constructor() {
    super();
    this.searchValue = '';
    this.searchPlaceholder = 'Search outline...';
    this.groupingMode = 'schema';
  }

  createRenderRoot() {
    return this; // Render in light DOM so we can reuse outline-tree CSS structure if needed, or style it locally
  }

  handleSearch(e) {
    this.searchValue = e.target.value;
    this.dispatchEvent(new CustomEvent('search-change', { 
      detail: { value: this.searchValue }, 
      bubbles: true, 
      composed: true 
    }));
  }

  clearSearch() {
    this.searchValue = '';
    this.dispatchEvent(new CustomEvent('search-change', { 
      detail: { value: '' }, 
      bubbles: true, 
      composed: true 
    }));
  }

  setGroupingMode(mode) {
    this.groupingMode = mode;
    this.dispatchEvent(new CustomEvent('grouping-mode-change', { 
      detail: { mode }, 
      bubbles: true, 
      composed: true 
    }));
  }

  render() {
    return html`
      <style>
        .outline-header-container {
          display: flex;
          flex-direction: column;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }
        
        .outline-search {
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .search-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .outline-search-input {
          width: 100%;
          padding: 6px 24px 6px 10px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 13px;
        }
        
        .outline-search-clear {
          position: absolute;
          right: 4px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          padding: 0 4px;
        }

        .outline-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-secondary);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        
        .outline-toggle-btn:hover {
          color: var(--text-primary);
          background: var(--bg-tertiary);
          border-color: var(--accent-color);
        }

        .outline-toggle-btn svg {
          width: 14px;
          height: 14px;
        }
        .icon-schema { color: #f59e0b; }
        .icon-group { color: #8b5cf6; }
      </style>
      
      <div class="outline-header-container">
        <div class="outline-search">
          <div class="search-wrapper">
            <input
              type="search"
              class="outline-search-input"
              placeholder="${this.searchPlaceholder}"
              .value=${this.searchValue}
              @input=${this.handleSearch}
            />
            ${this.searchValue
              ? html`<button class="outline-search-clear" @click=${this.clearSearch}>×</button>`
              : ''}
          </div>
          
          <button 
            class="outline-toggle-btn"
            title="Current: ${this.groupingMode === 'schema' ? 'Schemas' : 'Table Groups'} (Click to toggle)"
            @click=${() => this.setGroupingMode(this.groupingMode === 'schema' ? 'tableGroup' : 'schema')}
          >
            ${this.groupingMode === 'schema'
              ? html`<svg class="icon-schema" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`
              : html`<svg class="icon-group" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M3 9h18M9 21V9"></path></svg>`
            }
          </button>
        </div>
      </div>
    `;
  }
}

customElements.define('outline-header', OutlineHeader);
