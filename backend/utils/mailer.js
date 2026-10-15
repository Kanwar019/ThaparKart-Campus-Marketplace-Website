// backend/utils/mailer.js
import nodemailer from "nodemailer";
import process from "node:process";

let transporter = null;
let transporterVerified = false;

/**
 * Create & verify transporter lazily (on first use).
 * Throws a clear error if SMTP env vars are missing.
 */
async function getTransporter() {
  if (transporter && transporterVerified) return transporter;

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM="ThaparKart <ThaparKart25@gmail.com>",
  } = process.env;

  const mailConfigured = SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS;

  if (!mailConfigured) {
    // Clear any previous transporter to avoid confusion
    transporter = null;
    transporterVerified = false;
    throw new Error(
      "Mail service not configured. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS in backend/.env"
    );
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    requireTLS: Number(SMTP_PORT) !== 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  // verify once
  try {
    await transporter.verify();
    transporterVerified = true;
    console.log("✅ Mail transporter is ready");
  } catch (err) {
    transporter = null;
    transporterVerified = false;
    console.error("❌ Mail transporter verification failed:", err);
    throw err;
  }

  return transporter;
}

/**
 * Send email. Builds transporter lazily and rethrows useful errors.
 * @param {Object} param0
 * @returns {Promise}
 */
export async function sendMail({ to, subject, text, html, from }) {
  const provider = (process.env.MAIL_PROVIDER || "smtp").trim().toLowerCase();
  if (provider === "brevo") {
    const apiKey = process.env.BREVO_API_KEY?.trim();
    const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
    if (!apiKey || !senderEmail) {
      throw new Error("Brevo requires BREVO_API_KEY and BREVO_SENDER_EMAIL in the backend environment.");
    }
    // Use the verified sender configured for Brevo, never an unverified override.
    if (from) throw new Error("Brevo sender overrides are unsupported; configure BREVO_SENDER_EMAIL.");
    let response;
    let result;
    try {
      response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        redirect: "error",
        headers: { "api-key": apiKey, "Content-Type": "application/json", accept: "application/json" },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          sender: { email: senderEmail, name: process.env.BREVO_SENDER_NAME?.trim() || "ThaparKart" },
          to: [{ email: to }],
          subject,
          ...(html ? { htmlContent: html } : { textContent: text }),
        }),
      });
      if (!response.ok) {
        // Provider responses can contain recipient or message data. Do not log them.
        throw new Error(`Brevo rejected email (HTTP ${response.status}). Check API credentials, verified sender, transactional account status and quota.`);
      }
      result = await response.json();
    } catch (error) {
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        throw new Error("Brevo email request timed out. Check transactional logs before retrying.");
      }
      if (response && !response.ok) throw error;
      throw new Error("Brevo email request failed. Check connectivity and transactional logs.");
    }
    if (typeof result?.messageId !== "string" || !result.messageId) {
      throw new Error("Brevo did not return a message ID; email acceptance is unconfirmed.");
    }
    return { messageId: result.messageId };
  }
  if (provider !== "smtp") throw new Error("MAIL_PROVIDER must be brevo or smtp.");
  const fromAddress = from || process.env.SMTP_FROM || "ThaparKart <ThaparKart25@gmail.com>";

  let t;
  try {
    t = await getTransporter();
  } catch {
    // rethrow with friendly message (but keep original logged on server)
    throw new Error("Mail service not configured or transporter verify failed. See server logs.");
  }

  try {
    const info = await t.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
    });

    console.log(`Mail sent to ${to} messageId=${info.messageId}`);

    // if using nodemailer's test account, print preview URL (harmless when not)
    try {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log("Preview URL:", preview);
    } catch {
      // ignore
    }

    return info;
  } catch (err) {
    console.error("❌ sendMail error:", err);
    throw err;
  }
}
