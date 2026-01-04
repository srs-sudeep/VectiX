"""Authentication schemas."""

from typing import Optional

from pydantic import BaseModel, Field


class Token(BaseModel):
    """Token schema."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Token payload schema."""

    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None


class Login(BaseModel):
    """Login schema."""

    username: str
    password: str


class RefreshToken(BaseModel):
    """Refresh token schema."""

    refresh_token: str


# Google OAuth Schemas
class GoogleAuthRequest(BaseModel):
    """Request schema for Google OAuth - accepts the authorization code from frontend."""
    
    code: str = Field(..., description="Authorization code from Google OAuth")
    redirect_uri: Optional[str] = Field(None, description="Redirect URI used in frontend")


class GoogleTokenRequest(BaseModel):
    """Request schema for Google OAuth - accepts the ID token directly from frontend."""
    
    id_token: str = Field(..., description="Google ID token from frontend")


class GoogleUserInfo(BaseModel):
    """User info from Google OAuth."""
    
    id: str = Field(..., alias="sub")
    email: str
    name: str
    picture: Optional[str] = None
    email_verified: bool = False

    class Config:
        populate_by_name = True


class GoogleAuthResponse(BaseModel):
    """Response schema for Google OAuth login."""
    
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    is_new_user: bool = False
