# OTP email on Render Free

Render Free blocks outbound SMTP ports 25, 465 and 587. The backend supports Brevo's HTTPS API so OTP delivery does not need an SMTP connection. No frontend changes are required.

## Set up Brevo

1. Create/sign in to your Brevo account and complete any required account activation for transactional email.
2. Add and verify a sender address you control. Authenticate its domain if you control the domain. Do not use a `thapar.edu` sender unless you are authorized to send from that address and can complete Brevo verification.
3. Generate a Brevo **API key**, not an SMTP key. Keep it private.

## Configure the backend service in Render

Deploy the code containing this change. On the **backend web service**, open Environment and add these values (no surrounding quotes):

| Variable | Value |
| --- | --- |
| `MAIL_PROVIDER` | `brevo` |
| `BREVO_API_KEY` | Your private Brevo API key |
| `BREVO_SENDER_EMAIL` | The exact verified sender address |
| `BREVO_SENDER_NAME` | `ThaparKart` |

Save and redeploy. Preserve existing MongoDB, JWT and CORS variables. Do not add the API key to the frontend, Git, or chat. Existing SMTP variables are ignored in Brevo mode; there is no SMTP fallback. Without `MAIL_PROVIDER`, the backend retains SMTP behavior for compatibility.

## Verify delivery

Using your own `@thapar.edu` address, request one OTP from registration after deployment. Confirm the request succeeds, the email reaches your inbox (check spam), and registration accepts the code within its expiry. API acceptance alone does not prove inbox delivery.

If it fails, check Render backend logs and Brevo's transactional logs:

- HTTP 401: check the API key.
- HTTP 400/403: check the verified sender, account activation and provider logs.
- HTTP 429: check sending limits/quota.
- Timeout/network failure: inspect Brevo logs before retrying; the provider may have accepted the message before the connection failed.
- Accepted but missing: inspect delivery/bounce events and recipient spam/quarantine; the college mail server may filter it.

The request has a 15-second timeout and does not retry automatically, to avoid duplicate OTP emails. Local tests mock the provider; they do not send real messages or validate production credentials.

References: [Render Free limitations](https://render.com/docs/free#other-limitations), [Brevo transactional email API and sender setup](https://developers.brevo.com/docs/send-a-transactional-email).
