# 📚 ProReach - Project Documentation

This document serves as the technical and architectural documentation for **ProReach**. It explains the internal systems, data flows, and security measures used throughout the application.

---

## 👥 Multi-User Architecture & Authentication

ProReach is designed to handle hundreds or thousands of users simultaneously. However, instead of using traditional email/password login screens, the architecture relies on a **frictionless, device-bound profile system**.

### 1. Device-Bound Profiles (Frictionless Onboarding)
The app removes login friction entirely. Here is how a user session is established:
* When a user opens the app for the very first time, the React Native frontend silently communicates with the Django backend.
* The backend generates a unique `Profile ID` (a standard UUID, e.g., `123e4567-e89b-12d3...`) and registers a new profile row in the PostgreSQL database.
* The mobile app receives this UUID and saves it securely inside the device's hardware-encrypted local storage using `Expo SecureStore`.
* For every subsequent network request (generating pitches, viewing history, sending emails), the Axios interceptor automatically attaches this UUID inside an `X-Profile-ID` network header.
* The backend reads this header via a custom `ProfileAuthentication` middleware to identify exactly which user is making the request.

### 2. Complete Data Isolation
Because the system is strictly bound to the `UUID`, every user operates in a completely isolated environment on the server:
* **Company Lists:** User A cannot query or see User B's saved target companies.
* **Email History:** All sent pitches are tied to the UUID via foreign keys, keeping history separate.
* **Credentials:** Third-party credentials (like Google Gemini API keys and Gmail App Passwords) are strictly isolated to the user's UUID.

### 3. Unique User-Level Encryption 🔐
Security is paramount because the app handles sensitive credentials (API keys and SMTP passwords). 
Instead of encrypting all passwords with a single global database key, ProReach uses **User-Specific Encryption Key Derivation**.

* The encryption key for each user is dynamically derived using PBKDF2 HMAC SHA-256.
* We combine the Django global `SECRET_KEY` with the user's specific `Profile ID` (`SECRET_KEY | profile_id`) to generate the encryption seed.
* This means every single user's secrets are locked with a *different* mathematical key. 
* **Security Benefit:** Even in the unlikely event of a database leak, an attacker cannot write a single decryption script to extract all passwords. They would need to derive unique keys for every single user row individually.

### Limitations & Design Trade-offs
* **No Cloud Syncing:** Because there is no central email/password login, if a user uninstalls the app or changes their physical phone, their locally stored UUID is deleted. Reinstalling the app will generate a brand new UUID, acting as a clean slate. This trade-off was intentionally chosen to maximize privacy and remove user-onboarding friction.

---
*(More documentation will be added here as the project evolves...)*
