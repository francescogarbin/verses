// Notes List Web Component

class NotesList extends HTMLElement {
  constructor() {
    super();
    this.notes = [];
    this.selectedId = null;
    this.currentNotebook = null;
  }

  connectedCallback() {
    this.render();
  }

  setNotes(notes, notebook) {
    this.notes = notes;
    this.currentNotebook = notebook;
    this.render();
  }

  selectNote(id) {
    this.selectedId = id;
    this.render();
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  render() {
    this.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-right: 1px solid #d3d7cf;
          overflow: hidden;
          width: 100%;
          height: 100%;
        }

        @media (max-width: 768px) {
          :host {
            border-right: none;
          }
        }

        .list-header {
          padding: 1rem;
          border-bottom: 1px solid #d3d7cf;
          flex-shrink: 0;
          display: flex;
          flex-direction: row;
        }

        .list-header h2 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .notebook-badge {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .mobile-back-btn {
          display: none;
          background: none;
          border: none;
          color: #18b582;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.25rem;
        }

        @media (max-width: 768px) {
          .mobile-back-btn {
            display: inline-block;
          }
        }

        .btn-new-note {
          height: 2rem;
          padding: 0.5rem;
          padding-top: 4px;
          padding-bottom: 4px;
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
          margin-left: auto;
        }

        .btn-new-note:hover {
          background: #1c71d8;
        }

        .notes-list {
          flex: 1;
          overflow-y: auto;
        }

        .note-item {
          padding: 1rem;
          border-bottom: 1px solid #f5f5f5;
          cursor: pointer;
          transition: background 0.2s;
        }

        .note-item:hover {
          background: #fafafa;
        }

        .note-item.selected {
          background: #f0f0f0;
        }

        .note-title {
          font-weight: 500;
          font-size: 0.95rem;
          margin-bottom: 0.25rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .note-meta {
          font-size: 0.8rem;
          color: #888a85;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #888a85;
          text-align: center;
          padding: 2rem;
        }

        .empty-state p {
          margin-top: 0.5rem;
          font-size: 0.9rem;
        }
      </style>

      <div class="list-header">
        ${this.currentNotebook ? `
          <h2>
            <button class="mobile-back-btn" id="back-btn" title="Back to notebooks">&larr;</button>
            <span class="notebook-badge" style="background-color: ${this.currentNotebook.color}">
              ${this.getAbbreviation(this.currentNotebook.name)}
            </span>
            ${this.currentNotebook.name}
          </h2>
        ` : '<h2>Notes</h2>'}
        
        <button class="btn-new-note" id="new-note-btn" ${!this.currentNotebook ? 'disabled' : ''}>
          <span>+</span>
          <span>New Note</span>
        </button>
      </div>

      <div class="notes-list">
        ${this.notes.length === 0 ? `
          <div class="empty-state">
            <div style="font-size: 3rem;">📝</div>
            <p>No notes yet.<br>Create your first note!</p>
          </div>
        ` : this.notes.map(note => `
          <div class="note-item ${note.id === this.selectedId ? 'selected' : ''}" 
               data-id="${note.id}">
            <div class="note-title">${note.title || 'Untitled'}</div>
            <div class="note-meta">${this.formatDate(note.updated_at)}</div>
          </div>
        `).join('')}
      </div>
    `;

    this.attachEventListeners();
  }

  getAbbreviation(name) {
    if (!name || name.length === 0) return 'N';
    if (name.length === 1) return name.toUpperCase();
    
    const first = name[0].toUpperCase();
    const last = name[name.length - 1].toLowerCase();
    return first + last;
  }

  attachEventListeners() {
    // Back button (mobile)
    this.querySelector('#back-btn')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('mobile:back'));
    });

    // New note button
    this.querySelector('#new-note-btn')?.addEventListener('click', () => {
      const title = prompt('Note title:', 'New Note');
      if (title) {
        window.dispatchEvent(new CustomEvent('notes:create', {
          detail: { title, content: '' }
        }));
      }
    });

    // Note items
    this.querySelectorAll('.note-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.dataset.id);
        const note = this.notes.find(n => n.id === id);
        if (note) {
          window.dispatchEvent(new CustomEvent('notes:select', {
            detail: note
          }));
        }
      });
    });
  }
}

customElements.define('notes-list', NotesList);

