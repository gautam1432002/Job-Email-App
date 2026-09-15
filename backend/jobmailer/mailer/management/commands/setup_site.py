from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site


class Command(BaseCommand):
    help = 'Configure the Django Sites framework for local development'

    def handle(self, *args, **kwargs):
        site, created = Site.objects.get_or_create(id=1)
        site.domain = '127.0.0.1:8000'
        site.name   = 'JobMailer Local'
        site.save()
        self.stdout.write(self.style.SUCCESS(
            'Site configured: 127.0.0.1:8000 — Google OAuth will work correctly.'
        ))
