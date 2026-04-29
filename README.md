# AI Music Asset Manager

Self-hosted web application for managing AI-generated music projects — from first prompt to final release.

## Features

### v0.3.0
- ✅ **Project Management** — Create, edit, delete projects with metadata (title, artist, genre, BPM, key, status)
- ✅ **Status Workflow** — Draft → In Progress → Mastering → Released with one-click advancement
- ✅ **Audio Files** — Upload, organize, and play back audio with drag & drop
- ✅ **Waveform Player** — Real-time audio waveform visualization with seeking and volume
- ✅ **AI Prompts** — Track generation prompts with AI service tagging (Suno, Udio, AIVA, etc.)
- ✅ **Lyrics Editor** — Full CRUD for lyrics with language tracking and version management
- ✅ **Visual Assets** — Upload and manage covers, thumbnails, backgrounds, promo images
- ✅ **Google Drive Sync** — OAuth2-based sync to Google Drive with per-project folders
- ✅ **Authentication** — Login/register with PocketBase auth
- ✅ **Dark Theme** — Full dark UI with consistent color scheme
- ✅ **Responsive Design** — Mobile-friendly layouts across all pages
- ✅ **PocketBase Migrations** — Automated collection setup with owner-based access rules
- ✅ **CI/CD** — GitHub Actions for type checking, testing, and Docker deploys
- ✅ **Test Suite** — 28 unit, component, and integration tests
- ✅ **Docker** — Multi-stage Dockerfile + Docker Compose for easy deployment

## Tech Stack

- **Frontend:** SvelteKit + Tailwind CSS
- **Backend:** PocketBase (Auth, DB, File Storage, Realtime)
- **Container:** Docker + Docker Compose
- **CI/CD:** GitHub Actions (type check, tests, Docker build, GHCR deploy)

## Quick Start

### Docker (Recommended)

```bash
# Clone the repo
git clone https://github.com/miasolberg/ai-music-asset-manager.git
cd ai-music-asset-manager

# Start services
docker-compose up -d

# Setup PocketBase admin
# Open http://localhost:8090/_/ and create an admin account

# Open the app
# http://localhost:3000
```

### Development

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env
# Edit .env with your settings

# Start dev server
npm run dev

# Run type checking
npm run check

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Google Drive Integration (Optional)

1. Create OAuth2 credentials at [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Enable the Google Drive API
3. Set the redirect URI to your app's origin (e.g. `http://localhost:3000`)
4. Add `PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com` to your `.env`

## Database Schema

PocketBase collections are auto-created via migrations. See `pb_migrations/1680000000_initial_setup.js` for the full schema.

### Collections

| Collection | Key Fields | Description |
|---|---|---|
| **projects** | title, artist, genre, bpm, key, status, cover, owner | Main project entity |
| **audio_files** | project (relation), file, version, file_type, notes | Audio tracks & stems |
| **prompts** | project (relation), prompt_text, ai_service, tags | AI generation prompts |
| **lyrics** | project (relation), content, language | Lyrics with versions |
| **visual_assets** | project (relation), file, asset_type, format, alt_text | Cover art & visuals |

### Access Rules

All collections use owner-based filtering: users can only CRUD their own records (`@request.auth.id = owner`).

## Project Structure

```
├── .github/workflows/     # CI/CD pipelines
│   ├── ci.yml            # Type check, tests, Docker build
│   └── deploy.yml        # GHCR deploy on tag push
├── pb_migrations/        # PocketBase collection migrations
├── src/
│   ├── lib/
│   │   ├── components/   # Svelte components
│   │   ├── types/        # TypeScript type definitions
│   │   ├── pocketbase.ts # PocketBase client + typed helpers
│   │   └── google-drive.ts # Google Drive sync
│   └── routes/           # SvelteKit pages
├── docker-compose.yml
├── Dockerfile
└── tailwind.config.js
```

## Deployment

### Docker

The app is containerized and can be deployed with Docker Compose. For production, set `PB_ENCRYPTION_KEY` and configure a reverse proxy (nginx/Caddy) for TLS.

### GitHub Container Registry

Push a version tag to trigger the deploy workflow:

```bash
git tag v0.3.0
git push origin v0.3.0
```

This builds and pushes a Docker image to `ghcr.io/miasolberg/ai-music-asset-manager`.

## License

MIT