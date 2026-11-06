import React, { useEffect, useState, useRef } from 'react';
import { FiZap, FiCheckCircle, FiX } from 'react-icons/fi';
import axios from 'axios';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api/v1';
const PING_URL = `${API_URL.replace(/\/$/, '')}/ping`;

/** How long (ms) a successful wake is cached in sessionStorage to prevent re-showing on refresh */
const SESSION_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export const ServerWakeupNotice: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'waking' | 'slow' | 'online' | 'hidden'>('checking');
  const [progress, setProgress] = useState<number>(10);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(40);
  const [dismissed, setDismissed] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let isMounted = true;
    let wakeConfirmed = false;

    // ─── sessionStorage cache check ────────────────────────────────────────────
    // If the backend was confirmed alive within the last 10 minutes (same tab
    // session), skip the banner entirely.  This prevents it re-appearing on
    // every page refresh when Render is already warm.
    const cachedAt = sessionStorage.getItem('akmart_server_awake');
    if (cachedAt) {
      const age = Date.now() - Number(cachedAt);
      if (age < SESSION_CACHE_TTL) {
        // Server is known-warm — stay hidden immediately
        setStatus('hidden');
        return;
      }
    }

    const startWakingAnimation = () => {
      // Phase 1: 0–40 s — advance progress bar from 10 % to 92 %
      const startTime = Date.now();
      const phase1Duration = 40_000;

      timerRef.current = setInterval(() => {
        if (!isMounted) return;
        const elapsed = Date.now() - startTime;
        const ratio = Math.min(elapsed / phase1Duration, 1);
        const nextProgress = Math.min(10 + Math.floor(ratio * 82), 92);
        const remaining = Math.max(0, Math.ceil((phase1Duration - elapsed) / 1000));

        setProgress(nextProgress);
        setSecondsRemaining(remaining);

        if (ratio >= 1 && timerRef.current) {
          // Phase 1 done — Render is taking longer than 40 s.
          // Switch to "slow" state: keep polling silently, hold progress at 92 %
          // and show the "taking longer" sub-message.
          clearInterval(timerRef.current);
          timerRef.current = null;
          if (isMounted) setStatus('slow');
        }
      }, 500);
    };

    const handleServerAwake = () => {
      wakeConfirmed = true;
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      setProgress(100);
      setStatus('online');
      // Cache the wake time — prevents banner on subsequent refreshes this session
      sessionStorage.setItem('akmart_server_awake', String(Date.now()));

      // Dispatch global event so page components (Home, Collection, etc.) can re-fetch
      window.dispatchEvent(new CustomEvent('akmart:backend-ready'));

      // Automatically hide banner after 2.5 seconds
      setTimeout(() => {
        if (isMounted) setStatus('hidden');
      }, 2500);
    };

    const startPolling = () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await axios.get(PING_URL, { timeout: 5000 });
          if (res.status === 200) {
            handleServerAwake();
          }
        } catch {
          // Still waiting for Render container to boot — keep polling silently
        }
      }, 3000);
    };

    // Fast initial check: probe ping endpoint with a short-timeout axios request
    const checkServer = async () => {
      try {
        const res = await axios.get(PING_URL, { timeout: 2000 });
        if (res.status === 200 && isMounted) {
          wakeConfirmed = true;
          // Server is already warm — cache it and stay hidden
          sessionStorage.setItem('akmart_server_awake', String(Date.now()));
          setStatus('hidden');
          return;
        }
      } catch {
        // Ping failed or timed out — backend is asleep/cold on Render free tier
      }

      if (!wakeConfirmed && isMounted) {
        setStatus('waking');
        startWakingAnimation();
        startPolling();
      }
    };

    // Slight delay so the banner doesn't flash on fast connections
    const initialDelay = setTimeout(() => {
      checkServer();
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(initialDelay);
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  if (dismissed || status === 'checking' || status === 'hidden') {
    return null;
  }

  const isOnline = status === 'online';
  const isSlow = status === 'slow';

  return (
    <aside
      aria-live="polite"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] w-[94vw] max-w-lg transition-all duration-500 ease-out animate-in fade-in slide-in-from-top-4"
    >
      <div
        className={`rounded-2xl backdrop-blur-xl border p-4 shadow-2xl transition-all duration-500 ${
          isOnline
            ? 'bg-emerald-950/90 border-emerald-500/50 shadow-emerald-950/50 text-white'
            : 'bg-[#10141d]/95 border-orange-500/40 shadow-black/80 text-gray-100'
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Status Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {isOnline ? (
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <FiCheckCircle className="w-5 h-5 animate-bounce" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                <FiZap className="w-5 h-5 animate-pulse" />
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold tracking-wide flex items-center gap-1.5">
                {isOnline ? (
                  <span className="text-emerald-400">Cloud Server Online!</span>
                ) : (
                  <span className="text-orange-400">Free Cloud Server Starting...</span>
                )}
              </h4>
              {/* Countdown badge — hidden once animation phase ends */}
              {!isOnline && !isSlow && (
                <span className="text-[11px] font-mono font-medium text-orange-300/80 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                  ~{secondsRemaining}s
                </span>
              )}
              {/* Slow-boot badge shown after 40 s */}
              {isSlow && (
                <span className="text-[11px] font-mono font-medium text-yellow-300/80 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20 animate-pulse">
                  still starting…
                </span>
              )}
            </div>

            <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
              {isOnline
                ? 'Connection established. Loading store catalog and products...'
                : isSlow
                ? 'Taking longer than usual — Render free tier can take up to 60 s. Almost there!'
                : 'Render free tier spins down after inactivity. Waking container (~40s)...'}
            </p>

            {/* Progress Bar */}
            <div className="mt-2.5 w-full bg-gray-800/80 rounded-full h-1.5 overflow-hidden border border-gray-700/50">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isOnline
                    ? 'bg-emerald-400'
                    : isSlow
                    ? 'bg-gradient-to-r from-yellow-500 via-orange-400 to-yellow-500 animate-pulse'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 animate-pulse'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="flex-shrink-0 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ServerWakeupNotice;
