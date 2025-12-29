// Note Editor Web Component

class NoteEditor extends HTMLElement {
  constructor() {
    super();
    this.currentNote = null;
    this.saveTimeout = null;
    this.isPreview = false;
  }

  connectedCallback() {
    this.render();
  }

  setNote(note) {
    this.currentNote = note;
    this.isPreview = false;
    this.render();
  }

  clearNote() {
    this.currentNote = null;
    this.render();
  }

  render() {
    this.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          overflow: hidden;
          width: 100%;
          height: 100%;
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #d3d7cf;
          flex-shrink: 0;
          order: -1; /* Ensure header is always first */
        }

        .editor-actions {
          display: flex;
          gap: 0.5rem;
        }

        .editor-content {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          width: 100%;
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .editor-content {
            padding: 0.75rem;
          }

          .title-input {
            font-size: 1.25rem !important;
          }

          .content-input {
            font-size: 0.95rem !important;
            min-height: 300px !important;
          }
        }

        .btn-icon {
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          background: #f5f5f5;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.2s;
        }

        .btn-icon:hover {
          background: #ebebeb;
        }

        .btn-icon.active {
          background: #3584e4;
          color: white;
        }

        .title-input {
          width: 100%;
          border: none;
          font-size: 1.5rem;
          font-weight: 600;
          padding: 0.5rem 0;
          margin-bottom: 1rem;
          border-bottom: 2px solid transparent;
          transition: border-color 0.2s;
        }

        .title-input:focus {
          outline: none;
          border-bottom-color: #3584e4;
        }

        .content-input {
          width: 100%;
          border: none;
          font-size: 1rem;
          line-height: 1.6;
          font-family: inherit;
          resize: none;
          min-height: 400px;
        }

        .content-input:focus {
          outline: none;
        }

        .preview-content {
          font-size: 1rem;
          line-height: 1.6;
        }

        .preview-content h1 { font-size: 1.8rem; margin: 1rem 0; }
        .preview-content h2 { font-size: 1.5rem; margin: 0.8rem 0; }
        .preview-content h3 { font-size: 1.3rem; margin: 0.6rem 0; }
        .preview-content p { margin: 0.5rem 0; }
        .preview-content ul, .preview-content ol { margin: 0.5rem 0; padding-left: 2rem; }
        .preview-content li { margin: 0.25rem 0; }
        .preview-content code {
          background: #f5f5f5;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        .preview-content pre {
          background: #f5f5f5;
          padding: 1rem;
          border-radius: 6px;
          overflow-x: auto;
          margin: 0.5rem 0;
        }
        .preview-content pre code {
          background: none;
          padding: 0;
        }
        .preview-content blockquote {
          border-left: 4px solid #3584e4;
          padding-left: 1rem;
          margin: 0.5rem 0;
          color: #555753;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #888a85;
          text-align: center;
        }

        .empty-state p {
          margin-top: 0.5rem;
          font-size: 1rem;
        }

        .save-indicator {
          font-size: 0.85rem;
          color: #888a85;
          padding: 0.25rem 0.5rem;
        }

        .save-indicator.saving {
          color: #3584e4;
        }

        .save-indicator.saved {
          color: #26a269;
        }

        .mobile-back-btn {
          display: none;
          background: none;
          border: none;
          color: #18b582;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.25rem;
          margin-right: 0.5rem;
        }

        @media (max-width: 768px) {
          .mobile-back-btn {
            display: inline-block;
          }
        }
      </style>

      ${this.currentNote ? `
        <div class="editor-header">
          <div style="display: flex; align-items: center;">
            <button class="mobile-back-btn" id="back-btn" title="Back to notes">&larr;</button>
            <span class="save-indicator" id="save-indicator"></span>
          </div>
          <div class="editor-actions">
            <button class="btn-icon ${this.isPreview ? '' : 'active'}" id="edit-btn" title="Edit">✏️</button>
            <button class="btn-icon ${this.isPreview ? 'active' : ''}" id="preview-btn" title="Preview">👁️</button>
            <button class="btn-icon" id="delete-btn" title="Delete">🗑️</button>
          </div>
        </div>

        <div class="editor-content">
          ${this.isPreview ? `
            <h1>${this.currentNote.title || 'Untitled'}</h1>
            <div class="preview-content" id="preview-content"></div>
          ` : `
            <input 
              type="text" 
              class="title-input" 
              id="title-input" 
              placeholder="Note title..."
              value="${this.currentNote.title || ''}">
            
            <textarea 
              class="content-input" 
              id="content-input" 
              placeholder="Write your note in Markdown...">${this.currentNote.content || ''}</textarea>
          `}
        </div>
      ` : `
        <div class="empty-state">
          <div style="font-size: 4rem;">📝</div>
          <p>Select a note to start editing</p>
        </div>
      `}
    `;

    this.attachEventListeners();

    // Render markdown preview if in preview mode
    if (this.isPreview && this.currentNote) {
      this.renderPreview();
    }
  }

  attachEventListeners() {
    // Back button (mobile)
    this.querySelector('#back-btn')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('mobile:back'));
    });

    // Edit button
    this.querySelector('#edit-btn')?.addEventListener('click', () => {
      this.isPreview = false;
      this.render();
    });

    // Preview button
    this.querySelector('#preview-btn')?.addEventListener('click', () => {
      this.isPreview = true;
      this.render();
    });

    // Delete button
    this.querySelector('#delete-btn')?.addEventListener('click', () => {
      if (this.currentNote) {
        window.dispatchEvent(new CustomEvent('notes:delete', {
          detail: this.currentNote.id
        }));
      }
    });

    // Auto-save on input
    const titleInput = this.querySelector('#title-input');
    const contentInput = this.querySelector('#content-input');

    if (titleInput) {
      titleInput.addEventListener('input', () => {
        this.scheduleAutoSave();
      });
    }

    if (contentInput) {
      contentInput.addEventListener('input', () => {
        this.scheduleAutoSave();
      });

      // Auto-resize textarea
      contentInput.style.height = 'auto';
      contentInput.style.height = contentInput.scrollHeight + 'px';
      contentInput.addEventListener('input', () => {
        contentInput.style.height = 'auto';
        contentInput.style.height = contentInput.scrollHeight + 'px';
      });
    }
  }

  scheduleAutoSave() {
    const indicator = this.querySelector('#save-indicator');
    if (indicator) {
      indicator.textContent = 'Saving...';
      indicator.classList.add('saving');
      indicator.classList.remove('saved');
    }

    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Schedule save after 1 second of no typing
    this.saveTimeout = setTimeout(() => {
      this.saveNote();
    }, 1000);
  }

  saveNote() {
    if (!this.currentNote) return;

    const titleInput = this.querySelector('#title-input');
    const contentInput = this.querySelector('#content-input');

    if (!titleInput || !contentInput) return;

    const title = titleInput.value;
    const content = contentInput.value;

    // Only save if something changed
    if (title === this.currentNote.title && content === this.currentNote.content) {
      return;
    }

    window.dispatchEvent(new CustomEvent('notes:update', {
      detail: {
        id: this.currentNote.id,
        data: { title, content }
      }
    }));

    // Update current note
    this.currentNote.title = title;
    this.currentNote.content = content;

    // Update save indicator
    const indicator = this.querySelector('#save-indicator');
    if (indicator) {
      indicator.textContent = 'Saved';
      indicator.classList.remove('saving');
      indicator.classList.add('saved');
    }
  }

  renderPreview() {
    const previewContent = this.querySelector('#preview-content');
    if (previewContent && this.currentNote) {
      // Use marked.js to render markdown
      if (window.marked) {
        previewContent.innerHTML = marked.parse(this.currentNote.content || '');
      } else {
        previewContent.textContent = this.currentNote.content || '';
      }
    }
  }
}

customElements.define('note-editor', NoteEditor);

