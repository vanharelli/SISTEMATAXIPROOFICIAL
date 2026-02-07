import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface PWAInstallModalProps {
  deferredPrompt: any;
  onInstall: () => void;
  onDismiss: () => void;
}

export const PWAInstallModal = ({ deferredPrompt, onInstall, onDismiss }: PWAInstallModalProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (deferredPrompt) {
      // Small delay to ensure smooth entrance animation
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [deferredPrompt]);

  if (!deferredPrompt || !isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      width: '100%',
      height: 'auto',
      zIndex: 9999, // Highest priority
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      pointerEvents: 'none' // Allow clicks through the empty space
    }}>
      <div style={{
        background: 'rgba(10, 10, 10, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid #D4AF37',
        boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.8)',
        padding: '24px',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        pointerEvents: 'auto',
        transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        {/* Close Button */}
        <button 
          onClick={() => { setIsVisible(false); setTimeout(onDismiss, 500); }}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#rgba(255,255,255,0.5)',
            cursor: 'pointer'
          }}
        >
          <X size={20} color="#666" />
        </button>

        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
          marginBottom: '8px'
        }}>
           <Download size={32} color="#000" strokeWidth={2.5} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h3 style={{ 
            color: '#D4AF37', 
            fontSize: '1.25rem', 
            fontWeight: '700', 
            margin: '0 0 4px 0',
            letterSpacing: '0.5px'
          }}>
            INSTALAR APLICATIVO
          </h3>
          <p style={{ 
            color: '#ccc', 
            fontSize: '0.9rem', 
            margin: 0,
            lineHeight: '1.4'
          }}>
            Instale a versão oficial para melhor desempenho e acesso offline.
          </p>
        </div>

        <button 
          onClick={onInstall}
          style={{
            background: '#D4AF37',
            color: '#000',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 32px',
            fontSize: '1rem',
            fontWeight: '800',
            width: '100%',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          <Download size={20} />
          INSTALAR AGORA
        </button>
      </div>
    </div>
  );
};
