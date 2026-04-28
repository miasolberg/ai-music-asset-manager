import pytest
from fastapi.testclient import TestClient
import sys
sys.path.insert(0, "/tmp/ai-music-asset-manager")

from app.main import app

client = TestClient(app)

def test_read_root():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert "AI Music Asset Manager" in response.text

def test_list_projects():
    """Test listing projects."""
    response = client.get("/api/projects")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "projects" in data

def test_create_project():
    """Test creating a project."""
    response = client.post("/api/projects", data={"title": "Test Song", "artist": "Test Artist"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "created"
    assert data["title"] == "Test Song"

def test_upload_audio():
    """Test uploading audio file."""
    response = client.post("/api/projects/1/audio", data={"version": "v1"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "uploaded"

def test_add_prompt():
    """Test adding AI prompt."""
    response = client.post("/api/projects/1/prompts", data={"prompt": " upbeat pop song", "service": "Suno"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "saved"

def test_update_lyrics():
    """Test updating lyrics."""
    response = client.post("/api/projects/1/lyrics", data={"content": "Test lyrics here"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "saved"
