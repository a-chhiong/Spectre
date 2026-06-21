/**
 * Helper to clean database type names for Mermaid schema validation
 */
function cleanMermaidType(typeName) {
  if (!typeName) return 'varchar';
  // Strip parentheses and spaces (e.g., varchar(255) -> varchar)
  return typeName.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Map DBML endpoint relations to Mermaid ER cardinality notation
 */
function getMermaidRelation(rel1, rel2) {
  if (rel1 === '1' && rel2 === '1') return '||--||';
  if (rel1 === '1' && rel2 === '*') return '||--o{';
  if (rel1 === '*' && rel2 === '1') return '}o--||';
  return '}o--o{';
}

/**
 * Render standard HTML tables wrapped in a responsive container, with data-label properties for mobile responsiveness.
 */
function renderHtmlTable(headers, rows) {
  let html = '<div class="dbdocs-table-responsive">\n';
  html += '  <table class="dbdocs-table">\n';
  html += '    <thead>\n      <tr>\n';
  for (const header of headers) {
    html += `        <th>${header}</th>\n`;
  }
  html += '      </tr>\n    </thead>\n';
  html += '    <tbody>\n';
  for (const row of rows) {
    html += '      <tr>\n';
    for (let i = 0; i < headers.length; i++) {
      const label = headers[i];
      const cellContent = row[i] !== undefined && row[i] !== null ? row[i] : '';
      html += `        <td data-label="${label}"><span class="dbdocs-table-value">${cellContent}</span></td>\n`;
    }
    html += '      </tr>\n';
  }
  html += '    </tbody>\n  </table>\n</div>\n';
  return html;
}

/**
 * Core compiler converting @dbml/core Database AST object into hybrid Markdown + HTML documentation

 * @param {Object} database The parsed Database object
 * @param {string} entrypointName Filename of the compiled entrypoint (e.g. "index.dbml")
 * @param {string} activeAbsPath Optional path to filter tables by
 * @returns {string} Compiled markdown string
 */
export function compileDbmlToMarkdown(database, entrypointName, activeNodePath, options = {}) {
  if (!database) return '# Error: Compiled database schema is empty.';

  const { groupingMode = 'schema', isExport = false } = options;
  const exported = database.export();
  
  // Consolidate all tables, enums, tablegroups, and refs from all schemas
  const allTables = [];
  const allEnums = [];
  const allTableGroups = [];
  const refs = [];

  for (const schema of exported.schemas || []) {
    const schemaName = schema.name || 'public';
    if (schema.tables) {
      schema.tables.forEach(t => {
        t.schemaName = schemaName;
        allTables.push(t);
      });
    }
    if (schema.enums) {
      schema.enums.forEach(e => {
        e.schemaName = schemaName;
        allEnums.push(e);
      });
    }
    if (schema.tableGroups) {
      schema.tableGroups.forEach(tg => {
        tg.schemaName = schemaName;
        allTableGroups.push(tg);
      });
    }
    if (schema.refs) {
      schema.refs.forEach(r => {
        r.schemaName = schemaName;
        refs.push(r);
      });
    }
  }

  // Build a set of enum names for type detection
  const enumNames = new Set(allEnums.map(e => e.name));

  // --- Isolated Rendering Filtering ---
  let tables = [];
  let enums = [];
  let tableGroups = [];
  
  if (isExport) {
    tables = allTables;
    enums = allEnums;
    tableGroups = allTableGroups;
  } else {
    if (!activeNodePath) {
      // Root View: Show full document (TOC + all tables/enums)
      tables = allTables;
      enums = allEnums;
      tableGroups = groupingMode === 'tableGroup' ? allTableGroups : [];
    } else if (activeNodePath.startsWith('schema-')) {
      const sName = activeNodePath.replace('schema-', '');
      tables = allTables.filter(t => t.schemaName === sName);
      enums = allEnums.filter(e => e.schemaName === sName);
      tableGroups = []; 
    } else if (activeNodePath.startsWith('tablegroup-')) {
      const parts = activeNodePath.split('-');
      const sName = parts[1];
      const gName = parts.slice(2).join('-');
      const group = allTableGroups.find(g => g.name === gName && g.schemaName === sName);
      if (group) {
        tableGroups = [group];
        const gTableNames = (group.tables || []).map(t => t.tableName || t.name);
        tables = allTables.filter(t => gTableNames.includes(t.name));
      }
    } else if (activeNodePath.startsWith('table-')) {
      const parts = activeNodePath.split('-');
      const sName = parts[1];
      const tName = parts.slice(2).join('-');
      tables = allTables.filter(t => t.name === tName && t.schemaName === sName);
    } else if (activeNodePath.startsWith('enum-')) {
      const parts = activeNodePath.split('-');
      const sName = parts[1];
      const eName = parts.slice(2).join('-');
      enums = allEnums.filter(e => e.name === eName && e.schemaName === sName);
    }
  }

  // Local helper to check if a column is a foreign key
  const isForeignKey = (schemaName, tableName, columnName) => {
    return refs.some(ref => 
      ref.endpoints.some(ep => 
        (ep.schemaName || 'public') === schemaName &&
        ep.tableName === tableName && 
        ep.fieldNames.includes(columnName) && 
        ep.relation === '*'
      )
    );
  };

  // Local helper to find the target of a foreign key
  const getForeignKeyRef = (schemaName, tableName, columnName) => {
    for (const ref of refs) {
      const sourceEp = ref.endpoints.find(ep => 
        (ep.schemaName || 'public') === schemaName &&
        ep.tableName === tableName && 
        ep.fieldNames.includes(columnName) && 
        ep.relation === '*'
      );
      if (sourceEp) {
        const targetEp = ref.endpoints.find(ep => ep !== sourceEp);
        if (targetEp) {
          return {
            targetSchema: targetEp.schemaName || 'public',
            targetTable: targetEp.tableName,
            targetColumn: targetEp.fieldNames[0]
          };
        }
      }
    }
    return null;
  };

  // Helper: find which TableGroup a table belongs to
  const getTableGroup = (tableName) => {
    for (const tg of allTableGroups) {
      const groupTables = tg.tables || [];
      if (groupTables.some(gt => (gt.tableName || gt.name) === tableName)) {
        return tg.name;
      }
    }
    return null;
  };

  // Helper: get all refs where this table is an endpoint
  const getTableRefs = (schemaName, tableName) => {
    return refs.filter(ref => ref.endpoints.some(ep => 
      ep.tableName === tableName && (ep.schemaName || 'public') === schemaName
    ));
  };

  // Schema color palette (consistent colors per schema)
  const schemaColors = {};
  const colorPalette = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  let colorIdx = 0;
  const getSchemaColor = (schemaName) => {
    if (!schemaColors[schemaName]) {
      schemaColors[schemaName] = colorPalette[colorIdx % colorPalette.length];
      colorIdx++;
    }
    return schemaColors[schemaName];
  };

  // === Build Document ===
  const project = exported.project || database.shallowExport() || {};
  const projName = project.name || 'OpenStudio Project';
  const dbType = project.databaseType || project.database_type || '';
  const projNote = project.note || '';

  let md = '';

  // --- Project Header ---
  md += `<div class="dbml-project-header">\n`;
  md += `  <h1 class="dbml-project-title">${projName}</h1>\n`;
  if (dbType) {
    md += `  <div class="dbml-project-meta"><span class="dbdocs-badge dbdocs-badge-default">${dbType}</span></div>\n`;
  }
  if (projNote && (!activeNodePath || isExport)) {
    // Render project note as markdown (supports headings, bullets, bold)
    md += `  <div class="dbml-project-note">\n\n${projNote}\n\n</div>\n`;
  }
  md += `</div>\n\n---\n\n`;

  // --- Table of Contents & Grouped ER Diagrams ---
  if (groupingMode === 'schema') {
    const uniqueSchemas = [...new Set(tables.map(t => t.schemaName || 'public'))];
    if (uniqueSchemas.length > 0) {
      md += '<div class="toc-container">\n';
      md += '  <div class="toc-title">Schemas</div>\n';
      md += '  <ul class="toc-list">\n';
      for (const sName of uniqueSchemas) {
        const anchor = 'schema-' + sName.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        const schemaTables = tables.filter(t => (t.schemaName || 'public') === sName);
        md += `    <li class="toc-item"><a href="#${anchor}">${sName}</a> <span class="toc-count">(${schemaTables.length})</span></li>\n`;
      }
      md += '  </ul>\n';
      md += '</div>\n\n---\n\n';

      // Schema ERDs
      for (const sName of uniqueSchemas) {
        const anchor = 'schema-' + sName.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        md += `<div id="${anchor}">\n\n`;
        md += `### Schema: ${sName}\n\n`;

        const schemaTables = tables.filter(t => (t.schemaName || 'public') === sName);
        const schemaTableNames = schemaTables.map(t => t.name);
        
        const schemaHeaderTables = schemaTables.filter(t => t.headerColor);

        if (schemaHeaderTables.length > 0) {
          md += '```mermaid\n---\nconfig:\n  themeCSS: |\n';
          for (const table of schemaHeaderTables) {
            md += `    [id|="entity-${table.name}"] rect:first-of-type {\n      fill: ${table.headerColor} !important;\n    }\n`;
          }
          md += '---\nerDiagram\n';
        } else {
          md += '```mermaid\nerDiagram\n';
        }

        for (const table of schemaTables) {
          md += `    ${table.name} {\n`;
          for (const field of table.fields) {
            const typeName = cleanMermaidType(field.type.type_name);
            const pkAttr = field.pk ? ' PK' : '';
            const fkAttr = isForeignKey(table.schemaName, table.name, field.name) ? ' FK' : '';
            md += `        ${typeName} ${field.name}${pkAttr}${fkAttr}\n`;
          }
          md += '    }\n\n';
        }

        for (const ref of refs) {
          const ep1 = ref.endpoints[0];
          const ep2 = ref.endpoints[1];
          if (schemaTableNames.includes(ep1.tableName) && (ep1.schemaName || 'public') === sName &&
              schemaTableNames.includes(ep2.tableName) && (ep2.schemaName || 'public') === sName) {
            const relSym = getMermaidRelation(ep1.relation, ep2.relation);
            md += `    ${ep1.tableName} ${relSym} ${ep2.tableName} : ""\n`;
          }
        }

        md += '```\n';
        md += '</div>\n\n---\n\n';
      }
    }
  } else if (tableGroups.length > 0) {
    // Table Groups TOC
    md += '<div class="toc-container">\n';
    md += '  <div class="toc-title">Table Groups</div>\n';
    md += '  <ul class="toc-list">\n';
    for (const group of tableGroups) {
      const anchor = 'tablegroup-' + group.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      const groupTables = group.tables || [];
      md += `    <li class="toc-item"><a href="#${anchor}">${group.name}</a> <span class="toc-count">(${groupTables.length})</span></li>\n`;
    }
    md += '  </ul>\n';
    md += '</div>\n\n---\n\n';

    // Grouped ER Diagrams
    for (const group of tableGroups) {
      const anchor = 'tablegroup-' + group.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      md += `<div id="${anchor}">\n\n`;
      md += `### TableGroup: ${group.name}\n\n`;

      const groupTables = group.tables || [];
      const groupTableNames = groupTables.map(gt => gt.tableName || gt.name);
      
      const groupHeaderTables = groupTableNames
        .map(name => allTables.find(t => t.name === name))
        .filter(t => t && t.headerColor);

      if (groupHeaderTables.length > 0) {
        md += '```mermaid\n---\nconfig:\n  themeCSS: |\n';
        for (const table of groupHeaderTables) {
          md += `    [id|="entity-${table.name}"] rect:first-of-type {\n      fill: ${table.headerColor} !important;\n    }\n`;
        }
        md += '---\nerDiagram\n';
      } else {
        md += '```mermaid\nerDiagram\n';
      }

      for (const tableName of groupTableNames) {
        const table = allTables.find(t => t.name === tableName);
        if (table) {
          md += `    ${table.name} {\n`;
          for (const field of table.fields) {
            const typeName = cleanMermaidType(field.type.type_name);
            const pkAttr = field.pk ? ' PK' : '';
            const fkAttr = isForeignKey(table.schemaName, table.name, field.name) ? ' FK' : '';
            md += `        ${typeName} ${field.name}${pkAttr}${fkAttr}\n`;
          }
          md += '    }\n\n';
        }
      }

      for (const ref of refs) {
        const ep1 = ref.endpoints[0];
        const ep2 = ref.endpoints[1];
        if (groupTableNames.includes(ep1.tableName) && groupTableNames.includes(ep2.tableName)) {
          const relSym = getMermaidRelation(ep1.relation, ep2.relation);
          md += `    ${ep1.tableName} ${relSym} ${ep2.tableName} : ""\n`;
        }
      }

      md += '```\n';
      md += '</div>\n\n---\n\n';
    }
  }

  // --- Isolated Table ER Diagram ---
  if (!isExport && activeNodePath && activeNodePath.startsWith('table-') && tables.length === 1) {
    const tableMermaid = compileDbmlToMermaid(database, activeNodePath, groupingMode);
    if (tableMermaid) {
      md += '```mermaid\n' + tableMermaid + '\n```\n\n---\n\n';
    }
  }

  // --- Data Dictionary ---
  md += '## Data Dictionary\n\n';
  for (const table of tables) {
    const sName = table.schemaName || 'public';
    const schemaColor = getSchemaColor(sName);
    const groupName = getTableGroup(table.name);
    const tableRefs = getTableRefs(sName, table.name);

    md += `<div class="dbdocs-table-container" id="table-${sName}-${table.name}" data-table="${table.name}">\n\n`;

    // Structured table header
    md += `<div class="dbdocs-table-header">\n`;
    md += `  <div class="dbdocs-table-title-row" style="display: flex; justify-content: space-between; align-items: flex-start;">\n`;
    md += `    <div class="dbdocs-table-title">\n`;
    md += `      <span class="dbdocs-table-schema-dot" style="background: ${schemaColor}"></span>\n`;
    md += `      <h3>${sName}.${table.name}</h3>\n`;
    md += `    </div>\n`;
    md += `    <button class="copy-btn" data-copy-text="${table.name}">Copy name</button>\n`;
    md += `  </div>\n`;
    // Metadata row
    const metaItems = [];
    if (groupName) {
      metaItems.push(`<span class="dbdocs-meta-item"><span class="dbdocs-meta-label">Group</span> <span class="dbdocs-meta-value">${groupName}</span></span>`);
    }
    metaItems.push(`<span class="dbdocs-meta-item"><span class="dbdocs-meta-label">Fields</span> <span class="dbdocs-meta-value">${table.fields.length}</span></span>`);
    if (tableRefs.length > 0) {
      metaItems.push(`<span class="dbdocs-meta-item"><span class="dbdocs-meta-label">References</span> <span class="dbdocs-meta-value">${tableRefs.length}</span></span>`);
    }
    md += `  <div class="dbdocs-table-meta">${metaItems.join('')}</div>\n`;
    md += `</div>\n\n`;

    // Table note (rendered as markdown)
    if (table.note) {
      md += `<div class="dbdocs-table-note">\n\n${table.note}\n\n</div>\n\n`;
    }

    // === Columns (restructured: Name, Type, Settings, References, Notes) ===
    md += `<details class="table-section columns-section" open>\n`;
    md += `  <summary>Fields <span class="section-count">(${table.fields.length})</span></summary>\n\n`;
    md += `<div class="dbdocs-column-list">\n`;
    md += `  <div class="dbdocs-column-header-row">\n`;
    md += `    <div>Name</div><div>Type</div><div>Settings</div><div>References</div>\n`;
    md += `  </div>\n`;
    for (const field of table.fields) {
      const fkInfo = getForeignKeyRef(sName, table.name, field.name);
      
      const nameHtml = `<span class="col-icon-name"><svg class="col-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="12" height="12" rx="2"/><line x1="5" y1="6" x2="11" y2="6"/><line x1="5" y1="10" x2="9" y2="10"/></svg><span class="col-name">${field.name}</span></span>`;

      const isEnum = enumNames.has(field.type.type_name);
      const typeHtml = isEnum
        ? `<span class="col-type">${field.type.type_name}</span> <span class="dbdocs-badge dbdocs-badge-enum">E</span>`
        : `<span class="col-type">${field.type.type_name}</span>`;

      const settings = [];
      if (field.pk) settings.push('<span class="dbdocs-badge dbdocs-badge-pk">PK</span>');
      if (field.not_null) settings.push('<span class="dbdocs-badge dbdocs-badge-notnull">not null</span>');
      if (field.unique) settings.push('<span class="dbdocs-badge dbdocs-badge-unique">unique</span>');
      if (field.increment) settings.push('<span class="dbdocs-badge dbdocs-badge-increment">increment</span>');
      const settingsStr = settings.length > 0 ? `<div class="col-settings">${settings.join(' ')}</div>` : '';

      let refHtml = '';
      if (fkInfo) {
        const targetId = `table-${fkInfo.targetSchema}-${fkInfo.targetTable}`;
        refHtml = `<a href="#${targetId}" class="fk-link"><span class="fk-arrow">→</span> ${fkInfo.targetTable}.${fkInfo.targetColumn}</a>`;
      }
      const incomingRefs = refs.filter(ref => {
        const targetEp = ref.endpoints.find(ep => 
          (ep.schemaName || 'public') === sName && ep.tableName === table.name && 
          ep.fieldNames.includes(field.name) && ep.relation === '1'
        );
        return !!targetEp;
      });
      if (incomingRefs.length > 0) {
        const incoming = incomingRefs.map(ref => {
          const sourceEp = ref.endpoints.find(ep => ep.relation === '*');
          if (!sourceEp) return '';
          const sourceId = `table-${sourceEp.schemaName || 'public'}-${sourceEp.tableName}`;
          return `<a href="#${sourceId}" class="fk-link fk-link-incoming"><span class="fk-arrow">←</span> ${sourceEp.tableName}.${sourceEp.fieldNames[0]}</a>`;
        }).filter(Boolean);
        if (refHtml) refHtml += '<br>';
        refHtml += incoming.join('<br>');
      }
      const finalRefHtml = refHtml ? `<div class="col-refs">${refHtml}</div>` : '';

      let notesParts = [];
      if (field.dbdefault) {
        notesParts.push(`<span class="dbdocs-badge dbdocs-badge-default">default: <code>${field.dbdefault.value}</code></span>`);
      }
      if (field.note) {
        notesParts.push(`<span class="field-note-text">${field.note}</span>`);
      }
      const notesStr = notesParts.join(' ');

      md += `  <div class="dbdocs-column-row">\n`;
      md += `    <div>${nameHtml}</div>\n`;
      md += `    <div>${typeHtml}</div>\n`;
      md += `    <div>${settingsStr}</div>\n`;
      md += `    <div>${finalRefHtml}</div>\n`;
      if (notesStr) {
        md += `    <div class="dbdocs-column-note">${notesStr}</div>\n`;
      }
      md += `  </div>\n`;
    }
    md += `</div>\n`;
    md += `\n</details>\n\n`;

    // === Indexes ===
    const tableIndexes = table.indexes || [];
    if (tableIndexes.length > 0) {
      md += `<details class="table-section indexes-section" open>\n`;
      md += `  <summary>Indexes <span class="section-count">(${tableIndexes.length})</span></summary>\n\n`;
      const idxHeaders = ['Name', 'Columns', 'Unique', 'Details'];
      const idxRows = [];
      for (const idx of tableIndexes) {
        const columnsStr = idx.columns.map(c => c.value).join(', ');
        const details = idx.pk ? 'PRIMARY KEY' : 'INDEX';
        idxRows.push([
          `<code>${idx.name || '(anonymous)'}</code>`,
          `<code>(${columnsStr})</code>`,
          `<code>${idx.unique ? 'true' : 'false'}</code>`,
          `<span class="dbdocs-badge dbdocs-badge-default">${details}</span>`
        ]);
      }
      md += renderHtmlTable(idxHeaders, idxRows);
      md += `\n</details>\n\n`;
    }

    md += '</div>\n\n';
  }

  // --- Enums ---
  if (enums.length > 0) {
    md += '---\n\n## Enums\n\n';
    for (const en of enums) {
      const eSchema = en.schemaName || 'public';
      const schemaColor = getSchemaColor(eSchema);
      md += `<div class="dbdocs-table-container" id="enum-${eSchema}-${en.name}" data-enum="${en.name}">\n\n`;
      md += `<div class="dbdocs-table-header">\n`;
      md += `  <div class="dbdocs-table-title">\n`;
      md += `    <span class="dbdocs-table-schema-dot" style="background: ${schemaColor}"></span>\n`;
      md += `    <h3>${eSchema}.${en.name}</h3>\n`;
      md += `    <span class="dbdocs-badge dbdocs-badge-enum" style="margin-left: 8px">ENUM</span>\n`;
      md += `  </div>\n`;
      md += `</div>\n\n`;
      if (en.note) {
        md += `<div class="dbdocs-table-note">\n\n${en.note}\n\n</div>\n\n`;
      }
      const enumHeaders = ['Value', 'Note'];
      const enumRows = [];
      const values = en.values || [];
      for (const val of values) {
        enumRows.push([
          `<code>${val.name}</code>`,
          val.note || ''
        ]);
      }
      md += renderHtmlTable(enumHeaders, enumRows);
      md += '\n';
      md += '</div>\n\n';
    }
  }

  return md;
}

/**
 * Compiles a database AST to a Mermaid ER diagram code string representing the entire schema.
 * @param {Object} database The parsed Database object
 * @returns {string} Mermaid ER diagram code
 */
export function compileDbmlToMermaid(database, activeNodePath = null, groupingMode = 'schema') {
  if (!database) return '';
  const exported = database.export();
  
  const allTables = [];
  const refs = [];
  const allTableGroups = [];

  for (const schema of exported.schemas || []) {
    const schemaName = schema.name || 'public';
    if (schema.tables) {
      schema.tables.forEach(t => {
        t.schemaName = schemaName;
        allTables.push(t);
      });
    }
    if (schema.tableGroups) {
      schema.tableGroups.forEach(tg => {
        tg.schemaName = schemaName;
        allTableGroups.push(tg);
      });
    }
    if (schema.refs) {
      schema.refs.forEach(r => {
        r.schemaName = schemaName;
        refs.push(r);
      });
    }
  }

  let tables = [];
  if (!activeNodePath) {
    tables = allTables;
  } else if (activeNodePath.startsWith('schema-')) {
    const sName = activeNodePath.replace('schema-', '');
    tables = allTables.filter(t => t.schemaName === sName);
  } else if (activeNodePath.startsWith('tablegroup-')) {
    const parts = activeNodePath.split('-');
    const sName = parts[1];
    const gName = parts.slice(2).join('-');
    const group = allTableGroups.find(g => g.name === gName && g.schemaName === sName);
    if (group) {
      const gTableNames = (group.tables || []).map(t => t.tableName || t.name);
      tables = allTables.filter(t => gTableNames.includes(t.name));
    }
  } else if (activeNodePath.startsWith('table-')) {
    const parts = activeNodePath.split('-');
    const sName = parts[1];
    const tName = parts.slice(2).join('-');
    
    // For single table, we include its neighbors in the ERD
    const targetTable = allTables.find(t => t.name === tName && t.schemaName === sName);
    if (targetTable) {
      const tableNamesToInclude = new Set([tName]);
      for (const ref of refs) {
        const ep1 = ref.endpoints[0];
        const ep2 = ref.endpoints[1];
        if (ep1.tableName === tName && (ep1.schemaName || 'public') === sName) {
          tableNamesToInclude.add(ep2.tableName);
        } else if (ep2.tableName === tName && (ep2.schemaName || 'public') === sName) {
          tableNamesToInclude.add(ep1.tableName);
        }
      }
      tables = allTables.filter(t => tableNamesToInclude.has(t.name));
    }
  } else if (activeNodePath.startsWith('enum-')) {
    tables = [];
  }

  // Local helper to check if a column is a foreign key
  const isForeignKey = (schemaName, tableName, columnName) => {
    return refs.some(ref => 
      ref.endpoints.some(ep => 
        (ep.schemaName || 'public') === schemaName &&
        ep.tableName === tableName && 
        ep.fieldNames.includes(columnName) && 
        ep.relation === '*'
      )
    );
  };

  let mermaidCode = '';
  const hasHeaderColors = tables.some(t => t.headerColor);
  if (hasHeaderColors) {
    mermaidCode += '---\nconfig:\n  themeCSS: |\n';
    for (const table of tables) {
      if (table.headerColor) {
        mermaidCode += `    [id|="entity-${table.name}"] rect:first-of-type {\n      fill: ${table.headerColor} !important;\n    }\n`;
      }
    }
    mermaidCode += '---\nerDiagram\n';
  } else {
    mermaidCode += 'erDiagram\n';
  }

  // 1. Table columns
  for (const table of tables) {
    mermaidCode += `    ${table.name} {\n`;
    for (const field of table.fields) {
      const typeName = cleanMermaidType(field.type.type_name);
      const pkAttr = field.pk ? ' PK' : '';
      const fkAttr = isForeignKey(table.schemaName, table.name, field.name) ? ' FK' : '';
      mermaidCode += `        ${typeName} ${field.name}${pkAttr}${fkAttr}\n`;
    }
    mermaidCode += '    }\n\n';
  }

  // 2. Table relationships
  const tableNames = tables.map(t => t.name);
  for (const ref of refs) {
    const ep1 = ref.endpoints[0];
    const ep2 = ref.endpoints[1];
    
    // Only include refs where BOTH endpoints are in the current `tables` list
    if (tableNames.includes(ep1.tableName) && tableNames.includes(ep2.tableName)) {
      const relSym = getMermaidRelation(ep1.relation, ep2.relation);
      mermaidCode += `    ${ep1.tableName} ${relSym} ${ep2.tableName} : ""\n`;
    }
  }

  return mermaidCode;
}

