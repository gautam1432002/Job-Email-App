from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Profile, Company, EmailLog
from unittest.mock import patch
from .encryption import set_credential

class APIIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create a frictionless profile
        self.profile = Profile.objects.create(
            profile_name="Test Profile",
            full_name="Test User",
            role="Software Engineer"
        )

        # Set encrypted credentials
        set_credential(self.profile, 'gmail_enc', 'test@example.com')
        set_credential(self.profile, 'app_password_enc', 'secret_app_pw')
        set_credential(self.profile, 'gemini_key_enc', 'fake_gemini_key')
        
        self.profile.gmail_configured = True
        self.profile.gemini_configured = True
        self.profile.save()

        self.company = Company.objects.create(
            profile=self.profile,
            name='Tech Corp',
            email='hr@techcorp.com'
        )

        # Authenticate client using the new UUID system
        self.client.credentials(HTTP_X_PROFILE_ID=str(self.profile.id))

    def test_get_profile(self):
        response = self.client.get('/api/v1/profiles/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], 'Test User')
        self.assertNotIn('gmail_enc', response.data)

    def test_update_profile(self):
        response = self.client.patch('/api/v1/profiles/me/', {'location': 'New York'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.location, 'New York')

    def test_create_company(self):
        data = {
            'name': 'Startup Inc',
            'email': 'jane@startup.com'
        }
        response = self.client.post('/api/v1/companies/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Company.objects.count(), 2)

    @patch('mailer.api_views.draft_email')
    def test_generate_pitch(self, mock_draft):
        mock_draft.return_value = {
            "subject": "Mocked Subject",
            "full_body": "Mocked Body",
            "ai_used": True
        }
        data = {
            'company_name': 'Acme',
            'job_description': 'Need a backend dev'
        }
        response = self.client.post('/api/v1/compose/generate/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['subject'], "Mocked Subject")
        mock_draft.assert_called_once()

    def test_unauthenticated_access(self):
        self.client.credentials() # Clear auth header
        response = self.client.get('/api/v1/companies/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
