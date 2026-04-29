# AI Music Asset Manager

Self-hosted web application for managing AI-generated music projects — from first prompt to final release.

## Features

- **Project Management** — Create, edit, delete projects with metadata (title, artist, genre, BPM, key, status)
- **Status Workflow** — Draft → In Progress → Mastering → Released with one-click advancement
- **Audio Files** — Upload, organize, and play back audio with real waveform visualization
- **AI Prompts** — Track generation prompts with AI service tagging (Suno, Udio, AIVA, etc.)
- **Lyrics Editor** — Full CRUD for lyrics with language tracking and version management
- **Visual Assets** — Upload and manage covers, thumbnails, backgrounds, promo images
- **Google Drive Sync** — OAuth2-based sync to Google Drive with per-project folders
- **Authentication** — Register/login with PocketBase auth, auto-login on registration
- **Dark Theme** — Full dark UI with consistent color scheme
- **Responsive Design** — Mobile-friendly layouts, modals, and navigation
- **PocketBase Migrations** — Automated collection setup with owner-based access rules
- **CI/CD** — GitHub Actions for type checking, testing, and Docker deploys
- **Test Suite** — 34 unit, component, and integration tests
- **Docker** — Multi-stage Dockerfile + Docker Compose for easy deployment

## Tech Stack

- **Frontend:** SvelteKit + Tailwind CSS + TypeScript
- **Backend:** PocketBase v0.23+ (Auth, DB, File Storage)
- **Container:** Docker + Docker Compose
- **CI/CD:** GitHub Actions (type check, tests, Docker build, GHCR deploy)

## Quick Start

### Docker (Recommended)

```bash
git clone https://github.com/miasolberg/ai-music-asset-manager.git
cd ai-music-asset-manager
docker-compose up -d

# Setup PocketBase admin at http://localhost:8090/_/
# Open the app at http://localhost:3000
```

### Development

```bash
npm install
cp .env.example .env
# Edit .env with your PocketBase URL and optional Google Client ID

# Start PocketBase (download from https://pocketbase.io/docs/)
./pocketbase serve

# Start dev server
npm run dev

# Type checking
npm run check

# Tests
npm test
```

### PocketBase v0.23+ Notes

PocketBase v0.23+ no longer creates `created`/`updated` fields implicitly. The migration script includes `autodate` fields explicitly. If you're running an older PocketBase, the migration will still work — the autodate field type is supported since v0.22.

### Google Drive Integration (Optional)

1. Create OAuth2 credentials at [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Enable the Google Drive API
3. Set the redirect URI to your app's origin (e.g. `http://localhost:3000`)
4. Add `PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com` to your `.env`

## Database Schema

PocketBase collections are auto-created via migrations. See `pb_migrations/1680000000_initial_setup.js` for the full schema.

| Collection | Key Fields | Description |
|---|---|---|
| **projects** | title, artist, genre, bpm, key, status, cover, owner | Main project entity |
| **audio_files** | project (relation), file, version, file_type, notes | Audio tracks & stems |
| **prompts** | project (relation), prompt_text, ai_service, tags | AI generation prompts |
| **lyrics** | project (relation), content, language | Lyrics with versions |
| **visual_assets** | project (relation), file, asset_type, format, alt_text | Cover art & visuals |

All collections include `created`/`updated` autodate fields and use owner-based access rules: users can only CRUD their own records (`@request.auth.id = owner`).

## Project Structure

```
├── .github/workflows/     # CI/CD pipelines
├── pb_migrations/          # PocketBase collection migrations
├── src/
│   ├── lib/
│   │   ├── components/    # Svelte components (ProjectCard, modals, etc.)
│   │   ├── types/         # TypeScript type definitions
│   │   ├── pocketbase.ts  # PocketBase client + typed helpers
│   │   ├── google-drive.ts # Google Drive sync
│   │   └── utils.ts       # Shared utilities (formatDate, etc.)
│   └── routes/            # SvelteKit pages
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
git tag v0.5.0
git push origin v0.5.0
```

This builds and pushes a Docker image to `ghcr.io/miasolberg/ai-music-asset-manager`.

## License

MIT