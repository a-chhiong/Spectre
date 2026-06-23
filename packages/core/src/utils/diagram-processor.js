import mermaid from 'mermaid';

// Cache for the loaded PlantUML render module
let pumlModule = null;
let pumlLoadingPromise = null;

// Global queue for PlantUML rendering to prevent concurrent/overlapping TeaVM calls
let pumlQueue = Promise.resolve();

/**
 * Queue a PlantUML task to run sequentially
 * @param {Function} task Async function representing the rendering work
 * @returns {Promise} Resolves when the task completes
 */
function enqueuePuml(task) {
  const next = pumlQueue.then(() => task());
  pumlQueue = next.catch(() => {});
  return next;
}

/**
 * Promise-based loader for dynamic PlantUML javascript files
 * @returns {Promise<Object>} Resolves to the PlantUML module
 */
function loadPlantUMLFiles() {
  if (pumlModule) return Promise.resolve(pumlModule);
  if (pumlLoadingPromise) return pumlLoadingPromise;

  pumlLoadingPromise = new Promise((resolve, reject) => {
    // 1. Check if Viz is already loaded globally
    if (window.Viz) {
      loadPlantUMLCore(resolve, reject);
    } else {
      // Load viz-global.js
      const script = document.createElement('script');
      const baseUrl = import.meta.env.BASE_URL || '/';
      const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
      script.src = `${cleanBase}vendor/plantuml/viz-global.js`;
      script.async = true;
      script.onload = () => {
        loadPlantUMLCore(resolve, reject);
      };
      script.onerror = () => {
        pumlLoadingPromise = null;
        reject(new Error('Failed to load viz-global.js'));
      };
      document.body.appendChild(script);
    }
  });

  return pumlLoadingPromise;
}

/**
 * Load the plantuml.js core module after viz-global.js
 */
function loadPlantUMLCore(resolve, reject) {
  // Bypass Vite's static import analyzer by constructing import dynamically
  const dynamicImport = new Function('m', 'return import(m)');
  
  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
  dynamicImport(`${cleanBase}vendor/plantuml/plantuml.js`)
    .then((module) => {
      pumlModule = module;
      resolve(pumlModule);
    })
    .catch((err) => {
      pumlLoadingPromise = null;
      reject(new Error('Failed to load plantuml.js module: ' + err.message));
    });
}

/**
 * Render PlantUML lines to an SVG string using renderToString
 * @param {string[]} lines Diagram lines
 * @param {boolean} isDarkMode Current theme state
 * @returns {Promise<string>} Resolves to SVG string
 */
function renderPumlToString(lines, isDarkMode) {
  return new Promise((resolve, reject) => {
    if (!pumlModule || typeof pumlModule.renderToString !== 'function') {
      reject(new Error('PlantUML renderToString function is not loaded.'));
      return;
    }
    try {
      pumlModule.renderToString(
        lines,
        (svg) => resolve(svg),
        (err) => reject(new Error(err)),
        { dark: isDarkMode }
      );
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Enable interactive Ctrl+wheel zoom, drag-to-pan, and double-click fit on a rendered
 * Mermaid SVG container embedded in the document view.
 * Mirrors the diagram-viewer UX: Ctrl+wheel zooms toward cursor, plain wheel scrolls normally.
 * @param {HTMLElement} container The .mermaid div containing the SVG
 */
function enableMermaidInteractiveZoom(container) {
  const svg = container.querySelector('svg');
  if (!svg || container.getAttribute('data-zoom-enabled')) return;

  container.setAttribute('data-zoom-enabled', 'true');
  container.style.overflow = 'hidden';
  container.style.position = 'relative';
  container.style.cursor = 'grab';
  container.title = 'Ctrl+Scroll to zoom · Drag to pan · Double-click to fit';

  let scale = 1;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let startPanX = 0;
  let startPanY = 0;

  const applyTransform = () => {
    svg.style.transformOrigin = '0 0';
    svg.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  };

  const fitToWidth = () => {
    const containerW = container.clientWidth;
    const svgW = svg.getBBox ? svg.getBBox().width : (svg.viewBox?.baseVal?.width || svg.clientWidth || 800);
    scale = svgW > 0 ? Math.min(containerW / svgW, 1.5) : 1;
    panX = 0;
    panY = 0;
    applyTransform();
  };

  // Ctrl+wheel to zoom (centered on cursor position)
  container.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return; // plain wheel → page scroll (default)
    e.preventDefault();

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let factor = 1.1;
    if (Math.abs(e.deltaY) < 10) factor = 1 + Math.abs(e.deltaY) * 0.04; // smooth trackpad
    const direction = e.deltaY < 0 ? 1 : -1;
    const newScale = Math.min(Math.max(scale * (direction > 0 ? factor : 1 / factor), 0.1), 8);

    panX = mouseX - (mouseX - panX) * (newScale / scale);
    panY = mouseY - (mouseY - panY) * (newScale / scale);
    scale = newScale;
    applyTransform();
  }, { passive: false });

  // Double-click to fit
  container.addEventListener('dblclick', () => {
    fitToWidth();
  });

  // Drag to pan (pointer capture keeps tracking outside bounds)
  container.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('.mermaid-zoom-reset-btn')) return; // let reset button handle its own click
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    startPanX = panX;
    startPanY = panY;
    container.style.cursor = 'grabbing';
    container.setPointerCapture(e.pointerId);
    e.preventDefault();
  }, { passive: false });

  container.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    panX = startPanX + (e.clientX - dragStartX);
    panY = startPanY + (e.clientY - dragStartY);
    applyTransform();
  });

  container.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    container.style.cursor = 'grab';
    container.releasePointerCapture(e.pointerId);
  });

  container.addEventListener('pointercancel', (e) => {
    isDragging = false;
    container.style.cursor = 'grab';
  });

  // Inject a persistent Reset button — fades in on hover, restores original render state
  const resetBtn = document.createElement('button');
  resetBtn.className = 'mermaid-zoom-reset-btn';
  resetBtn.setAttribute('title', 'Reset to original · Double-click to fit to width');
  resetBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> Reset`;
  resetBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    // Fully clear the CSS transform to restore the exact original rendered state
    scale = 1;
    panX = 0;
    panY = 0;
    svg.style.transform = '';
    svg.style.transformOrigin = '';
    container.style.cursor = 'grab';
  });
  container.appendChild(resetBtn);
}

/**
 * Process HTML container to render Mermaid and PlantUML diagrams
 * @param {HTMLElement} container The DOM element containing code blocks
 * @param {boolean} isDarkMode Current theme state
 * @param {Object} [options] Optional rendering options
 * @param {boolean} [options.enableZoom] If true, enables interactive zoom/pan on rendered mermaid diagrams
 */
export async function renderDiagrams(container, isDarkMode, options = {}) {
  if (!container) return;

  // ─── PART 1: RENDER MERMAID DIAGRAMS ───
  const mermaidBlocks = container.querySelectorAll('pre > code.language-mermaid');
  if (mermaidBlocks.length > 0) {
    const nodesToProcess = [];

    mermaidBlocks.forEach((codeNode) => {
      const preNode = codeNode.parentElement;
      if (preNode.getAttribute('data-processed') === 'true') return;

      const codeText = codeNode.textContent.trim();
      
      // Create a mermaid div to replace the pre block
      const mermaidDiv = document.createElement('div');
      mermaidDiv.className = 'mermaid';
      mermaidDiv.textContent = codeText;
      
      // Replace pre with the new div
      preNode.replaceWith(mermaidDiv);
      nodesToProcess.push(mermaidDiv);
    });

    if (nodesToProcess.length > 0) {
      try {
        // Initialize mermaid with the current theme
        mermaid.initialize({
          startOnLoad: false,
          theme: isDarkMode ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'Outfit, Inter, sans-serif'
        });
        
        await mermaid.run({
          nodes: nodesToProcess
        });

        // Mark container as processed to avoid double compiling
        // Optionally enable interactive zoom/pan on each rendered diagram
        nodesToProcess.forEach(node => {
          node.setAttribute('data-processed', 'true');
          if (options.enableZoom) {
            enableMermaidInteractiveZoom(node);
          }
        });
      } catch (err) {
        console.error('Error rendering Mermaid:', err);
      }
    }
  }

  // ─── PART 2: RENDER PLANTUML DIAGRAMS ───
  const pumlBlocks = container.querySelectorAll('pre > code.language-plantuml, pre > code.language-puml');
  if (pumlBlocks.length > 0) {
    const blocksToRender = [];

    pumlBlocks.forEach((codeNode) => {
      const preNode = codeNode.parentElement;
      if (preNode.getAttribute('data-processed') === 'true') return;

      const codeText = codeNode.textContent.trim();
      const lines = codeText.split(/\r\n|\r|\n/);

      // Generate a unique ID for the container
      const uniqueId = 'puml-' + Math.random().toString(36).substring(2, 9);

      const pumlDiv = document.createElement('div');
      pumlDiv.id = uniqueId;
      pumlDiv.className = 'plantuml-svg-container';
      pumlDiv.innerHTML = `
        <div class="puml-loading" style="padding: 1rem; font-family: monospace; color: var(--text-secondary); display: flex; align-items: center; gap: 8px;">
          <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10"></path>
          </svg>
          Loading PlantUML Engine...
        </div>
      `;

      preNode.replaceWith(pumlDiv);
      pumlDiv.setAttribute('data-processed', 'true');

      blocksToRender.push({
        containerId: uniqueId,
        lines,
        element: pumlDiv
      });
    });

    if (blocksToRender.length > 0) {
      try {
        // Load compiler files dynamically
        await loadPlantUMLFiles();
        
        for (const block of blocksToRender) {
          // Enqueue each block rendering sequentially on the global queue
          await enqueuePuml(async () => {
            block.element.innerHTML = ''; // Clear loading screen
            try {
              const svg = await renderPumlToString(block.lines, isDarkMode);
              block.element.innerHTML = svg;
              block.element.setAttribute('data-processed', 'true');
            } catch (renderError) {
              block.element.innerHTML = `
                <div class="puml-error" style="color: var(--color-error, #f87171); padding: 1rem; border: 1px solid var(--border-color); border-radius: 4px;">
                  Error rendering PlantUML: ${renderError.message}
                </div>
              `;
            }
          });
        }
      } catch (err) {
        console.error('Error loading or running PlantUML:', err);
        blocksToRender.forEach(block => {
          block.element.innerHTML = `
            <div class="puml-error" style="color: var(--color-error, #f87171); padding: 1rem; border: 1px solid var(--border-color); border-radius: 4px; font-family: monospace;">
              Failed to load offline PlantUML engine. Make sure static assets exist in public/vendor/plantuml/.
            </div>
          `;
        });
      }
    }
  }
}
