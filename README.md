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
- Git

### Local Development

Get Verses running on your local machine in minutes:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/verses.git
cd verses

# 2. Create environment file
cp .env.example .env

# 3. Launch with Docker Compose
docker compose up -d --build

# 4. Check logs
docker compose logs -f
```

**Access Verses** at `http://localhost` and start writing!

> **Note:** By default, `VERSES_ENVIRONMENT=development` uses HTTP only, no SSL certificates required.

---

### Production Deployment

For deploying Verses on a remote server with HTTPS:

#### Prerequisites
- Linux server (Debian 12 / Ubuntu recommended)
- Domain name pointing to your server
- Ports 80 and 443 open

#### 1. Clone and configure

```bash
git clone https://github.com/yourusername/verses.git
cd verses
cp .env.example .env
```

#### 2. Edit `.env` for production

```bash
# Environment Configuration
VERSES_ENVIRONMENT=production
VERSES_CERTS_PATH=/etc/letsencrypt

# Security - Generate secure values!
VERSES_SECRET_KEY=<generate with: python3 -c "import secrets; print(secrets.token_urlsafe(32))">
VERSES_MYSQL_ROOT_PASSWORD=<generate with: openssl rand -base64 32>
VERSES_MYSQL_PASSWORD=<generate with: openssl rand -base64 32>

# Disable debug in production
VERSES_DEBUG=False
```

#### 3. Set up SSL certificates

```bash
# Install certbot
sudo apt install certbot

# Get certificate (replace with your domain)
sudo certbot certonly --standalone -d your.domain.com
```

#### 4. Update Nginx configuration

Edit `nginx/conf.d/production/verses.conf` and replace `verses.gamevisionitalia.it` with your domain:

```nginx
server_name your.domain.com;
ssl_certificate /etc/letsencrypt/live/your.domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/your.domain.com/privkey.pem;
```

#### 5. Launch

```bash
docker compose up -d --build
docker compose logs -f
```

**Access Verses** at `https://your.domain.com`

---

### Environment Variables Reference

| Variable | Development | Production |
|----------|-------------|------------|
| `VERSES_ENVIRONMENT` | `development` | `production` |
| `VERSES_CERTS_PATH` | `./nginx/certs` | `/etc/letsencrypt` |
| `VERSES_DEBUG` | `True` | `False` |
| `VERSES_SECRET_KEY` | any value | **secure random** |
| `VERSES_MYSQL_PASSWORD` | any value | **secure random** |
| `VERSES_MYSQL_ROOT_PASSWORD` | any value | **secure random** |

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

