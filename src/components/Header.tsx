import { useState, useEffect } from 'react';
import { MoreVertical, ExternalLink, FileText, Download } from 'lucide-react';
import '../styles/modules.css';
import '../styles/dropdown.css';

export const Header = ({ currentScreen, onBack, title, deferredPrompt, onInstall }: { currentScreen?: string, onBack?: () => void, title?: string, deferredPrompt?: any, onInstall?: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Logic to split title if it contains " - " for better styling
  const displayTitle = title || 'SISTEMA TÁXI PRO 5.0';
  const [mainTitle, subTitle] = displayTitle.includes(' - ') ? displayTitle.split(' - ') : [displayTitle, ''];

  const handleSupportClick = () => {
    window.open('https://www.instagram.com/marketelli_/', '_blank');
    setIsMenuOpen(false);
  };

  return (
    <header 
      className="glass-header" 
      style={{ 
        justifyContent: 'space-between', 
        padding: '0 16px',
        ...(currentScreen === 'pillar1' ? {
          background: 'rgba(11, 43, 75, 0.08)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid #30c522',
          boxShadow: '0 0 10px rgba(48, 197, 34, 0.3)',
          paddingBottom: '10px', // AJUSTE CIRÚRGICO: Altura vertical na parte de baixo
          height: 'auto', // Permite que o padding afete a altura
          minHeight: '60px' // Garante altura mínima consistente
        } : {}),
        ...(currentScreen === 'pillar2' ? {
          background: 'rgba(11, 43, 75, 0.08)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid #8B5CF6',
          boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)',
          paddingBottom: '10px',
          height: 'auto',
          minHeight: '60px'
        } : {}),
        ...(currentScreen === 'pillar3' ? {
          background: 'rgba(11, 43, 75, 0.08)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid #D4AF37',
          boxShadow: '0 0 10px rgba(212, 175, 55, 0.3)',
          paddingBottom: '10px',
          height: 'auto',
          minHeight: '60px'
        } : {}),
        ...(currentScreen === 'comunidade' ? {
          background: 'rgba(11, 43, 75, 0.08)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid #F97316',
          boxShadow: '0 0 10px rgba(249, 115, 22, 0.3)',
          paddingBottom: '10px',
          height: 'auto',
          minHeight: '60px'
        } : {}),
        ...(currentScreen === 'copiloto' ? {
          background: 'rgba(11, 43, 75, 0.08)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid #3B82F6',
          boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
          paddingBottom: '10px',
          height: 'auto',
          minHeight: '60px'
        } : {})
      }}
    >
      {/* Back Arrow or Spacer */}
      {currentScreen && currentScreen !== 'dashboard' && onBack ? (
        <button 
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--gold-marketelli)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: 'drop-shadow(0 0 5px rgba(212, 175, 55, 0.5))',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      ) : (
        <div style={{ width: '28px' }}></div>
      )}

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ 
          color: 'var(--gold-marketelli)', 
          fontWeight: 300, 
          margin: 0, 
          fontSize: subTitle ? '0.9rem' : '1rem',
          letterSpacing: '0.5px',
          lineHeight: '1.1'
        }}>
          {mainTitle}
        </h2>
        {subTitle && (
          <span style={{ 
            display: 'block', 
            fontSize: '0.65rem', 
            color: 'rgba(255, 255, 255, 0.8)', 
            letterSpacing: '0.5px',
            marginTop: '0px' 
          }}>
            {subTitle}
          </span>
        )}
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Support Menu (Three Dots) */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--gold-marketelli)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
        >
          <MoreVertical size={20} />
        </button>

        {isMenuOpen && (
          <>
            <div 
              style={{ position: 'fixed', inset: 0, zIndex: 998 }} 
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="support-dropdown" style={{ top: '50px', right: '10px' }}>
              {deferredPrompt && onInstall && (
                <div className="support-item" onClick={() => { setIsMenuOpen(false); onInstall(); }}>
                  <Download size={16} color="#D4AF37" />
                  <span>Instalar App</span>
                </div>
              )}
              <div className="support-item" onClick={handleSupportClick}>
                <ExternalLink size={16} color="#30c522" />
                <span>Suporte Marketelli</span>
              </div>
              {/* Novo Item: Termos e Privacidade */}
              <div className="support-item" onClick={() => { setIsMenuOpen(false); window.open('https://www.sistemataxipro.com.br/privacidadesistemataxipro', '_blank'); }}>
                <FileText size={16} color="#D4AF37" />
                <span>Termos e Privacidade</span>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
