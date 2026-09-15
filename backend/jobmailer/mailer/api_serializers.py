from rest_framework import serializers
from .models import Profile, Company, EmailLog

class ProfileSerializer(serializers.ModelSerializer):
    gmail = serializers.CharField(write_only=True, required=False, allow_blank=True)
    app_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    gemini_key = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Profile
        fields = [
            'id', 'profile_name', 'full_name', 'phone', 'role', 'skills', 'experience_years',
            'location', 'college', 'grad_year', 'linkedin', 'github', 'portfolio',
            'about_me', 'gmail_configured', 'gemini_configured',
            'gmail', 'app_password', 'gemini_key'
        ]
        read_only_fields = ['id', 'gmail_configured', 'gemini_configured']

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'email', 'notes', 'added_at']
        read_only_fields = ['id', 'added_at']

class EmailLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailLog
        fields = '__all__'
        read_only_fields = ['id', 'profile', 'sent_at']

class GeneratePitchSerializer(serializers.Serializer):
    company_name = serializers.CharField(max_length=200)
    job_description = serializers.CharField(required=False, allow_blank=True)
    about_company = serializers.CharField(required=False, allow_blank=True)
    use_resume = serializers.BooleanField(default=True)

class SendEmailSerializer(serializers.Serializer):
    receiver_email = serializers.EmailField()
    company_name = serializers.CharField(max_length=200)
    subject = serializers.CharField(max_length=300)
    html_body = serializers.CharField()
    ai_used = serializers.BooleanField(default=False)
    theme_used = serializers.CharField(max_length=60, default='none')
