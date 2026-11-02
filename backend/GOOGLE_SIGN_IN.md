# Google sign-in setup

Google sign-in replaces registration OTP emails. Existing users can sign in with their college Google account and keep the same account ID, listings, chats, orders and roles. Existing password login also remains available. The registration page no longer calls Brevo. No paid service or purchased domain is needed for this integration.

## Google Cloud setup

1. Open https://console.cloud.google.com/ and create/select a project for ThaparKart. This integration does not require enabling billing.
2. Open Google Auth Platform. Configure Branding with your app name, support email and developer contact. Do not upload an optional logo or request Gmail/Drive access for this sign-in flow.
3. Choose External audience if the project is in your personal Google account. While the app is in Testing, add your own college account as a test user. Move to Production when ready for students. Follow any consent/verification requirements Google displays; college administrators can independently restrict third-party sign-in.
4. Create a client of type **Web application** under Clients.
5. Add these **Authorized JavaScript origins**, without paths or trailing slashes:
   - `https://thaparkart.onrender.com`
   - `http://localhost:5173` (local Vite)
   - `http://localhost:4173` (optional local production preview)
6. Copy the client ID ending in `.apps.googleusercontent.com`. This popup/callback integration does not use a client secret or a redirect URI. Do not enter the backend URL as a frontend origin unless you actually serve the frontend there.

## Environment variables

Set **the same client ID** in both places:

| Service | Variable |
| --- | --- |
| Render backend | `GOOGLE_CLIENT_ID` |
| Render frontend | `VITE_GOOGLE_CLIENT_ID` |

Save and deploy the backend, then **rebuild and deploy the frontend** because Vite embeds its environment variables at build time. Keep existing JWT, database, API URL and CORS settings. If using an environment group, link it to the appropriate service. For local development use `backend/.env` and root `.env` respectively, then restart the servers. Never commit either `.env`.

## Verify before opening registration

- Sign in with your college-managed `@thapar.edu` Google account and confirm the landing page loads.
- Existing users: confirm listings and chats still belong to the same account.
- New users: confirm an account is created without an OTP or password.
- Personal Gmail and other organizations must be rejected.
- Confirm logout, mobile sign-in, protected listings and admin permissions still work.

The server uses Google's library to validate the token signature, issuer, audience and expiry, then requires `email_verified: true`, `hd: thapar.edu` and an exact `@thapar.edu` email domain. The frontend account-domain hint is not an authorization control. Linking to existing emails is allowed only after these checks. A different Google subject cannot silently replace an existing link. MongoDB must retain the unique email index and create the new sparse unique `googleSub` index (normal Mongoose automatic indexing).

If the college blocks third-party apps, request permission from its administrator; do not relax identity verification. A missing `hd` or a different organizational domain must be investigated before changing the accepted domain. Tests use mocked identity verification and database operations, so live Google consent and delivery of the frontend token require the setup above.

Legacy OTP endpoints remain for compatibility, but the login/registration UI no longer depends on them. Google-only accounts have no local password; the profile password-change action returns a clear explanation for them.

Official references: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid and https://developers.google.com/identity/gsi/web/guides/verify-google-id-token.
