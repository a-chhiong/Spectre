// ─── Swagger / OpenAPI Renderer ──────────────────────────────────────────────
// Validates that the parsed YAML/JSON is a legitimate OpenAPI spec before
// mounting Swagger UI. Shows a placeholder for generic YAML/JSON files.

import jsYaml from 'js-yaml';

// Swagger UI is loaded from webview asset URI (injected by PreviewPanel)
let swaggerInstance = null;

/**
 * Render a YAML or JSON file as Swagger UI if it is a valid OpenAPI spec.
 * @param {HTMLElement} container
 * @param {string}      content   Raw file text
 * @param {string}      filePath
 */
export function renderSwagger(container, content, filePath) {
  // ── Parse ───────────────────────────────────────────────────────────────────
  let spec;
  try {
    spec = filePath.endsWith('.json')
      ? JSON.parse(content)
      : jsYaml.load(content);
  } catch (err) {
    container.innerHTML = `<div class="os-error">Parse error: ${err.message}</div>`;
    return;
  }

  // ── OpenAPI validation guard ────────────────────────────────────────────────
  const isValidOpenAPI =
    spec &&
    typeof spec === 'object' &&
    (spec.openapi || spec.swagger) &&
    (spec.paths || spec.components);

  if (!isValidOpenAPI) {
    container.innerHTML = placeholder(filePath);
    return;
  }

  // ── Mount Swagger UI ────────────────────────────────────────────────────────
  container.innerHTML = '<div class="swagger-preview"><div id="swagger-ui"></div></div>';

  // swagger-ui-bundle must be loaded as a script tag from the webview URI
  // (injected by PreviewPanel via window.__ASSETS__.swaggerBundleUri).
  // If already loaded globally, use it; otherwise load it dynamically.
  if (typeof SwaggerUIBundle !== 'undefined') {
    mountSwagger(spec);
  } else {
    const swaggerUri = window.__ASSETS__?.swaggerBundleUri;
    const swaggerCssUri = window.__ASSETS__?.swaggerCssUri;

    if (swaggerCssUri && !document.getElementById('swagger-css')) {
      const link = document.createElement('link');
      link.id = 'swagger-css';
      link.rel = 'stylesheet';
      link.href = swaggerCssUri;
      document.head.appendChild(link);
    }

    if (!swaggerUri) {
      container.innerHTML = `<div class="os-error">Swagger UI assets not configured.</div>`;
      return;
    }
    const script = document.createElement('script');
    script.src = swaggerUri;
    script.onload = () => mountSwagger(spec);
    script.onerror = () => {
      container.innerHTML = `<div class="os-error">Failed to load Swagger UI bundle.</div>`;
    };
    document.head.appendChild(script);
  }
}

function mountSwagger(spec) {
  try {
    // eslint-disable-next-line no-undef
    swaggerInstance = SwaggerUIBundle({
      spec,
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        // eslint-disable-next-line no-undef
        SwaggerUIBundle.presets.apis,
        // eslint-disable-next-line no-undef
        SwaggerUIBundle.SwaggerUIStandalonePreset,
      ],
    });
  } catch (err) {
    const el = document.getElementById('swagger-ui');
    if (el) { el.innerHTML = `<div class="os-error">Swagger UI error: ${err.message}</div>`; }
  }
}

function placeholder(filePath) {
  const name = filePath.split(/[\\/]/).pop();
  return `<div class="os-placeholder">
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="12" y1="18" x2="12" y2="12"/>
      <line x1="9" y1="15" x2="15" y2="15"/>
    </svg>
    <p><strong>${name}</strong> is not a valid OpenAPI / Swagger specification.<br>
    Open it in the editor to inspect the content.</p>
  </div>`;
}
