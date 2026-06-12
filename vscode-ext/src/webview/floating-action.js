// ─── Floating Action Button ──────────────────────────────────────────────────
// Vanilla JS port of web-page's floating-action.js (no Lit).
// Renders a floating ⋮ button with a context-sensitive export dropdown.
// Calls handleExport() from export.js — same code path as command-palette exports.

import { handleExport } from './export.js';

export class FloatingAction {
  /**
   * @param {HTMLElement}   anchor      Element to append the FAB to
   * @param {() => HTMLElement} getPreview  Returns the current preview container
   */
  constructor(anchor, getPreview) {
    this._anchor     = anchor;
    this._getPreview = getPreview;
    this._open       = false;
    this._contentType = '';

    this._root = document.createElement('div');
    this._root.className = 'os-fab';
    anchor.appendChild(this._root);

    this._render();
    this._attachOutsideClick();
  }

  setContentType(ct) {
    this._contentType = ct;
    this._render();
  }

  _render() {
    this._root.innerHTML = '';

    const btn = document.createElement('button');
    btn.className = `os-fab-btn${this._open ? ' active' : ''}`;
    btn.setAttribute('aria-label', 'Export options');
    btn.title = 'Export options';
    btn.innerHTML = this._moreIcon();
    btn.addEventListener('click', e => {
      e.stopPropagation();
      this._open = !this._open;
      this._render();
    });
    this._root.appendChild(btn);

    if (this._open) {
      const menu = document.createElement('div');
      menu.className = 'os-fab-menu';
      this._getOptions().forEach(opt => {
        const item = document.createElement('button');
        item.className = 'os-fab-item';
        item.innerHTML = `${opt.icon} <span>${opt.label}</span>`;
        item.addEventListener('click', () => {
          this._open = false;
          this._render();
          handleExport(opt.format, this._getPreview());
        });
        menu.appendChild(item);
      });
      this._root.appendChild(menu);
    }
  }

  _getOptions() {
    const isDiagram = this._contentType === 'plantuml' || this._contentType === 'mermaid';
    if (isDiagram) {
      return [
        { label: 'Export SVG',  format: 'svg',  icon: this._svgIcon() },
        { label: 'Export PNG',  format: 'png',  icon: this._pngIcon() },
        { label: 'Export PDF',  format: 'pdf',  icon: this._pdfIcon() },
      ];
    }
    return [
      { label: 'Export HTML',  format: 'html', icon: this._htmlIcon() },
      { label: 'Export PDF',   format: 'pdf',  icon: this._pdfIcon() },
    ];
  }

  _attachOutsideClick() {
    document.addEventListener('click', e => {
      if (this._open && !this._root.contains(e.target)) {
        this._open = false;
        this._render();
      }
    });
  }

  // ── Icons (inline SVG) ────────────────────────────────────────────────────
  _moreIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="5"  r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
    </svg>`;
  }
  _svgIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>`;
  }
  _pngIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>`;
  }
  _htmlIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>`;
  }
  _pdfIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 9V2h12v7"/>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
      <rect x="6" y="14" width="12" height="8"/>
    </svg>`;
  }
}
