import { LitElement, html } from 'lit';

export class DbmlSidebar extends LitElement {
  static properties = {
    database: { type: Object },
    groupingMode: { type: String }, // 'tableGroup' or 'schema'
    collapsedPaths: { type: Object },
    isSidebarCollapsed: { type: Boolean },
    searchValue: { type: String },
    searchPlaceholder: { type: String },
    activeNodePath: { type: String },
    _filterSet: { state: true }
  };

  createRenderRoot() {
    return this; // Render in light DOM for global CSS inheritance
  }

  constructor() {
    super();
    this.database = null;
    this.groupingMode = 'schema';
    this.collapsedPaths = new Set();
    this.isSidebarCollapsed = false;
    this.searchValue = '';
    this.searchPlaceholder = 'Search...';
    this.activeNodePath = null;
    this._filterSet = new Set();
    this._searchDebounceTimer = null;
    
    this._isResizing = false;
    this._hasDragged = false;
    this._startX = 0;
    this._startWidth = 0;
  }

  handleDragStart = (e) => {
    e.preventDefault();
    this._isResizing = true;
    this._hasDragged = false;
    this._startX = e.clientX;
    const sidebarEl = this.renderRoot.querySelector('.dbml-sidebar');
    this._startWidth = sidebarEl.getBoundingClientRect().width;
    
    document.addEventListener('mousemove', this.handleDrag);
    document.addEventListener('mouseup', this.handleDragEnd);
    document.body.style.cursor = 'col-resize';
  };

  handleDrag = (e) => {
    if (!this._isResizing) return;
    
    const diff = e.clientX - this._startX;
    if (Math.abs(diff) > 3) {
      this._hasDragged = true;
    }
    
    let newWidth = this._startWidth + diff;
    if (newWidth < 200) newWidth = 200;
    if (newWidth > 400) newWidth = 400;
    
    document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
  };

  handleDragEnd = () => {
    this._isResizing = false;
    document.removeEventListener('mousemove', this.handleDrag);
    document.removeEventListener('mouseup', this.handleDragEnd);
    document.body.style.cursor = '';
  };

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

  handleSearch(e) {
    this.searchValue = e.target.value;
  }

  clearSearch() {
    this.searchValue = '';
  }

  setActiveNode(path) {
    this.activeNodePath = path;
    this.requestUpdate();
  }

  setGroupingMode(mode) {
    this.groupingMode = mode;
    this.dispatchEvent(new CustomEvent('grouping-mode-change', { detail: { mode }, bubbles: true, composed: true }));
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

    return html`
      <div class="dbml-sidebar-wrapper">
        <div class="dbml-sidebar ${this.isSidebarCollapsed ? 'collapsed' : ''}">
          <!-- Search Input -->
          <div class="dbml-search">
            <input
              type="search"
              class="dbml-search-input"
              placeholder="${this.searchPlaceholder}"
              .value=${this.searchValue}
              @input=${this.handleSearch}
            />
            ${this.searchValue
              ? html`<button class="dbml-search-clear" @click=${this.clearSearch}>×</button>`
              : ''}
          </div>
          
          <div class="dbml-sidebar-content" style="padding-top: 12px;">
            ${sidebarTree.map(node => this.renderSidebarNode(node))}
          </div>
          
          <div class="dbml-sidebar-footer">
            <div class="dbml-group-toggle">
              <button class="dbml-group-btn ${this.groupingMode === 'schema' ? 'active' : ''}" @click=${() => this.setGroupingMode('schema')}>Schemas</button>
              <button class="dbml-group-btn ${this.groupingMode === 'tableGroup' ? 'active' : ''}" @click=${() => this.setGroupingMode('tableGroup')}>Groups</button>
            </div>
          </div>
        </div>
        
        <div class="dbml-sidebar-handle" 
          @mousedown=${this.handleDragStart}
          @click=${() => { 
            if (!this._hasDragged) {
              this.isSidebarCollapsed = !this.isSidebarCollapsed; 
            }
          }} 
          title="Drag to resize, click to toggle"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="handle-icon ${this.isSidebarCollapsed ? 'collapsed' : ''}">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </div>
      </div>
    `;
  }
}

customElements.define('dbml-sidebar', DbmlSidebar);
