# Authentication and email configuration

Set `JWT_SECRET` to a private, randomly generated value in the backend environment.
The backend refuses to start with a missing, blank, or legacy
`dev-secret-change-this` value; there is no fallback signing key. Keep the
existing private key when deploying to preserve current sessions. Changing it
invalidates existing login tokens.

SMTP requires a trusted server certificate. Port 465 uses implicit TLS; other
ports (normally 587) require STARTTLS. Configure the correct SMTP hostname and
port rather than disabling certificate verification.

Registration and the standalone OTP-verification endpoint share a limit of 10
requests per 15 minutes per IP. Password-reset and OTP-send limits remain
separate. These limits use in-memory storage per backend process.

Run the regression suite from the project root:

```sh
node --test src/utils/*.test.js backend/tests/*.test.js
```

Tests use fake database/SMTP operations and temporary localhost servers,
not live account data.
