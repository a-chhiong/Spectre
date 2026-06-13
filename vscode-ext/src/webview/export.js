// ─── Export Module ────────────────────────────────────────────────────────────
// Shared by both the floating ⋮ button and the VS Code command palette.
// Collects rendered output from the DOM, serializes it, then posts to the
// extension host which handles the save dialog + file write.
// import html2pdf from 'html2pdf.js'; // REMOVED: Replaced by window.print() temporarily
/** @type {string} Current content type: 'markdown'|'plantuml'|'mermaid'|'swagger'|'' */
let _contentType = '';
let _fileName = 'preview';

export function setContentType(ct) { _contentType = ct; }
export function setFileName(name) {
  const lastDot = name.lastIndexOf('.');
  _fileName = lastDot > 0 ? name.substring(0, lastDot) : name;
}

/**
 * Entry point — called from both the ⋮ button and trigger-export messages.
 * @param {'svg'|'png'|'html'|'pdf'} format
 * @param {HTMLElement}               previewArea
 */
export async function handleExport(format, previewArea) {
  try {
    switch (format) {
      case 'svg':  await exportSVG(previewArea);  break;
      case 'png':  await exportPNG(previewArea);  break;
      case 'html': await exportHTML(previewArea); break;
      case 'pdf':  exportPDF(previewArea);        break;
      default:
        console.warn('[export] Unknown format:', format);
    }
  } catch (err) {
    console.error('[export] Error:', err);
    window.__vscode?.postMessage({ type: 'error', message: err.message });
  }
}

// ── SVG ────────────────────────────────────────────────────────────────────────
async function exportSVG(area) {
  const svg = area?.querySelector('svg');
  if (!svg) { throw new Error('No diagram SVG found to export.'); }

  const clone = svg.cloneNode(true);
  if (!clone.hasAttribute('viewBox')) {
    const bb = svg.getBBox?.();
    if (bb) { clone.setAttribute('viewBox', `${bb.x} ${bb.y} ${bb.width} ${bb.height}`); }
  }
  // Inject white background rect so exported SVG is not transparent
  if (!clone.querySelector('rect[data-bg]')) {
    const vb = clone.getAttribute('viewBox')?.split(' ').map(Number);
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    if (vb) {
      rect.setAttribute('x', vb[0]); rect.setAttribute('y', vb[1]);
      rect.setAttribute('width', vb[2]); rect.setAttribute('height', vb[3]);
    } else {
      rect.setAttribute('width', '100%'); rect.setAttribute('height', '100%');
    }
    rect.setAttribute('fill', '#ffffff');
    rect.setAttribute('data-bg', '1');
    clone.insertBefore(rect, clone.firstChild);
  }

  const data = new XMLSerializer().serializeToString(clone);
  post('export-svg', data, `${_fileName}-preview.svg`);
}

// ── PNG ────────────────────────────────────────────────────────────────────────
async function exportPNG(area) {
  const svg = area?.querySelector('svg');
  if (!svg) { throw new Error('No diagram SVG found to export.'); }

  const canvas = await svgToCanvas(svg);
  const data   = canvas.toDataURL('image/png');
  post('export-png', data, `${_fileName}-preview.png`, true);
}

async function svgToCanvas(svg) {
  const canvas = document.createElement('canvas');
  const ctx    = canvas.getContext('2d');
  const bb     = svg.getBBox?.() || { x: 0, y: 0, width: 800, height: 600 };
  const pad    = 20;
  canvas.width  = bb.width  + pad * 2;
  canvas.height = bb.height + pad * 2;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const svgStr = new XMLSerializer().serializeToString(svg);
  const blob   = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url    = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { ctx.drawImage(img, pad, pad); URL.revokeObjectURL(url); resolve(canvas); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to render SVG as image')); };
    img.src = url;
  });
}

// ── HTML ───────────────────────────────────────────────────────────────────────
async function exportHTML(area) {
  if (!area) { throw new Error('Preview area not found.'); }
  const inner = area.innerHTML;
  let rawContent = null;
  if (_contentType === 'swagger') {
    if (window.ui && window.ui.specSelectors) {
      rawContent = JSON.stringify(window.ui.specSelectors.specJson().toJS());
    } else {
      rawContent = '{}';
    }
  }
  const data  = buildStandaloneHTML(inner, _contentType, rawContent);
  post('export-html', data, `${_fileName}-preview.html`);
}

function buildStandaloneHTML(bodyContent, contentType, rawContent) {
  const isDiagram = contentType === 'plantuml' || contentType === 'mermaid';
  const isSwagger = contentType === 'swagger';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>OpenStudio Export</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css"/>
${isSwagger ? '  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@latest/swagger-ui.css"/>' : ''}
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, sans-serif;
           background: ${isSwagger ? '#fafafa' : '#ffffff'}; color: #1a1a1a; line-height: 1.7; }
${!isSwagger ? `    .container { max-width: 860px; margin: 0 auto; padding: 2.5rem 1.5rem; }
    h1,h2,h3,h4 { margin-top: 1.8rem; margin-bottom: 0.7rem; font-weight: 700; color: #111; }
    h1 { font-size: 2rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.4rem; }
    h2 { font-size: 1.5rem; } h3 { font-size: 1.2rem; }
    p  { margin-bottom: 1.2rem; }
    ul,ol { margin-left: 2rem; margin-bottom: 1rem; }
    a  { color: #0ea5e9; text-decoration: none; font-weight: 500; }
    a:hover { text-decoration: underline; }
    pre { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
          padding: 1rem 1.25rem; overflow-x: auto; margin-bottom: 1.2rem; }
    code { font-family: 'Fira Code', monospace; font-size: 0.88em;
           background: #f1f5f9; padding: 0.15rem 0.35rem; border-radius: 4px; color: #d73a49; }
    pre code { background: transparent; padding: 0; color: #1a1a1a; }
    blockquote { border-left: 4px solid #0ea5e9; background: #f8fafc;
                 padding: 0.7rem 1.2rem; margin: 0 0 1rem; border-radius: 0 6px 6px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 1.2rem; }
    th,td { border: 1px solid #e2e8f0; padding: 0.6rem 0.9rem; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
    tr:nth-child(even) td { background: #f8fafc; }
    .mermaid, .plantuml-svg-container {
      display: flex; justify-content: center; margin: 2rem 0;
      padding: 1.5rem; background: #f8fafc; border: 1px solid #e2e8f0;
      border-radius: 8px; overflow-x: auto; }
    .mermaid svg, .plantuml-svg-container svg { max-width: 100%; height: auto; }` : ''}
    ${isDiagram ? '.diagram-container { display:flex; justify-content:center; align-items:center; min-height:100vh; padding:2rem; }' : ''}
  </style>
</head>
<body>
  ${isDiagram
    ? `<div class="diagram-container">${bodyContent}</div>`
    : isSwagger
      ? `<div id="swagger-ui-export"></div>
  <script src="https://unpkg.com/swagger-ui-dist@latest/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        spec: ${rawContent},
        dom_id: '#swagger-ui-export'
      });
    };
  </script>`
      : `<div class="container">${bodyContent}</div>`
  }
${isDiagram ? '<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"><\/script><script>mermaid.initialize({startOnLoad:true});<\/script>' : ''}
</body>
</html>`;
}

// ── PDF ────────────────────────────────────────────────────────────────────────
function exportPDF(area) {
  if (!area) return;
  
  if (_contentType === 'swagger') {
    if (!window.customElements.get('rapi-pdf')) {
      const script = document.createElement('script');
      script.src = window.__ASSETS__.rapiPdfUri;
      script.onload = () => triggerRapiPdf();
      document.head.appendChild(script);
    } else {
      triggerRapiPdf();
    }
  } else {
    // Temporarily use window.print() while we evaluate Swagger2Markup/Node alternatives.
    window.print();
  }
}

function triggerRapiPdf() {
  let spec = {};
  if (window.ui && window.ui.specSelectors) {
    spec = window.ui.specSelectors.specJson().toJS();
  }
  
  const rapiPdf = document.createElement('rapi-pdf');
  rapiPdf.style.display = 'none';
  document.body.appendChild(rapiPdf);
  
  setTimeout(() => {
    // RapiPDF natively calls pdfMake.open(), which triggers window.open('', '_blank').
    // In VS Code's sandboxed Webview, this is blocked (returns null), causing it to fail.
    // We mock window.open to return a fake window object, satisfying pdfMake.
    // When pdfMake assigns the generated Blob URL to `mockWin.location.href`, we intercept it!
    const originalWindowOpen = window.open;
    let intercepted = false;

    window.open = function(url, target, features) {
      const mockWin = {
        location: {
          set href(val) {
            if (val && val.startsWith('blob:')) {
              intercepted = true;
              fetch(val)
                .then(res => res.blob())
                .then(blob => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    post('export-pdf', reader.result, `${_fileName}-preview.pdf`, true);
                    window.open = originalWindowOpen;
                    rapiPdf.remove();
                  };
                  reader.readAsDataURL(blob);
                })
                .catch(err => {
                  console.error('Failed to read blob:', err);
                  window.open = originalWindowOpen;
                });
            }
          }
        }
      };
      return mockWin;
    };

    try {
      rapiPdf.generatePdf(spec);
    } catch (err) {
      console.error('RapiPDF generation failed:', err);
      post('error', err.message, '');
      window.open = originalWindowOpen;
    }
    
    // Fallback cleanup if not intercepted within 30 seconds
    setTimeout(() => {
      if (!intercepted) {
        window.open = originalWindowOpen;
        rapiPdf.remove();
      }
    }, 30000);
  }, 100);
}

// ── Helper ─────────────────────────────────────────────────────────────────────
function post(type, data, suggestedName, isBase64 = false) {
  window.__vscode?.postMessage({ type, data, suggestedName, isBase64 });
}
