from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from config import settings
from database import get_db, init_db
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user
)
import models

app = FastAPI(
    title=settings.APP_NAME,
    description="A beautiful note-taking application with notebooks",
    version=settings.VERSION
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In produzione, specifica i domini
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()

# ==================== Pydantic Schemas ====================

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    username: str
    password: str

class NotebookCreate(BaseModel):
    name: str = "Notebook"
    color: str = "#8B5A3C"

class NotebookUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None

class NotebookResponse(BaseModel):
    id: int
    name: str
    color: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class NoteCreate(BaseModel):
    title: str
    content: str
    notebook_id: int

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    notebook_id: Optional[int] = None

class NoteResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    updated_at: datetime
    notebook_id: int
    
    class Config:
        from_attributes = True

# ==================== Root Endpoints ====================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Verses API",
        "version": settings.VERSION,
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

# ==================== Auth Endpoints ====================

@app.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user and create default notebook"""
    # Check if user exists
    db_user = db.query(models.User).filter(
        (models.User.email == user.email) | (models.User.username == user.username)
    ).first()
    
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create default notebook for the user
    default_notebook = models.Notebook(
        name="Notebook",
        color="#8B5A3C",
        user_id=new_user.id
    )
    db.add(default_notebook)
    db.commit()
    
    return new_user

@app.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login and get access token"""
    # Find user
    user = db.query(models.User).filter(
        models.User.username == login_data.username
    ).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

# ==================== Notebook Endpoints ====================

@app.get("/notebooks", response_model=List[NotebookResponse])
async def get_notebooks(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all notebooks for the current user"""
    notebooks = db.query(models.Notebook).filter(
        models.Notebook.user_id == current_user.id
    ).order_by(models.Notebook.created_at.asc()).all()
    
    return notebooks

@app.get("/notebooks/{notebook_id}", response_model=NotebookResponse)
async def get_notebook(
    notebook_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific notebook by ID"""
    notebook = db.query(models.Notebook).filter(
        models.Notebook.id == notebook_id,
        models.Notebook.user_id == current_user.id
    ).first()
    
    if not notebook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notebook not found"
        )
    
    return notebook

@app.post("/notebooks", response_model=NotebookResponse, status_code=status.HTTP_201_CREATED)
async def create_notebook(
    notebook: NotebookCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new notebook"""
    new_notebook = models.Notebook(
        name=notebook.name,
        color=notebook.color,
        user_id=current_user.id
    )
    
    db.add(new_notebook)
    db.commit()
    db.refresh(new_notebook)
    
    return new_notebook

@app.put("/notebooks/{notebook_id}", response_model=NotebookResponse)
async def update_notebook(
    notebook_id: int,
    notebook_update: NotebookUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a notebook's name and/or color"""
    notebook = db.query(models.Notebook).filter(
        models.Notebook.id == notebook_id,
        models.Notebook.user_id == current_user.id
    ).first()
    
    if not notebook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notebook not found"
        )
    
    if notebook_update.name is not None:
        notebook.name = notebook_update.name
    if notebook_update.color is not None:
        notebook.color = notebook_update.color
    
    notebook.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(notebook)
    
    return notebook

@app.delete("/notebooks/{notebook_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notebook(
    notebook_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a notebook and all its notes"""
    notebook = db.query(models.Notebook).filter(
        models.Notebook.id == notebook_id,
        models.Notebook.user_id == current_user.id
    ).first()
    
    if not notebook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notebook not found"
        )
    
    # Check if it's the last notebook
    notebook_count = db.query(models.Notebook).filter(
        models.Notebook.user_id == current_user.id
    ).count()
    
    if notebook_count <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete the last notebook"
        )
    
    db.delete(notebook)
    db.commit()
    
    return None

# ==================== Notes Endpoints ====================

@app.get("/notebooks/{notebook_id}/notes", response_model=List[NoteResponse])
async def get_notes_in_notebook(
    notebook_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all notes in a specific notebook"""
    # Verify notebook ownership
    notebook = db.query(models.Notebook).filter(
        models.Notebook.id == notebook_id,
        models.Notebook.user_id == current_user.id
    ).first()
    
    if not notebook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notebook not found"
        )
    
    notes = db.query(models.Note).filter(
        models.Note.notebook_id == notebook_id
    ).order_by(models.Note.updated_at.desc()).all()
    
    return notes

@app.get("/notes/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific note by ID"""
    note = db.query(models.Note).join(models.Notebook).filter(
        models.Note.id == note_id,
        models.Notebook.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    return note

@app.post("/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note: NoteCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new note in a notebook"""
    # Verify notebook ownership
    notebook = db.query(models.Notebook).filter(
        models.Notebook.id == note.notebook_id,
        models.Notebook.user_id == current_user.id
    ).first()
    
    if not notebook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notebook not found"
        )
    
    new_note = models.Note(
        title=note.title,
        content=note.content,
        notebook_id=note.notebook_id
    )
    
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    
    return new_note

@app.put("/notes/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: int,
    note_update: NoteUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing note"""
    note = db.query(models.Note).join(models.Notebook).filter(
        models.Note.id == note_id,
        models.Notebook.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    if note_update.title is not None:
        note.title = note_update.title
    if note_update.content is not None:
        note.content = note_update.content
    if note_update.notebook_id is not None:
        # Verify new notebook ownership
        new_notebook = db.query(models.Notebook).filter(
            models.Notebook.id == note_update.notebook_id,
            models.Notebook.user_id == current_user.id
        ).first()
        
        if not new_notebook:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target notebook not found"
            )
        
        note.notebook_id = note_update.notebook_id
    
    note.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(note)
    
    return note

@app.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a note"""
    note = db.query(models.Note).join(models.Notebook).filter(
        models.Note.id == note_id,
        models.Notebook.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    db.delete(note)
    db.commit()
    
    return None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

