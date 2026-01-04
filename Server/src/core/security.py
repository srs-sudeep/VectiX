"""Security utilities."""

from datetime import datetime, timedelta
from typing import Any, Optional, Union

import bcrypt
from jose import jwt

from src.core.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password.

    Args:
        plain_password: Plain password
        hashed_password: Hashed password

    Returns:
        True if password is correct

    Note:
        Bcrypt has a 72-byte limit. Passwords longer than 72 bytes will be truncated
        to match the truncation used during hashing.
    """
    # Bcrypt has a 72-byte limit, so we truncate if necessary (same as in get_password_hash)
    password_bytes = plain_password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    return bcrypt.checkpw(password_bytes, hashed_password.encode('utf-8'))


def get_password_hash(password: str) -> str:
    """
    Hash password.

    Args:
        password: Plain password

    Returns:
        Hashed password

    Note:
        Bcrypt has a 72-byte limit. Passwords longer than 72 bytes will be truncated.
    """
    # Bcrypt has a 72-byte limit, so we truncate if necessary
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    # Generate salt and hash password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create access token.

    Args:
        subject: Token subject (username)
        expires_delta: Token expiration time

    Returns:
        JWT token
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt


def create_refresh_token(subject: Union[str, Any]) -> str:
    """
    Create refresh token.

    Args:
        subject: Token subject (username)

    Returns:
        JWT token
    """
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt
