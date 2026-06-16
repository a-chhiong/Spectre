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
export function compileDbmlToMarkdown(database, entrypointName, activeAbsPath) {
  if (!database) return '# Error: Compiled database schema is empty.';

  const isParent = (entrypointName || '').toLowerCase().endsWith('index.dbml');
  const exported = database.export();
  const schema = exported.schemas[0] || { tables: [], enums: [], tableGroups: [], refs: [] };
  
  const tables = schema.tables || [];
  const enums = schema.enums || [];
  const tableGroups = schema.tableGroups || [];
  const refs = schema.refs || [];

  // Helper to determine if a column is a Foreign Key
  const isForeignKey = (tableName, columnName) => {
    return refs.some(ref => 
      ref.endpoints.some(ep => 
        ep.tableName === tableName && 
        ep.fieldNames.includes(columnName) && 
        ep.relation === '*'
      )
    );
  };

  if (!isParent) {
    // --- CHILD MODE: Render single Mermaid diagram only ---
    let md = `# Diagram: ${entrypointName.replace(/\.[^/.]+$/, '')}\n\n`;
    
    // Normalization helper for relative paths
    const getNormalizedPath = (p) => {
      if (!p) return '';
      return p.replace(/^\//, '').toLowerCase();
    };
    
    const activeNorm = getNormalizedPath(activeAbsPath);
    
    const belongsToActive = (tableName) => {
      if (!activeNorm) return true;
      const rawTable = database.schemas[0]?.tables?.find(t => t.name === tableName);
      const rawPath = rawTable?.token?.filepath?.path;
      if (!rawPath) return true;
      return getNormalizedPath(rawPath) === activeNorm;
    };

    const childTables = tables.filter(t => belongsToActive(t.name));

    if (childTables.length === 0) {
      md += '*No tables defined in this schema.*';
      return md;
    }

    // Filter relationships to only those where at least one endpoint is inside the child tables
    const childTableNames = childTables.map(ct => ct.name);
    const childRefs = refs.filter(ref =>
      ref.endpoints.some(ep => childTableNames.includes(ep.tableName))
    );

    const hasHeaderColors = childTables.some(t => t.headerColor);
    if (hasHeaderColors) {
      md += '```mermaid\n---\nconfig:\n  themeCSS: |\n';
      for (const table of childTables) {
        if (table.headerColor) {
          md += `    [id|="entity-${table.name}"] rect:first-of-type {\n      fill: ${table.headerColor} !important;\n    }\n`;
        }
      }
      md += '---\nerDiagram\n';
    } else {
      md += '```mermaid\nerDiagram\n';
    }

    // 1. Table columns
    for (const table of childTables) {
      md += `    ${table.name} {\n`;
      for (const field of table.fields) {
        const typeName = cleanMermaidType(field.type.type_name);
        const pkAttr = field.pk ? ' PK' : '';
        const fkAttr = isForeignKey(table.name, field.name) ? ' FK' : '';
        md += `        ${typeName} ${field.name}${pkAttr}${fkAttr}\n`;
      }
      md += '    }\n\n';
    }

    // 2. Table relationships
    for (const ref of childRefs) {
      const ep1 = ref.endpoints[0];
      const ep2 = ref.endpoints[1];
      const relSym = getMermaidRelation(ep1.relation, ep2.relation);
      md += `    ${ep1.tableName} ${relSym} ${ep2.tableName} : ""\n`;
    }

    md += '```\n';
    return md;
  }

  // --- PARENT MODE: Render Full Documentation ---
  const project = exported.project || database.shallowExport() || {};
  const projName = project.name || 'OpenStudio Project';
  const dbType = project.databaseType || project.database_type || 'Unknown';
  const projNote = project.note || '';

  let md = `# Database Documentation: ${projName}\n`;
  md += `> **Database Type**: ${dbType}\n`;
  if (projNote) {
    md += `> \n> ${projNote}\n`;
  }
  md += '\n---\n\n';

  // 1. Clickable Table of Contents
  if (tableGroups.length > 0) {
    md += '## 1. Table Groups\n\n';
    md += '<div class="toc-container">\n';
    md += '  <div class="toc-title">Domains / Modules</div>\n';
    md += '  <ul class="toc-list">\n';
    for (const group of tableGroups) {
      const anchor = 'tablegroup-' + group.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      md += `    <li class="toc-item"><a href="#${anchor}">${group.name}</a></li>\n`;
    }
    md += '  </ul>\n';
    md += '</div>\n\n---\n\n';
  }

  // 2. Grouped ER Diagrams
  if (tableGroups.length > 0) {
    md += '## 2. ER Diagrams\n\n';
    for (const group of tableGroups) {
      const anchor = 'tablegroup-' + group.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      md += `<div id="${anchor}">\n\n`;
      md += `### TableGroup: ${group.name}\n`;
      md += `*Visual representation of the ${group.name} module and relationships.*\n\n`;

      const groupTables = group.tables || [];
      const groupTableNames = groupTables.map(gt => gt.tableName);
      
      const groupHeaderTables = groupTableNames
        .map(name => tables.find(t => t.name === name))
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

      // Render columns for tables inside this group
      for (const tableName of groupTableNames) {
        const table = tables.find(t => t.name === tableName);
        if (table) {
          md += `    ${table.name} {\n`;
          for (const field of table.fields) {
            const typeName = cleanMermaidType(field.type.type_name);
            const pkAttr = field.pk ? ' PK' : '';
            const fkAttr = isForeignKey(table.name, field.name) ? ' FK' : '';
            md += `        ${typeName} ${field.name}${pkAttr}${fkAttr}\n`;
          }
          md += '    }\n\n';
        }
      }

      // Render relationships inside this group
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

  // 3. Data Dictionary
  md += '## 3. Data Dictionary\n\n';
  for (const table of tables) {
    md += `<div class="dbdocs-table-container" data-table="${table.name}">\n\n`;
    md += `### ${table.name}\n`;
    if (table.note) {
      md += `<div class="dbdocs-table-note">${table.note}</div>\n\n`;
    }

    // Columns
    md += '#### Columns\n\n';
    const colHeaders = ['Name', 'Type', 'Key', 'Attributes', 'Note'];
    const colRows = [];
    for (const field of table.fields) {
      const isPk = field.pk;
      const isFk = isForeignKey(table.name, field.name);
      
      const keyBadges = [];
      if (isPk) keyBadges.push('<span class="dbdocs-badge dbdocs-badge-pk">PK</span>');
      if (isFk) keyBadges.push('<span class="dbdocs-badge dbdocs-badge-fk">FK</span>');
      const keyVal = keyBadges.join(' ');

      const attrs = [];
      if (field.not_null) attrs.push('<span class="dbdocs-badge dbdocs-badge-notnull">not null</span>');
      if (field.unique) attrs.push('<span class="dbdocs-badge dbdocs-badge-unique">unique</span>');
      if (field.increment) attrs.push('<span class="dbdocs-badge dbdocs-badge-increment">increment</span>');
      if (field.dbdefault) {
        attrs.push(`<span class="dbdocs-badge dbdocs-badge-default">default: <code>${field.dbdefault.value}</code></span>`);
      }
      const attrStr = attrs.join(' ');

      colRows.push([
        `<code>${field.name}</code>`,
        `<code>${field.type.type_name}</code>`,
        keyVal,
        attrStr,
        field.note || ''
      ]);
    }
    md += renderHtmlTable(colHeaders, colRows);
    md += '\n';

    // Indexes
    const tableIndexes = table.indexes || [];
    if (tableIndexes.length > 0) {
      md += '#### Indexes\n\n';
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
      md += '\n';
    }

    // Relationships
    const tableRefs = refs.filter(ref => ref.endpoints.some(ep => ep.tableName === table.name));
    if (tableRefs.length > 0) {
      md += '#### Relationships\n\n';
      const relHeaders = ['Source Column', 'Target', 'Relationship', 'Actions / Details'];
      const relRows = [];
      for (const ref of tableRefs) {
        const sourceEp = ref.endpoints.find(ep => ep.tableName === table.name);
        const targetEp = ref.endpoints.find(ep => ep.tableName !== table.name) || ref.endpoints[0];
        
        let relType = 'one-to-many';
        if (sourceEp.relation === '*' && targetEp.relation === '1') relType = 'many-to-one';
        if (sourceEp.relation === '1' && targetEp.relation === '1') relType = 'one-to-one';
        if (sourceEp.relation === '*' && targetEp.relation === '*') relType = 'many-to-many';

        const actions = [];
        if (ref.onDelete) actions.push(`on delete: ${ref.onDelete}`);
        if (ref.onUpdate) actions.push(`on update: ${ref.onUpdate}`);
        const actionStr = actions.join(', ') || 'no action';

        relRows.push([
          `<code>${sourceEp.fieldNames.join(',')}</code>`,
          `<code>${targetEp.tableName}.${targetEp.fieldNames.join(',')}</code>`,
          `<span class="dbdocs-badge dbdocs-badge-default">${relType}</span>`,
          `<code>${actionStr}</code>`
        ]);
      }
      md += renderHtmlTable(relHeaders, relRows);
      md += '\n';
    }

    md += '</div>\n\n';
  }

  // 4. Enums
  if (enums.length > 0) {
    md += '---\n\n## 4. Enums\n\n';
    for (const en of enums) {
      md += `<div class="dbdocs-table-container" data-enum="${en.name}">\n\n`;
      md += `### ${en.name}\n`;
      if (en.note) {
        md += `<div class="dbdocs-table-note">${en.note}</div>\n\n`;
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
