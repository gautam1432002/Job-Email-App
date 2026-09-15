import base64
from functools import lru_cache
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from django.conf import settings
from .models import Profile


@lru_cache(maxsize=100)
def _derive_profile_key(profile_id: str) -> Fernet:
    """Derive a unique Fernet key for a specific profile. Cached to avoid PBKDF2 overhead."""
    raw = f"{settings.SECRET_KEY}|{profile_id}"
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b'jobmailer_v1_salt',
        iterations=100_000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(raw.encode('utf-8')))
    return Fernet(key)


def encrypt_for_profile(profile: Profile, plaintext: str) -> str:
    """Encrypt a plaintext string for a specific profile. Returns encrypted string."""
    if not plaintext or not plaintext.strip():
        return ''
    fernet = _derive_profile_key(str(profile.id))
    return fernet.encrypt(plaintext.encode('utf-8')).decode('utf-8')


def decrypt_for_profile(profile: Profile, encrypted: str) -> str:
    """Decrypt an encrypted string for a specific profile. Returns plaintext."""
    if not encrypted:
        return ''
    try:
        fernet = _derive_profile_key(str(profile.id))
        return fernet.decrypt(encrypted.encode('utf-8')).decode('utf-8')
    except Exception:
        return ''


def get_credential(profile: Profile, field_name: str) -> str:
    """
    Get a decrypted credential.
    Uses LRU cache inside _derive_profile_key to keep this fast without sessions.
    """
    encrypted = getattr(profile, field_name, '')
    if encrypted:
        return decrypt_for_profile(profile, encrypted)
    return ''


def set_credential(profile: Profile, field_name: str, plaintext: str):
    """
    Encrypt and save a credential to the profile model instance.
    Note: You must call profile.save() after this.
    """
    if not plaintext or not plaintext.strip():
        setattr(profile, field_name, '')
        return
    encrypted = encrypt_for_profile(profile, plaintext)
    setattr(profile, field_name, encrypted)
