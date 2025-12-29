// Main App Logic

import { api } from './api.js';

class VersesApp {
  constructor() {
    this.currentUser = null;
    this.selectedNotebook = null;
    this.selectedNote = null;
    this.notebooks = [];
    this.notes = [];
    this.mobileView = 'notes'; // 'notebooks', 'notes', 'editor'

    this.init();
  }

  async init() {
    // Check if user is logged in
    if (api.token) {
      try {
        this.currentUser = await api.getCurrentUser();
        this.showApp();
        await this.loadNotebooks();
      } catch (error) {
        console.error('Failed to load user:', error);
        this.showAuth();
      }
    } else {
      this.showAuth();
    }

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', () => {
      this.logout();
    });

    // Listen to custom events from components
    window.addEventListener('notebooks:select', (e) => {
      this.selectNotebook(e.detail);
    });

    window.addEventListener('notebooks:create', async (e) => {
      await this.createNotebook(e.detail);
    });

    window.addEventListener('notebooks:update', async (e) => {
      await this.updateNotebook(e.detail.id, e.detail.data);
    });

    window.addEventListener('notebooks:delete', async (e) => {
      await this.deleteNotebook(e.detail);
    });

    window.addEventListener('notes:select', (e) => {
      this.selectNote(e.detail);
    });

    window.addEventListener('notes:create', async (e) => {
      await this.createNote(e.detail);
    });

    window.addEventListener('notes:update', async (e) => {
      await this.updateNote(e.detail.id, e.detail.data);
    });

    window.addEventListener('notes:delete', async (e) => {
      await this.deleteNote(e.detail);
    });

    window.addEventListener('auth:login', async (e) => {
      await this.login(e.detail);
    });

    window.addEventListener('auth:register', async (e) => {
      await this.register(e.detail);
    });

    // Mobile navigation events
    window.addEventListener('mobile:back', () => {
      this.mobileGoBack();
    });

    window.addEventListener('mobile:showNotes', () => {
      this.setMobileView('notes');
    });

    window.addEventListener('mobile:showEditor', () => {
      this.setMobileView('editor');
    });
  }

  // Mobile navigation
  isMobile() {
    return window.innerWidth <= 768;
  }

  setMobileView(view) {
    this.mobileView = view;
    const appMain = document.querySelector('.app-main');

    appMain.classList.remove('show-notebooks', 'show-notes', 'show-editor');
    appMain.classList.add(`show-${view}`);
  }

  mobileGoBack() {
    if (this.mobileView === 'editor') {
      this.setMobileView('notes');
    } else if (this.mobileView === 'notes') {
      this.setMobileView('notebooks');
    }
  }

  showAuth() {
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
  }

  showApp() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    if (this.currentUser) {
      document.getElementById('user-email').textContent = this.currentUser.email;
    }

    // Initialize mobile view
    if (this.isMobile()) {
      this.setMobileView('notebooks');
    }
  }

  async login({ username, password }) {
    try {
      await api.login(username, password);
      this.currentUser = await api.getCurrentUser();
      this.showApp();
      await this.loadNotebooks();
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  }

  async register({ email, username, password }) {
    try {
      await api.register(email, username, password);
      // Auto-login after registration
      await this.login({ username, password });
    } catch (error) {
      alert('Registration failed: ' + error.message);
    }
  }

  logout() {
    api.setToken(null);
    this.currentUser = null;
    this.selectedNotebook = null;
    this.selectedNote = null;
    this.notebooks = [];
    this.notes = [];
    this.showAuth();
  }

  async loadNotebooks() {
    try {
      this.notebooks = await api.getNotebooks();

      // Update sidebar
      const sidebar = document.getElementById('notebooks-sidebar');
      sidebar.setNotebooks(this.notebooks);

      // Auto-select first notebook only on desktop
      if (!this.selectedNotebook && this.notebooks.length > 0 && !this.isMobile()) {
        this.selectNotebook(this.notebooks[0]);
      }
    } catch (error) {
      console.error('Failed to load notebooks:', error);
    }
  }

  async selectNotebook(notebook) {
    this.selectedNotebook = notebook;
    this.selectedNote = null;

    // Update sidebar selection
    const sidebar = document.getElementById('notebooks-sidebar');
    sidebar.selectNotebook(notebook.id);

    // Load notes for this notebook
    await this.loadNotes(notebook.id);

    // Mobile: navigate to notes view
    if (this.isMobile()) {
      this.setMobileView('notes');
    }
  }

  async loadNotes(notebookId) {
    try {
      this.notes = await api.getNotesInNotebook(notebookId);

      // Update notes list
      const notesList = document.getElementById('notes-list');
      notesList.setNotes(this.notes, this.selectedNotebook);

      // Auto-select first note only on desktop
      if (!this.selectedNote && this.notes.length > 0 && !this.isMobile()) {
        this.selectNote(this.notes[0]);
      } else if (this.notes.length === 0) {
        // Clear editor if no notes
        const editor = document.getElementById('note-editor');
        editor.clearNote();
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }

  async selectNote(note) {
    this.selectedNote = note;

    // Update notes list selection
    const notesList = document.getElementById('notes-list');
    notesList.selectNote(note.id);

    // Update editor
    const editor = document.getElementById('note-editor');
    editor.setNote(note);

    // Mobile: navigate to editor view
    if (this.isMobile()) {
      this.setMobileView('editor');
    }
  }

  async createNotebook({ name, color }) {
    try {
      const notebook = await api.createNotebook(name, color);
      await this.loadNotebooks();
      this.selectNotebook(notebook);
    } catch (error) {
      alert('Failed to create notebook: ' + error.message);
    }
  }

  async updateNotebook(id, data) {
    try {
      await api.updateNotebook(id, data);
      await this.loadNotebooks();
      
      // Re-select current notebook to refresh
      if (this.selectedNotebook && this.selectedNotebook.id === id) {
        const updated = this.notebooks.find(n => n.id === id);
        if (updated) {
          this.selectNotebook(updated);
        }
      }
    } catch (error) {
      alert('Failed to update notebook: ' + error.message);
    }
  }

  async deleteNotebook(id) {
    if (!confirm('Delete this notebook and all its notes?')) {
      return;
    }

    try {
      await api.deleteNotebook(id);
      await this.loadNotebooks();
    } catch (error) {
      alert('Failed to delete notebook: ' + error.message);
    }
  }

  async createNote({ title, content }) {
    if (!this.selectedNotebook) {
      alert('Please select a notebook first');
      return;
    }

    try {
      const note = await api.createNote(title, content, this.selectedNotebook.id);
      await this.loadNotes(this.selectedNotebook.id);
      this.selectNote(note);
    } catch (error) {
      alert('Failed to create note: ' + error.message);
    }
  }

  async updateNote(id, data) {
    try {
      await api.updateNote(id, data);
      
      // Refresh current note
      if (this.selectedNote && this.selectedNote.id === id) {
        this.selectedNote = await api.getNote(id);
      }
      
      // Refresh notes list
      await this.loadNotes(this.selectedNotebook.id);
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  }

  async deleteNote(id) {
    if (!confirm('Delete this note?')) {
      return;
    }

    try {
      await api.deleteNote(id);
      await this.loadNotes(this.selectedNotebook.id);
    } catch (error) {
      alert('Failed to delete note: ' + error.message);
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.versesApp = new VersesApp();
});

