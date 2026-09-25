from django.urls import path
from .api_views import (
    ProfileCreateView, ProfileView, CompanyListCreateView, CompanyRetrieveUpdateDestroyView,
    EmailLogListView, EmailLogUpdateView, GeneratePitchView, SendEmailView, PreviewEmailView,
    EmailLogBulkDeleteView
)

urlpatterns = [
    path('profiles/create/', ProfileCreateView.as_view(), name='api-profile-create'),
    path('profiles/me/', ProfileView.as_view(), name='api-profile-me'),
    
    path('companies/', CompanyListCreateView.as_view(), name='api-company-list'),
    path('companies/<int:pk>/', CompanyRetrieveUpdateDestroyView.as_view(), name='api-company-detail'),
    
    path('history/', EmailLogListView.as_view(), name='api-email-history'),
    path('history/<int:pk>/', EmailLogUpdateView.as_view(), name='api-email-history-update'),
    path('compose/history/bulk/', EmailLogBulkDeleteView.as_view(), name='api-history-bulk-delete'),
    
    path('compose/generate/', GeneratePitchView.as_view(), name='api-generate-pitch'),
    path('compose/preview/', PreviewEmailView.as_view(), name='api-preview-email'),
    path('compose/send/', SendEmailView.as_view(), name='api-send-email'),
]
