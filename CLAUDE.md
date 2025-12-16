# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Verses is a self-hosted note-taking application with cloud sync. The name is a cosmic anagram of "Servers" - code is poetry, and servers host verses.

**Stack:** FastAPI backend + Web Components PWA frontend + MySQL + Docker + Nginx

## Development Commands

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Production Deployment
```bash
cp .env.example .env.development
# Set VERSES_SECRET_KEY, VERSES_MYSQL_PASSWORD, VERSES_MYSQL_ROOT_PASSWORD
docker compose up -d --build
docker compose logs -f
```

### Services
- `verses_db` - MySQL 8.0 (port 3306 internal)
- `verses_api` - FastAPI (port 8000 internal)
- `verses_nginx` - Nginx (ports 80, 443 public)

## Architecture

### Backend (`backend/app/`)
- **main.py** - All FastAPI routes and Pydantic schemas (single-file API)
- **models.py** - SQLAlchemy ORM: User, Notebook, Note (cascading deletes)
- **auth.py** - JWT creation/validation, bcrypt password hashing, `get_current_user()` dependency
- **database.py** - Engine with connection pooling, `get_db()` dependency injection
- **config.py** - Pydantic settings from environment variables

All protected endpoints use user ownership verification via SQL filters (no separate authorization layer).

### Frontend (`frontend/`)
Web Components architecture with event-driven communication:
- **app.js** - Central state manager, listens to custom events from all components
- **api.js** - Singleton API client with automatic JWT header injection
- **components/** - Isolated Web Components that emit events via `window.dispatchEvent()`

**Data flow:** Component action → Custom event → app.js handler → api.js request → State update → Component setter

PWA with Service Worker (`sw.js`) using cache-first for static assets, network-first for API calls.

### Infrastructure
- Nginx proxies `/api/*` to FastAPI, serves frontend static files
- SSL/TLS configured for Let's Encrypt certificates
- Docker Compose orchestrates all services with health checks

## API Patterns

RESTful endpoints at `/api/`:
- Auth: `POST /register`, `POST /login`, `GET /me`
- Notebooks: CRUD at `/notebooks` and `/notebooks/{id}`
- Notes: `GET /notebooks/{id}/notes`, CRUD at `/notes` and `/notes/{id}`

Interactive docs: `/api/docs` (Swagger) and `/api/redoc`

## Key Conventions

- No database migrations yet - uses SQLAlchemy `create_all()` on startup
- No test suite or linting configured
- Frontend has no build step (vanilla HTML/JS/CSS)
- GNOME-inspired design with CSS variables and system fonts
- Notebooks use a 32-color palette, display two-letter abbreviations (first + last letter)
