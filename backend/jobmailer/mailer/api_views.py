import uuid
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.authentication import BaseAuthentication
from rest_framework.permissions import BasePermission
from rest_framework.exceptions import AuthenticationFailed
from django.shortcuts import get_object_or_404
from .models import Profile, Company, EmailLog
from .api_serializers import (
    ProfileSerializer, CompanySerializer, EmailLogSerializer,
    GeneratePitchSerializer, SendEmailSerializer
)
from .gemini import draft_email
from .smtp_send import send_job_email
from .encryption import get_credential, set_credential


class ProfileAuthentication(BaseAuthentication):
    """
    Custom authentication class that reads X-Profile-ID header.
    If valid, sets request.profile to the Profile instance.
    No JWT or User is used.
    """
    def authenticate(self, request):
        profile_id_str = request.headers.get('X-Profile-ID')
        if not profile_id_str:
            return None # Authentication not provided

        try:
            profile_id = uuid.UUID(profile_id_str)
            profile = Profile.objects.get(id=profile_id)
        except (ValueError, Profile.DoesNotExist):
            raise AuthenticationFailed('Invalid or missing Profile ID')

        request.profile = profile
        return (profile, None)


class IsProfileAuthenticated(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request, 'profile') and request.profile is not None


class ProfileCreateView(views.APIView):
    """Create a new local profile and return its UUID."""
    def post(self, request):
        profile_name = request.data.get('profile_name', 'My Profile')
        profile = Profile.objects.create(profile_name=profile_name)
        return Response({"id": str(profile.id), "profile_name": profile.profile_name}, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    authentication_classes = [ProfileAuthentication]
    permission_classes = [IsProfileAuthenticated]

    def get_object(self):
        return self.request.profile

    def perform_update(self, serializer):
        profile = serializer.save()
        # Handle credentials
        gmail = self.request.data.get('gmail')
        if gmail:
            set_credential(profile, 'gmail_enc', gmail)
            profile.gmail_configured = True

        app_password = self.request.data.get('app_password')
        if app_password:
            set_credential(profile, 'app_password_enc', app_password)
            profile.gmail_configured = True

        gemini_key = self.request.data.get('gemini_key')
        if gemini_key:
            set_credential(profile, 'gemini_key_enc', gemini_key)
            profile.gemini_configured = True
            
        profile.save()


class CompanyListCreateView(generics.ListCreateAPIView):
    serializer_class = CompanySerializer
    authentication_classes = [ProfileAuthentication]
    permission_classes = [IsProfileAuthenticated]

    def get_queryset(self):
        return Company.objects.filter(profile=self.request.profile).order_by('-added_at')

    def perform_create(self, serializer):
        serializer.save(profile=self.request.profile)


class CompanyRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CompanySerializer
    authentication_classes = [ProfileAuthentication]
    permission_classes = [IsProfileAuthenticated]

    def get_queryset(self):
        return Company.objects.filter(profile=self.request.profile)


class EmailLogListView(generics.ListAPIView):
    serializer_class = EmailLogSerializer
    authentication_classes = [ProfileAuthentication]
    permission_classes = [IsProfileAuthenticated]

    def get_queryset(self):
        return EmailLog.objects.filter(profile=self.request.profile).order_by('-sent_at')


class GeneratePitchView(views.APIView):
    authentication_classes = [ProfileAuthentication]
    permission_classes = [IsProfileAuthenticated]

    def post(self, request):
        serializer = GeneratePitchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            profile = request.profile
            if not profile.gemini_configured:
                return Response({"error": "Gemini API key not configured"}, status=status.HTTP_400_BAD_REQUEST)
                
            api_key = get_credential(profile, 'gemini_key_enc')
            if not api_key:
                return Response({"error": "Failed to decrypt Gemini API key"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            data = draft_email(
                company_name=serializer.validated_data['company_name'],
                job_description=serializer.validated_data.get('job_description', ''),
                about_company=serializer.validated_data.get('about_company', ''),
                profile=profile,
                api_key=api_key,
                use_resume=serializer.validated_data.get('use_resume', True)
            )
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SendEmailView(views.APIView):
    authentication_classes = [ProfileAuthentication]
    permission_classes = [IsProfileAuthenticated]

    def post(self, request):
        serializer = SendEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            profile = request.profile
            if not profile.gmail_configured:
                return Response({"error": "Gmail app password not configured"}, status=status.HTTP_400_BAD_REQUEST)
                
            sender_gmail = get_credential(profile, 'gmail_enc')
            app_password = get_credential(profile, 'app_password_enc')
            
            if not sender_gmail or not app_password:
                return Response({"error": "Failed to decrypt SMTP credentials"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            resume_path = profile.resume.path if (profile.resume and hasattr(profile.resume, 'path')) else None

            success, msg = send_job_email(
                receiver_email=serializer.validated_data['receiver_email'],
                subject=serializer.validated_data['subject'],
                html_body=serializer.validated_data['html_body'],
                sender_gmail=sender_gmail,
                app_password=app_password,
                resume_path=resume_path
            )
            
            # Log history
            EmailLog.objects.create(
                profile=profile,
                receiver_email=serializer.validated_data['receiver_email'],
                company_name=serializer.validated_data['company_name'],
                theme_used=serializer.validated_data['theme_used'],
                subject=serializer.validated_data['subject'],
                ai_used=serializer.validated_data['ai_used'],
                status='sent' if success else 'failed',
                error_message='' if success else msg
            )
            
            if success:
                return Response({"status": "Email sent successfully", "message": msg})
            else:
                return Response({"error": msg}, status=status.HTTP_502_BAD_GATEWAY)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
