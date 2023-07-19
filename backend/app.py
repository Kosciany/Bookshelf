from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware  # Import CORS middleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, CheckConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker
from jose import jwt, JWTError
import uuid
import bcrypt
import uvicorn

# SQLAlchemy setup
SQLALCHEMY_DATABASE_URL = "sqlite:///bookshelf.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# FastAPI setup
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security setup
security_scheme = HTTPBearer()

# JWT setup
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# User model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)  # Add user_id column for the unique identifier
    username = Column(String, unique=True, index=True)
    password = Column(String)

# Request models
class UserRegisterRequest(BaseModel):
    username: str
    password: str

class UserLoginRequest(BaseModel):
    username: str
    password: str

# Response models
class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class BookRequest(BaseModel):
    rating: int
    ISBN: str

class Book(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True)
    ISBN = Column(String)
    rating = Column(Integer, CheckConstraint('rating >= 1 AND rating <= 5'))  # Rating range 1-5
    user_id = Column(String)  # User's UUID

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Register endpoint
@app.post("/register")
def register(user_request: UserRegisterRequest, db: Session = Depends(get_db)):
# Check if user already exists
    if db.query(User).filter(User.username == user_request.username).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists")

    # Generate salt and hash the password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(user_request.password.encode(), salt)

    # Generate a unique user identifier using UUID
    user_id = str(uuid.uuid4())

    # Create new user
    user = User(user_id=user_id, username=user_request.username, password=hashed_password.decode())
    db.add(user)
    db.commit()

    # Return 200 OK
    return {"message": "User registered successfully"}

# Login endpoint
@app.post("/login", response_model=TokenResponse)
def login(user_request: UserLoginRequest, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(User).filter(User.username == user_request.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    # Verify password
    if not verify_password(user_request.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    # Generate access token
    access_token = create_access_token(user.user_id)
    return TokenResponse(access_token=access_token, token_type="bearer")

@app.get("/books")
def get_books(credentials: HTTPAuthorizationCredentials = Depends(security_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload['sub']  # Get the user's UUID from the JWT payload

        # Get books for the authenticated user from the "books" table
        books = db.query(Book).filter(Book.user_id == user_id).all()

        # Convert the query result to a list of dictionaries
        books_data = [{"ISBN": book.ISBN, "rating": book.rating, "user_id": book.user_id} for book in books]

        return books_data
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

@app.post("/book")
def add_book(request: BookRequest, credentials: HTTPAuthorizationCredentials = Depends(security_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload['sub']  # Get the user's UUID from the JWT payload

        # Create new book
        book = Book(ISBN=request.ISBN, rating=request.rating, user_id=user_id)
        db.add(book)
        db.commit()

        # Return 200 OK
        return {"message": "Book added successfully"}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


# Helper functions
def create_access_token(user_id: str) -> str:
    payload = {"sub": user_id}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# Verify password function
def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Encode both plain_password and hashed_password as bytes
    plain_password_bytes = plain_password.encode('utf-8')
    hashed_password_bytes = hashed_password.encode('utf-8')

    return bcrypt.checkpw(plain_password_bytes, hashed_password_bytes)


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    uvicorn.run(app, host="0.0.0.0", port=8000)
