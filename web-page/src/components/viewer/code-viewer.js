import { LitElement, html } from 'lit';
import { ViewerController } from './viewer-controller.js';
import './code-viewer.css';
import 'highlight.js/styles/github.css';

// Import viewer components to register custom elements
import './markdown-viewer.js';
import './dbml-viewer.js';
import './diagram-viewer.js';
import './swagger-viewer.js';

export class CodeViewer extends LitElement {
  static properties = {
    activeFile: { type: Object },
    files: { type: Array },
    theme: { type: String },
    viewMode: { type: String },
    _dbmlBreadcrumb: { type: Object, state: true }
  };

  // Override to render in Light DOM so global CSS (markdown.css, dbdocs.css, Swagger UI) applies directly
  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.activeFile = null;
    this.files = [];
    this.theme = 'light';
    this.currentContentType = ''; // 'markdown', 'plantuml', 'mermaid', 'swagger', 'dbml'
    this.viewMode = 'document'; // default
    this._dbmlBreadcrumb = null;

    // Instantiate the slim coordinator controller
    this.viewerController = new ViewerController(this);
  }

  firstUpdated() {
    // Safely trigger initial preview rendering once elements are mounted
    this.viewerController.updatePreview();
  }

  handleExportHTML = () => {
    this.viewerController.handleExportHTML();
  };

  handleExportPDF = () => {
    this.viewerController.handleExportPDF();
  };

  handleExportSVG = () => {
    this.viewerController.handleExportSVG();
  };

  handleExportPNG = () => {
    this.viewerController.handleExportPNG();
  };

  /**
   * Renders the appropriate viewer component based on currentContentType.
   * Each viewer component is self-contained and manages its own rendering lifecycle.
   */
  renderViewer() {
    const ct = this.currentContentType;

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
          .code=${this.activeFile?.content || ''}
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
          @breadcrumb-change=${(e) => { this._dbmlBreadcrumb = e.detail; }}
        ></dbml-viewer>
      `;
    }

    // No matching viewer — return empty fragment
    return html``;
  }

  render() {
    const filename = this.activeFile ? this.activeFile.path.split('/').pop() : '';
    return html`
      <div class="code-viewer-container">
        ${this.activeFile ? html`
          <tool-bar
            .filename=${filename}
            .contentType=${this.currentContentType}
            .viewMode=${this.viewMode}
            .breadcrumb=${this._dbmlBreadcrumb}
            @breadcrumb-navigate=${(e) => {
              const viewer = this.renderRoot.querySelector('#active-dbml-viewer');
              if (viewer && viewer.handleBreadcrumbNavigation) {
                viewer.handleBreadcrumbNavigation(e.detail);
              }
            }}
            @view-mode-change=${(e) => { this.viewMode = e.detail.mode; }}
            @export-html=${this.handleExportHTML}
            @export-pdf=${this.handleExportPDF}
            @export-svg=${this.handleExportSVG}
            @export-png=${this.handleExportPNG}
          ></tool-bar>
        ` : ''}
        <div id="previewer-target">
          ${this.renderViewer()}
        </div>
      </div>
    `;
  }
}

customElements.define('code-viewer', CodeViewer);
