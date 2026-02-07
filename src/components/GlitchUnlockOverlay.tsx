import React, { useEffect, useState } from 'react';
import { NeonLock } from './Armor';

interface GlitchUnlockOverlayProps {
  isVisible: boolean;
  onUnlock: () => void;
  title?: string;
  buttonText?: string;
  initialText?: string;
}

export const GlitchUnlockOverlay: React.FC<GlitchUnlockOverlayProps> = ({ 
  isVisible, 
  onUnlock,
  title = "PILAR 2 DESBLOQUEADO",
  buttonText = "ACESSAR PILAR 2",
  initialText = "> INICIALIZANDO PROTOCOLO PILAR 2..."
}) => {
  const [phase, setPhase] = useState<'hidden' | 'terminal' | 'glitch' | 'final'>('hidden');
  const [lockState, setLockState] = useState<'closed' | 'opening' | 'open' | 'breathing'>('closed');
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setPhase('hidden');
      setLockState('closed');
      setShowButton(false);
      return;
    }

    // Timeline Sequence
    setPhase('terminal'); // T=0
    setLockState('closed');
    setShowButton(false);

    const glitchTimer = setTimeout(() => {
      setPhase('glitch'); // T=1.5s
    }, 1500);

    const finalTimer = setTimeout(() => {
      setPhase('final'); // T=3.5s
      
      // Post-Glitch Timeline
      // T=0ms (relative to final): Closed Lock (already set)
      
      // T=500ms: Unlock Pop
      setTimeout(() => {
        setLockState('open');
      }, 500);

      // T=600ms: Breathing/Pulse
      setTimeout(() => {
        setLockState('breathing');
      }, 600);

      // T=1000ms: Button Fade In
      setTimeout(() => {
        setShowButton(true);
      }, 1000);

    }, 3500);

    return () => {
      clearTimeout(glitchTimer);
      clearTimeout(finalTimer);
    };
  }, [isVisible]);

  if (!isVisible || phase === 'hidden') return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100dvh',
      backgroundColor: '#000000',
      zIndex: 999999, // MAX Z-INDEX to cover everything including Header
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      
      {/* FORCE HEADER HIDING */}
      <style>{`
        header, .header, #header {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            z-index: -1 !important;
        }
      `}</style>
      
      {/* PHASE 1: TERMINAL (0s - 1.5s) */}
      {phase === 'terminal' && (
        <div style={{
          fontFamily: "'Courier New', Courier, monospace",
          color: '#30c522',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          letterSpacing: '1px',
          textShadow: '0 0 10px rgba(48, 197, 34, 0.5)',
          animation: 'blinkCursor 0.8s infinite step-end'
        }}>
          {initialText}<span style={{ animation: 'blink 1s infinite' }}>_</span>
        </div>
      )}

      {/* PHASE 2: GLITCH CHAOS (1.5s - 3.5s) */}
      {phase === 'glitch' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'shake 0.1s infinite'
        }}>
          {/* Background Noise */}
          <div style={{
            position: 'absolute', inset: 0,
            opacity: 0.1,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
            pointerEvents: 'none'
          }} />

          {/* RGB Split Text Effect */}
          <div className="glitch-text" data-text="ERROR: REWRITING SYSTEM KERNEL..." style={{
            fontFamily: 'monospace',
            fontSize: '2rem',
            color: '#fff',
            position: 'relative',
            animation: 'glitchText 0.3s infinite'
          }}>
            ERROR: REWRITING SYSTEM KERNEL...
          </div>

          {/* Random colored blocks */}
          <div style={{
            position: 'absolute',
            top: '20%',
            left: 0,
            width: '100%',
            height: '2px',
            background: 'red',
            opacity: 0.5,
            animation: 'scanline 2s linear infinite'
          }} />
           <div style={{
            position: 'absolute',
            bottom: '30%',
            left: 0,
            width: '100%',
            height: '4px',
            background: 'cyan',
            opacity: 0.3,
            animation: 'scanline 3s linear infinite reverse'
          }} />
        </div>
      )}

      {/* PHASE 3: REVELATION (3.5s+) */}
      {phase === 'final' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'fadeIn 0.5s ease-out',
          textAlign: 'center'
        }}>
          
          {/* Lock Container */}
          <div style={{ 
            marginBottom: '30px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '150px',
            width: '150px',
            position: 'relative'
          }}>
            {/* Background Glow */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(48, 197, 34, 0.4) 0%, rgba(0, 0, 0, 0) 70%)',
              pointerEvents: 'none',
              animation: 'pulseGlow 2s infinite'
            }} />

            {/* Floating Container */}
            <div style={{
              animation: 'float 3s ease-in-out infinite',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {/* T=0ms: Closed Lock (Gray) */}
              {lockState === 'closed' && (
                <div style={{ filter: 'grayscale(100%) opacity(0.5)' }}>
                  <NeonLock size={100} />
                </div>
              )}

              {/* T=500ms: Unlock Pop (Green) */}
              {lockState === 'open' && (
                <div style={{ 
                  transform: 'scale(1.1)',
                  transition: 'transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                  <NeonLock size={100} status="completed" />
                </div>
              )}

              {/* T=600ms+: Breathing Unlock (Green + Glow) */}
              {lockState === 'breathing' && (
                <div style={{ 
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}>
                  <NeonLock size={100} status="completed" />
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <h1 style={{
            color: '#fff',
            fontSize: '2.5rem',
            fontWeight: '800',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '40px',
            textShadow: '0 0 20px rgba(255,255,255,0.3)',
            fontFamily: 'sans-serif'
          }}>
            {title}
          </h1>

          {/* Action Button */}
          <div style={{
            opacity: showButton ? 1 : 0,
            transform: showButton ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
          }}>
            <button
              onClick={onUnlock}
              style={{
                background: '#30c522',
                color: '#000',
                border: 'none',
                padding: '18px 48px',
                fontSize: '1.2rem',
                fontWeight: '900',
                borderRadius: '50px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: '0 0 30px rgba(48, 197, 34, 0.4)',
                animation: 'pulseBtn 1.5s ease-in-out infinite'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 0 50px rgba(48, 197, 34, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(48, 197, 34, 0.4)';
              }}
            >
              {buttonText}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        @keyframes glitchText {
          0% { text-shadow: 2px 0 red, -2px 0 blue; clip-path: inset(40% 0 61% 0); }
          20% { text-shadow: -2px 0 red, 2px 0 blue; clip-path: inset(92% 0 1% 0); }
          40% { text-shadow: 2px 0 red, -2px 0 blue; clip-path: inset(43% 0 1% 0); }
          60% { text-shadow: -2px 0 red, 2px 0 blue; clip-path: inset(25% 0 58% 0); }
          80% { text-shadow: 2px 0 red, -2px 0 blue; clip-path: inset(54% 0 7% 0); }
          100% { text-shadow: -2px 0 red, 2px 0 blue; clip-path: inset(58% 0 43% 0); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        @keyframes pulseBtn {
          0% { box-shadow: 0 0 20px rgba(48, 197, 34, 0.4); }
          50% { box-shadow: 0 0 40px rgba(48, 197, 34, 0.8); }
          100% { box-shadow: 0 0 20px rgba(48, 197, 34, 0.4); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(0.9); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 20px #30c522); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 35px #30c522); }
        }
      `}</style>
    </div>
  );
};
