// backend/utils/mailer.js
import nodemailer from "nodemailer";

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
    secure: false, // STARTTLS on 587
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
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
  const fromAddress = from || process.env.SMTP_FROM || `"ThaparKart <ThaparKart25@gmail.com>`;

  let t;
  try {
    t = await getTransporter();
  } catch (err) {
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
    } catch (e) {
      // ignore
    }

    return info;
  } catch (err) {
    console.error("❌ sendMail error:", err);
    throw err;
  }
}
