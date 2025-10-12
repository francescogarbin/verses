// Notebooks Sidebar Web Component

class NotebooksSidebar extends HTMLElement {
  constructor() {
    super();
    this.notebooks = [];
    this.selectedId = null;
  }

  connectedCallback() {
    this.render();
  }

  getAbbreviation(name) {
    if (!name || name.length === 0) return 'N';
    if (name.length === 1) return name.toUpperCase();
    
    const first = name[0].toUpperCase();
    const last = name[name.length - 1].toLowerCase();
    return first + last;
  }

  setNotebooks(notebooks) {
    this.notebooks = notebooks;
    this.render();
  }

  selectNotebook(id) {
    this.selectedId = id;
    this.render();
  }

  render() {
    this.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          background: #fafafa;
          border-right: 1px solid #d3d7cf;
          overflow: hidden;
        }

        .sidebar-header {
          padding: 1rem;
          border-bottom: 1px solid #d3d7cf;
          flex-shrink: 0;
        }

        .sidebar-header h2 {
          font-size: 0.85rem;
          text-transform: uppercase;
          color: #888a85;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }

        .btn-new-notebook {
          width: 100%;
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          background: #3584e4;
          color: white;
          cursor: pointer;
          font-size: 0.85rem;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-new-notebook:hover {
          background: #1c71d8;
        }

        .notebooks-list {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
        }

        .notebook-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
          margin-bottom: 0.25rem;
        }

        .notebook-item:hover {
          background: #ebebeb;
        }

        .notebook-item.selected {
          background: #e3e3e3;
        }

        .notebook-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .notebook-name {
          flex: 1;
          font-size: 0.9rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      </style>

      <div class="sidebar-header">
        <h2>Notebooks</h2>
        <button class="btn-new-notebook" id="new-notebook-btn">
          <span>+</span>
          <span>New Notebook</span>
        </button>
      </div>

      <div class="notebooks-list">
        ${this.notebooks.map(notebook => `
          <div class="notebook-item ${notebook.id === this.selectedId ? 'selected' : ''}" 
               data-id="${notebook.id}">
            <div class="notebook-icon" style="background-color: ${notebook.color}">
              ${this.getAbbreviation(notebook.name)}
            </div>
            <div class="notebook-name">${notebook.name}</div>
          </div>
        `).join('')}
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    // New notebook button
    this.querySelector('#new-notebook-btn')?.addEventListener('click', () => {
      const name = prompt('Notebook name:', 'Notebook');
      if (name) {
        const color = '#8B5A3C'; // Default color
        window.dispatchEvent(new CustomEvent('notebooks:create', {
          detail: { name, color }
        }));
      }
    });

    // Notebook items
    this.querySelectorAll('.notebook-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.dataset.id);
        const notebook = this.notebooks.find(n => n.id === id);
        if (notebook) {
          window.dispatchEvent(new CustomEvent('notebooks:select', {
            detail: notebook
          }));
        }
      });

      // Right-click for options
      item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const id = parseInt(item.dataset.id);
        this.showNotebookMenu(id, e.clientX, e.clientY);
      });
    });
  }

  showNotebookMenu(id, x, y) {
    // TODO: Implement context menu with Edit/Delete options
    // For now, use confirm dialogs
    const notebook = this.notebooks.find(n => n.id === id);
    if (!notebook) return;

    const action = confirm(`Edit "${notebook.name}"?\nOK = Edit, Cancel = Delete`);
    
    if (action) {
      // Edit
      const newName = prompt('New name:', notebook.name);
      if (newName && newName !== notebook.name) {
        window.dispatchEvent(new CustomEvent('notebooks:update', {
          detail: { id, data: { name: newName } }
        }));
      }
    } else {
      // Delete
      window.dispatchEvent(new CustomEvent('notebooks:delete', {
        detail: id
      }));
    }
  }
}

customElements.define('notebooks-sidebar', NotebooksSidebar);

