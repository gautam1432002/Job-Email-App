from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Profile, Company, EmailLog
from unittest.mock import patch
from .encryption import set_credential, get_credential, decrypt_for_profile
import uuid


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
            email='hr@techcorp.com',
            notes='Initial outreach contact'
        )

        # Authenticate client using the frictionless UUID header system
        self.client.credentials(HTTP_X_PROFILE_ID=str(self.profile.id))

    def test_health_check(self):
        """Verify health check endpoint returns 200 OK and reports database status."""
        response = self.client.get('/api/v1/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json().get('status'), 'ok')
        self.assertEqual(response.json().get('database'), 'ok')

    def test_create_anonymous_profile(self):
        """Verify anonymous profile creation yields a unique hardware-anchored UUID."""
        unauthed_client = APIClient()
        response = unauthed_client.post('/api/v1/profiles/create/', {'profile_name': 'New Dev Profile'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        # Verify valid UUID
        created_uuid = uuid.UUID(response.data['id'])
        self.assertIsNotNone(created_uuid)

    def test_get_profile(self):
        """Verify candidate profile retrieval and confirm encrypted secrets are never leaked."""
        response = self.client.get('/api/v1/profiles/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], 'Test User')
        self.assertEqual(response.data['gmail_configured'], True)
        self.assertEqual(response.data['gemini_configured'], True)
        # Security check: encrypted blobs must not be exposed in serializer fields
        self.assertNotIn('gmail_enc', response.data)
        self.assertNotIn('app_password_enc', response.data)
        self.assertNotIn('gemini_key_enc', response.data)

    def test_update_profile(self):
        """Verify updating profile fields persists accurately to the database."""
        response = self.client.patch('/api/v1/profiles/me/', {
            'location': 'New York',
            'role': 'Senior Backend Engineer'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.location, 'New York')
        self.assertEqual(self.profile.role, 'Senior Backend Engineer')

    def test_update_credentials_encryption(self):
        """Verify credentials passed via PATCH are transparently encrypted with profile KDF."""
        response = self.client.patch('/api/v1/profiles/me/', {
            'gmail': 'newuser@gmail.com',
            'app_password': 'abcd efgh ijkl mnop',
            'gemini_key': 'AIzaSyNewKey123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        
        # Stored columns must NOT match plaintext
        self.assertNotEqual(self.profile.gmail_enc, 'newuser@gmail.com')
        self.assertNotEqual(self.profile.app_password_enc, 'abcd efgh ijkl mnop')
        self.assertNotEqual(self.profile.gemini_key_enc, 'AIzaSyNewKey123')
        
        # Decryption using helper must correctly reconstruct plaintext
        self.assertEqual(get_credential(self.profile, 'gmail_enc'), 'newuser@gmail.com')
        self.assertEqual(get_credential(self.profile, 'app_password_enc'), 'abcd efgh ijkl mnop')
        self.assertEqual(get_credential(self.profile, 'gemini_key_enc'), 'AIzaSyNewKey123')

    def test_encryption_isolation(self):
        """Verify that different profiles derive distinct keys and cannot cross-decrypt secrets."""
        other_profile = Profile.objects.create(profile_name="Other Profile")
        set_credential(other_profile, 'gmail_enc', 'other@example.com')
        other_profile.save()

        # Decrypting other_profile's ciphertext with self.profile key must fail gracefully
        cross_decrypt = decrypt_for_profile(self.profile, other_profile.gmail_enc)
        self.assertEqual(cross_decrypt, '')

    def test_create_and_list_companies(self):
        """Verify company creation and scoped listing."""
        data = {
            'name': 'Startup Inc',
            'email': 'jane@startup.com',
            'notes': 'Met at hackathon'
        }
        create_resp = self.client.post('/api/v1/companies/', data)
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Company.objects.filter(profile=self.profile).count(), 2)

        list_resp = self.client.get('/api/v1/companies/')
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_resp.data), 2)

    def test_company_detail_update_delete(self):
        """Verify single company retrieval, patch notes, and deletion."""
        # Retrieve
        get_resp = self.client.get(f'/api/v1/companies/{self.company.id}/')
        self.assertEqual(get_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(get_resp.data['name'], 'Tech Corp')

        # Update
        patch_resp = self.client.patch(f'/api/v1/companies/{self.company.id}/', {'notes': 'Updated recruiter note'})
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)
        self.company.refresh_from_db()
        self.assertEqual(self.company.notes, 'Updated recruiter note')

        # Delete
        del_resp = self.client.delete(f'/api/v1/companies/{self.company.id}/')
        self.assertEqual(del_resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Company.objects.filter(id=self.company.id).exists())

    def test_history_list_and_stage_update(self):
        """Verify email history listing and funnel status progression."""
        log = EmailLog.objects.create(
            profile=self.profile,
            receiver_email='recruiter@apple.com',
            company_name='Apple',
            theme_used='theme1',
            subject='Application for iOS Dev',
            status='sent',
            application_status='Applied'
        )

        list_resp = self.client.get('/api/v1/history/')
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_resp.data), 1)

        # Update funnel stage: Applied -> Interview
        patch_resp = self.client.patch(f'/api/v1/history/{log.id}/', {'application_status': 'Interview'})
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)
        log.refresh_from_db()
        self.assertEqual(log.application_status, 'Interview')

    def test_bulk_delete_history(self):
        """Verify multi-select batch deletion of email logs."""
        log1 = EmailLog.objects.create(profile=self.profile, receiver_email='a@co.com', company_name='A', subject='S1')
        log2 = EmailLog.objects.create(profile=self.profile, receiver_email='b@co.com', company_name='B', subject='S2')
        log3 = EmailLog.objects.create(profile=self.profile, receiver_email='c@co.com', company_name='C', subject='S3')

        delete_resp = self.client.delete('/api/v1/compose/history/bulk/', {'ids': [log1.id, log2.id]}, format='json')
        self.assertEqual(delete_resp.status_code, status.HTTP_204_NO_CONTENT)
        
        remaining = EmailLog.objects.filter(profile=self.profile).values_list('id', flat=True)
        self.assertNotIn(log1.id, remaining)
        self.assertNotIn(log2.id, remaining)
        self.assertIn(log3.id, remaining)

    def test_preview_email_theme(self):
        """Verify theme rendering endpoint produces HTML output."""
        data = {
            'company_name': 'Netflix',
            'receiver_email': 'jobs@netflix.com',
            'subject': 'Software Engineer Pitch',
            'html_body': 'Excited by high concurrency distributed microservices.',
            'theme_used': 'theme1',
            'ai_used': True
        }
        response = self.client.post('/api/v1/compose/preview/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('html', response.data)
        self.assertIn('Software Engineer Pitch', response.data['html'])
        self.assertIn('Excited by high concurrency', response.data['html'])

    @patch('mailer.api_views.draft_email')
    def test_generate_pitch(self, mock_draft):
        """Verify Gemini AI draft generation endpoint with mock."""
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

    @patch('threading.Thread')
    def test_send_email_success(self, mock_thread_cls):
        """Verify async dispatch creates an EmailLog and starts background worker thread."""
        mock_thread_instance = mock_thread_cls.return_value
        data = {
            'company_name': 'Stripe',
            'receiver_email': 'recruiting@stripe.com',
            'subject': 'Application — Backend Engineer',
            'html_body': 'Dear Stripe Team...',
            'theme_used': 'theme1',
            'ai_used': True
        }
        response = self.client.post('/api/v1/compose/send/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['status'], 'Email dispatch initiated')

        # Check that thread was spawned and started
        mock_thread_cls.assert_called_once()
        mock_thread_instance.start.assert_called_once()

        # Check that log was created in DB with status sending
        log_id = response.data['id']
        log = EmailLog.objects.get(id=log_id)
        self.assertEqual(log.company_name, 'Stripe')
        self.assertEqual(log.receiver_email, 'recruiting@stripe.com')
        self.assertEqual(log.status, 'sending')

    def test_unauthenticated_access(self):
        """Verify unauthenticated requests are rejected with 403 Forbidden."""
        self.client.credentials()  # Clear auth header
        response = self.client.get('/api/v1/companies/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
