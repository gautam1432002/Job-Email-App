from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Profile, Company, EmailLog
from unittest.mock import patch
from .encryption import set_credential

class APIIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='password123')
        
        # Profile is auto-created by signal on real login, or we create one
        self.profile, _ = Profile.objects.get_or_create(user=self.user)
        self.profile.full_name = "Test User"
        self.profile.role = "Software Engineer"
        self.profile.save()

        # Set encrypted credentials using the helper
        class DummySession(dict):
            modified = False

        class MockRequest:
            user = self.user
            session = DummySession()
        mock_req = MockRequest()
        
        set_credential(mock_req, self.profile, 'gmail_enc', 'test@example.com')
        set_credential(mock_req, self.profile, 'app_password_enc', 'secret_app_pw')
        set_credential(mock_req, self.profile, 'gemini_key_enc', 'fake_gemini_key')
        
        self.profile.gmail_configured = True
        self.profile.gemini_configured = True
        self.profile.save()

        self.company = Company.objects.create(
            user=self.user,
            name='Tech Corp',
            email='hr@techcorp.com'
        )

        # Authenticate client
        response = self.client.post('/api/v1/auth/token/', {'username': 'testuser', 'password': 'password123'})
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

    def test_get_profile(self):
        response = self.client.get('/api/v1/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], 'Test User')
        self.assertNotIn('gmail_enc', response.data)

    def test_update_profile(self):
        response = self.client.patch('/api/v1/auth/profile/', {'location': 'New York'})
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

    @patch('mailer.api_views.send_job_email')
    def test_send_email_success(self, mock_send):
        mock_send.return_value = (True, "Success msg")
        data = {
            'receiver_email': 'hr@techcorp.com',
            'company_name': 'Tech Corp',
            'subject': 'Hello',
            'html_body': '<p>This is a test</p>',
            'ai_used': False
        }
        response = self.client.post('/api/v1/compose/send/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(EmailLog.objects.count(), 1)
        self.assertEqual(EmailLog.objects.first().status, 'sent')

    @patch('mailer.api_views.send_job_email')
    def test_send_email_failure(self, mock_send):
        mock_send.return_value = (False, "SMTP Error")
        data = {
            'receiver_email': 'hr@techcorp.com',
            'company_name': 'Tech Corp',
            'subject': 'Hello',
            'html_body': '<p>This is a test</p>'
        }
        response = self.client.post('/api/v1/compose/send/', data)
        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
        self.assertEqual(EmailLog.objects.count(), 1)
        self.assertEqual(EmailLog.objects.first().status, 'failed')
        self.assertEqual(EmailLog.objects.first().error_message, 'SMTP Error')

    def test_unauthenticated_access(self):
        self.client.credentials() # Clear auth
        response = self.client.get('/api/v1/companies/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
