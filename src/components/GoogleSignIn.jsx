import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.js';

let scriptPromise;
function loadGoogle() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timeout = setTimeout(() => { script.remove(); reject(new Error('Google sign-in took too long to load. Please reload this page.')); }, 15000);
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      clearTimeout(timeout);
      if (window.google?.accounts?.id) resolve(window.google);
      else reject(new Error('Google sign-in is unavailable. Please reload this page.'));
    };
    script.onerror = () => { clearTimeout(timeout); script.remove(); reject(new Error('Unable to load Google sign-in. Check your connection or browser blockers and reload.')); };
    document.head.appendChild(script);
  }).catch(error => { scriptPromise = undefined; throw error; });
  return scriptPromise;
}

export default function GoogleSignIn() {
  const container = useRef(null);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

  useEffect(() => {
    if (!clientId) return;
    let active = true;
    let pending = false;
    loadGoogle().then(google => {
      if (!active) return;
      google.accounts.id.initialize({
        client_id: clientId, hd: 'thapar.edu', auto_select: false,
        callback: async ({ credential }) => {
          if (!active || pending || !credential) return;
          pending = true;
          setBusy(true);
          setError('');
          try {
            const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
              method: 'POST', credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential }), signal: AbortSignal.timeout(60000),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.message || 'Google sign-in failed. Please try again.');
            if (!data.token || !data.user?.email) throw new Error('Sign-in response was incomplete. Please try again.');
            if (!active) return;
            try {
              localStorage.setItem('authToken', data.token);
              localStorage.setItem('userEmail', data.user.email);
              localStorage.setItem('isAdmin', data.isAdmin ? 'true' : 'false');
            } catch { /* The HTTP-only session cookie remains available. */ }
            navigate('/landing-login', { replace: true });
          } catch (failure) {
            if (active) setError(failure.name === 'TimeoutError' ? 'The server took too long to respond. Please try again.' : failure.message);
          } finally {
            pending = false;
            if (active) setBusy(false);
          }
        },
      });
      google.accounts.id.renderButton(container.current, {
        theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with',
        width: Math.min(360, Math.floor(container.current.getBoundingClientRect().width)),
      });
      setReady(true);
    }).catch(failure => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [clientId, navigate]);

  return <div className="space-y-4 text-center">
    <p className="text-sm text-gray-300">Continue with your college-managed @thapar.edu Google account.</p>
    <div ref={container} aria-busy={busy} className={`w-full flex justify-center min-h-11 ${busy ? 'pointer-events-none opacity-60' : ''}`} />
    {!clientId && <p role="status" className="text-sm text-amber-200">Google sign-in is being set up. Please try again later.</p>}
    {clientId && !ready && !error && <p role="status" className="text-sm text-gray-300">Loading Google sign-in…</p>}
    {busy && <p role="status" className="text-sm text-gray-300">Signing you in… The server may take a moment to wake up.</p>}
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
  </div>;
}
