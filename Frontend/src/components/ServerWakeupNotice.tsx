import React, { useEffect, useState, useRef } from 'react';
import { FiZap, FiCheckCircle, FiX } from 'react-icons/fi';
import apiClient from '../api/client';

export const ServerWakeupNotice: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'waking' | 'online' | 'hidden'>('checking');
  const [progress, setProgress] = useState<number>(10);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(35);
  const [dismissed, setDismissed] = useState<boolean>(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Check if server was already verified awake in this browser session
    const isAlreadyAwake = sessionStorage.getItem('akmart_server_awake') === 'true';
    if (isAlreadyAwake) {
      setStatus('hidden');
      return;
    }

    let isMounted = true;
    let wakeConfirmed = false;

    const startWakingAnimation = () => {
      // Smoothly advance progress bar from 10% to 92% over 35 seconds
      const startTime = Date.now();
      const totalDuration = 35000; // 35 seconds estimated spin-up time

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const ratio = Math.min(elapsed / totalDuration, 1);
        const nextProgress = Math.min(10 + Math.floor(ratio * 82), 92);
        const remaining = Math.max(0, Math.ceil((totalDuration - elapsed) / 1000));

        setProgress(nextProgress);
        setSecondsRemaining(remaining);

        if (ratio >= 1 && timerRef.current) {
          clearInterval(timerRef.current);
        }
      }, 500);
    };

    const handleServerAwake = () => {
      wakeConfirmed = true;
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      setProgress(100);
      setStatus('online');
      sessionStorage.setItem('akmart_server_awake', 'true');

      // Dispatch global event so page components (Home, Collection, etc.) can re-fetch
      window.dispatchEvent(new CustomEvent('akmart:backend-ready'));

      // Automatically hide banner after 2.5 seconds
      setTimeout(() => {
        if (isMounted) setStatus('hidden');
      }, 2500);
    };

    const startPolling = () => {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await apiClient.get('/ping', { timeout: 4000 });
          if (res.status === 200) {
            handleServerAwake();
          }
        } catch {
          // Still waiting for Render container to boot
        }
      }, 3500);
    };

    // Fast check: probe ping endpoint
    const checkServer = async () => {
      try {
        const res = await apiClient.get('/ping', { timeout: 3000 });
        if (res.status === 200 && isMounted) {
          wakeConfirmed = true;
          sessionStorage.setItem('akmart_server_awake', 'true');
          setStatus('hidden');
          return;
        }
      } catch {
        // Ping failed or timed out — backend is cold/spinning up on Render free tier
      }

      if (!wakeConfirmed && isMounted) {
        setStatus('waking');
        startWakingAnimation();
        startPolling();
      }
    };

    // Delay 1.5s before showing notice so users on warm servers never see a flicker
    const initialDelay = setTimeout(() => {
      checkServer();
    }, 1500);

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
              {!isOnline && (
                <span className="text-[11px] font-mono font-medium text-orange-300/80 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                  ~{secondsRemaining}s
                </span>
              )}
            </div>

            <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
              {isOnline
                ? 'Connection established. Loading store catalog and products...'
                : 'Render free tier spins down after inactivity. Waking container (~35s)...'}
            </p>

            {/* Progress Bar */}
            <div className="mt-2.5 w-full bg-gray-800/80 rounded-full h-1.5 overflow-hidden border border-gray-700/50">
              <div 
                className={`h-full transition-all duration-300 rounded-full ${
                  isOnline 
                    ? 'bg-emerald-400' 
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
