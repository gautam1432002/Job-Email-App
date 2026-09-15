import json
import time
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.contrib.auth import logout, login
from django.contrib.auth.decorators import login_required
from django.template.loader import render_to_string
from django.contrib.auth.models import User

def dev_login_bypass(request):
    """Bypasses Google Auth for local development."""
    test_user, _ = User.objects.get_or_create(username='dev_user', defaults={'email': 'dev@example.com'})
    login(request, test_user, backend='django.contrib.auth.backends.ModelBackend')
    return redirect('compose')

from .models import Profile, EmailLog, Company
from .encryption import get_credential, set_credential, clear_credentials_from_session
from .smtp_send import send_job_email
from .gemini import draft_email

THEMES = [
    {'id': 'theme1', 'name': 'Void Purple',      
     'desc': 'Dark terminal aesthetic, purple neon',
     'color': '#a78bfa', 'bg': '#0a0a0f',
     'template': 'themes/theme1_void_purple.html'},
    {'id': 'theme2', 'name': 'Editorial Ink',    
     'desc': 'Serif editorial, dark hero header',
     'color': '#44403c', 'bg': '#f5f5f0',
     'template': 'themes/theme2_editorial_ink.html'},
    {'id': 'theme3', 'name': 'Soft Bento',       
     'desc': 'Clean indigo, info cards, versatile',
     'color': '#6366f1', 'bg': '#f8fafc',
     'template': 'themes/theme3_soft_bento.html'},
    {'id': 'theme4', 'name': 'Neobrutalist',     
     'desc': 'Bold orange, bento grid, unforgettable',
     'color': '#f97316', 'bg': '#fafaf9',
     'template': 'themes/theme4_neobrutalist.html'},
    {'id': 'theme5', 'name': 'Newsletter Dark',  
     'desc': 'Dev newsletter layout, ultra unique',
     'color': '#ef4444', 'bg': '#0f0f0f',
     'template': 'themes/theme5_newsletter_dark.html'},
    {'id': 'theme6', 'name': 'Minimal Resume',   
     'desc': 'GitHub portfolio vibe, zinc palette',
     'color': '#22c55e', 'bg': '#fafafa',
     'template': 'themes/theme6_minimal_resume.html'},
]

THEME_MAP = {t['id']: t for t in THEMES}


def get_profile(user):
    profile, _ = Profile.objects.get_or_create(
        user=user,
        defaults={
            'full_name': user.get_full_name() or user.email.split('@')[0].title(),
            'role': 'Software Developer / Backend Developer',
            'skills': 'Python, Django, REST APIs, JavaScript, HTML/CSS, SQL, Git',
        }
    )
    return profile


def get_creds(request, profile):
    """Return decrypted credentials dict. Never stored plaintext anywhere."""
    return {
        'gmail': get_credential(request, 'gmail_enc', profile) or request.user.email,
        'app_password': get_credential(request, 'app_password_enc', profile),
        'gemini_key': get_credential(request, 'gemini_key_enc', profile),
    }


def login_page(request):
    if request.user.is_authenticated:
        return redirect('compose')
    return render(request, 'auth/login.html')


@login_required
def logout_view(request):
    clear_credentials_from_session(request)
    logout(request)
    return redirect('login')


def setup_guide(request):
    return render(request, 'auth/setup_guide.html')


@login_required
def compose(request):
    profile = get_profile(request.user)
    creds = get_creds(request, profile)
    companies = Company.objects.filter(user=request.user).order_by('name')
    sent_emails = set(
        EmailLog.objects.filter(user=request.user, status='sent')
        .values_list('receiver_email', flat=True)
    )
    context = {
        'themes': THEMES,
        'companies': companies,
        'sent_emails_json': json.dumps(list(sent_emails)),
        'has_smtp': bool(creds['app_password']),
        'has_gemini': bool(creds['gemini_key']),
        'sender_email': creds['gmail'],
        'profile': profile,
        'default_subject': f"Application for {profile.role} Position",
        'default_opening': (
            f"I am reaching out to express my interest in a software development "
            f"role at your organization. With expertise in "
            f"{', '.join(profile.skills_list[:3])}, I am confident in my ability "
            f"to contribute effectively to your engineering team."
        ),
    }
    return render(request, 'pages/compose.html', context)


@login_required
def preview_email(request):
    if request.method == 'POST':
        theme_id   = request.POST.get('theme_id', 'theme1')
        company    = request.POST.get('company_name', 'the Company')
        subject    = request.POST.get('subject', '')
        opening    = request.POST.get('opening_paragraph', '')
        profile    = get_profile(request.user)
        theme      = THEME_MAP.get(theme_id, THEME_MAP['theme1'])
        html       = render_to_string(theme['template'], {
                         'profile': profile,
                         'company_name': company,
                         'subject': subject,
                         'opening_paragraph': opening,
                         'skills_list': profile.skills_list,
                     })
        return HttpResponse(html)
    return HttpResponse("")


@login_required
def send_email(request):
    if request.method == 'POST':
        data           = json.loads(request.body)
        receiver       = data.get('receiver_email', '').strip()
        company        = data.get('company_name', '').strip() or (receiver.split('@')[1].split('.')[0].title() if '@' in receiver else '')
        theme_id       = data.get('theme_id', 'theme1')
        subject        = data.get('subject', '').strip()
        opening        = data.get('opening_paragraph', '').strip()
        full_body      = data.get('full_body', '').strip()
        add_to_book    = data.get('add_to_book', False)
        force_send     = data.get('force_send', False)
        ai_used        = data.get('ai_used', False)

        if not receiver:
            return JsonResponse({'success': False, 'message': 'Receiver email is required.'})

        already_sent = EmailLog.objects.filter(
            user=request.user, receiver_email=receiver, status='sent'
        ).exists()
        if already_sent and not force_send:
            return JsonResponse({
                'success': False,
                'duplicate': True,
                'message': f'You already sent an email to {receiver}. Send again?'
            })

        if add_to_book:
            Company.objects.get_or_create(
                user=request.user, email=receiver,
                defaults={'name': company}
            )

        profile = get_profile(request.user)
        creds   = get_creds(request, profile)
        theme   = THEME_MAP.get(theme_id, THEME_MAP['theme1'])

        html_body = render_to_string(theme['template'], {
            'profile': profile,
            'company_name': company,
            'subject': subject,
            'opening_paragraph': full_body if full_body else opening,
            'skills_list': profile.skills_list,
        })

        resume_path = profile.resume.path if profile.resume else None

        success, message = send_job_email(
            receiver, subject, html_body,
            creds['gmail'], creds['app_password'], resume_path
        )

        EmailLog.objects.create(
            user=request.user,
            receiver_email=receiver,
            company_name=company,
            theme_used=theme_id,
            subject=subject,
            opening_para=opening,
            ai_used=bool(ai_used),
            status='sent' if success else 'failed',
            error_message='' if success else message,
        )

        if success:
            return JsonResponse({'success': True, 'message': f'Email sent to {receiver}!'})
        
        hint = message
        if message == 'AUTH_ERROR':
            hint = ('Gmail authentication failed. '
                     'Check your App Password in Settings → '
                     'myaccount.google.com/security → App Passwords')
        return JsonResponse({'success': False, 'message': hint})
    return JsonResponse({'success': False, 'message': 'Invalid request'})


@login_required
def api_personalize(request):
    """
    Legacy endpoint — now calls the full draft_email function.
    Kept for backward compatibility with the compose page JS.
    Accepts company_name only (no JD) for the quick-typing trigger.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)

    data         = json.loads(request.body)
    company_name = data.get('company_name', '').strip()
    about_company = data.get('about_company', '').strip()

    if not company_name:
        return JsonResponse({'error': 'Company name required'}, status=400)

    profile = get_profile(request.user)
    creds   = get_creds(request, profile)

    result = draft_email(
        company_name    = company_name,
        job_description = '',         # no JD in quick mode
        about_company   = about_company,
        profile         = profile,
        api_key         = creds['gemini_key']
    )

    return JsonResponse(result)


@login_required
def api_draft_email(request):
    """
    Full JD-powered email drafting endpoint.
    This is the main new AI feature — user pastes a job description
    and Gemini reads it, matches against profile, and drafts the
    complete email body with all sections.

    POST body (JSON):
        company_name     : string (required)
        job_description  : string (the full JD text — can be long)
        about_company    : string (optional user note about the company)

    Response (JSON):
        subject          : string
        greeting         : string
        hook             : string
        body             : string (multi-paragraph)
        why_company      : string
        closing          : string
        sign_off         : string
        full_body        : string (all sections assembled)
        jd_skills_matched: list of strings
        angle_used       : string
        ai_used          : boolean
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)

    data            = json.loads(request.body)
    company_name    = data.get('company_name', '').strip()
    job_description = data.get('job_description', '').strip()
    about_company   = data.get('about_company', '').strip()
    extract_resume  = data.get('extract_resume', True)

    if not company_name:
        return JsonResponse({'error': 'Company name is required.'}, status=400)

    if not job_description:
        return JsonResponse({
            'error': 'Please paste the job description to use full AI drafting.'
        }, status=400)

    profile = get_profile(request.user)
    creds   = get_creds(request, profile)

    if not creds['gemini_key']:
        return JsonResponse({
            'error': 'Gemini API key not configured.',
            'hint': 'Add your free Gemini API key in Settings to use AI drafting.'
        }, status=400)

    result = draft_email(
        company_name    = company_name,
        job_description = job_description,
        about_company   = about_company,
        profile         = profile,
        api_key         = creds['gemini_key'],
        use_resume      = extract_resume
    )

    return JsonResponse(result)


@login_required
def api_test_smtp(request):
    if request.method == 'POST':
        profile = get_profile(request.user)
        creds   = get_creds(request, profile)
        if not creds['app_password']:
            return JsonResponse({
                'success': False,
                'message': 'App Password not configured. Add it in Settings first.'
            })
        test_html = """
        <div style="font-family:sans-serif;max-width:500px;margin:40px auto;
                     padding:30px;border:1px solid #e5e7eb;border-radius:12px">
          <h2 style="color:#6366f1">JobMailer SMTP Test</h2>
          <p>This is a test email from your JobMailer application.</p>
          <p style="color:#6b7280">Your Gmail SMTP is configured correctly!</p>
        </div>"""
        success, msg = send_job_email(
            creds['gmail'], 'JobMailer — SMTP Test',
            test_html, creds['gmail'], creds['app_password']
        )
        return JsonResponse({'success': success, 'message': msg})
    return JsonResponse({'error': 'Invalid request'})


@login_required
def history(request):
    status_filter = request.GET.get('status', 'all')
    logs = EmailLog.objects.filter(user=request.user)
    if status_filter in ('sent', 'failed'):
        logs = logs.filter(status=status_filter)
    stats = {
        'total':  EmailLog.objects.filter(user=request.user).count(),
        'sent':   EmailLog.objects.filter(user=request.user, status='sent').count(),
        'failed': EmailLog.objects.filter(user=request.user, status='failed').count(),
    }
    context = {
        'logs': logs,
        'stats': stats,
        'status_filter': status_filter,
        'THEMES': THEMES,
    }
    return render(request, 'pages/history.html', context)


@login_required
def delete_log(request, pk):
    EmailLog.objects.filter(pk=pk, user=request.user).delete()
    return redirect('history')


@login_required
def company_book(request):
    if request.method == 'POST':
        data  = json.loads(request.body)
        name  = data.get('name', '').strip()
        email = data.get('email', '').strip()
        notes = data.get('notes', '').strip()
        if not name or not email:
            return JsonResponse({'success': False, 'message': 'Name and email required.'})
        obj, created = Company.objects.get_or_create(
            user=request.user, email=email,
            defaults={'name': name, 'notes': notes}
        )
        if not created:
            return JsonResponse({'success': False, 'message': 'This email already exists in your book.'})
        return JsonResponse({'success': True, 'message': f'{name} added.'})

    companies = Company.objects.filter(user=request.user)
    sent_emails = set(
        EmailLog.objects.filter(user=request.user, status='sent')
        .values_list('receiver_email', flat=True)
    )
    company_data = []
    for c in companies:
        company_data.append({
            'obj': c,
            'already_emailed': c.email in sent_emails,
        })
    return render(request, 'pages/company_book.html', {'company_data': company_data})


@login_required
def delete_company(request, pk):
    if request.method == "POST" or request.method == "DELETE":
        Company.objects.filter(pk=pk, user=request.user).delete()
        return JsonResponse({'success': True})
    return JsonResponse({'success': False})


@login_required
def bulk_send(request):
    profile = get_profile(request.user)
    if request.method == 'GET':
        context = {
            'THEMES': THEMES,
            'profile': profile,
        }
        return render(request, 'pages/bulk_send.html', context)

    if request.method == 'POST':
        data     = json.loads(request.body)
        emails   = [e.strip() for e in data.get('emails', '').splitlines() if e.strip()]
        names    = [n.strip() for n in data.get('company_names', '').splitlines()]
        theme_id = data.get('theme_id', 'theme1')
        delay    = min(max(int(data.get('delay', 30)), 5), 120)

        creds    = get_creds(request, profile)
        theme    = THEME_MAP.get(theme_id, THEME_MAP['theme1'])
        results  = []

        for i, email in enumerate(emails):
            company = names[i] if i < len(names) and names[i] else (email.split('@')[1].split('.')[0].title() if '@' in email else '')
            subject = f"Application for {profile.role} at {company}"
            opening = (
                f"I am excited to apply for a software development opportunity "
                f"at {company}. With expertise in "
                f"{', '.join(profile.skills_list[:2])}, I look forward to "
                f"contributing to your team."
            )
            html_body = render_to_string(theme['template'], {
                'profile': profile, 'company_name': company,
                'subject': subject, 'opening_paragraph': opening,
                'skills_list': profile.skills_list,
            })
            resume_path = profile.resume.path if profile.resume else None
            success, message = send_job_email(
                email, subject, html_body,
                creds['gmail'], creds['app_password'], resume_path
            )
            EmailLog.objects.create(
                user=request.user, receiver_email=email,
                company_name=company, theme_used=theme_id,
                subject=subject, ai_used=False,
                status='sent' if success else 'failed',
                error_message='' if success else message,
            )
            results.append({
                'email': email, 'company': company,
                'success': success,
                'message': 'Sent' if success else message
            })
            if i < len(emails) - 1:
                time.sleep(delay)

        sent_count   = sum(1 for r in results if r['success'])
        failed_count = len(results) - sent_count
        return JsonResponse({
            'results': results,
            'summary': f'{sent_count} sent, {failed_count} failed'
        })


@login_required
def profile_view(request):
    profile = get_profile(request.user)
    context = {'p': profile}

    if request.method == 'POST':
        email_val = request.POST.get('email', '').strip()
        if email_val:
            profile.user.email = email_val
            profile.user.save()
            
        profile.full_name  = request.POST.get('full_name', profile.full_name).strip()
        profile.phone      = request.POST.get('phone', profile.phone).strip()
        profile.role       = request.POST.get('target_role', profile.role).strip()
        profile.skills     = request.POST.get('skills', profile.skills).strip()
        profile.location   = request.POST.get('location', profile.location).strip()
        profile.experience_years = request.POST.get('experience_years', profile.experience_years).strip()
        profile.college    = request.POST.get('college', profile.college).strip()
        profile.grad_year  = request.POST.get('grad_year', profile.grad_year).strip()
        profile.linkedin   = request.POST.get('linkedin_url', profile.linkedin).strip()
        profile.github     = request.POST.get('github_url', profile.github).strip()
        profile.portfolio  = request.POST.get('portfolio_url', profile.portfolio).strip()
        
        if 'resume' in request.FILES:
            profile.resume = request.FILES['resume']
            
        profile.save()
        context['success_msg'] = 'Profile saved successfully!'

    return render(request, 'pages/profile.html', context)


@login_required
def settings_view(request):
    profile = get_profile(request.user)
    context = {}

    if request.method == 'POST':
        u = request.POST.get('gmail_user', '').strip()
        p = request.POST.get('gmail_app_pwd', '').strip()
        k = request.POST.get('gemini_api_key', '').strip()

        if u:
            set_credential(request, profile, 'gmail_enc', u)
        if p:
            set_credential(request, profile, 'app_password_enc', p)
        if k:
            set_credential(request, profile, 'gemini_key_enc', k)

        # Update flags based on whether they have credentials
        profile.gmail_configured = bool(u and p)
        profile.gemini_configured = bool(k)
        profile.save()
        context['success_msg'] = 'Configuration saved securely!'

    creds = get_creds(request, profile)
    context.update({
        'gmail_configured': profile.gmail_configured,
        'gemini_configured': profile.gemini_configured,
        'resume_uploaded': bool(profile.resume),
        'gmail_user': get_credential(request, 'gmail_enc', profile) or '', # Don't auto-fill user's email if unset
        'gmail_app_pwd': creds['app_password'] or '',
        'gemini_api_key': creds['gemini_key'] or '',
    })
    return render(request, 'pages/settings.html', context)
