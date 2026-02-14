from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from datetime import datetime

from app.config import engine, Base, settings
from app.routes import (
    auth, password, onboarding, dashboard, inbox, 
    bookings, inventory, forms, public
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info(f"CareOps Platform v{settings.VERSION} started")
    yield
    logger.info("Shutting down")

app = FastAPI(title="CareOps", version=settings.VERSION, lifespan=lifespan)

# ✅ CRITICAL CORS FIX - Allow ALL origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(password.router, prefix="/api/auth", tags=["Password"])
app.include_router(onboarding.router, prefix="/api/onboarding", tags=["Onboarding"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(inbox.router, prefix="/api/inbox", tags=["Inbox"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(forms.router, prefix="/api/forms", tags=["Forms"])
app.include_router(public.router, prefix="/api/public", tags=["Public"])

@app.get("/")
async def root():
    return {"service": "CareOps", "status": "operational"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)