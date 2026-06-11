import { LitElement, html, css } from 'lit';
import { projectManager } from '../../services/project-manager.js';

export class MenuDropdown extends LitElement {
  static properties = {
    currentKey: { type: String }
  };

  static styles = css`
    :host {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 220px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
      box-shadow: var(--glass-shadow);
      padding: 6px 0;
      display: flex;
      flex-direction: column;
      z-index: 200;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: none;
      border: none;
      color: var(--text-primary);
      text-align: left;
      font-size: 0.9rem;
      font-family: var(--font-sans);
      cursor: pointer;
      transition: background-color var(--transition-normal);
      width: 100%;
      box-sizing: border-box;
    }

    .dropdown-item:hover {
      background-color: var(--bg-tertiary);
      color: var(--accent-color);
    }

    .dropdown-divider {
      height: 1px;
      background-color: var(--border-color);
      margin: 4px 0;
    }

    .dropdown-submenu-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .dropdown-submenu-trigger > svg:last-child {
      margin-left: auto;
    }

    .submenu {
      position: absolute;
      right: 100%;
      top: 0;
      width: 180px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
      box-shadow: var(--glass-shadow);
      padding: 6px 0;
      display: flex;
      flex-direction: column;
    }

    .hidden-input {
      display: none;
    }

    svg {
      width: 18px;
      height: 18px;
    }
  `;

  constructor() {
    super();
    this.currentKey = '';
  }

  // ZIP triggers
  triggerZipUpload() {
    this.shadowRoot.getElementById('zip-input').click();
    this.dispatchEvent(new CustomEvent('close-menu', { bubbles: true, composed: true }));
  }

  async handleZipUpload(e) {
    const file = e.target.files[0];
    if (file) {
      try {
        await projectManager.importProjectZip(file);
      } catch (err) {
        alert('Failed to import ZIP file: ' + err.message);
      }
    }
    e.target.value = ''; // Reset input
  }

  // Folder triggers
  triggerFolderUpload() {
    this.shadowRoot.getElementById('folder-input').click();
    this.dispatchEvent(new CustomEvent('close-menu', { bubbles: true, composed: true }));
  }

  async handleFolderUpload(e) {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        await projectManager.importProjectFolder(files);
      } catch (err) {
        alert('Failed to import Folder: ' + err.message);
      }
    }
    e.target.value = ''; // Reset input
  }

  handleNewProject() {
    const name = prompt('Enter project name:', 'My OpenStudio API');
    if (name) {
      const cleanStart = confirm('Would you like a clean start (blank project with a single openapi.yaml)?\n\nClick "OK" for a clean blank project.\nClick "Cancel" to initialize with the sample templates.');
      projectManager.createNewProject(name, cleanStart);
    }
    this.dispatchEvent(new CustomEvent('close-menu', { bubbles: true, composed: true }));
  }

  handleSaveProject() {
    const key = this.currentKey;
    alert(`Project successfully saved locally.\nYour Project Key is:\n${key}`);
    this.dispatchEvent(new CustomEvent('close-menu', { bubbles: true, composed: true }));
  }

  async handleDeleteProject() {
    if (confirm('Are you sure you want to delete this project and all its files permanently? This action cannot be undone.')) {
      if (confirm('This action is permanent and cannot be recovered. Are you absolutely certain you want to proceed with the deletion?')) {
        try {
          const keyToDelete = this.currentKey;
          await projectManager.deleteProject(keyToDelete);
          this.dispatchEvent(new CustomEvent('close-menu', { bubbles: true, composed: true }));
        } catch (err) {
          alert('Failed to delete project: ' + err.message);
        }
      }
    }
  }

  handleExportZip() {
    projectManager.exportProjectZip();
    this.dispatchEvent(new CustomEvent('close-menu', { bubbles: true, composed: true }));
  }

  render() {
    return html`
      <button class="dropdown-item" @click=${this.triggerFolderUpload}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
        <span>Load Folder</span>
      </button>

      <button class="dropdown-item" @click=${this.triggerZipUpload}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span>Import Project (ZIP)</span>
      </button>

      <button class="dropdown-item" @click=${this.handleExportZip}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        <span>Export Project (ZIP)</span>
      </button>

      <div class="dropdown-divider"></div>

      <button class="dropdown-item" @click=${this.handleNewProject}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>New Project</span>
      </button>

      <button class="dropdown-item" @click=${this.handleSaveProject}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
        <span>Save Project</span>
      </button>

      <button class="dropdown-item" style="color: var(--color-error);" @click=${this.handleDeleteProject}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        <span>Delete Project</span>
      </button>

      <!-- Hidden standard file inputs for import parsing -->
      <input 
        id="zip-input" 
        type="file" 
        class="hidden-input" 
        accept=".zip" 
        @change=${this.handleZipUpload}
      />
      <input 
        id="folder-input" 
        type="file" 
        class="hidden-input" 
        webkitdirectory 
        directory 
        multiple 
        @change=${this.handleFolderUpload}
      />
    `;
  }
}

customElements.define('menu-dropdown', MenuDropdown);
