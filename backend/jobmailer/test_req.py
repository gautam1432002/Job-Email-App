import os
import sys
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jobmailer.settings')
django.setup()

from mailer.models import Profile
profile = Profile.objects.first()

print("Testing space in email")
res = requests.post(f"http://127.0.0.1:8000/api/v1/compose/send/", json={
    "receiver_email": "hr@some company.com",
    "company_name": "Some Company",
    "subject": "Test",
    "html_body": "test",
    "ai_used": True,
    "theme_used": "default"
}, headers={"X-Profile-ID": str(profile.id)})
print(res.status_code, len(res.content), res.text)
