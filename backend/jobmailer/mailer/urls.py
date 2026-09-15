from django.urls import path
from . import views

urlpatterns = [
    # Auth routes (public — no login required)
    path('auth/login/',           views.login_page,    name='login'),
    path('auth/dev-login/',       views.dev_login_bypass, name='dev_login_bypass'),
    path('auth/logout/',          views.logout_view,   name='logout'),
    path('auth/setup-guide/',     views.setup_guide,   name='setup_guide'),

    # App routes (all require login)
    path('',                              views.compose,         name='compose'),
    path('preview/',                      views.preview_email,   name='preview'),
    path('send/',                         views.send_email,      name='send'),
    path('history/',                      views.history,         name='history'),
    path('history/delete/<int:pk>/',      views.delete_log,      name='delete_log'),
    path('companies/',                    views.company_book,    name='company_book'),
    path('companies/delete/<int:pk>/',    views.delete_company,  name='delete_company'),
    path('bulk/',                         views.bulk_send,       name='bulk_send'),
    path('profile/',                      views.profile_view,    name='profile'),
    path('settings/',                     views.settings_view,   name='settings'),

    # JSON API routes (all require login)
    path('api/personalize/',   views.api_personalize,  name='api_personalize'),
    path('api/draft-email/',   views.api_draft_email,  name='api_draft_email'),
    path('api/test-smtp/',     views.api_test_smtp,    name='api_test_smtp'),
]
