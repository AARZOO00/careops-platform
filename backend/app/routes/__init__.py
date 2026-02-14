from app.routes import auth
from app.routes import password  # Add this
from app.routes import onboarding
from app.routes import dashboard
from app.routes import inbox
from app.routes import bookings
from app.routes import inventory
from app.routes import forms
from app.routes import public

__all__ = [
    "auth",
    "password",  # Add this
    "onboarding",
    "dashboard",
    "inbox",
    "bookings",
    "inventory",
    "forms",
    "public"
]