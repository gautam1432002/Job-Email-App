from .models import Profile


def user_context(request):
    """
    Injects user profile data into every template automatically.
    This means base.html and all templates always have:
      {{ user_profile }}, {{ user_avatar }}, {{ smtp_configured }}, etc.
    """
    if not request.user.is_authenticated:
        return {}

    profile = Profile.objects.filter(user=request.user).first()

    # Get Google profile picture safely
    avatar_url = None
    try:
        from allauth.socialaccount.models import SocialAccount
        social = SocialAccount.objects.filter(
            user=request.user, provider='google'
        ).first()
        if social:
            avatar_url = social.get_avatar_url()
    except Exception:
        pass

    return {
        'user_profile': profile,
        'user_avatar': avatar_url,
        'user_display_name': profile.display_name if profile else request.user.email,
        'user_initials': profile.initials if profile else '?',
        'smtp_configured': profile.gmail_configured if profile else False,
        'gemini_configured': profile.gemini_configured if profile else False,
        'resume_uploaded': bool(profile.resume) if profile else False,
    }
