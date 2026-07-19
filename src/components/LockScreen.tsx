import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import Noise from './ui/Noise';

// Lazy-load the WebGL shader so the main bundle stays light.
const Silk = lazy(() => import('./ui/Silk'));

interface LockScreenProps {
  onAuthenticate: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onAuthenticate }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(false);

    // Simulate verification delay for visual feedback
    setTimeout(() => {
      if (password === 'SCREEN@2026!') {
        onAuthenticate();
      } else {
        setError(true);
        setIsSubmitting(false);
        if (inputRef.current) {
          inputRef.current.select();
        }
      }
    }, 400);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0a1a10] text-white flex flex-col justify-between select-none">
      {/* Noise background */}
      <Noise 
        patternSize={250}
        patternScaleX={2}
        patternScaleY={2}
        patternRefreshInterval={2}
        patternAlpha={12}
      />

      {/* Silk background */}
      <div className="absolute inset-0 z-0 opacity-90">
        <Suspense fallback={<div className="absolute inset-0 bg-[#0a1a10]" />}>
          <Silk
            speed={4}
            scale={1.2}
            color="#14532d"
            noiseIntensity={1.5}
            rotation={0}
          />
        </Suspense>
        {/* Subtle top→bottom darkening for legibility on top of the shader */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50 pointer-events-none"
        />
      </div>

      {/* Header spacer */}
      <div className="h-16" />

      {/* Central Card */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 w-full max-w-[420px] mx-auto">
        
        {/* LOGO AREA */}
        <div className="flex flex-col items-center mb-8 fade-in">
          <img
            src="picture1.png"
            alt="SCREEN Logo"
            className="w-32 h-32 object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] mb-4"
          />
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-white">
            SCREEN Research Portal
          </h1>
          <p className="text-[13px] text-white/70 text-center mt-1">
            Access to this system is restricted to authorized personnel.
          </p>
        </div>

        {/* PASSWORD BOX */}
        <div 
          className={`w-full bg-white/[0.04] border ${error ? 'border-red-500/50' : 'border-white/[0.08]'} hover:border-white/[0.15] rounded-14 p-6 shadow-[0_12px_36px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-300 fade-in-delayed`}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label 
                htmlFor="access-key" 
                className="block text-[11px] font-mono uppercase tracking-wider text-white/50"
              >
                Access Key
              </label>
              
              <div className="relative">
                <input
                  ref={inputRef}
                  id="access-key"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter portal password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  disabled={isSubmitting}
                  className={`w-full h-10 pl-9 pr-10 bg-black/40 border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-white/[0.1] focus:border-accent'} rounded-8 text-[14px] text-white placeholder-white/30 focus:ring-1 focus:ring-accent/20 outline-none transition-all duration-180`}
                />
                
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/40">
                  <Lock size={13} />
                </div>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-3 flex items-center text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-[12px] bg-red-950/40 border border-red-900/30 px-3 py-2 rounded-6 animate-pulse">
                <AlertCircle size={13} className="shrink-0" />
                <span>Incorrect access key. Please try again.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="w-full h-10 rounded-8 bg-accent text-white hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-white/[0.06] disabled:text-white/30 font-medium text-[13px] flex items-center justify-center gap-2 cursor-pointer transition-all duration-120"
            >
              <span>{isSubmitting ? 'Verifying...' : 'Unlock Portal'}</span>
              {!isSubmitting && <ArrowRight size={13} />}
            </button>
          </form>
        </div>

      </main>

      {/* Footer */}
      <footer className="px-6 py-6 shrink-0 text-center text-[10.5px] font-mono text-white/40 tracking-wider uppercase relative z-10">
        Authorized Access Only • © {new Date().getFullYear()} SCREEN
      </footer>
    </div>
  );
};
