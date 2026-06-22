import { LitElement, html, css } from 'lit';
import './outline-header.js';

export class OutlineTree extends LitElement {
  static properties = {
    database: { type: Object },
    groupingMode: { type: String }, // 'tableGroup' or 'schema'
    collapsedPaths: { type: Object },
    searchValue: { type: String },
    searchPlaceholder: { type: String },
    activeNodePath: { type: String },
    _filterSet: { state: true }
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      background: var(--bg-secondary);
    }
    .outline-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
      /* Hide scrollbar for Firefox and IE/Edge */
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    /* Hide scrollbar for Chrome, Safari and Opera */
    .outline-content::-webkit-scrollbar,
    .outline-content *::-webkit-scrollbar {
      display: none;
    }
    
    .dbml-tree-node {
      display: flex;
      align-items: center;
      padding: 4px 12px 4px 4px;
      cursor: pointer;
      font-size: 0.85rem;
      color: var(--text-secondary);
      user-select: none;
      transition: background var(--transition-fast, 0.15s);
    }
    .dbml-tree-node:hover {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
    }
    .dbml-tree-node.active {
      background-color: var(--bg-tertiary);
      color: var(--accent-color);
      font-weight: 500;
      border-right: 2px solid var(--accent-color);
    }
    .dbml-tree-indent {
      width: 16px;
      flex-shrink: 0;
    }
    .dbml-tree-arrow {
      width: 14px;
      height: 14px;
      margin-right: 4px;
      flex-shrink: 0;
      color: var(--text-muted, var(--text-secondary));
      transition: transform 0.2s;
      cursor: pointer;
    }
    .dbml-tree-arrow.open {
      transform: rotate(90deg);
    }
    .dbml-tree-icon {
      width: 14px;
      height: 14px;
      margin-right: 6px;
      flex-shrink: 0;
    }
    .dbml-tree-icon.schema { color: #f59e0b; }
    .dbml-tree-icon.group { color: #8b5cf6; }
    .dbml-tree-icon.table { color: #3b82f6; }
    .dbml-tree-icon.enum { color: #10b981; }
    .node-count {
      margin-left: auto;
      font-size: 0.65rem;
      color: var(--text-muted, var(--text-secondary));
      background: var(--bg-tertiary);
      padding: 2px 6px;
      border-radius: 999px;
      font-weight: 500;
    }
  `;

  constructor() {
    super();
    this.database = null;
    this.groupingMode = 'schema';
    this.collapsedPaths = new Set();
    this.searchValue = '';
    this.searchPlaceholder = 'Search outline...';
    this.activeNodePath = null;
    this._filterSet = new Set();
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('database') || changedProperties.has('searchValue')) {
      this._applySearchFilter();
    }
  }

  _applySearchFilter() {
    if (!this.database || !this.searchValue) {
      this._filterSet = new Set();
      return;
    }
    const searchTerm = this.searchValue.toLowerCase().trim();
    if (!searchTerm) {
      this._filterSet = new Set();
      return;
    }
    this._filterSet = new Set();
    // Collect all searchable names (tables, enums, groups, schemas)
    const searchNames = [];
    this.database.schemas.forEach(schema => {
      searchNames.push(schema.name || 'public');
      schema.tables.forEach(t => searchNames.push(t.name));
      schema.enums.forEach(e => searchNames.push(e.name));
      schema.tableGroups.forEach(g => searchNames.push(g.name));
    });
    searchNames.forEach(name => {
      if (name.toLowerCase().includes(searchTerm)) {
        this._filterSet.add(name.toLowerCase());
      }
    });
    // When searching, auto-expand all nodes to show matches
    if (searchTerm && this._filterSet.size > 0) {
      this.collapsedPaths = new Set();
    }
  }

  handleSearchChange(e) {
    this.searchValue = e.detail.value;
  }

  handleGroupingModeChange(e) {
    this.groupingMode = e.detail.mode;
    this.dispatchEvent(new CustomEvent('grouping-mode-change', { detail: { mode: this.groupingMode }, bubbles: true, composed: true }));
    this.requestUpdate();
  }

  setActiveNode(path) {
    this.activeNodePath = path;
    this.requestUpdate();
  }

  toggleNode(path) {
    const nextCollapsed = new Set(this.collapsedPaths);
    if (nextCollapsed.has(path)) {
      nextCollapsed.delete(path);
    } else {
      nextCollapsed.add(path);
    }
    this.collapsedPaths = nextCollapsed;
    this.requestUpdate();
  }

  scrollToEntity(path) {
    // path is the hash, e.g., tablegroup-public-orders or table-public-users
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

    if (!this.database) {
        return html`<div style="padding: 1rem; color: var(--color-text-dim);">No DBML structure available.</div>`;
    }

    return html`
      <outline-header 
        .searchValue=${this.searchValue}
        .searchPlaceholder=${this.searchPlaceholder}
        .groupingMode=${this.groupingMode}
        @search-change=${this.handleSearchChange}
        @grouping-mode-change=${this.handleGroupingModeChange}
      ></outline-header>
      
      <div class="outline-content">
        ${sidebarTree.map(node => this.renderSidebarNode(node))}
      </div>
    `;
  }
}

customElements.define('outline-tree', OutlineTree);
