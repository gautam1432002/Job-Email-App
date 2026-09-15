from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import Profile


@receiver(post_save, sender=User)
def auto_create_profile(sender, instance, created, **kwargs):
    """
    When a new user first signs in via Google, automatically create their
    Profile pre-filled with sensible defaults. They only need to review
    and update — never fill from scratch.
    """
    if created:
        Profile.objects.get_or_create(
            user=instance,
            defaults={
                'full_name': (
                    instance.get_full_name()
                    or instance.email.split('@')[0].title()
                ),
                'role': 'Software Developer / Backend Developer',
                'skills': 'Python, Django, REST APIs, JavaScript, HTML/CSS, SQL, Git, Linux',
                'about_me': (
                    'I am a passionate fresher software developer with hands-on '
                    'experience in Python and Django. I love building practical, '
                    'real-world applications and am eager to contribute to a '
                    'dynamic engineering team.'
                ),
                'grad_year': '',
            }
        )
