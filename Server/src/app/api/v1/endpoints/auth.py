"""Authentication endpoints."""

from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.schemas import (
    Login,
    RefreshToken,
    Token,
    UserResponse,
    GoogleAuthRequest,
    GoogleTokenRequest,
    GoogleAuthResponse,
)
from src.app.services import AuthService, UserService, GoogleAuthService
from src.core.utils import create_rate_limiter
from src.core.db import get_db
from src.core.utils import file_upload_service
from src.core import settings

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    login_data: Login,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(create_rate_limiter(5, 60)),  # 5 requests per minute
) -> Token:
    """
    Login user.

    Args:
        login_data: Login credentials
        db: Database session

    Returns:
        Access and refresh tokens

    Raises:
        HTTPException: If credentials are invalid
    """
    auth_service = AuthService(db)

    # Authenticate user
    user = await auth_service.authenticate(login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create tokens using username
    tokens = auth_service.create_tokens(user.username)
    return Token(**tokens)


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: RefreshToken,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(create_rate_limiter(5, 60)),  # 5 requests per minute
) -> Token:
    """Refresh tokens."""
    auth_service = AuthService(db)
    tokens = await auth_service.refresh_tokens(refresh_token.refresh_token)
    return Token(**tokens)


@router.post("/register", response_model=UserResponse)
async def register(
    name: str = Form(...),
    phoneNumber: str = Form(...),
    email: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    photo: UploadFile = File(None),
    role_id: int = Form(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new user with role_id=2 (normal user).
    """
    photo_url = None
    if photo:
        file_info = await file_upload_service.save_file(photo, subfolder="userphotos")
        photo_url = file_upload_service.get_file_url(file_info["file_path"])
    user_data = {
        "name": name,
        "phoneNumber": phoneNumber,
        "email": email,
        "username": username,
        "password": password,
        "photo": photo_url,
    }
    user_service = UserService(db)
    user = await user_service.create_user_with_role(user_data, role_id=role_id)
    return UserResponse(
        id=user.id,
        name=user.name,
        phoneNumber=user.phoneNumber,
        email=user.email,
        username=user.username,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at,
        photo=user.photo,
        roles=[role.name for role in user.roles] if user.roles else [],
    )


# ============================================================================
# Google OAuth Endpoints
# ============================================================================


@router.get("/google/login")
async def google_login(
    redirect_uri: str = Query(None, description="Custom redirect URI for OAuth callback"),
) -> dict:
    """
    Get Google OAuth login URL.
    
    The frontend should redirect the user to this URL to initiate Google OAuth.
    
    Args:
        redirect_uri: Optional custom redirect URI (defaults to settings.GOOGLE_REDIRECT_URI)
    
    Returns:
        Dictionary with the Google OAuth URL
    """
    oauth_redirect = redirect_uri or settings.GOOGLE_REDIRECT_URI
    
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": oauth_redirect,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    
    google_oauth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    
    return {"url": google_oauth_url}


@router.post("/google/callback", response_model=GoogleAuthResponse)
async def google_callback(
    auth_request: GoogleAuthRequest,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(create_rate_limiter(10, 60)),  # 10 requests per minute
) -> GoogleAuthResponse:
    """
    Handle Google OAuth callback with authorization code.
    
    This endpoint exchanges the authorization code for tokens and creates/retrieves
    the user account.
    
    Args:
        auth_request: Contains the authorization code from Google
        db: Database session
    
    Returns:
        Access and refresh tokens for the authenticated user
    """
    google_service = GoogleAuthService(db)
    
    result = await google_service.authenticate_with_code(
        code=auth_request.code,
        redirect_uri=auth_request.redirect_uri,
    )
    
    return GoogleAuthResponse(**result)


@router.post("/google/token", response_model=GoogleAuthResponse)
async def google_token_auth(
    token_request: GoogleTokenRequest,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(create_rate_limiter(10, 60)),  # 10 requests per minute
) -> GoogleAuthResponse:
    """
    Authenticate using Google ID token.
    
    Use this endpoint when the frontend handles the OAuth flow (e.g., using 
    Google Sign-In for Web) and sends the ID token directly.
    
    Args:
        token_request: Contains the Google ID token
        db: Database session
    
    Returns:
        Access and refresh tokens for the authenticated user
    """
    google_service = GoogleAuthService(db)
    
    result = await google_service.authenticate_with_id_token(
        id_token=token_request.id_token,
    )
    
    return GoogleAuthResponse(**result)

