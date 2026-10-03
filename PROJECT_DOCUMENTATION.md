<div align="center">
  <img src="https://raw.githubusercontent.com/gautam1432002/Job-Email-App/main/frontend/assets/icon.png" width="100" />
  <h1>📚 ProReach: Core Architecture & Systems</h1>
  <p><i>A deep dive into frictionless multi-tenant architecture and dynamic cryptography.</i></p>
</div>

---

## 🚀 1. Frictionless Onboarding (Device-Bound Auth)

Traditional apps force users through tedious sign-up forms. ProReach removes **all friction** by using a hardware-linked, device-bound profile system. 

When a user opens the app, a secure handshake happens silently in the background:

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 User
    participant App as 📱 Mobile (React Native)
    participant API as ⚙️ Backend (Django)
    participant DB as 🗄️ PostgreSQL
    
    User->>App: Opens App for the first time
    App->>API: Silent POST /profiles/create/
    API->>DB: INSERT New Profile row
    DB-->>API: Generates Unique UUID
    API-->>App: Returns UUID to Device
    App->>App: Saves UUID in Hardware SecureStore 🔒
    
    Note over App, API: All future requests attach this UUID in the X-Profile-ID Header
```

<details>
<summary><b>💡 Click to see the technical advantages of this approach:</b></summary>
<br>
<ul>
  <li><b>Zero Friction:</b> The user is immediately dropped into the app experience.</li>
  <li><b>Stateless Auth:</b> No JWTs or session cookies to manage or expire.</li>
  <li><b>High Privacy:</b> No personal emails or phone numbers are stored in the database just to use the app.</li>
</ul>
</details>

---

## 🛡️ 2. Total Data Isolation

Because the system is strictly bound to the `UUID`, every user operates in a completely isolated environment on the server. The `ProfileAuthentication` middleware acts as a firewall between users.

```mermaid
graph TD
    subgraph Device A
        A_App[React Native] -->|Header: X-Profile-ID: 111| A_Req(API Request)
    end
    
    subgraph Device B
        B_App[React Native] -->|Header: X-Profile-ID: 999| B_Req(API Request)
    end

    A_Req --> Middleware
    B_Req --> Middleware

    subgraph Django REST Framework
        Middleware{Profile Auth Middleware}
        Middleware -->|Filters by 111| ViewA[User A Views]
        Middleware -->|Filters by 999| ViewB[User B Views]
    end

    ViewA --> DB_A[(User A Saved Companies)]
    ViewB --> DB_B[(User B Saved Companies)]
```

---

## 🔐 3. User-Specific Dynamic Encryption

Handling user credentials (like Google Gemini API keys and Gmail App Passwords) requires extreme security. **We do not use a single master key to encrypt the database.** Instead, ProReach uses **Dynamic Key Derivation**.

Every single user has their own unique encryption lock.

```mermaid
flowchart LR
    Global[Django Global SECRET_KEY] --> KDF
    User[User's Unique UUID] --> KDF
    
    subgraph Security Layer
        KDF{PBKDF2 HMAC SHA-256}
    end
    
    KDF -->|Derives| Key[Unique 32-byte Encryption Key]
    
    Key -->|Encrypts| Plaintext(Plaintext Gemini API Key)
    Plaintext --> DB[(Encrypted Ciphertext in DB)]
```

---

## 🛑 4. Google Play Store Compliance Protocol

Preparing an app for public distribution requires strict adherence to privacy and data deletion policies. To ensure ProReach is 100% compliant with Google Play Store regulations, we implemented a dedicated **Compliance Architecture**.

<div align="center">
  <!-- This SVG contains embedded CSS animations, gradients, and cyberpunk aesthetics! -->
  <img src="frontend/assets/compliance_animated.svg" alt="Animated Cyberpunk Compliance Flow" width="100%">
</div>

### Core Compliance Features:
1. **The "Right to be Forgotten" API:** We upgraded the "Wipe Profile" feature. It doesn't just clear local storage—it actively fires a `DELETE` request to the Django backend to totally erase the user's UUID and all encrypted data from the PostgreSQL database, satisfying GDPR and Google Play's strict data deletion requirements.
2. **Transparent Privacy Policy:** Links directly to a hosted privacy page to explain exactly how device-bound UUIDs work.
3. **Gmail App Password Clarity:** Explicitly guiding users to generate secure Google App Passwords instead of entering primary Google Account passwords to avoid "Deceptive Behavior" flags during app review.

---

## ⚠️ Limitations & Trade-offs

To achieve this level of privacy and zero-friction onboarding, we made an intentional architectural trade-off:

| Feature | Trade-off Explained |
| :--- | :--- |
| **No Cloud Syncing** | Because there is no central email/password login, if a user uninstalls the app or changes their physical phone, their locally stored UUID is deleted. |
| **Clean Slates** | Reinstalling the app will generate a brand new UUID, acting as a complete reset. This maximizes privacy (data isn't lingering attached to an email address forever). |

<br>
<div align="center">
  <i>ProReach was designed to prioritize speed, execution, and local-first security.</i>
</div>
