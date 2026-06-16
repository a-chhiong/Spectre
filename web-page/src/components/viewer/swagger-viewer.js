import { LitElement, html } from 'lit';
import { projectManager } from '../../services/project-manager.js';
import { resolverService } from '../../utils/spec-resolver.js';
import { sanitizeSpec } from '../../utils/file-exporter.js';
import SwaggerUI from 'swagger-ui-dist/swagger-ui-bundle.js';
import './swagger-viewer.css';

/**
 * swagger-viewer — Renders OpenAPI/Swagger specifications:
 * - Resolves multi-file specs via resolverService
 * - Detects child spec fragments (shows placeholder with link to parent)
 * - Manages Swagger UI lifecycle (mount/unmount/cleanup)
 * - Handles dark theme via CSS filter
 */
export class SwaggerViewer extends LitElement {
  static properties = {
    activeFile: { type: Object },
    files: { type: Array },
    theme: { type: String }
  };

  createRenderRoot() {
    return this; // Light DOM — Swagger UI requires global CSS access
  }

  constructor() {
    super();
    this.activeFile = null;
    this.files = [];
    this.theme = 'light';
    this.swaggerInstance = null;
  }

  updated(changedProperties) {
    if (changedProperties.has('activeFile') ||
        changedProperties.has('files') ||
        changedProperties.has('theme')) {
      this.renderContent();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupSwagger();
  }

  cleanupSwagger() {
    if (this.swaggerInstance) {
      try {
        this.swaggerInstance.preauthorizeApiKey && this.swaggerInstance.preauthorizeApiKey();
      } catch (_) { /* ignore cleanup errors */ }
      this.swaggerInstance = null;
    }
  }

  isRootCandidate(path) {
    return path === 'openapi.yaml' || path.endsWith('/openapi.yaml') ||
           path === 'swagger.yaml' || path.endsWith('/swagger.yaml') ||
           path === 'openapi.json' || path.endsWith('/openapi.json') ||
           path === 'swagger.json' || path.endsWith('/swagger.json');
  }

  findRootSpecFile() {
    return this.files.find(f =>
      f.type === 'file' &&
      (f.path === 'openapi.yaml' || f.path.endsWith('/openapi.yaml') ||
       f.path === 'swagger.yaml' || f.path.endsWith('/swagger.yaml') ||
       f.path === 'openapi.json' || f.path.endsWith('/openapi.json') ||
       f.path === 'swagger.json' || f.path.endsWith('/swagger.json'))
    );
  }

  async renderContent() {
    const host = this.querySelector('.swagger-viewer-host');
    if (!host) return;

    if (!this.activeFile) {
      host.innerHTML = `
        <div class="swagger-viewer-placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          <span>No active preview. Select a spec or document.</span>
        </div>
      `;
      return;
    }

    const entrypoint = this.activeFile.path;
    const filename = this.activeFile.path.split('/').pop();

    // Check if this is a child spec fragment
    if (!this.isRootCandidate(entrypoint)) {
      const rootFile = this.findRootSpecFile();
      if (rootFile) {
        const rootResult = resolverService.resolve(this.files, rootFile.path);
        if (rootResult && rootResult.spec && rootResult.resolvedFiles &&
            rootResult.resolvedFiles.has(this.activeFile.path)) {
          // This is a child fragment — show placeholder
          host.innerHTML = `
            <div class="swagger-viewer-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                <path d="M9 15h6"/>
                <path d="M12 12v6"/>
              </svg>
              <h3>Child Reference YAML</h3>
              <p>
                This file (<code>${filename}</code>) is a fragment referenced by the main OpenAPI specification.
                It is not a standalone Swagger root document.
              </p>
              <button class="btn-primary" id="open-parent-btn">
                Open Parent Swagger (${rootFile.path.split('/').pop()})
              </button>
            </div>
          `;
          const btn = host.querySelector('#open-parent-btn');
          if (btn) {
            btn.addEventListener('click', () => {
              projectManager.openTab(rootFile.path);
            });
          }
          return;
        }
      }
    }

    // Resolve and render the full spec
    const resolvedResult = resolverService.resolve(this.files, entrypoint);
    const { spec } = resolvedResult || {};

    const isValidSpec = spec && typeof spec === 'object' &&
                        (spec.openapi || spec.swagger || spec.paths);

    if (!isValidSpec) {
      host.innerHTML = `
        <div class="swagger-viewer-placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          <span>No preview available for "${filename}".</span>
        </div>
      `;
      return;
    }

    try {
      this.cleanupSwagger();
      host.innerHTML = '<div id="swagger-ui"></div>';

      // Deep clone and sanitize spec
      const sanitizedSpec = sanitizeSpec(JSON.parse(JSON.stringify(spec)));

      this.swaggerInstance = SwaggerUI({
        spec: sanitizedSpec,
        dom_id: '#swagger-ui',
        deepLinking: true
      });
    } catch (err) {
      host.innerHTML = `
        <div class="swagger-viewer-placeholder">
          <span>Failed to render Swagger UI: ${err.message}</span>
        </div>
      `;
    }
  }

  render() {
    return html`
      <div class="swagger-viewer-host"></div>
    `;
  }
}

customElements.define('swagger-viewer', SwaggerViewer);
