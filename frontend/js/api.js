// API Client for Verses Backend

const API_BASE = window.location.origin + '/api';

class VersesAPI {
  constructor() {
    this.token = localStorage.getItem('verses_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('verses_token', token);
    } else {
      localStorage.removeItem('verses_token');
    }
  }

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - clear token and redirect to login
          this.setToken(null);
          window.location.reload();
        }
        const error = await response.json();
        throw new Error(error.detail || 'Request failed');
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(email, username, password) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password })
    });
  }

  async login(username, password) {
    const data = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    
    return data;
  }

  async getCurrentUser() {
    return this.request('/me');
  }

  // Notebooks endpoints
  async getNotebooks() {
    return this.request('/notebooks');
  }

  async createNotebook(name, color) {
    return this.request('/notebooks', {
      method: 'POST',
      body: JSON.stringify({ name, color })
    });
  }

  async updateNotebook(id, data) {
    return this.request(`/notebooks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteNotebook(id) {
    return this.request(`/notebooks/${id}`, {
      method: 'DELETE'
    });
  }

  // Notes endpoints
  async getNotesInNotebook(notebookId) {
    return this.request(`/notebooks/${notebookId}/notes`);
  }

  async getNote(id) {
    return this.request(`/notes/${id}`);
  }

  async createNote(title, content, notebookId) {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify({ title, content, notebook_id: notebookId })
    });
  }

  async updateNote(id, data) {
    return this.request(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteNote(id) {
    return this.request(`/notes/${id}`, {
      method: 'DELETE'
    });
  }
}

// Export singleton instance
export const api = new VersesAPI();

