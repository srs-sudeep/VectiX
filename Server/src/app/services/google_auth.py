"""Google OAuth authentication service."""

import uuid
from typing import Optional, Dict, Tuple

import httpx
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from src.app.models import User, Role
from src.app.schemas import GoogleUserInfo
from src.core import create_access_token, create_refresh_token, settings


class GoogleAuthService:
    """Google OAuth authentication service."""

    GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
    GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
    GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"

    def __init__(self, db: AsyncSession):
        """Initialize Google auth service."""
        self.db = db

    async def get_google_user_info_from_code(
        self, code: str, redirect_uri: Optional[str] = None
    ) -> GoogleUserInfo:
        """
        Exchange authorization code for tokens and get user info.

        Args:
            code: Authorization code from Google OAuth
            redirect_uri: Redirect URI used in the OAuth flow

        Returns:
            GoogleUserInfo object with user data
        """
        # Use provided redirect_uri or fall back to settings
        redirect = redirect_uri or settings.GOOGLE_REDIRECT_URI

        async with httpx.AsyncClient() as client:
            # Exchange code for tokens
            token_response = await client.post(
                self.GOOGLE_TOKEN_URL,
                data={
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": redirect,
                },
            )

            if token_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Failed to exchange code for tokens: {token_response.text}",
                )

            token_data = token_response.json()
            access_token = token_data.get("access_token")

            if not access_token:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="No access token in response",
                )

            # Get user info using access token
            userinfo_response = await client.get(
                self.GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )

            if userinfo_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Failed to get user info from Google",
                )

            user_data = userinfo_response.json()
            return GoogleUserInfo(**user_data)

    async def verify_google_id_token(self, id_token: str) -> GoogleUserInfo:
        """
        Verify Google ID token and extract user info.
        Use this method when frontend sends the ID token directly.

        Args:
            id_token: Google ID token from frontend

        Returns:
            GoogleUserInfo object with user data
        """
        async with httpx.AsyncClient() as client:
            # Verify the ID token with Google
            response = await client.get(
                self.GOOGLE_TOKEN_INFO_URL,
                params={"id_token": id_token},
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Google ID token",
                )

            token_info = response.json()

            # Verify the audience (client ID)
            if token_info.get("aud") != settings.GOOGLE_CLIENT_ID:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token audience",
                )

            return GoogleUserInfo(
                sub=token_info.get("sub"),
                email=token_info.get("email"),
                name=token_info.get("name", token_info.get("email", "").split("@")[0]),
                picture=token_info.get("picture"),
                email_verified=token_info.get("email_verified", "false") == "true",
            )

    async def get_or_create_user(
        self, google_user: GoogleUserInfo, default_role_id: int = 2
    ) -> Tuple[User, bool]:
        """
        Get existing user by Google ID or email, or create a new one.

        Args:
            google_user: User info from Google
            default_role_id: Role ID to assign to new users (default: 2 for normal user)

        Returns:
            Tuple of (User, is_new_user)
        """
        # First, try to find user by Google ID
        query = (
            select(User)
            .where(User.google_id == google_user.id)
            .options(selectinload(User.roles))
        )
        result = await self.db.execute(query)
        user = result.scalar_one_or_none()

        if user:
            return user, False

        # Try to find user by email (for linking existing accounts)
        query = (
            select(User)
            .where(User.email == google_user.email)
            .options(selectinload(User.roles))
        )
        result = await self.db.execute(query)
        user = result.scalar_one_or_none()

        if user:
            # Link Google account to existing user
            user.google_id = google_user.id
            user.auth_provider = "google"
            if google_user.picture and not user.photo:
                user.photo = google_user.picture
            await self.db.commit()
            await self.db.refresh(user)
            return user, False

        # Create new user
        # Generate username from email (before @)
        base_username = google_user.email.split("@")[0]
        username = base_username

        # Check if username exists and make it unique
        counter = 1
        while True:
            query = select(User).where(User.username == username)
            result = await self.db.execute(query)
            if result.scalar_one_or_none() is None:
                break
            username = f"{base_username}{counter}"
            counter += 1

        # Get the default role
        role_result = await self.db.execute(
            select(Role).where(Role.role_id == default_role_id)
        )
        default_role = role_result.scalar_one_or_none()

        new_user = User(
            id=str(uuid.uuid4()),
            name=google_user.name,
            email=google_user.email,
            username=username,
            phoneNumber=None,  # OAuth users may not have phone number
            hashed_password=None,  # OAuth users don't need password
            google_id=google_user.id,
            auth_provider="google",
            photo=google_user.picture,
            is_active=True,
            is_superuser=False,
        )

        if default_role:
            new_user.roles.append(default_role)

        self.db.add(new_user)
        await self.db.commit()
        await self.db.refresh(new_user)

        return new_user, True

    def create_tokens(self, username: str) -> Dict[str, str]:
        """
        Create access and refresh tokens.

        Args:
            username: Username of the user

        Returns:
            Dictionary with tokens
        """
        return {
            "access_token": create_access_token(username),
            "refresh_token": create_refresh_token(username),
            "token_type": "bearer",
        }

    async def authenticate_with_code(
        self, code: str, redirect_uri: Optional[str] = None, default_role_id: int = 2
    ) -> Dict:
        """
        Complete OAuth flow: exchange code for user info and create/get user.

        Args:
            code: Authorization code from Google
            redirect_uri: Redirect URI used in the OAuth flow
            default_role_id: Role ID for new users

        Returns:
            Dictionary with tokens and user info
        """
        google_user = await self.get_google_user_info_from_code(code, redirect_uri)
        user, is_new = await self.get_or_create_user(google_user, default_role_id)
        tokens = self.create_tokens(user.username)

        return {
            **tokens,
            "is_new_user": is_new,
        }

    async def authenticate_with_id_token(
        self, id_token: str, default_role_id: int = 2
    ) -> Dict:
        """
        Authenticate using Google ID token (for frontend that handles OAuth flow).

        Args:
            id_token: Google ID token from frontend
            default_role_id: Role ID for new users

        Returns:
            Dictionary with tokens and user info
        """
        google_user = await self.verify_google_id_token(id_token)
        user, is_new = await self.get_or_create_user(google_user, default_role_id)
        tokens = self.create_tokens(user.username)

        return {
            **tokens,
            "is_new_user": is_new,
        }

