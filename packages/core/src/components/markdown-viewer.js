import { LitElement, html } from 'lit';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { renderDiagrams } from '@spectre/core/utils/diagram-processor.js';
import './markdown-viewer.css';

/**
 * markdown-viewer — Renders Markdown documents with:
 * - @import statement preprocessing
 * - Obsidian-style transclusions ![[path]]
 * - Embedded diagram rendering (mermaid/plantuml)
 * - Cross-file workspace link navigation (open-ref-file events)
 * - Syntax highlighting via highlight.js
 */
export class MarkdownViewer extends LitElement {
  static properties = {
    activeFile: { type: Object },
    files: { type: Array },
    theme: { type: String }
  };

  createRenderRoot() {
    return this; // Light DOM to inherit global .markdown-preview styles
  }

  constructor() {
    super();
    this.activeFile = null;
    this.files = [];
    this.theme = 'light';

    // Configure marked custom link rendering for cross-references
    const renderer = new marked.Renderer();
    renderer.link = (href, title, text) => {
      if (href && !href.startsWith('http') && !href.startsWith('#')) {
        return `<a href="${href}" class="workspace-link" data-href="${href}">${text}</a>`;
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    };
    marked.setOptions({ renderer });
  }

  updated(changedProperties) {
    if (changedProperties.has('activeFile') ||
        changedProperties.has('files') ||
        changedProperties.has('theme')) {
      this.renderContent();
    }
  }

  resolvePath(basePath, relativePath) {
    const baseSegments = basePath ? basePath.split('/') : [];
    baseSegments.pop();
    const relSegments = relativePath.split('/');

    for (const seg of relSegments) {
      if (seg === '.' || seg === '') continue;
      if (seg === '..') {
        if (baseSegments.length > 0) baseSegments.pop();
      } else {
        baseSegments.push(seg);
      }
    }
    return baseSegments.join('/');
  }

  preprocessImports(content, basePath, visited = new Set()) {
    if (!content) return '';
    if (visited.has(basePath)) {
      return `*Error: Circular import detected for "${basePath}"*`;
    }
    const nextVisited = new Set(visited);
    nextVisited.add(basePath);

    // Process @import statements
    let processed = content.replace(/^@import\s+['"]?([^'"]+)['"]?\s*$/gm, (match, relPath) => {
      const resolvedPath = this.resolvePath(basePath, relPath);
      return this.getImportedContent(resolvedPath, relPath, nextVisited);
    });

    // Process Obsidian-style transclusions ![[path]]
    processed = processed.replace(/!\[\[(.*?)\]\]/g, (match, relPath) => {
      const resolvedPath = this.resolvePath(basePath, relPath);
      return this.getImportedContent(resolvedPath, relPath, nextVisited);
    });

    return processed;
  }

  getImportedContent(resolvedPath, originalPath, visited) {
    let importedFile = this.files.find(f => f.path === resolvedPath && f.type === 'file');

    if (!importedFile) {
      const filename = originalPath.split('/').pop();
      importedFile = this.files.find(f => f.type === 'file' && (f.path === filename || f.path.endsWith('/' + filename)));
    }

    if (importedFile) {
      const ext = importedFile.path.split('.').pop().toLowerCase();
      if (ext === 'md' || ext === 'markdown') {
        return this.preprocessImports(importedFile.content, importedFile.path, visited);
      }

      let lang = '';
      if (ext === 'puml' || ext === 'plantuml' || ext === 'pu') {
        lang = 'plantuml';
      } else if (ext === 'mermaid' || ext === 'mmd') {
        lang = 'mermaid';
      } else if (ext === 'yaml' || ext === 'yml') {
        lang = 'yaml';
      } else {
        lang = ext;
      }
      return `\`\`\`${lang}\n${importedFile.content}\n\`\`\``;
    }
    return `*Error: Imported file not found at "${resolvedPath}"*`;
  }

  showLoaderOverlay() {
    this.hideLoaderOverlay();
    const container = this.querySelector('.markdown-viewer-host');
    if (!container) return;
    const overlay = document.createElement('div');
    overlay.className = 'render-loader-overlay';
    overlay.innerHTML = `
      <svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="2" x2="12" y2="6"></line>
        <line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="6" y2="12"></line>
        <line x1="18" y1="12" x2="22" y2="12"></line>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
      </svg>
      <div class="render-loader-text">Rendering...</div>
    `;
    container.style.position = 'relative';
    container.appendChild(overlay);
  }

  hideLoaderOverlay() {
    const container = this.querySelector('.markdown-viewer-host');
    if (!container) return;
    const existing = container.querySelector('.render-loader-overlay');
    if (existing) existing.remove();
  }

  async renderContent() {
    if (!this.activeFile) {
      const host = this.querySelector('.markdown-viewer-host');
      if (host) {
        host.innerHTML = `
          <div class="markdown-viewer-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            <span>No active preview. Select a document.</span>
          </div>
        `;
      }
      return;
    }

    const host = this.querySelector('.markdown-viewer-host');
    if (!host) return;

    try {
      const preprocessedText = this.preprocessImports(this.activeFile.content, this.activeFile.path);
      const htmlContent = marked.parse(preprocessedText || '');

      host.innerHTML = `<div class="markdown-preview">${htmlContent}</div>`;

      // Syntax highlight code blocks (skip diagram blocks)
      host.querySelectorAll('.markdown-preview pre code').forEach((block) => {
        const isDiagram = block.classList.contains('language-mermaid') ||
          block.classList.contains('language-plantuml') ||
          block.classList.contains('language-puml');
        if (!isDiagram) {
          hljs.highlightElement(block);
        }
      });

      this.showLoaderOverlay();
      await new Promise(r => setTimeout(r, 10));

      const isDark = this.theme === 'dark';
      await renderDiagrams(host.querySelector('.markdown-preview'), isDark);
    } catch (err) {
      host.innerHTML = `
        <div class="markdown-viewer-error">
          Error rendering Markdown document: ${err.message}
        </div>
      `;
    } finally {
      this.hideLoaderOverlay();
    }
  }

  render() {
    return html`
      <div class="markdown-viewer-host"></div>
    `;
  }
}

customElements.define('markdown-viewer', MarkdownViewer);
