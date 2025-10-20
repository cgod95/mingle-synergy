import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentUserProfile } from '../services/firebase/userProfileService';

export default function RequireProfileComplete({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const [ok, setOk] = useState(false);
  const [checking, setChecking] = useState(true);
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) { setChecking(false); setOk(false); return; }
      try {
        const p = await getCurrentUserProfile();
        const complete = !!p && !!p.displayName?.trim() && (p.age ?? 0) >= 18;
        if (!mounted) return;
        if (complete) setOk(true);
        else nav('/profile', { replace: true, state: { from: loc.pathname } });
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, [user, nav, loc.pathname]);

  if (checking) return <div style={{ padding: 24 }}>Checking profile…</div>;
  if (!ok) return null;
  return children;
}
