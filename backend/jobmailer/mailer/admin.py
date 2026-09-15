from django.contrib import admin
from .models import Profile, EmailLog, Company


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display  = ['display_name', 'user_email', 'gmail_configured',
                     'gemini_configured', 'updated_at']
    search_fields = ['user__email', 'full_name', 'college']
    readonly_fields = ['gmail_enc', 'app_password_enc', 'gemini_key_enc',
                       'gmail_configured', 'gemini_configured', 'created_at', 'updated_at']

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Google Email'

    def display_name(self, obj):
        return obj.display_name
    display_name.short_description = 'Name'


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display   = ['user_email', 'company_name', 'receiver_email',
                      'theme_used', 'ai_used', 'status', 'sent_at']
    list_filter    = ['status', 'ai_used', 'theme_used']
    search_fields  = ['user__email', 'company_name', 'receiver_email', 'subject']
    readonly_fields = ['sent_at']

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display   = ['user_email', 'name', 'email', 'added_at']
    search_fields  = ['user__email', 'name', 'email']

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
