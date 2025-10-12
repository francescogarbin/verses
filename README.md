# 📝 Verses

*A beautiful, minimalist note-taking application with cloud sync.*

**Verses** = **Servers** 🌌  
*Because code is poetry, and servers host verses.*

---

## 🐋 Philosophy

> *"Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world."*  
> — Herman Melville, Moby-Dick

Verses is born from the idea that note-taking should be:
- **Simple** - No clutter, just your thoughts
- **Beautiful** - Clean, GNOME-inspired interface
- **Yours** - Your data, your control, self-hosted
- **Poetic** - Markdown-formatted notes, organized in notebooks

The name itself is a cosmic anagram discovered during development. We believe the Universe was listening.

---

## ✨ Features

- 📚 **Notebooks** - Organize notes in color-coded notebooks
- 📝 **Markdown Support** - Write with formatting power
- 🔐 **JWT Authentication** - Secure, token-based auth
- 🌐 **Multi-device Sync** - Access your notes anywhere
- 🐳 **Docker-based** - Easy deployment and scaling
- 🔓 **Open Source** - Free as in freedom

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast Python web framework
- **MySQL 8.0** - Reliable data persistence
- **SQLAlchemy** - Elegant ORM
- **JWT** - Secure authentication
- **bcrypt** - Password hashing

### Frontend *(Coming Soon)*
- **Web Components** - Native, framework-free
- **PWA** - Progressive Web App with offline support
- **Service Worker** - Background sync
- **Marked.js** - Markdown rendering

### Infrastructure
- **Docker & Docker Compose** - Containerized deployment
- **Nginx** - Reverse proxy with SSL/TLS
- **Let's Encrypt** - Free SSL certificates

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Domain name (for SSL)
- Linux server (Debian 12 recommended)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/verses.git
cd verses
```

2. **Configure environment**
```bash
# Copy example env file
cp .env.example .env.development

# Edit with your settings
nano .env.development

# Generate a secure SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

3. **Set up SSL certificates**
```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d your.domain.com
```

4. **Update nginx configuration**
Edit `nginx/conf.d/verses.conf` with your domain name.

5. **Launch with Docker Compose**
```bash
# Create symlink to development env
ln -s .env.development .env

# Build and start
docker compose up -d --build

# Check logs
docker compose logs -f
```

6. **Access Verses**
Visit `https://your.domain.com` and start writing! ✍️

---

## 📚 API Documentation

Once running, interactive API docs are available at:
- **Swagger UI**: `https://your.domain.com/api/docs`
- **ReDoc**: `https://your.domain.com/api/redoc`

### Key Endpoints

```
POST   /api/register          # Register new user
POST   /api/login             # Login and get JWT token
GET    /api/notebooks         # List user's notebooks
POST   /api/notebooks         # Create new notebook
GET    /api/notebooks/{id}/notes  # Get notes in notebook
POST   /api/notes             # Create new note
PUT    /api/notes/{id}        # Update note
DELETE /api/notes/{id}        # Delete note
```

---

## 🎨 Notebook Colors

Notebooks support a palette of 32 colors. Each notebook displays a two-letter abbreviation:
- First letter (uppercase) + Last letter (lowercase)
- Examples: "Notebook" → **Nk**, "Work" → **Wk**, "Personal" → **Pl**

---

## 🗺️ Roadmap

- [x] Backend API with JWT auth
- [x] Notebooks and notes management
- [x] MySQL persistence
- [x] Docker deployment
- [ ] Progressive Web App (PWA)
- [ ] Web Components UI
- [ ] Offline support with Service Worker
- [ ] GNOME/GTK4 native app (Folio fork)
- [ ] Mobile apps (iOS/Android)
- [ ] Real-time collaboration
- [ ] End-to-end encryption

---

## 🤝 Contributing

Verses is open source and contributions are welcome! This is a weekend project born from the joy of coding, and we'd love to have you join the journey.

### Development Setup

```bash
# Backend development
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Database migrations (when needed)
# Using SQLAlchemy's create_all for now
```

---

## 📜 License

MIT License - See [LICENSE](LICENSE) file for details.

---

## 🙏 Credits

Created with ❤️ by Francesco and Claude during a weekend of "vibe coding".

Special thanks to:
- **Folio** - Design inspiration
- **GNOME** - UI philosophy
- **Herman Melville** - For the whales 🐋

---

## 🌌 The Cosmic Connection

**VERSES = SERVERS**

This anagram was discovered organically during development. We believe in synchronicities. The Universe was watching, and it whispered: "Code is poetry, and servers host verses."

*Navigate wisely, write beautifully.* ✨

---

**Star ⭐ this repo if you believe in the cosmic connection!**

