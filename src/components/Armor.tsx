import React from 'react';
import '../styles/modules.css';

// Componente de proteção/estrutura base
export const Armor = ({ children }: { children: React.ReactNode }) => {
  return <div className="armor-container">{children}</div>;
};

export const ScannerOverlay = () => {
  return (
    <div className="scanner-line"></div>
  );
};

export const NeonLock = ({ isOpen = false, status, size = 40, color, glowColor }: { isOpen?: boolean; status?: 'locked' | 'completed'; size?: number; color?: string; glowColor?: string }) => {
  const isUnlocked = isOpen || status === 'completed';
  
  // Default Colors
  const defaultColor = isUnlocked ? '#30c522' : undefined; // Undefined falls back to CSS (Gold)
  const defaultFilter = isUnlocked ? 'drop-shadow(0 0 20px #30c522)' : undefined; // Undefined falls back to CSS (Gold Shadow)

  // Overrides
  const finalColor = color || defaultColor;
  const finalFilter = glowColor ? `drop-shadow(0 0 20px ${glowColor})` : defaultFilter;

  return (
    <div 
      className="neon-lock-icon"
      style={{ 
        fontSize: `${size}px`,
        color: finalColor,
        filter: finalFilter
      }}
    >
      {isUnlocked ? '🔓' : '🔒'}
    </div>
  );
};

export const LockedLayer = () => {
  return (
    <div className="locked-layer">
      <NeonLock />
      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', letterSpacing: '1px' }}>
        ACESSO RESTRITO
      </span>
      <ScannerOverlay />
    </div>
  );
};

export const LockedLayerVIP = () => {
  return (
    <div className="locked-layer" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%'
    }}>
      <NeonLock />
    </div>
  );
};

export const AccessGrantedOverlay = () => {
  return (
    <div className="access-granted-overlay">
      <div className="access-granted-bg"></div>
      <div className="unlocked-icon-container">
        <span className="unlocked-icon-large">🔓</span>
      </div>
    </div>
  );
};
