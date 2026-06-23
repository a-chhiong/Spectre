// ─── Webview Entry Point ──────────────────────────────────────────────────────
// Wires the VS Code postMessage bridge and mounts the Lit extension-app

import './styles/preview.css';

// Import the Lit root application
import './extension-app.js';
import { setContentType, setFileName, handleExport } from './export.js';

// ─────────────────────────────────────────────────────────────────────────────
//  VS Code API
// ─────────────────────────────────────────────────────────────────────────────
const vscode = acquireVsCodeApi(); // eslint-disable-line no-undef
window.__vscode = vscode;

// ─────────────────────────────────────────────────────────────────────────────
//  DOM Bootstrap
// ─────────────────────────────────────────────────────────────────────────────
const root = document.getElementById('os-root');
const app = document.createElement('extension-app');
root.appendChild(app);

// ─────────────────────────────────────────────────────────────────────────────
//  Message Router (from VS Code extension host)
// ─────────────────────────────────────────────────────────────────────────────
window.addEventListener('message', ({ data }) => {
  switch (data.type) {
    case 'update':
      app.activeFile = { path: data.path, content: data.content, type: 'file' };
      app.files = data.workspaceFiles || [];
      if (!app.files.find(f => f.path === data.path)) {
        app.files.push(app.activeFile);
      }
      app.contentType = data.contentType || '';
      app.activeNodePath = null;
      
      // Load Swagger CSS if needed
      if (app.contentType === 'swagger' && window.__ASSETS__?.swaggerCssUri) {
        if (!document.getElementById('swagger-css')) {
          const link = document.createElement('link');
          link.id = 'swagger-css';
          link.rel = 'stylesheet';
          link.href = window.__ASSETS__.swaggerCssUri;
          document.head.appendChild(link);
        }
      }

      // Update export state
      setContentType(app.contentType);
      setFileName(data.filename || 'preview');
      break;

    case 'scroll-to-node':
      if (app.contentType === 'dbml') {
        app.activeNodePath = data.path;
      }
      break;

    case 'trigger-export':
      // The export logic still lives in export.js
      // We pass the app's shadowRoot or specific container to it
      handleExport(data.format, app.renderRoot.querySelector('#preview-container'));
      break;
      
    case 'toggle-theme':
      app.theme = app.theme === 'dark' ? 'light' : 'dark';
      break;

    case 'print':
      window.print();
      break;
  }
});

// ── Webview ready signal ─────────────────────────────────────────────────────
vscode.postMessage({ type: 'webview-ready' });

