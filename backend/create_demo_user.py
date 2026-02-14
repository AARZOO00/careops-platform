from app.database import SessionLocal, init_db
from app.models.user import User
from passlib.context import CryptContext

# Initialize database
init_db()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = SessionLocal()

# Delete existing demo user
db.query(User).filter(User.email == "admin@demo.com").delete()
db.commit()

# Create fresh demo user
hashed_password = pwd_context.hash("demo123456")
user = User(
    email="admin@demo.com",
    hashed_password=hashed_password,
    full_name="Demo Admin",
    is_active=True
)

db.add(user)
db.commit()
db.refresh(user)

print("✅ Demo user created!")
print(f"📧 Email: admin@demo.com")
print(f"🔑 Password: demo123456")
print(f"🆔 User ID: {user.id}")

db.close()