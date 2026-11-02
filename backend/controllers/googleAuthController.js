import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import process from 'node:process';
import User from '../models/User.js';
import { getJwtSecret } from '../config/auth.js';

const googleClient = new OAuth2Client();
const adminEmails = new Set(['ksingh2_be23@thapar.edu', 'ybhansali_be23@thapar.edu']);

export async function googleLogin(req, res) {
  // GIS's JS callback sends JSON via CORS fetch. Reject simple HTML form posts
  // to prevent login CSRF; the server's CORS allowlist protects the preflight.
  if (!req.is('application/json')) return res.status(415).json({ message: 'JSON request required.' });
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) return res.status(503).json({ message: 'Google sign-in is not configured yet. Please contact the site administrator.' });
  const credential = req.body?.credential;
  if (typeof credential !== 'string' || !credential || credential.length > 16000) {
    return res.status(400).json({ message: 'Google sign-in credential required.' });
  }
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ message: 'Google sign-in could not be verified. Please try again.' });
  }
  const email = typeof payload?.email === 'string' ? payload.email.toLowerCase().trim() : '';
  if (payload?.email_verified !== true || payload?.hd !== 'thapar.edu' ||
      !/^[^@\s]+@thapar\.edu$/.test(email) || typeof payload?.sub !== 'string' || !payload.sub) {
    return res.status(403).json({ message: 'Please choose your college-managed @thapar.edu Google account.' });
  }
  try {
    const secret = getJwtSecret();
    // Google is authoritative for this verified Workspace email. Link only an
    // unlinked account or the same subject. Preserve existing IDs, roles and data.
    const user = await User.findOneAndUpdate({
      email,
      $or: [{ googleSub: payload.sub }, { googleSub: { $exists: false } }],
    }, {
      $set: { googleSub: payload.sub },
      $setOnInsert: { name: payload.name?.trim() || email.split('@')[0], email, role: 'user' },
    }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true });
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '7d' });
    const production = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true, secure: production, sameSite: production ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const isAdmin = user.role === 'admin' || adminEmails.has(user.email.toLowerCase());
    return res.json({
      message: 'Login successful.', token, isAdmin,
      user: { id: user._id, name: user.name, email: user.email, role: user.role || 'user', isAdmin },
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Account could not be linked. Retry sign-in or contact support if this persists.' });
    console.error('Google sign-in account/session failure:', error.name);
    return res.status(500).json({ message: 'Unable to complete sign-in. Please try again.' });
  }
}
