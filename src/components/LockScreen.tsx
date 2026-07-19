import React, { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import Dither from './ui/Dither';

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
    // Preload Silk background animation bundle in the background while typing the password
    import('./ui/Silk').catch(() => {});

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
      if (password === 'Screen@2026') {
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
    <div className="relative h-screen w-full overflow-hidden bg-[#0c0d0e] text-white flex flex-col select-none">
      
      {/* Dither background - low-opacity interactive grey-green waves */}
      <div className="absolute inset-0 z-0 opacity-25">
        <Dither
          waveColor="#15261d"
          disableAnimation={false}
          enableMouseInteraction={false}
          mouseRadius={0.25}
          colorNum={4}
          waveAmplitude={0.32}
          waveFrequency={3.5}
          waveSpeed={0.06}
          pixelSize={2}
        />
        {/* Subtle top→bottom darkening for legibility on top of the shader */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none"
        />
      </div>

      {/* Subtle central glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-accent/[0.06] blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Viewport Centered Content */}
      <main className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 w-full max-w-[400px] mx-auto z-10">
        
        {/* LOGO AREA - Halved visual gap again using -mb-7 sm:-mb-11 */}
        <div className="flex flex-col items-center mb-6 fade-in">
          <img
            src="picture1.png"
            alt="SCREEN Logo"
            className="w-36 h-36 sm:w-48 sm:h-48 object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] -mt-8 -mb-7 sm:-mb-11"
          />
          <h1 className="text-[20px] font-semibold tracking-[-0.035em] text-white leading-none text-center">
            SCREEN Research Portal
          </h1>
          <p className="text-[10.5px] text-white/40 tracking-[0.2em] uppercase text-center mt-2.5">
            Authorized Access Only
          </p>
        </div>

        {/* PASSWORD BOX - Translucent glassmorphism card */}
        <div 
          className={`w-full bg-white/[0.02] border ${error ? 'border-red-500/50' : 'border-white/[0.06]'} hover:border-white/[0.12] rounded-14 p-5 shadow-[0_12px_36px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 fade-in-delayed`}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <input
                  ref={inputRef}
                  id="access-key"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter access key"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  disabled={isSubmitting}
                  className={`w-full h-9 pl-8 pr-10 bg-black/40 border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-white/[0.08] focus:border-accent'} rounded-6 text-[13px] text-white placeholder-white/30 focus:ring-1 focus:ring-accent/20 outline-none transition-all duration-120`}
                />
                
                <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-white/30">
                  <Lock size={12} />
                </div>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-2.5 flex items-center text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-red-400 text-[11px] bg-red-950/20 border border-red-900/30 px-2.5 py-1.5 rounded-6 animate-pulse">
                <AlertCircle size={12} className="shrink-0" />
                <span>Access key rejected. Please try again.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="w-full h-9 rounded-6 bg-accent text-white hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-white/[0.06] disabled:text-white/30 font-medium text-[12px] flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-120"
            >
              <span>{isSubmitting ? 'Verifying...' : 'Authenticate'}</span>
              {!isSubmitting && <ArrowRight size={12} />}
            </button>
          </form>
        </div>

      </main>

      {/* Footer */}
      <footer className="px-6 py-6 shrink-0 text-center text-[10.5px] text-apple-tertiary tracking-wider uppercase relative z-10">
        Authorized Access Only • © {new Date().getFullYear()} SCREEN
      </footer>
    </div>
  );
};
