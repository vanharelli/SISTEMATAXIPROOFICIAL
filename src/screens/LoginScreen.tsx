import { useState } from 'react';
import '../styles/layout.css';
import { NeonLock } from '../components/Armor';
import { AuthSecureScanner } from '../components/AuthSecureScanner';
import { AccessGranted } from '../components/AccessGranted';
import { supabase } from '../services/supabase';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [loginStatus, setLoginStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    // Open-Gate Logic: Simple Regex for visual validation
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    setIsValid(validateEmail(val));
  };

  const handleLogin = async () => {
    if (!isValid || isLoading) return; // Prevent access if invalid or loading

    // ADMIN BYPASS: vanharelli@gmail.com
    if (email.toLowerCase() === 'vanharelli@gmail.com') {
      localStorage.setItem('marketelli_user_email', email);
      setLoginStatus('scanning');
      setTimeout(() => {
        setLoginStatus('success');
        setTimeout(() => {
          localStorage.setItem('marketelli_has_completed_entry', 'true');
          onLogin();
        }, 5000);
      }, 5000);
      return;
    }

    // HARD LOCK: Verify Database Connection & Save
    setIsLoading(true); // Start Loading Feedback
    
    try {
      // Attempt to save to Supabase
      const { error } = await supabase.from('leads').insert([
        { email: email, created_at: new Date().toISOString() }
      ]);

      if (error) {
        console.error('Supabase Error:', error);
        alert('ERRO DE CONEXÃO: Não foi possível validar seu acesso. Tente novamente.');
        setIsLoading(false); // Unlock buttons
        return; // HARD STOP: Do not grant access
      }

      // Success: Proceed to Scanning
      localStorage.setItem('marketelli_user_email', email);
      setLoginStatus('scanning'); 

      setTimeout(() => {
        setLoginStatus('success'); 
        setTimeout(() => {
          localStorage.setItem('marketelli_has_completed_entry', 'true');
          onLogin();
        }, 5000); 
      }, 5000); 

    } catch (err) {
      console.error('Supabase Exception:', err);
      alert('ERRO DE SISTEMA: Falha na validação. Contate o suporte.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ 
      position: 'relative', 
      zIndex: 9999, // Z-Index Prioritário: Força o login acima de tudo
      height: '100dvh', // Ajuste de Viewport: Garante altura total no mobile
      width: '100%',
      display: 'flex', // Centralização Mobile
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      
      {/* Paris Background Video - User Requested (Fixed URL) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        src="https://st3.depositphotos.com/10593848/17888/v/600/depositphotos_178885268-stock-video-semaphore-julio-avenue-buenos-aires.mp4"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: -2,
          opacity: 1,
          filter: 'blur(10px) brightness(0.4)',
          pointerEvents: 'none'
        }}
      />

      {/* IDLE STATE */}
      {loginStatus === 'idle' && (
        <div className="login-card login-pillar flex flex-col items-center justify-center gap-4 max-h-[80vh]">
          {/* BADGE SISTEMA ATIVO - ESTILO DASHBOARD REPLICADO */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 24px',
            background: 'rgba(0, 5, 10, 0.4)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            border: '1px solid #D4AF37',
            borderRadius: '9999px',
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#30c522',
              borderRadius: '50%',
              boxShadow: '0 0 10px #30c522',
              animation: 'pulseGreen 2s infinite'
            }}></div>
            <style>{`
              @keyframes pulseGreen {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(0.9); }
                100% { opacity: 1; transform: scale(1); }
              }
            `}</style>
            <span style={{
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>SISTEMA ATIVO</span>
        </div>

          <h1 className="neonFlicker" style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0px',
            width: 'auto',
            maxWidth: '100%',
            textAlign: 'center',
            margin: '0',
            fontSize: '2rem',
          }}>
            <span>SISTEMA</span>
            <span>TÁXI PRO</span>
          </h1>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            margin: '20px 0',
            color: '#B8860B', 
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '1px',
            whiteSpace: 'nowrap',
            width: 'auto',
            maxWidth: '100%'
          }}>
            <NeonLock isOpen={false} size={16} />
            <span>ACESSO SEGURO E CRIPTOGRAFADO</span>
          </div>

          <input 
            type="email" 
            placeholder="EMAIL DE COMPRA"
            value={email}
            onChange={handleEmailChange}
            style={{
              width: '100%',
              maxWidth: '80%',
              padding: '15px 20px',
              marginBottom: '15px',
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: `1px solid ${isValid ? '#30c522' : 'rgba(203, 152, 32, 0.3)'}`, // Green border if valid
              borderRadius: '12px',
              color: '#bcb9afff',
              textAlign: 'center',
              fontSize: '1rem',
              letterSpacing: '2px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.3s ease'
            }}
          />

          <button 
            onClick={handleLogin}
            disabled={!isValid || isLoading}
            style={{
              background: isValid && !isLoading ? '#D4AF37' : 'rgba(212, 175, 55, 0.2)', // Dimmed if invalid or loading
              color: isValid && !isLoading ? '#000' : 'rgba(255, 255, 255, 0.3)',
              fontWeight: 900,
              width: '100%',
              maxWidth: '80%',
              padding: '15px 20px',
              borderRadius: '12px',
              border: 'none',
              boxShadow: isValid && !isLoading ? '0 0 15px rgba(212, 175, 55, 0.5)' : 'none',
              cursor: isValid && !isLoading ? 'pointer' : 'not-allowed',
              marginTop: '0',
              fontSize: '1rem',
              letterSpacing: '1px',
              boxSizing: 'border-box',
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? 'VALIDANDO ACESSO...' : (isValid ? 'ACESSAR SISTEMA' : 'INSIRA SEU EMAIL')}
          </button>
        </div>
      )}

      {/* SCANNING OVERLAY */}
      {loginStatus === 'scanning' && (
        <AuthSecureScanner />
      )}

      {/* SUCCESS OVERLAY */}
      {loginStatus === 'success' && (
        <AccessGranted />
      )}

    </div>
  );
};
