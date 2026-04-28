# AI Music Asset Manager

Self-hosted web application for managing AI-generated music projects.

## Features

- Project-based song management
- Audio upload and version tracking
- Prompt archive for AI generation
- Lyrics editor
- Visual asset management (covers, thumbnails)
- Optional Google Drive sync

## Tech Stack

- Python + FastAPI
- SQLite
- Vanilla JS + Tailwind CSS
- Docker

## Development

```bash
# Run locally
pip install -r requirements.txt
uvicorn app.main:app --reload

# Run with Docker
docker-compose up -d
```

## License

MIT
