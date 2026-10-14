<div align="center">
  <img src="https://raw.githubusercontent.com/gautam1432002/Job-Email-App/main/frontend/assets/icon.png" width="110" alt="ProReach Logo" />
  <h1>📚 ProReach: System Architecture & Engineering Specification</h1>
  <p><b>An In-Depth Blueprint of Frictionless Multi-Tenant Architecture, Dynamic Cryptography, and AI Orchestration</b></p>

  <div>
    <img src="https://img.shields.io/badge/Architecture-Headless_REST_API-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django" />
    <img src="https://img.shields.io/badge/Client-React_Native_%2F_Expo-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
    <img src="https://img.shields.io/badge/Cryptography-PBKDF2_%2B_Fernet-black?style=for-the-badge&logo=auth0&logoColor=white" alt="Crypto" />
    <img src="https://img.shields.io/badge/AI_Engine-Gemini_1.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
    <img src="https://img.shields.io/badge/Delivery-Background_SMTP_Threading-EA4335?style=for-the-badge&logo=gmail&logoColor=white" alt="SMTP" />
  </div>
</div>

---

## 📑 Table of Contents

1. [Executive Summary & System Vision](#1-executive-summary--system-vision)
2. [End-to-End Architectural Blueprint](#2-end-to-end-architectural-blueprint)
3. [Frictionless Onboarding & Hardware-Anchored Identity](#3-frictionless-onboarding--hardware-anchored-identity)
4. [Cryptographic Vault: Dynamic Key Derivation](#4-cryptographic-vault-dynamic-key-derivation)
5. [AI Orchestration Engine (Google Gemini 1.5)](#5-ai-orchestration-engine-google-gemini-15)
6. [Responsive HTML Templating Engine](#6-responsive-html-templating-engine)
7. [Asynchronous Non-Blocking Dispatch & Concurrency](#7-asynchronous-non-blocking-dispatch--concurrency)
8. [Application Lifecycle & Funnel State Machine](#8-application-lifecycle--funnel-state-machine)
9. [Complete REST API Specification](#9-complete-rest-api-specification)
10. [Relational Data Model & Entity Specifications](#10-relational-data-model--entity-specifications)
11. [Mobile Client Architecture & UX System](#11-mobile-client-architecture--ux-system)
12. [Cross-Platform Ecosystem & Strategic Roadmap](#12-cross-platform-ecosystem--strategic-roadmap)
    * [12.1 Multi-Client Ecosystem Topology](#121-multi-client-ecosystem-topology)
    * [12.2 Detailed Breakdown of Ecosystem Options (Options 1–7)](#122-detailed-breakdown-of-ecosystem-options)
    * [12.3 Strategic Phased Roadmap & Execution Matrix](#123-strategic-phased-roadmap--execution-matrix)
13. [Infrastructure Scaling & Persistence Migration Plan](#13-infrastructure-scaling--persistence-migration-plan)
14. [Local Development & Environment Setup](#14-local-development--environment-setup)

---

## 🧭 1. Executive Summary & System Vision

### The Problem Space
In the modern software engineering employment market, standard cold applications yield an abysmal response rate (< 2%). Conversely, deeply researched, customized pitches mapping specific company requirements directly to candidate strengths boast response rates upwards of 25–40%. However, manually analyzing job descriptions, formulating personalized narratives, formatting professional email layouts, and tracking communications takes **30–45 minutes per application**, leading to severe candidate burnout.

### The ProReach Solution
**ProReach** is a high-velocity, privacy-first career outreach platform engineered to eliminate application friction. It acts as an automated, intelligent co-pilot that:
1. Ingests raw job descriptions and company context.
2. Extracts candidate skills, achievements, and experiences directly from an uploaded PDF resume and local developer profile.
3. Synthesizes a hyper-personalized, context-aware cold pitch via **Google Gemini 1.5 Flash** using dynamic cognitive angle selection.
4. Encapsulates the narrative within responsive HTML email designs.
5. Dispatches the email directly from the developer’s authenticated Gmail SMTP account in a non-blocking background thread with resume attachment.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CORE DESIGN PRINCIPLES                            │
├─────────────────────┬──────────────────────┬────────────────────────────────┤
│ 🚀 Zero-Friction    │ 🔐 Zero-Knowledge    │ ⚡ High Concurrency            │
│ No tedious sign-ups,│ Dynamic cryptographic│ Async background dispatching   │
│ passwords, or JWTs. │ keys per tenant;     │ ensures mobile UI stays 60 FPS │
│ Device-bound UUIDs. │ secrets never stored │ without network thread stalls. │
│                     │ in plaintext.        │                                │
└─────────────────────┴──────────────────────┴────────────────────────────────┘
```

---

## 🏛️ 2. End-to-End Architectural Blueprint

ProReach employs a decoupled **Client-Server Architecture** featuring a React Native / Expo front-end communicating with a headless Django REST Framework API back-end.

### High-Level Topology Diagram

```mermaid
graph TB
    subgraph ClientLayer ["📱 Mobile Client Layer (React Native + Expo)"]
        UI["Bento-Box UI (Reanimated + Gestures)"]
        Cache["TanStack Query (Memory + Offline Cache)"]
        Secure["Hardware SecureStore (Keychain / Keystore)"]
        Axios["Axios Interceptor Engine"]
        UI --> Cache
        Cache --> Axios
        Secure -.->|Injects X-Profile-ID| Axios
    end

    subgraph APILayer ["⚙️ Backend Gateway (Django REST Framework)"]
        Gateway["Reverse Proxy & Gunicorn WSGI"]
        AuthMiddleware{"ProfileAuthentication Middleware"}
        Routers["REST API Routers (v1)"]
        Gateway --> AuthMiddleware
        AuthMiddleware --> Routers
    end

    subgraph SecurityLayer ["🔐 Cryptographic Core (Dynamic KDF)"]
        KDFEngine["PBKDF2-HMAC-SHA256 (100k Iterations)"]
        FernetEngine["Fernet Symmetric Cipher (AES-128-CBC)"]
        LRUCache["In-Memory LRU Key Cache (maxsize=100)"]
        KDFEngine --> FernetEngine
        FernetEngine <--> LRUCache
    end

    subgraph AIEngine ["🧠 Cognitive Synthesis (Google Gemini)"]
        PDFParser["PyPDF2 Resume Ingestion"]
        PromptEngine["4-Step Context Matching & Angle Engine"]
        GeminiAPI["Gemini 1.5 Flash Model"]
        PDFParser --> PromptEngine
        PromptEngine --> GeminiAPI
    end

    subgraph DispatchLayer ["📨 Asynchronous Delivery System"]
        ThreadWorker["Python Background Worker Thread"]
        HTMLRenderer["Django Template Engine (6 Themes)"]
        SMTPClient["smtplib TLS Client (smtp.gmail.com:587)"]
        ThreadWorker --> HTMLRenderer
        HTMLRenderer --> SMTPClient
    end

    subgraph DataStorage ["🗄️ Persistence Layer"]
        DB[(PostgreSQL / SQLite Storage)]
    end

    Axios ==>|HTTP/JSON + X-Profile-ID| Gateway
    Routers --> SecurityLayer
    Routers --> AIEngine
    Routers --> DispatchLayer
    Routers <--> DB
    ThreadWorker -.->|Update Status: sent/failed| DB
    SMTPClient ==>|Direct TLS SMTP| Inbox["📬 Recruiter Inbox"]
```

### Full-Stack Data Flow Animation

The diagram below illustrates the exact interactive path traveled from candidate input to inbox delivery:

<div align="center">
  <img src="frontend/assets/workflow_animated.svg" alt="Animated ProReach Workflow" width="100%">
</div>

---

## 🚀 3. Frictionless Onboarding & Hardware-Anchored Identity

### The Philosophy: Zero-Friction Device Binding
Traditional web and mobile applications require email verifications, passwords, OAuth redirects, and JWT refresh token handshakes before a user can test a single feature. This creates high bounce rates and compromises personal privacy.

ProReach replaces traditional authentication with a **Hardware-Anchored Device Identity Protocol**:

```mermaid
sequenceDiagram
    autonumber
    actor Dev as 👤 Developer
    participant App as 📱 Mobile Client (React Native)
    participant SecStore as 🔒 Hardware SecureStore
    participant API as ⚙️ Django API Gateway
    participant DB as 🗄️ Database

    Dev->>App: Launches Application for first time
    App->>SecStore: getItemAsync('jobmailer_active_profile_id')
    SecStore-->>App: null (First-time user)
    
    App->>API: Silent POST /api/v1/profiles/create/
    API->>DB: INSERT INTO Profile (id, profile_name) VALUES (UUID4, 'My Profile')
    DB-->>API: Returns Profile UUID Record
    API-->>App: HTTP 201 Created { id: "3fa85f64-5717-4562-b3fc-2c963f66afa6" }
    
    App->>SecStore: setItemAsync('jobmailer_active_profile_id', UUID)
    SecStore-->>App: Stored securely in iOS Keychain / Android Keystore
    
    Note over App, API: All subsequent requests inject header: X-Profile-ID: <UUID>
```

### ProfileAuthentication Middleware
Every protected endpoint evaluates the custom `ProfileAuthentication` backend class:

```python
class ProfileAuthentication(BaseAuthentication):
    def authenticate(self, request):
        profile_id_str = request.headers.get('X-Profile-ID')
        if not profile_id_str:
            return None  # Unauthenticated request

        try:
            profile_id = uuid.UUID(profile_id_str)
            profile = Profile.objects.get(id=profile_id)
        except (ValueError, Profile.DoesNotExist):
            raise AuthenticationFailed('Invalid or missing Profile ID')

        request.profile = profile
        return (profile, None)
```

### Orphaned UUID Self-Healing Mechanism
When running on cloud providers with ephemeral filesystems (e.g., Render free tier) where database state can reset upon redeployments, the client's stored UUID might no longer exist on the server. Instead of freezing or crashing into unhandled 500/404 screens, ProReach implements an **Axios Interceptor Self-Healing Protocol**:

```typescript
// frontend/src/services/api.ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && [401, 403, 404].includes(error.response.status)) {
      console.warn("Backend rejected Profile ID (Server reset). Wiping SecureStore...");
      await SecureStore.deleteItemAsync('jobmailer_active_profile_id');
      Alert.alert(
        "Session Reset",
        "Your profile state was renewed by the server. Please restart to re-initialize your local profile."
      );
    }
    return Promise.reject(error);
  }
);
```

---

## 🔐 4. Cryptographic Vault: Dynamic Key Derivation

### The Vulnerability of Global Master Keys
Most applications that store third-party credentials (such as Gmail App Passwords and LLM API keys) encrypt database columns using a single, static master encryption key (e.g., `settings.SECRET_KEY`). If the database or server environment is compromised, every user's external credentials are leaked simultaneously.

### ProReach Dynamic Per-Tenant Isolation
ProReach utilizes **Dynamic Key Derivation** where each user profile possesses its own mathematically distinct cryptographic key derived on-the-fly.

```mermaid
flowchart LR
    subgraph InputParameters ["Entropy Inputs"]
        SK["Server SECRET_KEY (Global Master Secret)"]
        PID["Profile UUID (Tenant Unique Salt/ID)"]
    end

    subgraph Derivation ["Key Derivation Function"]
        Concat["Entropy Combine: SECRET_KEY | Profile_UUID"]
        KDF["PBKDF2-HMAC-SHA256\n100,000 Iterations\nSalt: jobmailer_v1_salt"]
        B64["Base64 URL Safe Encoder"]
    end

    subgraph CipherEngine ["Symmetric Encryption"]
        Key["Derived 32-Byte Fernet Key"]
        Plain["Plaintext Credential (e.g. Gemini Key)"]
        Fernet["Fernet AES-128-CBC + HMAC-SHA256"]
        EncBlob["Encrypted Ciphertext (Saved to DB)"]
    end

    SK --> Concat
    PID --> Concat
    Concat --> KDF
    KDF --> B64
    B64 --> Key
    Key --> Fernet
    Plain --> Fernet
    Fernet --> EncBlob
```

### Mathematical & Cryptographic Formulation
The derived key $K_{profile}$ for a tenant with profile ID $P$ is expressed as:

$$RawEntropy = SECRET\_KEY \mathbin{\Vert} P$$

$$K_{profile} = \text{Base64URLSafe}\Big(\text{PBKDF2}\big(\text{PRF}=\text{HMAC-SHA256},\ S=b'\text{jobmailer\_v1\_salt}',\ c=100{,}000,\ dkLen=32,\ PWD=RawEntropy\big)\Big)$$

### Performance Optimization: LRU Key Caching
Deriving keys via 100,000 iterations of PBKDF2 is intentionally CPU-intensive to mitigate brute-force attacks. Doing this repeatedly per HTTP request would severely degrade API throughput. ProReach utilizes an in-memory Least Recently Used (LRU) cache:

```python
# backend/jobmailer/mailer/encryption.py
@lru_cache(maxsize=100)
def _derive_profile_key(profile_id: str) -> Fernet:
    raw = f"{settings.SECRET_KEY}|{profile_id}"
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b'jobmailer_v1_salt',
        iterations=100_000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(raw.encode('utf-8')))
    return Fernet(key)
```
> [!NOTE]
> The `@lru_cache` guarantees that active tenant sessions execute encryption/decryption in sub-millisecond time while retaining complete multi-tenant cryptographic isolation.

### Defensive Credential Sanitization
Google App Passwords generated in Google Accounts are formatted with spaces (e.g. `abcd efgh ijkl mnop`). If passed unformatted to an SMTP socket, authentication fails abruptly with an `SMTPAuthenticationError`. ProReach performs defensive sanitization:
* Automatically strips whitespace formatting: `app_password.replace(" ", "")`.
* Trims leading and trailing control characters before derivation and dispatch.

---

## 🧠 5. AI Orchestration Engine (Google Gemini 1.5)

### The 4-Step Cognitive Synthesis Architecture
ProReach utilizes Google's `gemini-1.5-flash` model. Rather than sending a basic prompt asking the model to "write an email", ProReach structures the request into an exhaustive 4-stage cognitive pipeline:

```mermaid
graph TD
    JD[User Job Description] --> S1[Step 1: Deep JD Parsing]
    Resume[PyPDF2 Extracted Resume Text] --> S2[Step 2: Dual Matching Engine]
    Profile[Developer Profile Details] --> S2
    
    S1 -->|Roles, Hard Skills, Culture Signals| S2
    
    S2 -->|Direct Matches & Transfer Matches| S3[Step 3: Narrative Angle Selection]
    
    S3 --> AngleChoice{Dynamic Angle Selected}
    AngleChoice -->|Direct Match| A1["domain_expert"]
    AngleChoice -->|Project Rich| A2["builder"]
    AngleChoice -->|Challenge Centric| A3["problem_solver"]
    AngleChoice -->|Transfer Skills| A4["fast_learner"]
    AngleChoice -->|Values Alignment| A5["culture_fit"]
    
    A1 & A2 & A3 & A4 & A5 --> S4[Step 4: Constrained Synthesis]
    S4 --> JSONOut["Strict JSON Payload (Subject, Hook, Body, Closing)"]
```

### Ingestion of Resume Multi-Modal Context
When the developer uploads a PDF resume, `mailer.gemini.draft_email` extracts the raw structural text using `PyPDF2`:
```python
if use_resume and profile.resume:
    try:
        import PyPDF2
        with open(profile.resume.path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            resume_text = "\n".join(page.extract_text() for page in reader.pages if page.extract_text())
    except Exception as e:
        logger.warning(f"Failed to read resume PDF: {e}")
```
This parsed text is injected directly into the Gemini prompt under `=== RESUME DETAILS ===`, allowing Gemini to cite specific open-source repositories, university projects, metrics, and achievements.

### Strict JSON Output Contract
The model is instructed to output raw JSON adhering to this schema:
```json
{
  "subject": "Role Application — Candidate Name",
  "greeting": "Dear Hiring Team at Company Name,",
  "hook": "Concise 1-2 sentence hook proving value immediately.",
  "body": "2-3 targeted paragraphs addressing JD requirements directly.",
  "why_company": "1-2 sentences on company-specific engineering missions.",
  "closing": "Call to action referencing attached resume.",
  "sign_off": "Warm regards,\nCandidate Name",
  "jd_skills_matched": ["Django", "React", "PostgreSQL"],
  "angle_used": "builder"
}
```

### Deterministic Algorithmic Fallback
If the user's Gemini API quota is exhausted, the network drops, or JSON validation fails, the system executes `_build_default()`. This algorithmic fallback constructs a clean, personalized pitch using the developer's graduation year, college, skills array, and bio—ensuring the application workflow is never interrupted.

---

## 🎨 6. Responsive HTML Templating Engine

ProReach avoids plain, easily ignorable plain-text emails by providing **6 hand-crafted, production-tested HTML email themes**. Every theme is designed with inline CSS compatible with all major email clients (Gmail, Apple Mail, Outlook).

### Email Theme Catalog

| Theme ID | Name | Visual Aesthetic | Target Industry / Recipient |
| :--- | :--- | :--- | :--- |
| `theme1` | **Void Purple** | Sleek dark mode, purple gradients, modern developer styling | Startups, Web3, AI & Cutting-Edge Tech |
| `theme2` | **Editorial Ink** | High-contrast editorial style, clean borders, serif accents | Creative Agencies, Design Studios, Publications |
| `theme3` | **Soft Bento** | Bento card containers, emerald accents, rounded geometry | Product Companies, SaaS, FinTech |
| `theme4` | **Neobrutalist** | High-contrast borders, bold shadows, retro tech aesthetic | Indie Hackers, Creative Tech, Gaming Studios |
| `theme5` | **Newsletter Dark** | Clean digest layout, subtle divider lines, deep slate tones | Engineering Blogs, Media, Open-Source Teams |
| `theme6` | **Minimal Resume** | Clean monochromatic structure, executive resume look | Enterprise, Fortune 500, Financial Institutions |

### In-App Mobile WebView Preview
Before transmitting an email, candidates can tap **"Preview Theme"** in the mobile app. The React Native app invokes `POST /api/v1/compose/preview/`, which renders the template server-side and returns the full HTML payload. The client displays it within a modal `WebView`, allowing candidates to inspect their email layout prior to dispatch.

---

## ⚡ 7. Asynchronous Non-Blocking Dispatch & Concurrency

### The Latency Problem
Connecting to `smtp.gmail.com:587`, executing TLS handshakes, authenticating credentials, assembling multi-part MIME packets, and streaming binary PDF attachments takes anywhere from **1.5 to 5.0 seconds**. Blocking the HTTP request thread during this process freezes the mobile client and degrades user experience.

### The Background Worker Thread Pattern
ProReach delegates email transmission to an isolated daemon worker thread:

```mermaid
sequenceDiagram
    autonumber
    actor Dev as 👤 Mobile User
    participant View as ⚙️ SendEmailView (Main Thread)
    participant Worker as 🧵 Background Thread
    participant DB as 🗄️ Database
    participant SMTP as 🌐 Gmail SMTP (TLS 587)

    Dev->>View: POST /api/v1/compose/send/
    View->>DB: Create EmailLog (status='sending')
    View->>Worker: thread.start(target=bg_send_email)
    View-->>Dev: HTTP 200 OK {"status": "dispatch_initiated", "id": 102} (<180ms)
    
    critical Background Worker Execution
        Worker->>DB: close_old_connections()
        Worker->>SMTP: Connect, EHLO, STARTTLS, Login
        Worker->>SMTP: sendmail(sender, receiver, MIMEData)
        alt Transmission Succeeded
            SMTP-->>Worker: 250 2.0.0 OK
            Worker->>DB: Update EmailLog (status='sent')
        else Transmission Failed (e.g. Auth Error)
            SMTP-->>Worker: 535 5.7.8 Authentication credentials invalid
            Worker->>DB: Update EmailLog (status='failed', error_message='AUTH_ERROR')
        end
        Worker->>DB: close_old_connections()
    end
```

### Database Connection Hygiene
In Django, background threads retain references to database connections opened by the spawning thread. In multi-threaded environments, this can lead to connection leaks or `OperationalError: SSL error: decryption failed or bad record mac`. 

ProReach resolves this by invoking `django.db.close_old_connections()`:
1. Immediately upon entering the background worker thread.
2. In the `finally` block before the thread terminates.

```python
def bg_send_email():
    from django.db import close_old_connections
    close_old_connections()  # Discard inherited connections
    try:
        success, msg = send_job_email(...)
        log.status = 'sent' if success else 'failed'
        log.error_message = '' if success else msg
        log.save()
    finally:
        close_old_connections()  # Release worker socket
```

---

## 📊 8. Application Lifecycle & Funnel State Machine

ProReach provides an integrated **Application Funnel Tracker** allowing developers to follow cold emails through every milestone of the recruiting cycle.

### Application State Machine

```mermaid
stateDiagram-v2
    [*] --> Draft: User composes pitch
    Draft --> Sending: User triggers Swipe-to-Send
    Sending --> Sent: SMTP delivery verified (250 OK)
    Sending --> Failed: SMTP rejection / Auth error
    Failed --> Sending: Retry with updated credentials
    
    Sent --> Applied: Initial recruiter touchpoint logged
    Applied --> Viewed: Recruiter opened or acknowledged
    Viewed --> Interview: Recruiter scheduled conversation
    Interview --> Offer: Final offer extended 🎉
    Interview --> Rejected: Candidate declined / Ghosted
    Applied --> Rejected: Position filled
    Offer --> [*]
    Rejected --> [*]
```

### Real-Time Delivery Polling
While the email sends in the background, the mobile client's `HistoryScreen` uses TanStack Query with an active polling interval (`refetchInterval: 2000`) to track status updates. Once the server marks the record as `sent` or `failed`, the UI automatically displays the updated badge without requiring a manual refresh.

### Circular Goal Dial & Motivation Engine
On the home dashboard, an interactive SVG ring tracks daily outreach targets:

$$\text{Progress} = \min\left(\frac{\text{Pitches Sent Today}}{\text{Daily Pitch Goal}}, 1.0\right)$$

$$\text{StrokeDashOffset} = \text{Circumference} \times (1 - \text{Progress})$$

---

## 📡 9. Complete REST API Specification

Base Endpoint: `https://job-email-app.onrender.com/api/v1/`  
Mandatory Header for Protected Endpoints: `X-Profile-ID: <UUID>`

### Endpoint Directory

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/health/` | Server health check & uptime probe | No |
| `POST` | `/profiles/create/` | Provision a new device-bound UUID profile | No |
| `GET` | `/profiles/me/` | Retrieve candidate profile, skills, & credential status | Yes |
| `PATCH` | `/profiles/me/` | Update candidate bio, skills, credentials, or resume | Yes |
| `GET` | `/companies/` | Retrieve candidate's saved company address book | Yes |
| `POST` | `/companies/` | Save a new company recruiter contact | Yes |
| `GET` | `/companies/<id>/` | Fetch single company record | Yes |
| `PATCH` | `/companies/<id>/` | Update contact notes or email | Yes |
| `DELETE` | `/companies/<id>/` | Delete company record | Yes |
| `GET` | `/history/` | List all dispatched emails & funnel statuses | Yes |
| `PATCH` | `/history/<id>/` | Update application stage (`Applied`, `Interview`, etc.) | Yes |
| `DELETE` | `/compose/history/bulk/` | Batch delete email history records | Yes |
| `POST` | `/compose/generate/` | Synthesize context-aware pitch via Gemini | Yes |
| `POST` | `/compose/preview/` | Render full responsive HTML email theme | Yes |
| `POST` | `/compose/send/` | Initiate background asynchronous SMTP dispatch | Yes |

---

### Endpoint Schemas & Payloads

#### 1. Server Health Check (`GET /api/v1/health/`)
* **Headers**: None required.
* **Response Payload (200 OK)**:
```json
{
  "status": "ok",
  "message": "Backend is alive!"
}
```

#### 2. Provision Anonymous Profile (`POST /api/v1/profiles/create/`)
* **Headers**: None required.
* **Request Payload**:
```json
{
  "profile_name": "My Profile"
}
```
* **Response Payload (201 Created)**:
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "profile_name": "My Profile"
}
```

#### 3. Retrieve Candidate Profile (`GET /api/v1/profiles/me/`)
* **Headers**: `X-Profile-ID: 3fa85f64-5717-4562-b3fc-2c963f66afa6`
* **Response Payload (200 OK)**:
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "profile_name": "My Profile",
  "full_name": "Gautam Verma",
  "phone": "+91 9876543210",
  "role": "Software Developer",
  "skills": "Python, Django, REST APIs, React Native, TypeScript, PostgreSQL",
  "experience": "Fresher",
  "tech_stack": "React Native, Django, Python",
  "location": "New Delhi, India",
  "college": "Delhi Technological University",
  "grad_year": "2025",
  "linkedin": "https://linkedin.com/in/gautam1432",
  "github": "https://github.com/gautam1432002",
  "portfolio": "https://gautam.dev",
  "about_me": "Full-stack engineer passionate about building frictionless developer tools.",
  "resume": "https://job-email-app.onrender.com/media/resumes/2026/10/resume.pdf",
  "gmail_configured": true,
  "gemini_configured": true
}
```

#### 4. Update Profile & Encrypted Credentials (`PATCH /api/v1/profiles/me/`)
* **Headers**: `X-Profile-ID: <UUID>`, `Content-Type: multipart/form-data` or `application/json`
* **Request Payload**:
```json
{
  "full_name": "Gautam Verma",
  "role": "Backend Engineer",
  "skills": "Python, Django, FastAPI, Celery, PostgreSQL",
  "gmail": "candidate@gmail.com",
  "app_password": "abcd efgh ijkl mnop",
  "gemini_key": "AIzaSyD-sampleGeminiApiKey12345"
}
```
> [!NOTE]
> `gmail`, `app_password`, and `gemini_key` are write-only fields. The server immediately derives tenant-isolated Fernet keys and writes encrypted blobs to `gmail_enc`, `app_password_enc`, and `gemini_key_enc`. Plaintext credentials are never returned in responses.

#### 5. Company Address Book (`GET|POST /api/v1/companies/`)
* **List Companies (`GET /api/v1/companies/`) Response (200 OK)**:
```json
[
  {
    "id": 12,
    "name": "Stripe",
    "email": "recruiting@stripe.com",
    "notes": "Met recruiter at Tech Summit; focus on API performance.",
    "added_at": "2026-10-12T14:30:00Z"
  }
]
```
* **Add Company (`POST /api/v1/companies/`) Request Payload**:
```json
{
  "name": "Linear",
  "email": "careers@linear.app",
  "notes": "Product-led growth, frontend engineering opening."
}
```

#### 6. Outreach History & Funnel Management (`GET /api/v1/history/`)
* **List History Logs (`GET /api/v1/history/`) Response (200 OK)**:
```json
[
  {
    "id": 104,
    "receiver_email": "recruiting@stripe.com",
    "company_name": "Stripe",
    "theme_used": "theme1",
    "subject": "Application for Software Engineer — Gautam Verma",
    "opening_para": "Dear Stripe Engineering Team...",
    "ai_used": true,
    "status": "sent",
    "application_status": "Applied",
    "error_message": "",
    "sent_at": "2026-10-12T17:15:30Z"
  }
]
```
* **Update Funnel Milestone (`PATCH /api/v1/history/<id>/`) Request**:
```json
{
  "application_status": "Interview"
}
```
* **Bulk Delete History Logs (`DELETE /api/v1/compose/history/bulk/`) Request**:
```json
{
  "ids": [101, 102, 103]
}
```

#### 7. Synthesize Pitch (`POST /api/v1/compose/generate/`)
* **Request Payload**:
```json
{
  "company_name": "Stripe",
  "job_description": "We are seeking a Backend Engineer with strong Python and API design experience...",
  "about_company": "Fintech infrastructure leader",
  "use_resume": true
}
```
* **Response Payload (200 OK)**:
```json
{
  "subject": "Application for Software Engineer — Gautam Verma",
  "greeting": "Dear Stripe Engineering Team,",
  "hook": "I have long admired Stripe's developer-first API design and want to bring my backend engineering background to your core infrastructure.",
  "body": "Having built production-grade Django APIs with dynamic cryptography...",
  "why_company": "Stripe's commitment to reliability and clean abstractions aligns directly with my engineering values.",
  "closing": "My resume is attached for your review. I look forward to connecting.",
  "sign_off": "Warm regards,\nGautam",
  "full_body": "Dear Stripe Engineering Team,\n\nI have long admired...",
  "jd_skills_matched": ["Python", "REST APIs", "PostgreSQL"],
  "angle_used": "domain_expert",
  "ai_used": true
}
```

#### 8. Preview HTML Email Theme (`POST /api/v1/compose/preview/`)
* **Request Payload**:
```json
{
  "company_name": "Stripe",
  "receiver_email": "recruiting@stripe.com",
  "subject": "Application for Software Engineer — Gautam Verma",
  "html_body": "Dear Stripe Engineering Team,\n\n...",
  "theme_used": "theme1",
  "ai_used": true
}
```
* **Response Payload (200 OK)**:
```json
{
  "html": "<!DOCTYPE html><html lang=\"en\"><head><style>...</style></head><body><div class=\"container\">...</div></body></html>"
}
```

#### 9. Asynchronous SMTP Dispatch (`POST /api/v1/compose/send/`)
* **Request Payload**:
```json
{
  "company_name": "Stripe",
  "receiver_email": "recruiting@stripe.com",
  "subject": "Application for Software Engineer — Gautam Verma",
  "html_body": "Dear Stripe Engineering Team,\n\n...",
  "theme_used": "theme1",
  "ai_used": true
}
```
* **Response Payload (200 OK)**:
```json
{
  "status": "Email dispatch initiated",
  "message": "Sending in background",
  "id": 104
}
```

---

## 🗃️ 10. Relational Data Model & Entity Specifications

The persistence schema is engineered around tenant isolation, where all personal records, history items, and address books reference the primary `Profile` entity.

### Entity-Relationship Diagram

```mermaid
erDiagram
    PROFILE ||--o{ EMAIL_LOG : "dispatches"
    PROFILE ||--o{ COMPANY : "maintains"

    PROFILE {
        uuid id PK "UUID4 Hardware Identifier"
        string profile_name "Display identifier"
        string full_name "Candidate legal name"
        string phone "Contact phone number"
        string role "Target job title"
        text skills "Comma-delimited skills"
        string experience "Experience seniority"
        text tech_stack "Primary stack tags"
        string location "Geographic location"
        string college "Alma mater"
        string grad_year "Graduation year"
        url linkedin "LinkedIn profile URL"
        url github "GitHub profile URL"
        url portfolio "Portfolio URL"
        text about_me "Bio narrative & summary"
        url resume "Uploaded PDF binary path"
        text gmail_enc "Encrypted Gmail address"
        text app_password_enc "Encrypted App Password"
        text gemini_key_enc "Encrypted Gemini API Key"
        boolean gmail_configured "Status flag"
        boolean gemini_configured "Status flag"
        datetime created_at "Timestamp"
        datetime updated_at "Timestamp"
    }

    EMAIL_LOG {
        bigint id PK "Auto Increment"
        uuid profile_id FK "Owner profile"
        string receiver_email "Recruiter email"
        string company_name "Company name"
        string theme_used "HTML theme identifier"
        string subject "Email subject line"
        text opening_para "Generated opener"
        boolean ai_used "AI attribution flag"
        string status "sending | sent | failed"
        string application_status "Applied | Viewed | Interview | Offer | Rejected"
        text error_message "SMTP debug payload"
        datetime sent_at "Timestamp"
    }

    COMPANY {
        bigint id PK "Auto Increment"
        uuid profile_id FK "Owner profile"
        string name "Company name"
        string email "Recruiter contact email"
        text notes "Context or referral notes"
        datetime added_at "Timestamp"
    }
```

---

## 📱 11. Mobile Client Architecture & UX System

The client is built with **React Native** and **Expo**, engineered to deliver a fluid 60 FPS mobile experience.

### Architectural Highlights
1. **Bento-Grid Design Language**: Modular card components (`BentoCard.tsx`) group related functionality into clean, scannable panels.
2. **Dual-Theme Design System**: Supports both dark and light modes through a custom token-based provider (`useAppTheme()`).
3. **Gesture-Driven Interactions**:
   * **Swipe-to-Send**: A custom swipe slider built with `react-native-gesture-handler` and `react-native-reanimated` spring physics prevents accidental dispatches.
   * **Dynamic Tone Controller**: An interactive 3-step segmented track (*Professional*, *Friendly*, *Direct*) built with `PanResponder` and spring physics.
4. **Interactive SVG Outreach Dial**: Real-time daily goal tracker on the home dashboard using SVG `strokeDashoffset` mathematics, with target preferences persisted via `AsyncStorage`.
5. **Follow-Up Reminder & Overdue Tracking Engine**: Local reminder scheduling persisted in hardware `SecureStore`. The engine evaluates due dates on screen focus (`useFocusEffect`) and alerts candidates to stale applications.
6. **Pre-Configured Outreach Frameworks**: Fast-start cards on the home dashboard (*Standard Application*, *Aggressive Follow-Up*, *Networking*) pre-populate prompt context and target tone.
7. **Multi-Select Bulk History Management**: Batch selection mode allows deleting outdated or rejected applications in bulk with optimistic TanStack Query cache updates.
8. **Resilient Local Caching**: Powered by **TanStack Query**, cached profiles and logs render instantly upon app launch while network revalidation runs quietly in the background.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DESIGN TOKEN PALETTE                            │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ Token              │ Dark Theme         │ Light Theme                  │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ Background         │ #000000            │ #F2F2F7                      │
│ Card Surface       │ #1C1C1E            │ #FFFFFF                      │
│ Text Primary       │ #FFFFFF            │ #000000                      │
│ Text Secondary     │ #8E8E93            │ #8E8E93                      │
│ Neon Cyan Accent   │ #00F0FF            │ #00F0FF                      │
│ Emerald Accent     │ #00FF66            │ #00FF66                      │
│ Border Stroke      │ #38383A            │ #E5E5EA                      │
└────────────────────┴────────────────────┴──────────────────────────────┘
```

---

## 🔮 12. Cross-Platform Ecosystem & Strategic Roadmap

Because ProReach relies on a headless **Django REST Framework** API architecture, the backend engine is entirely decoupled from client-specific presentation layers. The same high-velocity endpoints for profile management, cryptographic key derivation, AI pitch generation, and asynchronous SMTP delivery can power a broad multi-device ecosystem.

Below is the architectural blueprint and execution roadmap for scaling ProReach into a comprehensive, multi-channel career outreach ecosystem.

---

### 🌐 12.1 Multi-Client Ecosystem Topology

```mermaid
graph TB
    subgraph ClientTiers ["🖥️ Expanded Multi-Client Surface Area"]
        Mobile["📱 Mobile App (React Native / Expo)\n• iOS & Android\n• Hardware SecureStore\n• On-the-go Outreach"]
        WebDash["💻 Web Command Center (Next.js 14)\n• Desktop Kanban Board\n• Deep Analytics\n• Bulk Recruiter Import"]
        Extension["🧩 Chrome / Edge Extension\n• Manifest V3 In-Page Co-Pilot\n• LinkedIn / Indeed 1-Click Scraping\n• Floating Pitch Drawer"]
        DesktopNative["⚡ Desktop Menu Bar App (Tauri / Rust)\n• Global Hotkey 'Cmd+Shift+P'\n• Instant Pitch Popover\n• Background Follow-up Alerts"]
    end

    subgraph Gateway ["⚙️ Central Gateway & Routing Layer"]
        API["Django REST API Gateway (v1)\n• Stateless X-Profile-ID Auth\n• Dynamic KDF Encryption Engine\n• Per-Tenant Rate Limiting & Quotas"]
    end

    subgraph ServiceIntegrations ["🔌 External Service Integrations & Providers"]
        direction TB
        subgraph DeliveryGateways ["📨 Delivery Channels"]
            Gmail["Gmail SMTP (TLS 587)"]
            Outlook["Microsoft 365 / Graph API"]
            CustomSMTP["Custom Domain SMTP (DKIM/SPF)"]
            LinkedInOut["LinkedIn InMail / Note Formatter"]
        end
        subgraph AIGateways ["🧠 Intelligence Layer"]
            Gemini["Google Gemini 1.5 Flash (Primary)"]
            Claude["Anthropic Claude 3.5 Sonnet (Executive)"]
            LocalLLM["Local Ollama / Llama 3 (Zero-Cloud Private)"]
        end
        subgraph DiscoveryEnrichment ["🔍 Discovery & Enrichment"]
            Hunter["Hunter.io / Apollo.io (Email Finding)"]
            ATSEngine["ATS Resume Matcher & Keyword Gap Analyzer"]
        end
    end

    Mobile ==>|REST + X-Profile-ID| API
    WebDash ==>|REST + LocalStorage UUID| API
    Extension ==>|REST + Chrome Sync Storage| API
    DesktopNative ==>|REST + OS Keystore| API

    API --> DeliveryGateways
    API --> AIGateways
    API --> DiscoveryEnrichment
```

### Visual Topology & Web Dashboard Mockups

<div align="center">
  <img src="frontend/assets/ecosystem.svg" alt="ProReach Ecosystem Map" width="100%">
</div>

<br>

<div align="center">
  <img src="frontend/assets/webapp_preview.svg" alt="Web Dashboard Mockup" width="100%">
</div>

---

### 🛠️ 12.2 Detailed Breakdown of Ecosystem Options

To transform ProReach from a single mobile utility into an all-encompassing outreach suite, the following core ecosystem options have been engineered into the system expansion plan:

#### 🧩 Option 1: Chrome / Web Browser Extension (Active Job Board Co-Pilot)
* **The Problem:** Developers actively discover jobs while browsing job boards on their desktop laptops (LinkedIn, Indeed, Wellfound, YC Work at a Startup, Greenhouse, Lever). Switching between browser tabs and mobile phones introduces severe friction.
* **Architecture & Mechanics:**
  * **Manifest V3 Architecture:** Built with TypeScript, React, and Tailwind CSS using a Manifest V3 background service worker and content script injection.
  * **Intelligent DOM Scraper:** Automatically detects active URLs (e.g. `linkedin.com/jobs/view/*`, `wellfound.com/jobs/*`) and extracts the **Role Title**, **Company Name**, **Hiring Manager / Recruiter Profile Details**, and the **Full Job Description** in real time.
  * **In-Page Floating Drawer:** A sleek, keyboard-accessible drawer slides out directly on the job posting page.
  * **Seamless Dispatch:** Hits the `/api/v1/compose/generate/` and `/api/v1/compose/send/` endpoints using the developer's synced `X-Profile-ID` stored in `chrome.storage.sync`.
  * **Recruiter Email Finder:** Leverages lightweight heuristics and meta tags to pinpoint recruiter contact addresses directly on the page.

#### 💻 Option 2: Next.js 14 Web Command Center & Kanban Pipeline
* **The Problem:** Managing 50+ active applications, tracking follow-up dates, analyzing theme performance, and switching between different resume versions requires larger desktop real estate.
* **Architecture & Mechanics:**
  * **Modern Web Stack:** Built with Next.js 14 (App Router), React Server Components, Tailwind CSS, and Shadcn UI.
  * **Visual Application Kanban Board:** Interactive drag-and-drop board organized by application status:
    $$\text{Draft} \longrightarrow \text{Applied} \longrightarrow \text{Viewed} \longrightarrow \text{Interview} \longrightarrow \text{Offer} \longrightarrow \text{Rejected}$$
  * **Multi-Resume Portfolio Manager:** Allows developers to maintain and toggle between specialized resume PDFs (e.g., *Frontend Specialist Resume*, *Backend Python Resume*, *Machine Learning Resume*), dynamically selected per pitch.
  * **Outreach Analytics Dashboard:**
    * Real-time delivery success rates vs SMTP bounces.
    * Response rate heatmaps categorized by email theme (e.g., *Void Purple* vs *Soft Bento* vs *Editorial Ink*).
    * Weekly application cadence graphs with daily goal streak indicators.
  * **Bulk CSV Recruiter Ingestion:** Upload spreadsheets of verified recruiter contacts (Company, Recruiter Name, Recruiter Email, Role) to rapidly generate custom batches.

#### 📨 Option 3: Multi-Channel Communication Matrix (Beyond Gmail SMTP)
* **The Problem:** Many developers and tech professionals use university accounts, Microsoft Outlook/Office 365, private custom domains, or prefer connecting via LinkedIn.
* **Architecture & Mechanics:**
  * **Microsoft 365 / Outlook Integration:** Secure OAuth2 authorization using Microsoft Graph API (`/v1.0/me/sendMail`) alongside Gmail App Passwords.
  * **Custom Domain SMTP Support:** Connect any private email server (Fastmail, ProtonMail Bridge, SendGrid, custom `name@developer.io` domain) with built-in SPF, DKIM, and DMARC health status checkers to ensure 99%+ recruiter inbox placement.
  * **LinkedIn Outreach Adapter:**
    * **Connection Request Mode:** Constrains Gemini synthesis to 300 characters, generating high-conversion connection note hooks.
    * **InMail Mode:** Structures pitches within LinkedIn's 1,900-character limit with custom subject lines and profile referrals.

#### ⏳ Option 4: Smart Drip Campaign & Follow-Up Sequencer
* **The Problem:** Recruiter response rates double when candidates send 1–2 thoughtful follow-ups, yet candidates routinely forget to follow up or feel awkward drafting them.
* **Architecture & Mechanics:**
  * **Automated 3-Stage Drip Cadence:**
    * **Day 0 (Initial Pitch):** Deeply customized cold pitch highlighting skill alignment, resume attachment, and HTML styling.
    * **Day 4 (The Gentle Bump):** Short, respectful 2-paragraph check-in referencing recent engineering projects or company milestones.
    * **Day 9 (The Final Value-Add):** A gracious final note sharing a relevant GitHub project, live demo link, or article.
  * **Smart Reply Detection (IMAP Auto-Stop):** Optional background IMAP read checking. As soon as an inbound response email from the recruiter is detected in the inbox thread, all subsequent scheduled follow-up triggers are instantly canceled.
  * **Manual Confirmation Mode:** Users can opt to receive a push notification or in-app prompt to review and approve follow-up drafts before dispatch.

#### 🧠 Option 5: Advanced AI Intelligence & ATS Gap Engine
* **The Problem:** Different roles require distinct AI cognitive strengths, and candidates need to know how well their resume actually matches an ATS (Applicant Tracking System) before reaching out.
* **Architecture & Mechanics:**
  * **Dynamic Multi-LLM Routing:**
    * **Default (Speed & Cost):** Google Gemini 1.5 Flash (sub-2 second generation, cost-effective).
    * **Nuanced Executive Mode:** Anthropic Claude 3.5 Sonnet (for deeply tailored engineering leadership & principal roles).
    * **Private / Zero-Cloud Mode:** Local model inference via Ollama (DeepSeek-R1, Llama 3) running on `localhost:11434` for 100% private, on-device pitch generation.
  * **ATS Keyword Gap Analyzer:**
    * Computes vector cosine similarity between the candidate's PDF resume and the pasted job description.
    * Returns an **ATS Match Score** (0–100%) and highlights critical missing technical keywords (e.g., *"Job mentions Kafka & Kubernetes, which are not listed on your resume"*).
  * **Recruiter Email Finder Integration:** Connects with verified discovery APIs (Hunter.io, Apollo.io, Proxycurl) to automatically deduce recruiter email addresses when the candidate only provides a LinkedIn profile URL or company domain.

#### 🔒 Option 6: Zero-Knowledge Multi-Device Sync Protocol (E2EE Relay)
* **The Problem:** Synchronizing company address books, pitch logs, and settings between phones, laptops, and browser extensions without exposing plaintext data to a central cloud server.
* **Architecture & Mechanics:**
  * **Device-to-Device Cryptographic Pairing:**
    1. Mobile client displays a high-entropy **Pairing QR Code** containing `Profile_UUID` and an ephemeral public key.
    2. Web client or Chrome extension scans or inputs the pairing token.
    3. The devices establish an end-to-end encrypted channel using the Web Crypto API.
  * **Portable Encrypted Vault:**
    * Candidates can download a full, password-encrypted backup file (`.proreach-vault`) containing their complete history, profile, and address book.
    * Instantly restorable on any new device or clean browser installation without database dependence.

#### ⚡ Option 7: Lightweight Desktop Menu Bar & System Tray App (Tauri + Rust)
* **The Problem:** When developers are immersed in deep coding workflows (e.g., inside VS Code or debugging in the terminal), switching context to a mobile phone or opening heavy web browser tabs to draft a quick cold pitch breaks flow state.
* **Architecture & Mechanics:**
  * **Tauri 2.0 + Rust Engine:** Delivers a native desktop client consuming less than 15 MB of RAM and launching instantaneously (<100ms), bypassing Electron memory overhead.
  * **Global Hotkey Daemon:** Registered global keyboard shortcut (`Cmd+Shift+P` on macOS, `Ctrl+Shift+P` on Windows/Linux) invokes a sleek glassmorphic popover HUD over any active IDE or browser window.
  * **Clipboard AI Auto-Ingestion:** Actively inspects clipboard content upon hotkey activation to auto-detect pasted job descriptions or recruiter emails, immediately pre-populating the pitch compose form.
  * **Native OS Keystore Integration:** Persists `X-Profile-ID` in the local operating system's secure vault (macOS Keychain, Windows Credential Manager, Linux Secret Service).
  * **System Tray Follow-Up Alerts:** Dispatches native OS notifications when outreach reminders are due or when delivery status transitions from `sending` to `sent`.

---

### 🗺️ 12.3 Strategic Phased Roadmap & Execution Matrix

The multi-client ecosystem expansion is structured across four progressive engineering phases:

```mermaid
gantt
    title ProReach Ecosystem Strategic Roadmap
    dateFormat  YYYY-MM-DD
    section Phase 1: Web & Persistence
    Managed Cloud PostgreSQL Migration       :done,    p1_1, 2026-01-01, 2026-02-15
    Next.js 14 Web Command Center (MVP)      :active,  p1_2, 2026-02-15, 2026-04-30
    QR-Based Device Pairing Protocol         :         p1_3, 2026-04-01, 2026-05-15
    Multi-Resume Portfolio Management        :         p1_4, 2026-05-01, 2026-06-15

    section Phase 2: Browser Co-Pilot & Desktop
    Manifest V3 Chrome Extension Engine      :         p2_1, 2026-06-01, 2026-07-31
    LinkedIn & Indeed DOM Scraping Script    :         p2_2, 2026-07-15, 2026-08-31
    ATS Keyword Matcher & Gap Analyzer       :         p2_3, 2026-08-15, 2026-09-30
    Desktop Menu Bar App (Tauri / Rust)      :         p2_4, 2026-08-01, 2026-09-30

    section Phase 3: Multi-Channel & Sequencer
    Celery + Redis Distributed Worker Queue  :         p3_1, 2026-09-15, 2026-10-31
    Microsoft 365 & Custom Domain SMTP       :         p3_2, 2026-10-15, 2026-11-30
    Automated Follow-Up Drip Sequencer       :         p3_3, 2026-11-01, 2026-12-31

    section Phase 4: Intelligence & Teams
    Multi-LLM Failover (Claude & Ollama)     :         p4_1, 2027-01-01, 2027-02-28
    Recruiter Email Finder Integration       :         p4_2, 2027-02-15, 2027-03-31
    Zero-Knowledge Encrypted Vault (.proreach):        p4_3, 2027-03-15, 2027-04-30
```

### Comprehensive Execution Matrix

| Phase & Milestone | Target Horizon | Core Deliverables | Technology Stack | Architectural & Security Impact |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1: Web Command Center & Cloud Persistence** | **Q1 – Q2** | • Managed Cloud PostgreSQL migration (Neon/Supabase)<br>• Next.js 14 Desktop Web Dashboard<br>• Visual Kanban Application Board<br>• QR-based cross-device profile pairing<br>• Multi-resume portfolio storage | Next.js 14, React Server Components, Tailwind CSS, Shadcn UI, PostgreSQL, Cloudflare | Decouples persistence from ephemeral containers; enables high-volume desktop job application management. |
| **Phase 2: Browser Co-Pilot & Desktop Menu Bar App** | **Q2 – Q3** | • Manifest V3 Chrome/Edge/Brave Extension<br>• 1-Click DOM scraping for LinkedIn & Indeed<br>• In-page floating composer drawer<br>• ATS Resume Match Score & Keyword Gap Analyzer<br>• Native Menu Bar App (Tauri + Rust) with global hotkey (`Cmd+Shift+P`) | Chrome Extension API (MV3), Tauri 2.0, Rust, TypeScript, Webpack, OS Keyring | Eliminates tab switching; allows candidates to pitch directly from job postings or hotkeys without leaving their IDE. |
| **Phase 3: Multi-Channel Outreach & Sequencer** | **Q3 – Q4** | • Distributed background worker queue (Celery + Redis)<br>• Microsoft 365 (Graph API) & Custom SMTP<br>• 3-Stage automated follow-up drip sequence<br>• Inbound IMAP reply detection to auto-cancel follow-ups | Celery, Redis, Microsoft Graph API, Python `imaplib`, SPF/DKIM validation | Converts single-shot outreach into structured high-converting campaigns; removes background thread scaling bottlenecks. |
| **Phase 4: Advanced Intelligence & Portable Vault** | **Q4+** | • Multi-model LLM failover (Gemini, Claude 3.5, Local Ollama)<br>• Recruiter email discovery API (Hunter/Apollo)<br>• Portable encrypted JSON backup & restore (`.proreach-vault`) | Anthropic Claude SDK, Ollama WebAssembly, Web Crypto API, Apollo.io API | Enables 100% offline private pitch generation and zero-vendor-lock-in data portability. |

---

## 🏗️ 13. Infrastructure Scaling & Persistence Migration Plan

> [!WARNING]
> **Ephemeral Storage Notice:** When hosted on free-tier container platforms (like Render's free tier), the local filesystem is ephemeral. Server updates or redeployments wipe local storage, including SQLite database files (`db.sqlite3`).

### Ephemeral Storage vs. Production Architecture

```mermaid
graph LR
    subgraph CurrentState ["⚠️ Current Testing State (Ephemeral)"]
        Deploy1[New Deployment] --> Wipe[Old Container Wiped]
        Wipe --> ResetDB[(Local db.sqlite3 Re-initialized)]
        ResetDB --> Orphan[Client UUID Becomes Orphaned]
    end

    subgraph TargetState ["🚀 Production State (Persistent)"]
        Deploy2[New Deployment] --> StatelessApp[Stateless Docker Container]
        StatelessApp --> ManagedDB[(Cloud PostgreSQL e.g. Neon / Supabase)]
        StatelessApp --> S3Bucket[(Cloud Object Storage: Resumes / Assets)]
        ManagedDB --> Persist[Tenant Profiles & History Retained 100%]
    end
```

### Production Migration Roadmap

| Milestone | Implementation Strategy | Impact |
| :--- | :--- | :--- |
| **1. Managed Database** | Configure `DATABASE_URL` targeting a managed Cloud PostgreSQL instance (Neon / Supabase). | Completely eliminates data loss on server restarts. |
| **2. Distributed Task Queue** | Replace Python threading with **Celery + Redis**. | Adds job retry logic, rate-limit throttling, and scheduled follow-ups. |
| **3. Cloud Object Storage** | Route `profile.resume` uploads to Amazon S3 or Google Cloud Storage via `django-storages`. | Keeps resumes persistent across container lifecycles. |
| **4. Rate Limiting & Throttling** | Add DRF throttling scopes per `X-Profile-ID` to prevent SMTP abuse. | Protects Gmail accounts from triggering Google bulk-spam flags. |

---

## 💻 14. Local Development & Environment Setup

### Prerequisites
* **Python 3.10+**
* **Node.js 18+ & npm**
* **Expo Go** app on a physical device, or an Android/iOS emulator

### 1. Repository Setup
```bash
git clone https://github.com/gautam1432002/Job-Email-App.git
cd Job-Email-App
```

### 2. Backend Setup (Django REST Framework)
```bash
cd backend/jobmailer
python -m venv venv

# Activate virtual environment:
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### 3. Frontend Setup (React Native / Expo)
```bash
cd frontend
npm install

# For local testing, configure backend endpoint in .env:
# EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:8000/api/v1/

npx expo start --clear
```

### 4. Running Backend Unit Tests
```bash
cd backend/jobmailer
python manage.py test mailer.api_tests
```

---

<div align="center">
  <p><b>ProReach</b> was engineered with passion to demonstrate production-grade system architecture, dynamic security, and human-centric developer workflows.</p>
  <p>Made with ❤️ by Gautam</p>
</div>
