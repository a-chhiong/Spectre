import { LitElement, html, css } from 'lit';

export class DbmlMenu extends LitElement {
  static properties = {
    database: { type: Object },
    isOpen: { type: Boolean },
    groupingMode: { type: String }, // 'schema' | 'tableGroup'
    collapsedPaths: { type: Object },
    searchValue: { type: String },
    activeNodePath: { type: String },
    _filterSet: { state: true }
  };

  static styles = css`
    :host {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 20;
      pointer-events: none; /* Let clicks pass through where there's no UI */
    }

    * {
      box-sizing: border-box;
    }

    /* Floating Menu Button */
    .dbml-menu-btn {
      position: absolute;
      top: 12px;
      left: 12px;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--glass-bg, rgba(255, 255, 255, 0.85));
      border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.4));
      border-radius: var(--border-radius-lg, 12px);
      box-shadow: var(--glass-shadow, 0 8px 32px 0 rgba(0, 0, 0, 0.1));
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: var(--text-primary);
      cursor: pointer;
      opacity: 0.4;
      transition: opacity 0.25s ease, background 0.2s ease;
      pointer-events: auto;
      z-index: 20;
    }

    .dbml-menu-btn:hover {
      opacity: 1;
      background: var(--bg-tertiary, rgba(0,0,0,0.05));
    }

    .dbml-menu-btn.hidden {
      display: none;
    }

    .dbml-menu-btn svg {
      width: 18px;
      height: 18px;
    }

    /* Floating Panel */
    .dbml-menu-panel {
      position: absolute;
      top: 12px;
      left: 12px;
      bottom: 12px;
      width: 280px;
      display: flex;
      flex-direction: column;
      background: var(--glass-bg, rgba(255, 255, 255, 0.85));
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.4));
      border-radius: var(--border-radius-lg, 12px);
      box-shadow: var(--glass-shadow, 0 12px 48px 0 rgba(0, 0, 0, 0.15));
      
      /* Scale & Fade Animation */
      opacity: 0;
      transform: scale(0.95);
      transform-origin: top left;
      transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.2s;
      visibility: hidden;
      pointer-events: none;
      z-index: 15;
    }

    .dbml-menu-panel.open {
      opacity: 1;
      transform: scale(1);
      visibility: visible;
      pointer-events: auto;
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
    }

    .panel-close {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      line-height: 1;
      padding: 4px;
      margin-left: -4px;
      border-radius: var(--border-radius-sm);
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .panel-close:hover {
      color: var(--text-primary);
      background: var(--bg-tertiary);
    }

    .panel-search {
      flex: 1;
      position: relative;
    }

    .panel-search input {
      width: 100%;
      padding: 6px 28px 6px 12px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      color: var(--text-primary);
      font-family: var(--font-sans);
      font-size: 0.85rem;
      transition: border-color var(--transition-normal);
    }

    .panel-search input:focus {
      outline: none;
      border-color: var(--accent-color);
    }

    .search-clear {
      position: absolute;
      right: 24px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 1rem;
      padding: 0;
      line-height: 1;
    }

    .search-clear:hover {
      color: var(--text-primary);
    }

    .panel-tree {
      flex: 1;
      overflow-y: auto;
      padding: 0 12px 12px 12px;
    }

    .panel-tree::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    .panel-tree::-webkit-scrollbar-track {
      background: transparent;
    }

    .panel-tree::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 4px;
    }

    .panel-tree::-webkit-scrollbar-thumb:hover {
      background: var(--text-secondary);
    }

    .panel-footer {
      padding: 12px 16px;
      border-top: 1px solid var(--border-color);
    }

    .group-toggle {
      display: flex;
      background: var(--bg-tertiary);
      border-radius: var(--border-radius-sm);
      padding: 2px;
    }

    .group-btn {
      flex: 1;
      background: none;
      border: none;
      padding: 4px 0;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-secondary);
      border-radius: calc(var(--border-radius-sm) - 2px);
      cursor: pointer;
      transition: all var(--transition-normal);
    }

    .group-btn:hover {
      color: var(--text-primary);
    }

    .group-btn.active {
      background: var(--bg-primary);
      color: var(--text-primary);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    /* Tree Node Styles */
    .dbml-tree-node {
      display: flex;
      align-items: center;
      padding: 4px 6px;
      cursor: pointer;
      border-radius: var(--border-radius-sm);
      font-size: 0.85rem;
      color: var(--text-primary);
      user-select: none;
      margin-bottom: 2px;
      border-right: 2px solid transparent;
      transition: background-color var(--transition-normal), border-color var(--transition-normal);
    }

    .dbml-tree-node:hover {
      background-color: var(--bg-tertiary);
    }

    .dbml-tree-node.active {
      background-color: var(--bg-tertiary);
      color: var(--accent-color);
      border-right-color: var(--accent-color);
      font-weight: 500;
    }

    .node-count {
      margin-left: auto;
      font-size: 0.7rem;
      color: var(--text-secondary);
      background: var(--bg-tertiary);
      padding: 1px 6px;
      border-radius: 10px;
    }

    .dbml-tree-indent {
      width: 14px;
      height: 100%;
      flex-shrink: 0;
    }

    .dbml-tree-icon {
      width: 14px;
      height: 14px;
      margin-right: 6px;
      flex-shrink: 0;
    }

    .dbml-tree-icon.schema { color: var(--color-warning, #f59e0b); }
    .dbml-tree-icon.group { color: var(--color-info, #8b5cf6); }
    .dbml-tree-icon.table { color: var(--accent-color); }
    .dbml-tree-icon.enum { color: var(--color-success, #10b981); }

    .dbml-tree-arrow {
      width: 14px;
      height: 14px;
      margin-right: 4px;
      flex-shrink: 0;
      color: var(--text-secondary);
      transition: transform 0.2s ease;
      cursor: pointer;
    }

    .dbml-tree-arrow:hover {
      color: var(--text-primary);
    }

    .dbml-tree-arrow.open {
      transform: rotate(90deg);
    }
  `;

  constructor() {
    super();
    this.database = null;
    this.isOpen = false;
    this.groupingMode = 'schema';
    this.collapsedPaths = new Set();
    this.searchValue = '';
    this.activeNodePath = '';
    this.searchPlaceholder = 'Search tables...';
  }

  handleSearch(e) {
    this.searchValue = e.target.value;
  }

  clearSearch() {
    this.searchValue = '';
    const input = this.shadowRoot.querySelector('.panel-search input');
    if (input) input.value = '';
  }

  setGroupingMode(mode) {
    if (this.groupingMode === mode) return;
    this.groupingMode = mode;
    this.collapsedPaths.clear();
    this.dispatchEvent(new CustomEvent('grouping-mode-change', {
      detail: { mode },
      bubbles: true,
      composed: true
    }));
  }

  toggleNode(path) {
    const newCollapsed = new Set(this.collapsedPaths);
    if (newCollapsed.has(path)) {
      newCollapsed.delete(path);
    } else {
      newCollapsed.add(path);
    }
    this.collapsedPaths = newCollapsed;
  }

  scrollToEntity(path) {
    this.activeNodePath = path;
    this.dispatchEvent(new CustomEvent('node-click', {
      detail: { path },
      bubbles: true,
      composed: true
    }));
  }

  buildSidebarTree() {
    if (!this.database) return [];
    
    let rootNodes = [];

    // Grouping by Schema Driven
    if (this.groupingMode === 'schema') {
      this.database.schemas.forEach(schema => {
        const schemaName = schema.name || 'public';
        const schemaNode = {
          name: schemaName,
          type: 'schema',
          path: `schema-${schemaName}`,
          children: []
        };
        
        schema.tables.forEach(table => {
          schemaNode.children.push({
            name: table.name,
            type: 'table',
            path: `table-${schemaName}-${table.name}`
          });
        });
        
        schema.enums.forEach(enm => {
          schemaNode.children.push({
            name: enm.name,
            type: 'enum',
            path: `enum-${schemaName}-${enm.name}`
          });
        });
        
        if (schemaNode.children.length > 0) {
          rootNodes.push(schemaNode);
        }
      });
    } else {
      // Grouping by TableGroup Driven (Flattened layout ignoring schema)
      const groupedTableNames = new Set();
      
      this.database.schemas.forEach(schema => {
        const schemaName = schema.name || 'public';
        
        schema.tableGroups.forEach(tg => {
          const groupNode = {
            name: tg.name,
            type: 'group',
            path: `tablegroup-${schemaName}-${tg.name}`,
            children: []
          };
          
          (tg.tables || []).forEach(groupTable => {
            const tSchema = (groupTable.schema && groupTable.schema.name) || groupTable.schemaName || schemaName;
            const tName = groupTable.tableName || groupTable.name;
            // Track globally by schema+name
            groupedTableNames.add(`${tSchema}-${tName}`);
            groupNode.children.push({
              name: tName,
              type: 'table',
              path: `table-${tSchema}-${tName}`
            });
          });
          
          rootNodes.push(groupNode);
        });
      });
      
      // Standalone tables (not in any group)
      this.database.schemas.forEach(schema => {
        const schemaName = schema.name || 'public';
        const standaloneTables = schema.tables.filter(t => !groupedTableNames.has(`${schemaName}-${t.name}`));
        standaloneTables.forEach(table => {
          rootNodes.push({
            name: table.name,
            type: 'table',
            path: `table-${schemaName}-${table.name}`
          });
        });
        
        // Enums at root
        schema.enums.forEach(enm => {
          rootNodes.push({
            name: enm.name,
            type: 'enum',
            path: `enum-${schemaName}-${enm.name}`
          });
        });
      });
    }
    
    return rootNodes;
  }

  _isNodeVisible(node) {
    if (!this.searchValue) return true;
    const term = this.searchValue.toLowerCase().trim();
    if (!term) return true;

    // Check if the node itself matches
    const nameMatches = node.name && node.name.toLowerCase().includes(term);
    if (nameMatches) return true;

    // Check if any child matches
    if (node.children && node.children.length > 0) {
      return node.children.some(child => this._isNodeVisible(child));
    }

    return false;
  }

  renderSidebarNode(node, depth = 0) {
    if (!this._isNodeVisible(node)) return html``;

    const visibleChildren = (node.children || []).filter(child => this._isNodeVisible(child));
    const isCollapsible = visibleChildren.length > 0;
    const isCollapsed = this.collapsedPaths.has(node.path);
    const indentStyles = Array.from({ length: depth }).map(() => html`<div class="dbml-tree-indent"></div>`);
    
    // Icons
    let icon = '';
    if (node.type === 'schema') {
      icon = html`<svg class="dbml-tree-icon schema" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;
    } else if (node.type === 'group') {
      icon = html`<svg class="dbml-tree-icon group" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M3 9h18M9 21V9"></path></svg>`;
    } else if (node.type === 'table') {
      icon = html`<svg class="dbml-tree-icon table" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`;
    } else if (node.type === 'enum') {
      icon = html`<svg class="dbml-tree-icon enum" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`;
    }

    const isActive = this.activeNodePath === node.path;

    return html`
      <div 
        class="dbml-tree-node ${isActive ? 'active' : ''}" 
        @click=${() => this.scrollToEntity(node.path)}
      >
        ${indentStyles}
        ${isCollapsible 
          ? html`
              <svg 
                class="dbml-tree-arrow ${!isCollapsed ? 'open' : ''}" 
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                @click=${(e) => {
                  e.stopPropagation();
                  this.toggleNode(node.path);
                }}
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            ` 
          : html`<div class="dbml-tree-indent" style="width: 14px; margin-right: 4px;"></div>`
        }
        ${icon}
        <span>${node.name}</span>
        ${isCollapsible ? html`<span class="node-count">${visibleChildren.length}</span>` : ''}
      </div>
      ${isCollapsible && !isCollapsed ? visibleChildren.map(child => this.renderSidebarNode(child, depth + 1)) : ''}
    `;
  }

  render() {
    const sidebarTree = this.buildSidebarTree();

    return html`
      <button class="dbml-menu-btn ${this.isOpen ? 'hidden' : ''}"
              @click=${() => this.isOpen = true}
              title="Toggle Outline">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="6" x2="20" y2="6"></line>
          <line x1="8" y1="12" x2="20" y2="12"></line>
          <line x1="8" y1="18" x2="20" y2="18"></line>
          <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"></circle>
          <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"></circle>
        </svg>
      </button>

      <div class="dbml-menu-panel ${this.isOpen ? 'open' : ''}">
        <div class="panel-header">
          <button class="panel-close" @click=${() => this.isOpen = false} title="Close Outline">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <div class="panel-search">
            <input
              type="search"
              placeholder="${this.searchPlaceholder}"
              .value=${this.searchValue}
              @input=${this.handleSearch}
            />
            ${this.searchValue
              ? html`<button class="search-clear" @click=${this.clearSearch}>×</button>`
              : ''}
          </div>
        </div>
        
        <div class="panel-tree">
          ${sidebarTree.map(node => this.renderSidebarNode(node))}
        </div>
        
        <div class="panel-footer">
          <div class="group-toggle">
            <button class="group-btn ${this.groupingMode === 'schema' ? 'active' : ''}" @click=${() => this.setGroupingMode('schema')}>Schemas</button>
            <button class="group-btn ${this.groupingMode === 'tableGroup' ? 'active' : ''}" @click=${() => this.setGroupingMode('tableGroup')}>Groups</button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('dbml-menu', DbmlMenu);
