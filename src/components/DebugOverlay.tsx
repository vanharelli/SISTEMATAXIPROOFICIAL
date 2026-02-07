import React, { useState } from 'react';
import { useGlobalProgress } from '../context/GlobalProgressContext';
import { AlertCircle, RotateCcw, Unlock, Shield, Map, Activity } from 'lucide-react';

export const DebugOverlay: React.FC = () => {
  const { history, resetHistory, unlockNextLevel, navigate } = useGlobalProgress();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!history.isDebugMode) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      zIndex: 10000,
      fontFamily: 'monospace',
      fontSize: '10px'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'rgba(255, 0, 0, 0.2)',
            border: '1px solid red',
            color: 'red',
            padding: '5px',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)'
          }}
        >
          {isExpanded ? 'DEBUG [-]' : 'DEBUG [+]'}
        </button>

        {isExpanded && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid #333',
            padding: '10px',
            borderRadius: '4px',
            color: '#0f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            minWidth: '200px'
          }}>
            <div style={{ borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '5px' }}>
              <div>PILLAR: {history.currentPillar}</div>
              <div>STEP: {history.currentStep}</div>
              <div>LEVEL: {history.unlockedLevel}</div>
            </div>

            <button 
              onClick={resetHistory}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#300', border: '1px solid red', color: '#fff', padding: '4px', cursor: 'pointer' }}
            >
              <RotateCcw size={10} /> RESETAR TUDO
            </button>

            <div style={{ fontSize: '9px', color: '#888', marginTop: '5px' }}>TELEPORTE & UNLOCK</div>
            
            <button 
              onClick={() => navigate('dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#111', border: '1px solid #333', color: '#aaa', padding: '4px', cursor: 'pointer' }}
            >
              <Activity size={10} /> DASHBOARD
            </button>

            <button 
              onClick={() => { navigate('pillar1'); unlockNextLevel(1); }}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#111', border: '1px solid #333', color: '#aaa', padding: '4px', cursor: 'pointer' }}
            >
              <Shield size={10} /> PILAR 1 (INSTALAÇÃO)
            </button>

            <button 
              onClick={() => { unlockNextLevel(2); navigate('pillar2'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#111', border: '1px solid #333', color: '#aaa', padding: '4px', cursor: 'pointer' }}
            >
              <Map size={10} /> PILAR 2 (ESTRATÉGIA)
            </button>

            <button 
              onClick={() => { unlockNextLevel(3); navigate('pillar3'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#111', border: '1px solid #333', color: '#aaa', padding: '4px', cursor: 'pointer' }}
            >
              <AlertCircle size={10} /> PILAR 3 (OPERACIONAL)
            </button>

             <button 
              onClick={() => { unlockNextLevel(4); navigate('copiloto'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#111', border: '1px solid #333', color: '#aaa', padding: '4px', cursor: 'pointer' }}
            >
              <Unlock size={10} /> COPILOTO 6.0
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
