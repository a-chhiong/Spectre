import { LitElement, html } from 'lit';
import './explorer-tree.js';
import './outline-tree.js';

export class CodeFolder extends LitElement {
  static properties = {
    activeFile: { type: Object },
    dbmlDatabase: { type: Object },
    activeSection: { type: String } // 'explorer' or 'outline'
  };

  constructor() {
    super();
    this.activeFile = null;
    this.dbmlDatabase = null;
    this.activeSection = 'explorer'; // Default
  }
  
  createRenderRoot() {
    return this; // Render in light DOM for styling
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('activeFile')) {
      const isDbml = this.activeFile && this.activeFile.path.toLowerCase().endsWith('.dbml');
      if (!isDbml && this.activeSection === 'outline') {
        this.activeSection = 'explorer'; // Force explorer if outline is not available
      }
    }
  }

  toggleSection(section) {
    // XOR logic: exactly one must be open!
    if (this.activeSection !== section) {
      this.activeSection = section;
    }
  }

  render() {
    const isDbmlActive = this.activeFile && this.activeFile.path.toLowerCase().endsWith('.dbml');

    return html`
      <style>
        .sidebar-accordion {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-secondary);
        }
        .accordion-section {
          display: flex;
          flex-direction: column;
          border-bottom: 1px solid var(--border-color);
        }
        .accordion-section[expanded] {
          flex: 1;
          min-height: 0;
        }
        .accordion-header {
          display: flex;
          align-items: center;
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          user-select: none;
          text-transform: uppercase;
          background: var(--bg-secondary);
          transition: color 0.2s;
        }
        .accordion-header:hover {
          color: var(--text-primary);
        }
        .accordion-chevron {
          width: 16px;
          height: 16px;
          margin-right: 4px;
          transition: transform 0.2s;
        }
        .accordion-section[expanded] .accordion-chevron {
          transform: rotate(90deg);
        }
        .accordion-content {
          display: none;
          flex: 1;
          overflow: hidden;
          position: relative;
        }
        .accordion-section[expanded] .accordion-content {
          display: flex;
          flex-direction: column;
        }
      </style>

      <div class="sidebar-accordion">
        <div class="accordion-section" ?expanded=${this.activeSection === 'explorer'}>
          <div class="accordion-header" @click=${() => this.toggleSection('explorer')}>
            <svg class="accordion-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
            EXPLORER
          </div>
          <div class="accordion-content">
            <explorer-tree style="width:100%; height:100%;"></explorer-tree>
          </div>
        </div>

        ${isDbmlActive ? html`
          <div class="accordion-section" ?expanded=${this.activeSection === 'outline'}>
            <div class="accordion-header" @click=${() => this.toggleSection('outline')}>
              <svg class="accordion-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
              OUTLINE
            </div>
            <div class="accordion-content">
              <outline-tree .database=${this.dbmlDatabase} style="width:100%; height:100%;"></outline-tree>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('code-folder', CodeFolder);
