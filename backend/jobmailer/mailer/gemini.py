"""
JobMailer — Gemini AI Email Drafting Engine
============================================
This module handles the full intelligent email generation pipeline:
  1. Parse and understand the job description
  2. Match against developer profile
  3. Select the best narrative angle
  4. Draft a complete, professional email body

The output is a structured JSON with subject + full email body sections
that replace the entire email content — not just an opener.
"""

import json
import re


# ── DEFAULT FALLBACK ────────────────────────────────────────────────────────
def _build_default(company_name: str, profile) -> dict:
    """
    Returns a well-structured default email when Gemini is unavailable.
    Still better than a blank form — uses all profile data.
    """
    skills_top = ', '.join(profile.skills_list[:4]) if profile.skills_list else 'Python, Django'

    return {
        'subject': f'Application for {profile.role} — {profile.display_name}',
        'greeting': f'Dear Hiring Team at {company_name},',
        'hook': (
            f'I am writing to express my strong interest in a {profile.role} '
            f'position at {company_name}. Having researched your organization, '
            f'I am genuinely excited by the work your team is doing and believe '
            f'my background is a strong match for what you are looking for.'
        ),
        'body': (
            f'I am a {profile.grad_year} graduate from {profile.college} '
            f'with hands-on experience in {skills_top}. '
            f'Throughout my academic and project work, I have built and shipped '
            f'practical applications that demonstrate my ability to write clean, '
            f'maintainable code and collaborate effectively within engineering teams. '
            f'\n\n'
            f'{profile.about_me}'
        ),
        'why_company': (
            f'I am particularly drawn to {company_name} because of the calibre '
            f'of engineering challenges your team tackles. I am confident that '
            f'my skills in {skills_top} would allow me to contribute meaningfully '
            f'from day one, while continuing to grow alongside your team.'
        ),
        'closing': (
            f'I have attached my resume for your reference and would welcome '
            f'the opportunity to discuss how I can contribute to {company_name}. '
            f'Thank you for your time and consideration.'
        ),
        'sign_off': f'Warm regards,\n{profile.display_name}',
        'full_body': '',  # assembled below
        'jd_skills_matched': [],
        'angle_used': 'default',
        'ai_used': False,
    }


def _assemble_full_body(parts: dict) -> str:
    """
    Combine all email sections into a single full_body string.
    This is what gets inserted into the HTML email template.
    """
    sections = [
        parts.get('greeting', ''),
        '',
        parts.get('hook', ''),
        '',
        parts.get('body', ''),
        '',
        parts.get('why_company', ''),
        '',
        parts.get('closing', ''),
        '',
        parts.get('sign_off', ''),
    ]
    return '\n'.join(sections).strip()


# ── MAIN FUNCTION ────────────────────────────────────────────────────────────
def draft_email(
    company_name: str,
    job_description: str,
    about_company: str,
    profile,
    api_key: str,
    use_resume: bool = True
) -> dict:
    """
    Main AI email drafting function.

    Parameters:
        company_name     : Name of the target company
        job_description  : Full text of the job description (pasted by user)
        about_company    : Optional short note about the company from the user
        profile          : Django Profile model instance
        api_key          : Gemini API key (decrypted from session)

    Returns:
        dict with keys: subject, greeting, hook, body, why_company,
                        closing, sign_off, full_body, jd_skills_matched,
                        angle_used, ai_used
    """
    default = _build_default(company_name, profile)

    # ── Guard: no API key → return default immediately ──────────────────────
    if not api_key or not api_key.strip():
        default['full_body'] = _assemble_full_body(default)
        return default

    # ── Guard: no JD provided → use company-name-only mode ──────────────────
    has_jd = bool(job_description and job_description.strip() and len(job_description.strip()) > 30)

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key.strip())
        model = genai.GenerativeModel('gemini-1.5-flash')

        # ── Extract Resume Text ──────────────────────────────────────────────
        resume_text = ""
        if use_resume and profile.resume:
            try:
                import PyPDF2
                with open(profile.resume.path, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    resume_text = "\n".join(page.extract_text() for page in reader.pages if page.extract_text())
            except Exception as e:
                print(f"Failed to read resume PDF: {e}")

        # ── Build the mega-prompt ────────────────────────────────────────────
        if has_jd:
            prompt = _build_jd_prompt(
                company_name, job_description, about_company, profile, resume_text
            )
        else:
            prompt = _build_company_only_prompt(
                company_name, about_company, profile, resume_text
            )

        response = model.generate_content(prompt)
        raw = response.text.strip()

        # Strip markdown code fences if Gemini added them
        raw = re.sub(r'^```(?:json)?\s*', '', raw, flags=re.MULTILINE)
        raw = re.sub(r'```\s*$', '', raw, flags=re.MULTILINE)
        raw = raw.strip()

        data = json.loads(raw)

        # ── Validate all required keys exist ────────────────────────────────
        required = ['subject', 'greeting', 'hook', 'body',
                    'why_company', 'closing', 'sign_off']
        for key in required:
            if key not in data or not str(data[key]).strip():
                data[key] = default[key]

        # ── Assemble full_body from parts ────────────────────────────────────
        data['full_body'] = _assemble_full_body(data)
        data['ai_used'] = True
        data['jd_skills_matched'] = data.get('jd_skills_matched', [])
        data['angle_used'] = data.get('angle_used', 'domain_expert')

        return data

    except json.JSONDecodeError:
        # Gemini returned non-JSON — use default
        default['full_body'] = _assemble_full_body(default)
        return default

    except Exception:
        default['full_body'] = _assemble_full_body(default)
        return default


# ── PROMPT BUILDERS ──────────────────────────────────────────────────────────

def _build_jd_prompt(company_name, job_description, about_company, profile, resume_text="") -> str:
    """
    Full JD-aware prompt. This is the powerful path.
    Gemini reads the JD, matches it to the profile, picks an angle,
    and drafts the complete email.
    """
    skills_str = profile.skills
    about_str  = profile.about_me or (
        f"A passionate {profile.role} with experience in {', '.join(profile.skills_list[:4])}."
    )
    company_context = f"\nAbout the company (user's note): {about_company}" if about_company else ""
    resume_context = f"\n\n=== RESUME DETAILS (USE THIS FOR CONTEXT) ===\n{resume_text}" if resume_text else ""

    return f"""You are an expert career coach and professional email writer.
Your job is to write a complete, personalized job application email for a software developer.

You must follow a strict 4-step internal process before writing anything.
The output must be a single valid JSON object — nothing else.
No markdown. No explanation. No code fences. Just raw JSON.

=== DEVELOPER PROFILE ===
Name:            {profile.display_name}
Applying for:    {profile.role}
Skills:          {skills_str}
College:         {profile.college}
Graduation Year: {profile.grad_year}
LinkedIn:        {profile.linkedin or 'not provided'}
GitHub:          {profile.github or 'not provided'}
Portfolio:       {profile.portfolio or 'not provided'}
About me:        {about_str}{resume_context}

=== TARGET COMPANY ===
Company Name: {company_name}{company_context}

=== JOB DESCRIPTION ===
{job_description}

=== YOUR 4-STEP PROCESS (think through each step internally) ===

STEP 1 — ANALYSE THE JD:
  Read the job description above very carefully.
  Identify:
    - The exact role title
    - Required technical skills (must-have)
    - Preferred/bonus skills (nice-to-have)
    - Key responsibilities mentioned
    - Team or domain focus (e.g. backend, platform, data, mobile)
    - Any culture or personality signals (e.g. "fast-paced", "ownership mindset")
    - Seniority level expected
    - Specific tools, frameworks, or technologies named

STEP 2 — MATCH PROFILE TO JD:
  Compare the developer's skills against what the JD asks for.
  Find DIRECT matches (skill appears in both JD and profile — e.g. both mention Django).
  Find TRANSFER matches (related skills — e.g. JD says React, profile has JavaScript).
  Identify the developer's 2-3 STRONGEST selling points for THIS specific role.
  Note which JD requirements the developer does NOT have (to avoid over-promising).

STEP 3 — CHOOSE A NARRATIVE ANGLE:
  Based on the match analysis, pick the SINGLE best angle for the email:
    "domain_expert"  — Developer has direct skill matches. Lead with specific expertise.
    "builder"        — Developer has shipped projects. Lead with what they have built.
    "problem_solver" — JD mentions a specific challenge. Lead with how dev solves it.
    "fast_learner"   — Partial skill match. Lead with adaptability + closest skills.
    "culture_fit"    — Strong culture signal in JD. Lead with shared values + skills.
  Choose whichever angle makes this developer look BEST for this exact role.

STEP 4 — WRITE THE EMAIL:
  Write every section below with these rules:
    - Every sentence must reference EITHER a specific JD requirement OR a specific
      profile detail — never write generic filler sentences
    - Use the company name {{ company_name }} naturally (not repeatedly)
    - Match the tone to the company's culture signal (startup = casual-confident,
      enterprise = formal-professional, tech = direct-technical)
    - The hook must grab attention in the first 10 words
    - The body must show you read the JD (mention specific JD details)
    - why_company must be specific to THIS company — not a template
    - Total email should feel like a real person wrote it, not an AI

=== OUTPUT FORMAT ===
Return ONLY this JSON object with no extra text:

{{
  "subject": "compelling subject line under 12 words that mentions the role and/or company",
  "greeting": "Dear [appropriate salutation for {company_name}],",
  "hook": "1-2 sentences. Strong opening that immediately establishes the developer's value for THIS role. Reference the specific role from the JD.",
  "body": "2-3 paragraphs separated by \\n\\n. Paragraph 1: specific skills matched to JD requirements (name actual technologies from both JD and profile). Paragraph 2: relevant project experience or what the developer has built. Paragraph 3 (optional): growth, what excites them about this type of work.",
  "why_company": "1-2 sentences specific to {company_name}. Reference something real about the company (their product, their engineering, their domain) and why it genuinely appeals to this developer. Must NOT be generic.",
  "closing": "1-2 sentences. Professional closing that invites a conversation. Mention resume is attached.",
  "sign_off": "Warm regards,\\n{profile.display_name}",
  "jd_skills_matched": ["list", "of", "skills", "found", "in", "both", "JD", "and", "profile"],
  "angle_used": "one of: domain_expert / builder / problem_solver / fast_learner / culture_fit"
}}"""


def _build_company_only_prompt(company_name, about_company, profile, resume_text="") -> str:
    """
    Fallback prompt when no JD is provided — uses only company name.
    Still produces a full email, just less targeted than the JD version.
    """
    skills_str = profile.skills
    about_str  = profile.about_me or (
        f"A passionate {profile.role} with experience in {', '.join(profile.skills_list[:4])}."
    )
    company_context = f"Additional context about the company: {about_company}" if about_company else ""
    resume_context = f"\n\n=== RESUME DETAILS (USE THIS FOR CONTEXT) ===\n{resume_text}" if resume_text else ""

    return f"""You are an expert career coach and professional email writer.
Write a complete, personalized job application email for a software developer
applying to {company_name}.

No JD was provided. Use your knowledge of {company_name}'s industry, tech stack,
and engineering culture to write a relevant email.
{company_context}

=== DEVELOPER PROFILE ===
Name:            {profile.display_name}
Applying for:    {profile.role}
Skills:          {skills_str}
College:         {profile.college}
Graduation Year: {profile.grad_year}
About me:        {about_str}{resume_context}

=== RULES ===
- Use what you know about {company_name} to write specific, relevant content
- Reference actual things about {company_name} (their product, their domain, their tech)
- Match the developer's skills to what {company_name} likely needs
- Every sentence must be specific — no generic filler
- Write like a confident, articulate young developer — not a formal HR robot
- Total email length: professional but concise (not too short, not too long)

=== OUTPUT FORMAT ===
Return ONLY this JSON object:

{{
  "subject": "compelling subject line under 12 words",
  "greeting": "Dear Hiring Team at {company_name},",
  "hook": "1-2 sentences strong opening establishing value for a role at {company_name}",
  "body": "2-3 paragraphs separated by \\n\\n covering skills, experience, and enthusiasm",
  "why_company": "1-2 sentences specific to {company_name} — reference their actual product/domain",
  "closing": "Professional closing mentioning resume is attached",
  "sign_off": "Warm regards,\\n{profile.display_name}",
  "jd_skills_matched": [],
  "angle_used": "company_research"
}}"""
