import { LitElement, html, css } from 'lit';
import { EditorController } from './editor-controller.js';

export class CodeEditor extends LitElement {
  static properties = {
    activeFile: { type: Object },
    theme: { type: String },
    visibleLineNumbers: { type: Boolean }
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      background-color: var(--bg-primary);
    }

    .editor-container {
      flex: 1;
      overflow: hidden;
      width: 100%;
      height: 100%;
      position: relative;
    }

    /* Style the CodeMirror scroll layout to fit panel */
    .cm-editor {
      height: 100%;
      font-family: var(--font-mono);
      font-size: 0.9rem;
    }

    /* Ensure line number gutter element fits 4 digits naturally */
    .cm-lineNumbers .cm-gutterElement {
      min-width: 4ch !important;
      padding: 0 4px 0 8px !important;
      text-align: right !important;
      box-sizing: border-box !important;
    }

    .no-file {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--text-secondary);
      font-style: italic;
      gap: 12px;
    }

    svg {
      width: 48px;
      height: 48px;
      color: var(--border-color);
    }

    .hidden {
      display: none !important;
    }

    .cm-ref-link {
      color: var(--accent-color) !important;
      text-decoration: underline !important;
      cursor: pointer !important;
    }

    .cm-ref-link:hover {
      filter: brightness(1.2);
    }

    /* Unified Auto-hidden Scrollbar */
    /* Hide scrollbar for Chrome, Safari and Opera */
    .editor-container::-webkit-scrollbar,
    .editor-container *::-webkit-scrollbar {
      display: none;
    }

    .editor-container {
      /* Hide scrollbar for Firefox and IE/Edge */
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;

  constructor() {
    super();
    this.activeFile = null;
    this.theme = 'light';
    this.visibleLineNumbers = true;
    this.locked = true;
    
    // Instantiates EditorController
    this.editorController = new EditorController(this);
  }

  firstUpdated() {
    const container = this.shadowRoot.getElementById('editor');
    this.editorController.initializeEditor(container);
  }

  render() {
    return html`
      <div class="no-file ${this.activeFile ? 'hidden' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>
        Select a file from the explorer to start editing
      </div>
      <div id="editor" class="editor-container ${this.activeFile ? '' : 'hidden'}"></div>
    `;
  }
}

customElements.define('code-editor', CodeEditor);
