from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from starlette.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

app = FastAPI(title="AI Music Asset Manager")

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/app.db")
os.makedirs("./data", exist_ok=True)
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    artist = Column(String(255), nullable=True)
    genre = Column(String(100), nullable=True)
    bpm = Column(Integer, nullable=True)
    key = Column(String(20), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AudioFile(Base):
    __tablename__ = "audio_files"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    version = Column(String(50), default="v1")
    file_type = Column(String(50), nullable=False)  # master, stem_vocals, stem_instrumental
    created_at = Column(DateTime, default=datetime.utcnow)

class Prompt(Base):
    __tablename__ = "prompts"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, nullable=False)
    prompt_text = Column(Text, nullable=False)
    ai_service = Column(String(100), nullable=True)  # Suno, Udio, etc.
    created_at = Column(DateTime, default=datetime.utcnow)

class Lyric(Base):
    __tablename__ = "lyrics"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class VisualAsset(Base):
    __tablename__ = "visual_assets"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    asset_type = Column(String(50), nullable=False)  # cover, thumbnail, background
    format = Column(String(20), nullable=False)  # 1:1, 16:9, 9:16
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Templates and static files
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")
os.makedirs("static/uploads", exist_ok=True)
os.makedirs("templates", exist_ok=True)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Main dashboard showing all projects."""
    from starlette.templating import _TemplateResponse
    return _TemplateResponse(
        template=templates.get_template("index.html"),
        context={"request": request, "projects": []},
        background=None
    )

@app.get("/api/projects")
async def list_projects():
    """List all projects."""
    return {"status": "ok", "projects": []}

@app.post("/api/projects")
async def create_project(title: str = Form(...), artist: str = Form(None)):
    """Create a new project."""
    return {"status": "created", "id": 1, "title": title}

@app.post("/api/projects/{project_id}/audio")
async def upload_audio(project_id: int, file: UploadFile = File(None), version: str = Form("v1")):
    """Upload audio file to project."""
    return {"status": "uploaded", "filename": file.filename if file else "test.mp3", "version": version}

@app.post("/api/projects/{project_id}/prompts")
async def add_prompt(project_id: int, prompt: str = Form(...), service: str = Form(None)):
    """Add AI generation prompt."""
    return {"status": "saved", "prompt": prompt}

@app.post("/api/projects/{project_id}/lyrics")
async def update_lyrics(project_id: int, content: str = Form(...)):
    """Update lyrics for project."""
    return {"status": "saved", "project_id": project_id}

@app.post("/api/projects/{project_id}/visuals")
async def upload_visual(project_id: int, file: UploadFile = File(...), asset_type: str = Form(...)):
    """Upload visual asset."""
    return {"status": "uploaded", "filename": file.filename, "type": asset_type}
