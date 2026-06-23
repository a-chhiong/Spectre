import { LitElement, html, css } from 'lit';
import { ContextProvider } from '@lit/context';
import { WorkspaceContext } from '@doctheatre/core/context/workspace-context.js';
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeDropdown, vsCodeOption } from '@vscode/webview-ui-toolkit';

// Import core viewer components
import '@doctheatre/core/components/markdown-viewer.js';
import '@doctheatre/core/components/dbml-viewer.js';
import '@doctheatre/core/components/diagram-viewer.js';
import '@doctheatre/core/components/swagger-viewer.js';

// Register VS Code UI Toolkit components
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeDropdown(), vsCodeOption());

export class ExtensionApp extends LitElement {
  static properties = {
    activeFile: { type: Object },
    files: { type: Array },
    theme: { type: String },
    contentType: { type: String },
    viewMode: { type: String },
    activeNodePath: { type: String }
  };

  createRenderRoot() {
    return this; // Render in light DOM for global CSS (like dbdocs, markdown, swagger)
  }

  constructor() {
    super();
    this.activeFile = null;
    this.files = [];
    this.theme = 'light';
    this.contentType = '';
    this.viewMode = 'document'; // doc vs erd
    this.activeNodePath = null;

    // Create a mock projectManager to satisfy the core components that rely on WorkspaceContext
    this.mockProjectManager = {
      openTab: (path) => {
        // Log or send message back to VS Code to open tab?
        // VS Code extension host doesn't support opening arbitrary tabs directly from webview yet without a custom command.
        // We'll leave it as a no-op or pass it back if needed.
      }
    };
    
    // Provide the WorkspaceContext to all children
    new ContextProvider(this, { context: WorkspaceContext, initialValue: this.mockProjectManager });
  }

  handleExportSVG = () => {
    // Custom export event handled by export.js
    window.dispatchEvent(new CustomEvent('export-svg'));
  };

  handleExportPNG = () => {
    window.dispatchEvent(new CustomEvent('export-png'));
  };

  handleExportHTML = () => {
    window.dispatchEvent(new CustomEvent('export-html'));
  };

  renderViewer() {
    if (!this.activeFile) {
      return html`
        <div class="os-placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          <p>No file selected. Open a supported file to preview it.</p>
        </div>
      `;
    }

    const ct = this.contentType;

    if (ct === 'markdown') {
      return html`
        <markdown-viewer
          .activeFile=${this.activeFile}
          .files=${this.files}
          .theme=${this.theme}
        ></markdown-viewer>
      `;
    }

    if (ct === 'plantuml' || ct === 'mermaid') {
      return html`
        <diagram-viewer
          class="diagram-preview ${ct}-preview"
          .code=${this.activeFile.content || ''}
          .type=${ct}
          .theme=${this.theme}
        ></diagram-viewer>
      `;
    }

    if (ct === 'swagger') {
      return html`
        <swagger-viewer
          .activeFile=${this.activeFile}
          .files=${this.files}
          .theme=${this.theme}
        ></swagger-viewer>
      `;
    }

    if (ct === 'dbml') {
      return html`
        <dbml-viewer
          id="active-dbml-viewer"
          .activeFile=${this.activeFile}
          .files=${this.files}
          .theme=${this.theme}
          .viewMode=${this.viewMode}
          .activeEntityPath=${this.activeNodePath}
        ></dbml-viewer>
      `;
    }

    return html`<div style="padding: 2rem;">No preview available for this file type.</div>`;
  }

  render() {
    const filename = this.activeFile ? this.activeFile.path.split(/[\\/]/).pop() : 'DocTheatre';

    return html`
      <div class="os-toolbar">
        <div class="os-breadcrumb" id="os-filename">
          <span class="filename">${filename}</span>
        </div>

        ${this.contentType === 'dbml' ? html`
          <div class="view-switcher" id="os-dbml-switcher">
            <button 
              class="view-switcher-btn ${this.viewMode === 'document' ? 'active' : ''}" 
              @click=${() => this.viewMode = 'document'}
              title="Document view">DOC</button>
            <button 
              class="view-switcher-btn ${this.viewMode === 'diagram' ? 'active' : ''}" 
              @click=${() => this.viewMode = 'diagram'}
              title="Diagram view">ERD</button>
          </div>
        ` : ''}

        <span class="badge" id="os-badge">${this.contentType !== 'unknown' ? this.contentType : ''}</span>
        
        <!-- We can hook up export buttons here if needed, or rely on VS Code Command Palette -->
      </div>

      <div class="os-preview" id="preview-container">
        ${this.renderViewer()}
      </div>
    `;
  }
}

customElements.define('extension-app', ExtensionApp);
