// ─── Diagram Zoom ─────────────────────────────────────────────────────────────
// Scroll-wheel + MacBook trackpad pinch-to-zoom for diagram containers.
// Uses the browser's native `wheel` event (ctrlKey = true for pinch/Ctrl+Scroll).
// Applies CSS transform: scale() to the inner .os-diagram-wrapper element.
// Shows a "⟳ Reset" button when zoom ≠ 1.

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4.0;
const STEP     = 0.001; // sensitivity per deltaY unit

/** @type {WeakMap<HTMLElement, number>} container → zoomLevel */
const zoomState = new WeakMap();

/**
 * Attach zoom behaviour to a diagram container element.
 * Safe to call multiple times — attaches only once per element.
 * @param {HTMLElement} container  Element wrapping the diagram (.diagram-preview)
 */
export function attachZoom(container) {
  if (container.__osZoomAttached) { return; }
  container.__osZoomAttached = true;

  zoomState.set(container, 1);

  // ── Wrapper for transform ──────────────────────────────────────────────────
  let wrapper = container.querySelector('.os-diagram-wrapper');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'os-diagram-wrapper';
    // Move children into wrapper
    while (container.firstChild) { wrapper.appendChild(container.firstChild); }
    container.appendChild(wrapper);
  }

  // ── Reset button ───────────────────────────────────────────────────────────
  let resetBtn = container.querySelector('.os-zoom-reset');
  if (!resetBtn) {
    resetBtn = document.createElement('button');
    resetBtn.className = 'os-zoom-reset';
    resetBtn.textContent = '⟳ Reset';
    resetBtn.title = 'Reset zoom to 100%';
    container.appendChild(resetBtn);
  }

  resetBtn.addEventListener('click', () => {
    setZoom(container, wrapper, resetBtn, 1);
  });

  // ── Wheel event (handles both Ctrl+Scroll and trackpad pinch) ─────────────
  container.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) { return; } // only zoom on Ctrl/Cmd+scroll or pinch
    e.preventDefault();

    const current = zoomState.get(container) ?? 1;
    const delta   = -e.deltaY * STEP;
    const next    = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current + delta));
    setZoom(container, wrapper, resetBtn, next);
  }, { passive: false });
}

function setZoom(container, wrapper, resetBtn, level) {
  zoomState.set(container, level);
  wrapper.style.transform = level === 1 ? '' : `scale(${level})`;

  if (Math.abs(level - 1) > 0.001) {
    resetBtn.classList.add('visible');
  } else {
    resetBtn.classList.remove('visible');
  }
}

/**
 * Detach zoom and reset scale on a container (e.g., before re-rendering).
 * @param {HTMLElement} container
 */
export function detachZoom(container) {
  container.__osZoomAttached = false;
  zoomState.delete(container);
}
