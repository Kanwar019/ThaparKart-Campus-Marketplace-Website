# Email OTP retirement

Registration and recovery now use the verified college Google account. Existing ThaparKart passwords still work and can be changed after authenticating with the current password. Google-only users have no ThaparKart password.

Old POST routes `/api/auth/register`, `/api/auth/send-otp`, `/api/auth/verify-otp`, `/api/auth/reset-password` and `/api/auth/forgot-password` return HTTP 410 with guidance to use Google. They do not send email, validate OTPs, create accounts or reset passwords.

After deploying this cleanup, remove these unused variables from the backend's Render environment or linked email environment group if they are not used by another service:

- `MAIL_PROVIDER`
- `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `OTP_TTL_MINUTES`

Keep `GOOGLE_CLIENT_ID`, `JWT_SECRET`, `MONGO_URI`, `CLIENT_URL`, `ALLOWED_ORIGINS`, and the frontend `VITE_GOOGLE_CLIENT_ID` and API URL. Revoke the unused Brevo key in Brevo after confirming nothing else uses it. Private local `.env` files and remote settings are not edited by this cleanup.

The OTP model, mailer, OTP generator and mail dependencies have been removed. Existing MongoDB OTP documents are not used. The existing TTL index can expire them normally; this change does not drop collections or change user data.
