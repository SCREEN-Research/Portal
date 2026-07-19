import React, { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import Noise from './ui/Noise';

interface LockScreenProps {
  onAuthenticate: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onAuthenticate }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);
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
        localStorage.setItem('screen_portal_authorized', 'true');
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
    <div className="relative h-screen w-full overflow-hidden bg-apple-base text-white flex flex-col justify-between select-none">
      {/* Noise background */}
      <Noise 
        patternSize={250}
        patternScaleX={2}
        patternScaleY={2}
        patternRefreshInterval={2}
        patternAlpha={10}
      />

      {/* Decorative subtle background gradient */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Header spacer */}
      <div className="h-16" />

      {/* Central Card */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 w-full max-w-[420px] mx-auto">
        
        {/* LOGO AREA */}
        <div className="flex flex-col items-center mb-8 fade-in">
          <img
            src="picture1.png"
            alt="SCREEN Logo"
            className="w-20 h-20 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] mb-3"
          />
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-2">
            <Sparkles size={10} className="text-white/60" />
            <span className="text-[10px] font-mono tracking-wider text-white/70 uppercase">
              Secure Research Environment
            </span>
          </div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-white">
            SCREEN Research Portal
          </h1>
          <p className="text-[13px] text-apple-secondary text-center mt-1">
            Access to this system is restricted to authorized personnel.
          </p>
        </div>

        {/* PASSWORD BOX */}
        <div 
          className={`w-full bg-apple-surface border ${error ? 'border-red-500/50' : 'border-apple-border'} rounded-14 p-6 shadow-[0_12px_36px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-300 fade-in-delayed`}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label 
                htmlFor="access-key" 
                className="block text-[11px] font-mono uppercase tracking-wider text-apple-gray"
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
                  className={`w-full h-10 pl-9 pr-10 bg-apple-base/80 border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-apple-border focus:border-accent'} rounded-8 text-[14px] text-white placeholder-apple-tertiary focus:ring-1 focus:ring-accent/20 outline-none transition-all duration-180`}
                />
                
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-apple-tertiary">
                  <Lock size={13} />
                </div>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-3 flex items-center text-apple-tertiary hover:text-apple-gray transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-[12px] bg-red-950/20 border border-red-900/30 px-3 py-2 rounded-6 animate-pulse">
                <AlertCircle size={13} className="shrink-0" />
                <span>Incorrect access key. Please try again.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="w-full h-10 rounded-8 bg-accent text-white hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-apple-border disabled:text-apple-tertiary font-medium text-[13px] flex items-center justify-center gap-2 cursor-pointer transition-all duration-120"
            >
              <span>{isSubmitting ? 'Verifying...' : 'Unlock Portal'}</span>
              {!isSubmitting && <ArrowRight size={13} />}
            </button>
          </form>
        </div>

        {/* HELP HINT ACCORDION */}
        <div className="w-full mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="text-[11px] font-mono text-apple-secondary hover:text-white/80 transition-colors bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] rounded-full px-3 py-1 cursor-pointer"
          >
            {showHint ? 'Hide access key hint' : 'Show access key hint'}
          </button>
          
          {showHint && (
            <div className="mt-3 p-3 bg-apple-surface/60 border border-apple-border rounded-8 text-left text-[12px] text-apple-gray leading-relaxed space-y-1 fade-in">
              <p className="font-medium text-white/90">Reviewer Information:</p>
              <p>For testing, enter the project access key:</p>
              <code className="block select-all font-mono bg-apple-base/80 border border-apple-border px-2 py-1 rounded text-accent font-semibold mt-1">
                SCREEN@2026!
              </code>
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="px-6 py-6 shrink-0 text-center text-[10.5px] font-mono text-apple-tertiary tracking-wider uppercase">
        Authorized Access Only • © {new Date().getFullYear()} SCREEN
      </footer>
    </div>
  );
};
