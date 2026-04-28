# AI Music Asset Manager

Self-hosted web application for managing AI-generated music projects.

## Tech Stack

- **Backend:** PocketBase (Auth, DB, File Storage, Realtime)
- **Frontend:** SvelteKit + Tailwind CSS
- **Container:** Docker + Docker Compose

## Quick Start

```bash
# Start services
docker-compose up -d

# Access PocketBase Admin: http://localhost:8090/_/ (create admin account)
# Access App: http://localhost:3000
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test
```

## License

MIT
