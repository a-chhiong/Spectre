# OpenStudio DBML Viewer - Unified Implementation Roadmap

> **Date**: 2026-06-17
> **Source**: Consolidated from DBMLS_IMPLEMENTATION_PLAN.md + DBMLS-DEEP-DIVE-ANALYSIS.md + DBML_VIEWER_IMPLEMENTATION_PLAN.md
> **Goal**: Rich client-only DBML documentation viewer with optimized screen real estate

---

## Architecture Decisions (Final)

### ✓ Extend Existing Components (Don't Create New Toolbar)
- **tool-bar.js** extended with DBML-specific controls (view mode, zoom, export)
- **Avoid**: Creating separate `dbml-viewer-toolbar.js` and `entity-panel.js`

### ✓ Use Collapsible Table Sections (Not Side Panel)
- Inline `<details>/<summary>` instead of entity side panel
- No extra DOM elements, no layout shifts with mermaid diagrams

### ✓ Keep PLANTUML (not remove)
- PLANTUML is part of core feature set for PlantUML diagram support
- Keep 1.2MB offline bundle for PlantUML rendering

### ✓ No SQL DDL Generation
- Client-only **documentation viewer**, not a database schema-to-SQL converter

---

## Feature Priority Classification

### 🔴 Critical (Phase 1 - Days 1-2)
| ID | Feature | Source | Effort |
|----|---------|--------|--------|
| 1 | Sidebar Search/Filter | All 3 plans | Medium |
| 2 | Active Node Scroll Spy | DBMLS + DBML_VIEWER | Medium |
| 3 | Click FK → Navigate | DBMLS_DEEP + DBML_VIEWER | Low |
| 4 | View Mode Toggle (Doc/Diagram) | DBMLS + DBML_VIEWER | Low |
| 5 | Collapsible Table Sections | DBML_VIEWER + DBMLS | Low |
| 6 | Copy to Clipboard | DBMLS_DEEP | Low |

### 🟡 High-Value (Phase 2 - Days 3-5)
| ID | Feature | Source | Effort |
|----|---------|--------|--------|
| 7 | Diagram Zoom/Pan | DBMLS_DEEP + DBML_VIEWER | High |
| 8 | Export SVG/PNG/MD/HTML/PDF | DBMLS + DBML_VIEWER | Medium |
| 9 | Auto-fit Diagram | DBML_VIEWER | Low |
| 10 | Toggle Show/Hide Tables | DBML_VIEWER | Medium |
| 11 | Breadcrumb Navigation | DBMLS_DEEP + DBML_VIEWER | Low |
| 12 | Highlight Target on Click | DBMLS_DEEP | Low |

### 🟢 Nice-to-Have (Phase 3 - Days 6-8)
| ID | Feature | Source | Effort |
|----|---------|--------|--------|
| 13 | Count Badges | DBMLS + DBML_VIEWER | Low |
| 14 | Skeleton Loading State | DBMLS + DBML_VIEWER | Medium |
| 15 | Keyboard Shortcuts | DBMLS_DEEP | Medium |
| 16 | Responsive Typography | DBMLS_DEEP | Low |
| 17 | Toast Notifications | DBMLS_DEEP + DBML_VIEWER | Low |

---

## Phase-by-Phase Implementation

### Phase 1: Quick Wins (Days 1-2)

#### 1.1 Sidebar Search/Filter
**File**: `web-page/src/components/viewer/dbml-sidebar.js`

```javascript
// Add to constructor
this.searchValue = '';
this.searchDebounceTimer = null;

// Add to render() - search input
html`
  <div class="dbml-search">
    <input 
      type="search" 
      class="dbml-search-input"
      placeholder="${this.searchPlaceholder || 'Search...'}" 
      .value=${this.searchValue}
      @input=${this.handleSearch}
    />
    ${this.searchValue 
      ? html`<button class="dbml-search-clear" @click=${this.clearSearch}>×</button>`
      : ''}
  </div>
`;

// Methods
handleSearch(e) {
  clearTimeout(this.searchDebounceTimer);
  this.searchValue = e.target.value.toLowerCase();
  this.searchDebounceTimer = setTimeout(() => {
    this.updateTreeVisibility();
  }, 150);
}

updateTreeVisibility() {
  // Auto-expand all nodes when searching
  if (this.searchValue) {
    this.collapsedPaths = new Set();
  }
  this.requestUpdate();
}

clearSearch() {
  this.searchValue = '';
  this.requestUpdate();
}
```

**CSS** (`dbml-viewer.css`):
```css
.dbml-search {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
}

.dbml-search-input {
  padding: 6px 12px;
  padding-right: 28px;
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
}

.dbml-search-clear {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  color: var(--text-secondary);
}
```

---

#### 1.2 Active Node Scroll Spy
**File**: `web-page/src/components/viewer/dbml-viewer.js`

```javascript
// Add to constructor
this.scrollSpyObserver = null;
this.activeEntityPath = null;

// Add to renderContent() after rendering
setupScrollSpy() {
  if (this.scrollSpyObserver) this.scrollSpyObserver.disconnect();
  
  this.scrollSpyObserver = new IntersectionObserver((entries) => {
    let activeEntry = null;
    let minDistance = Infinity;
    
    entries.forEach(entry => {
      const distance = Math.max(0, entry.boundingClientRect.top);
      if (entry.isIntersecting && distance < minDistance) {
        minDistance = distance;
        activeEntry = entry;
      }
    });
    
    if (activeEntry) {
      this.activeEntityPath = activeEntry.target.id;
      this.notifySidebarActive(this.activeEntityPath);
    }
  }, { 
    rootMargin: '-10% 0px -60% 0px',
    threshold: 0.1
  });
  
  const mainContent = this.querySelector('.dbml-main-content');
  const containers = mainContent.querySelectorAll('.dbdocs-table-container, [data-enum], [id^="tablegroup-"]');
  
  containers.forEach(el => this.scrollSpyObserver.observe(el));
}
```

**Notify sidebar method** (`dbml-sidebar.js`):
```javascript
setActiveNode(path) {
  this.activeNodePath = path;
  this.requestUpdate();
}
```

---

#### 1.3 Click FK → Navigate
**File**: `web-page/src/utils/dbml-converter.js`

```javascript
// In column row generation (~line 261):
const isForeignKey = (tableName, columnName) => { /* existing logic */ };

// Make FK column names clickable:
let fieldHtml = `<span class="field-name">${field.name}</span>`;
if (isForeignKey(tableName + "." + field.name)) {
  const ref = refs.find(r => r.endpoints.some(ep => ep.fieldNames.includes(field.name)));
  if (ref) {
    const targetEp = ref.endpoints.find(ep => ep.fieldName === field.name);
    fieldHtml = `<a href="#table-${targetEp.tableName}" class="fk-link"><span class="field-name">${field.name}</span></a>`;
  }
}

// CSS for FK links:
.fk-link {
  color: var(--link-color);
  text-decoration: none;
  font-weight: 500;
}

.fk-link:hover {
  text-decoration: underline;
}
```

---

#### 1.4 View Mode Toggle
**File**: `web-page/src/components/viewer/tool-bar.js`

```javascript
// Add property:
viewMode = 'document'; // 'document' | 'diagram'

// Add to connectedCallback or property update callback:
shouldShowViewMode() {
  return this.contentType === 'dbml';
}

// Add to render():
${this.shouldShowViewMode() ? html`
  <div class="toolbar-segmented-controls">
    <button class="os-toolbar-btn ${this.viewMode === 'document' ? 'active' : ''}" 
            @click=${() => this.setNavigationBarVisible(true)}>
      <span class="toolbar-icon">📄</span>
    </button>
    <button class="os-toolbar-btn ${this.viewMode === 'diagram' ? 'active' : ''}" 
            @click=${() => this.setViewMode('diagram')}>
      <span class="toolbar-icon">📊</span>
    </button>
  </div>
` : ''}

// Add handler:
setViewMode(mode) {
  this.viewMode = mode;
  this.dispatchEvent(new CustomEvent('view-mode-change', { detail: mode }));
}
```

---

#### 1.5 Collapsible Table Sections
**File**: `web-page/src/utils/dbml-converter.js`

```javascript
// Wrap sections in details/summary:
md += `<details class="table-section columns-section" open>\n`;
md += `<summary class="section-header">${sectionTitle} <span class="section-count">(${count})</span></summary>\n\n`;
md += renderSectionContent(sectionData);
md += `</details>\n\n`;
```

**CSS** (`dbml-viewer.css`):
```css
.table-section {
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
}

.table-section > summary {
  cursor: pointer;
  font-weight: 600;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  list-style-position: outside;
}

.table-section > summary::marker {
  font-size: 0.8rem;
  transition: transform 0.2s;
}

.table-section.collapsed > summary::marker {
  transform: rotate(-90deg);
}
```

---

#### 1.6 Copy to Clipboard
**File**: `web-page/src/components/viewer/dbml-viewer.js`

```javascript
async copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    this.showToast('Copied to clipboard!');
  } catch (err) {
    console.error('Copy failed:', err);
  }
}

showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
```

---

### Phase 2: Core Features (Days 3-5)

#### 2.1 Diagram Zoom/Pan
**File**: `web-page/src/components/viewer/diagram-viewer.js` or `diagram-processor.js`

```javascript
// Option A: d3-zoom (~25KB min+gzip)
import { zoom } from 'd3-zoom';

function setupDiagramZoom(container, svg) {
  const zoomBehavior = zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      svg.setAttribute('transform', event.transform);
    });
  
  container.call(zoomBehavior);
  return zoomBehavior;
}

// Option B: PanndAgent (lightweight alternative)
import { PanndAgent } from './pannd.js';

function enableDiagramInteractions(container) {
  const svg = container.querySelector('svg');
  if (!svg) return null;
  
  return new PanndAgent(svg, {
    minZoom: 0.1,
    maxZoom: 4.0,
    zoomStep: 0.1,
    smoothScroll: true
  });
}
```

---

#### 2.2 Export Functions
**File**: `web-page/src/utils/file-exporter.js` (extend existing)

```javascript
export const exporterService = {
  // ... existing methods

  async exportDiagramSVG(projectName, activeFile, svg) {
    const svgElement = svg || this.getMermaidSVGContainer();
    const svgEl = svgElement?.querySelector('svg');
    if (!svgEl) return;
    
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    downloadFile(blob, getExportFilename(projectName, activeFile, 'diagram')) + '.svg');
  },

  async exportDiagramPNG(projectName, activeFile, svg) {
    const svgEl = svg?.querySelector('svg') || this.getMermaidSVGContainer()?.querySelector('svg');
    const canvas = await svgToCanvas(svgEl);
    canvas.toBlob((blob) => {
      downloadFile(blob, getExportFilename(projectName, activeFile, 'diagram') + '.png');
    }, 'image/png');
  },

  exportMarkdownHTML(projectName, activeFile, renderedHtml) {
    // Extension of existing method for DBML
    const html = `<html><head><title>${projectName}</title></head><body>${renderedHtml}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    downloadFile(blob, getExportFilename(projectName, activeFile, 'dbml-doc') + '.html');
  }
};
```

---

#### 2.3 Auto-fit & Table Toggles
**File**: `web-page/src/components/viewer/tool-bar.js`

```javascript
handleFitToView() {
  if (this.diagramAgent) {
    this.diagramAgent.fitToView();
  }
}

// Table visibility toggles in diagram view
html`
  <div class="diagram-table-toggles">
    ${this.diagramTables.map(t => html`
      <label class="diagram-table-toggle">
        <input type="checkbox" checked @change=${(e) => this.toggleTable(t.name, e.target.checked)}>
        <span>${t.name}</span>
      </label>
    `)}
  </div>
`;
```

---

### Phase 3: Polish (Days 6-8)

#### 3.1 Skeleton Loading
**File**: `web-page/src/components/viewer/dbml-viewer.css`

```css
.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-table {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-md);
  padding: 1rem;
  animation: skeleton-pulse 1.5s infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

#### 3.2 Count Badges & Breadcrumbs
**File**: `dbml-sidebar.js` + `dbml-viewer.js`

```javascript
// Count badges:
<span class="node-count">(${node.children.length})</span>

// Breadcrumbs:
<div class="breadcrumb">
  <span class="breadcrumb-item">${projectName}</span>
  <span class="breadcrumb-sep">/</span>
  <span class="breadcrumb-item">${schemaName}</span>
  <span class="breadcrumb-sep">/</span>
  <span class="breadcrumb-item active">${activeEntity}</span>
</div>
```

#### 3.3 Highlight on Click
```javascript
highlightElement(el) {
  el.classList.add('highlighted');
  setTimeout(() => el.classList.remove('highlighted'), 1500);
}
```

---

## File Change Map

| File | Phase | Key Changes |
|------|-------|-------------|
| **`dbml-sidebar.js`** | 1, 3 | Search input, scroll spy, count badges |
| **`dbml-viewer.js`** | 1, 2, 3 | View mode toggle, zoom/pan, export, scroll spy, shortcuts |
| **`dbml-viewer.css`** | 1, 2, 3 | Skeleton, section styling, tooltip styles |
| **`dbml-converter.js`** | 1, 2 | FK links, collapsible sections |
| **`diagram-processor.js`** | 2, 3 | Zoom/pan, table toggles |
| **`tool-bar.js`** | 1, 2, 3 | View mode, export, zoom controls |
| **`file-exporter.js`** | 2 | SVG/PNG export, markdown export |
| **`dbdocs.css`** | 1, 2 | Add tooltip styles, section styles, breadcrumb styles |
| **`variables.css`** | 3 | New CSS custom properties |

---

## Dependency Analysis

### OpenStudio Dependency Philosophy

> **OpenStudio is a universal document viewer & editor combination.** Every package included is here for a reason. Before reducing any dependency:
> 1. Verify the use case (Mermaid doesn't use highlight.js, but other view modes might)
> 2. Consider if users want full language coverage across all document types
> 3. Err on keeping - the bundle size impact is marginal vs. the utility gained
>
> **Rule: If you cannot articulate a clear rationale for reducing a dependency, do NOT touch it.**

### Current Dependencies
| Package | Purpose | Notes |
|---------|---------|-------|
| `@dbml/core` | DBML parsing | Core for DBML viewers |
| `mermaid` | ER diagrams + flowcharts + sequences | Covers all Mermaid diagram types |
| `marked` | Markdown rendering | Core for markdown viewers |
| `highlight.js` | Code highlighting | Multi-language coverage (SQL, DBML, JSON, etc.) |
| `lit` | UI framework | Core for all Lit-based components |
| `plantuml-encoder` | PlantUML encoding | Encodes PlantUML diagrams |
| `dompurify` | HTML sanitization | Prevents XSS in rendered HTML |

### New Dependencies (Phase 2)
| Package | Purpose | Size | Decision |
|---------|---------|------|----------|
| `d3-zoom` | Diagram zoom/pan | ~25KB | **ADD** (preferred over pannd for Mermaid SVG compatibility) |
| `pannd` | Diagram pan/zoom (alternative) | ~8KB | **OPTIONAL** (lightweight alternative if d3-zoom too heavy) |

### Dependencies to Keep (No Reduction Planned)
- **PLANTUML** - 1.2MB offline bundle, essential for PlantUML diagram support
- **highlight.js** - Full language coverage for all document types (Mermaid renders SVG images, not text)

### Dependencies to Consider Adding (Not Removing)
- **focus-trap** - For accessible modal/panel focus management
- **lodash.debounce** - Cross-browser debounce implementation

---

## Gap Score Summary

| Category | dbdocs.io | OpenStudio | Target | Gap |
|----------|-----------|------------|--------|-----|
| Navigation | 95/100 | 60/100 | 90/100 | -5 |
| Diagram UX | 90/100 | 40/100 | 85/100 | -5 |
| Table View | 95/100 | 75/100 | 90/100 | -5 |
| Export Options | 90/100 | 65/100 | 85/100 | -5 |
| Performance | 85/100 | 70/100 | 80/100 | -5 |
| Accessibility | 80/100 | 45/100 | 75/100 | -5 |
| **Total** | **88/100** | **61/100** | **85/100** | **-3** |

---

## Implementation Order (Detailed)

```
PR #1: Quick Wins
├── 1.1 Sidebar Search (dbml-sidebar.js)
├── 1.2 Scroll Spy (dbml-viewer.js) 
├── 1.3 FK Navigation (dbml-converter.js)
└── 1.4 Collapsible Sections (dbml-converter.js)

PR #2: View Mode + Copy
├── 1.5 View Mode Toggle (tool-bar.js)
├── 1.6 Copy to Clipboard (dbml-viewer.js)
└── 2.3 Auto-fit (tool-bar.js)

PR #3: Diagram Interactions
├── 2.1 Zoom/Pan (diagram-processor.js)
├── 2.2 Export SVG/PNG (file-exporter.js)
└── 2.3 Table Toggles (tool-bar.js)

PR #4: Polish
├── 3.1 Skeleton Loading (dbml-viewer.css)
├── 3.2 Count Badges (dbml-sidebar.js)
├── 3.3 Breadcrumbs (dbml-viewer.js)
└── 3.4 Highlight on Click (dbml-viewer.js)
```

---

## Technical Notes

1. **Mermaid Zoom/Pan**: Mermaid v10+ renders SVG. Use `d3-zoom` for best compatibility:
   ```js
   import { zoom } from 'd3-zoom';
   // After mermaid renders, wrap SVG in container with zoom behavior
   ```

2. **Export Strategy**:
   - **Markdown**: Direct string output from converter
   - **PDF**: `window.print()` with existing print CSS
   - **SVG**: Extract from mermaid DOM
   - **PNG**: Canvas from SVG via `XMLSerializer`

3. **Performance**:
   - Current `renderContent()` re-renders everything on every change
   - Phase 3 introduces lazy rendering for 100+ table schemas
   - Memoize `compileDbmlToMarkdown` output by content hash

---

*Document generated: 2026-06-17*  
*Consolidated from 3 analysis documents*