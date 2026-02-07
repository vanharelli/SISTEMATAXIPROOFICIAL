import { useRef, useState, useEffect } from 'react';
import { useGlobalProgress } from '../context/GlobalProgressContext';
import '../styles/layout.css';
import '../styles/effects.css';
import '../styles/pillars.css';
import { LockedLayer, LockedLayerVIP, AccessGrantedOverlay } from '../components/Armor';
import { CopilotActivationOverlay } from '../components/CopilotActivationOverlay';

interface DashboardProps {
  onNavigate?: (screen: 'dashboard' | 'pillar1' | 'pillar2' | 'pillar3' | 'copiloto' | 'comunidade' | 'calculadora') => void;
  unlockedLevel?: number;
  showUnlockEffect?: boolean;
  onDismissEffect?: () => void;
}

export const DashboardScreen = ({ onNavigate, unlockedLevel = 1, showUnlockEffect = false, onDismissEffect }: DashboardProps) => {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showCopilotOverlay, setShowCopilotOverlay] = useState(false);

  // --- STATE SYNCHRONIZATION (Re-Entry & Focus Logic) ---
  const { history } = useGlobalProgress();
  const [currentUnlockedLevel, setCurrentUnlockedLevel] = useState(unlockedLevel);

  // 1. Sync with Props
  useEffect(() => {
    setCurrentUnlockedLevel(unlockedLevel);
  }, [unlockedLevel]);

  // 2. Sync with LocalStorage on Focus (Immediate Update)
  useEffect(() => {
    const handleFocus = () => {
       const storedLevel = localStorage.getItem('marketelli_unlocked_level');
       if (storedLevel) {
           const level = parseInt(storedLevel, 10);
           setCurrentUnlockedLevel(prev => Math.max(prev, level));
       }
       // Fallback: Check explicit flags
       const pilar2Unlocked = localStorage.getItem('marketelli_pilar2_unlocked') === 'true';
       if (pilar2Unlocked) setCurrentUnlockedLevel(prev => Math.max(prev, 2));
       
       const pilar3Unlocked = localStorage.getItem('marketelli_pilar3_unlocked') === 'true';
       if (pilar3Unlocked) setCurrentUnlockedLevel(prev => Math.max(prev, 3));
    };
    window.addEventListener('focus', handleFocus);
    handleFocus(); // Run on mount
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // --- STRATEGIC LOCK STATE ---
  // Using Context for centralized state management
  const pilar1CompletionTime = history.completionTimePillar1 || parseInt(localStorage.getItem('completionTimePillar1') || '0') || null;
  const [timeLeftP2, setTimeLeftP2] = useState(0);
  const LOCK_DURATION = 129600000; // 36 HOURS
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Timer Logic
  useEffect(() => {
      // SYNC: Use global start time reference from localStorage
      const startTime = parseInt(localStorage.getItem('marketelli_start_time') || '0');

      // WAITING STATE: Timer only activates after Pilar 1 Completion (when CountdownAction mounts)
      if (!startTime) {
          setTimeLeftP2(0);
          setIsTimerActive(false);
          return;
      }
      
      const checkTimer = () => {
          const now = Date.now();
          const elapsed = now - startTime;
          const remaining = Math.max(0, LOCK_DURATION - elapsed);
          
          setTimeLeftP2(remaining);
          setIsTimerActive(remaining > 0);
      };

      checkTimer();
      const interval = setInterval(checkTimer, 1000);
      return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
      const seconds = Math.floor(ms / 1000);
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Persistence Logic (Derived from Props + Context + LocalStorage)
  // Standardized State Architecture: Dashboard reflects global state immediately.
  const isPilar2Unlocked = currentUnlockedLevel >= 2;
  const isPilar3Unlocked = currentUnlockedLevel >= 3;
  // FIX: Comunidade VIP unlocks when Pilar 2 is finished (Level 3), NOT Level 4.
  // User Requirement: Unlock when "ACESSAR PILAR 3" is clicked (Transition from P2 -> P3).
  const isVipUnlocked = currentUnlockedLevel >= 3;

  // Completion Logic
  const isPilar1Finished = isPilar2Unlocked || !!pilar1CompletionTime; 
  const isPilar2Finished = isPilar3Unlocked;
  // FIX: Pilar 3 is finished when unlockedLevel >= 4 OR when "ATIVAR MÁQUINA DE VENDAS" was clicked (pilar3_maquina_ativada)
  const isPilar3Finished = currentUnlockedLevel >= 4 || localStorage.getItem('pilar3_maquina_ativada') === 'true';

  const [overlayVisible, setOverlayVisible] = useState<{ [key: number]: boolean }>(() => {
    // Keep local tracking for "seen" animation states to avoid re-playing
    const isSeen = (id: number) => localStorage.getItem(`marketelli_overlay_seen_${id}`) === 'true';
    return {
      0: !isSeen(1),
      1: !isSeen(2) && isPilar2Unlocked,
      2: !isSeen(3) && isPilar3Unlocked
    };
  });

  useEffect(() => {
    if (showUnlockEffect) {
      if (isPilar2Unlocked) {
        const seen = localStorage.getItem('marketelli_overlay_seen_2') === 'true';
        if (!seen) setOverlayVisible(prev => ({ ...prev, 1: true }));
      }
      if (isPilar3Unlocked) {
        const seen = localStorage.getItem('marketelli_overlay_seen_3') === 'true';
        if (!seen) setOverlayVisible(prev => ({ ...prev, 2: true }));
      }
    }
  }, [showUnlockEffect, isPilar2Unlocked, isPilar3Unlocked]);

  const updateActiveIndex = () => {
    const container = carouselRef.current;
    if (!container) return;
    const children = Array.from(container.children) as HTMLElement[];
    const center = container.scrollLeft + container.clientWidth / 2;
    let min = Infinity;
    let closest = 0;
    for (let i = 0; i < children.length; i++) {
      const el = children[i];
      const elCenter = el.offsetLeft + el.clientWidth / 2;
      const dist = Math.abs(elCenter - center);
      if (dist < min) {
        min = dist;
        closest = i;
      }
    }
    setActiveIndex(closest);
  };

  useEffect(() => {
    updateActiveIndex();
    const onResize = () => updateActiveIndex();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const pillars = [
    { id: 1, title: 'INSTRUTOR DE INSTALAÇÃO', subtitle: 'IA (CHATGPT)', buttonText: 'ACESSAR PILAR 1', locked: false, route: 'pillar1' as const },
    { 
        id: 2, 
        title: 'INSTRUTORA WEBDESIGNER', 
        subtitle: 'SITE PROFISSIONAL', 
        buttonText: 'ACESSAR PILAR 2', 
        locked: false, // Force Unlock for Demo Strategy
        route: 'pillar2' as const 
    },
    { id: 3, title: 'CHEFE OPERACIONAL', subtitle: 'PILAR 3 GOOGLE ADS', buttonText: 'ACESSAR PILAR 3', locked: true, route: 'pillar3' as const }, // Force Lock
  ];

  const tools = [
    { id: 1, title: 'Calculadora de Lucro', subtitle: 'Simulação Financeira v5.0', route: 'calculadora' as const, borderClass: 'border-right-calculadora', textColor: '#30c522', locked: true }, // Force Lock
    { id: 2, title: 'Co-Piloto 6.0', subtitle: 'Atendimento Automatizado', route: 'copiloto' as const, borderClass: 'border-right-copiloto', textColor: '#0096ff', locked: false },
    { id: 3, title: 'Comunidade VIP', subtitle: 'Rede Operacional Elite', route: 'comunidade' as const, borderClass: 'border-right-comunidade', textColor: '#D4AF37', locked: true }, // Force Lock
  ];

  const handlePillarClick = (index: number, locked: boolean, route: 'pillar1' | 'pillar2' | 'pillar3') => {
    // STRATEGIC LOCK: Dashboard auto-unlock removed to enforce "Golden Rule" (Chat Bridge only).
    
    if (locked) return;
    if (overlayVisible[index]) {
      setOverlayVisible(prev => ({ ...prev, [index]: false }));
      const pillarId = index + 1;
      localStorage.setItem(`marketelli_overlay_seen_${pillarId}`, 'true');
      if (showUnlockEffect && onDismissEffect) onDismissEffect();
    } else if (onNavigate) {
      onNavigate(route);
    }
  };

  return (
    <main className="main-stage" style={{ 
      paddingTop: '0',
      paddingLeft: '0',
      paddingRight: '0',
      paddingBottom: '32px', /* 1cm de respiro da base para o Badge */
      overflowY: 'hidden',
      overflowX: 'hidden',
      minHeight: '100dvh', // Garante preenchimento total da viewport sem lacunas
      width: '100%',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      
      {/* Particles Golden Video - User Requested */}
      <video
        autoPlay
        loop
        muted
        playsInline
        src="https://st3.depositphotos.com/10593848/17888/v/600/depositphotos_178885268-stock-video-semaphore-julio-avenue-buenos-aires.mp4"
        style={{
          position: 'fixed',
          inset: 0,
          width: '110vw',
          height: '110vh',
          objectFit: 'cover',
          zIndex: -2,
          opacity: 1,
          filter: 'blur(5px) brightness(0.5)',
          pointerEvents: 'none'
        }}
      />

      {/* Seção Pilares Principais (Carousel) */}
      <div className="pillars-stage" style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
        marginTop: '-80px' /* 1cm abaixo do Header */
      }}>
        <div ref={carouselRef} className="carousel-wrapper pillars-container" onScroll={updateActiveIndex} style={{
          zIndex: 10,
          transform: 'scale(1.04)',
          transformOrigin: 'center center',
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          touchAction: 'pan-x',
          alignItems: 'center',
          width: '95%',
          padding: '10px 50px'
        }}>
        {pillars.map((pillar, index) => {
          // Logic for active highlight:
          // A pillar is active if it's unlocked AND not finished.
          // Exception: If all are finished, none are active (or last one is).
          // Based on user request:
          // Pilar 1: Starts active. Green border when completed.
          // Pilar 2: Active when P1 completed. Green border when P2 completed.
          // Pilar 3: Active when P2 completed. Green border when P3 completed.
          
          let isFinished = false;
          if (pillar.id === 1) isFinished = isPilar1Finished;
          if (pillar.id === 2) isFinished = isPilar2Finished;
          if (pillar.id === 3) isFinished = isPilar3Finished;

          const isActive = !pillar.locked && !isFinished;
          
          return (
          <div 
            key={pillar.id} 
            className={`pillar-card ${isFinished ? 'neon-border-pillar-completed' : (pillar.locked ? '' : 'neon-border-pillar')} ${isActive ? 'status-active-step' : ''} ${pillar.locked ? 'status-locked' : ''} ${activeIndex === index ? 'active' : ''}`}
            style={{ 
                overflow: 'hidden', 
                position: 'relative',
                opacity: pillar.locked ? 0.5 : 1, // BLOCKED: 0.5, ACTIVE/COMPLETED: 1.0
                boxShadow: isFinished 
                  ? '0 0 20px #30c522' // COMPLETED: Neon Green #30c522 (OFFICIAL)
                  : (isActive ? '0 0 20px #D4AF37' : undefined) // ACTIVE: Gold #D4AF37
            }}
            onClick={() => handlePillarClick(index, pillar.locked, pillar.route)}
          >
            {/* LED Status: Gold for Active, Green for Finished, Red for Locked */}
            <div className={`card-led-status ${pillar.locked ? 'led-red-neon' : (isFinished ? 'led-green-completed' : 'led-gold')}`} 
                 style={isFinished ? { backgroundColor: '#30c522', boxShadow: '0 0 10px #30c522' } : (isActive ? { backgroundColor: '#D4AF37', boxShadow: '0 0 10px #D4AF37' } : undefined)}
            ></div>
            {/* TIMER OVERLAY (Scanner Animation) */}
            {pillar.id === 2 && isTimerActive && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 pointer-events-none">
                     <div className="scanner-line"></div>
                     <div className="text-2xl font-bold tracking-widest text-[#30c522] animate-pulse">
                         {formatTime(timeLeftP2)}
                     </div>
                 </div>
            )}
            {!pillar.locked && overlayVisible[index] && (
              <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 15, margin: '1px', width: 'calc(100% - 2px)', height: 'calc(100% - 2px)', borderRadius: '23px', overflow: 'hidden' }}>
                <AccessGrantedOverlay />
              </div>
            )}
            <h3 className="pillar-title text-xl" style={{ marginBottom: pillar.subtitle ? '10px' : '20px' }}>{pillar.title}</h3>
            {pillar.subtitle && <div className="text-sm" style={{ color: '#fff', fontWeight: '300', letterSpacing: '1px', marginBottom: '20px', opacity: 0.9, textAlign: 'center' }}>{pillar.subtitle}</div>}
            
            {/* Button: Gold for Active, Green for Finished */}
            <button 
                className="pillar-btn" 
                style={
                    !pillar.locked 
                    ? (isFinished 
                        ? { color: '#30c522', border: '1px solid #30c522', boxShadow: '0 0 15px #30c522' } // Finished: Neon Green
                        : { 
                            color: '#D4AF37', 
                            border: '1px solid #D4AF37',
                            boxShadow: '0 0 20px #D4AF37', // Golden Glow
                            opacity: 1
                          } // Active: Gold
                      )
                    : {}
                }
            >
                {pillar.buttonText}
            </button>
            {pillar.locked && !isTimerActive && <LockedLayer />}
          </div>
        )})}
        </div>
      </div>

      {/* Seção Ferramentas Pro */}
      <div className="tools-section pillars-container" style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '32px', /* 1cm de distância para o Badge abaixo */
        marginTop: '-10px'     /* 1cm de distância para o elemento acima */
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
          <h2 className="text-base font-light tracking-[2px] mb-1" style={{ color: '#b8b6b1ff' }}>FERRAMENTAS PRO</h2>
          <div className="neon-separator" style={{ background: '#b8b6b1ff' }}></div>
        </div>

        {tools.map((tool) => (
          <div 
            key={tool.id} 
            className="tool-card pro-tool-card" 
            style={{ marginBottom: '12px', borderRight: `3px solid ${tool.textColor}`, display: 'flex', alignItems: 'center' }}
            onClick={() => {
              if (tool.locked) return;
              if (tool.route === 'copiloto') {
                // TRAVA DE PERSISTÊNCIA DO PROTOCOLO:
                // Verifica se o usuário já viu o aviso antes.
                const hasSeenProtocol = localStorage.getItem('marketelli_copilot_protocol_seen') === 'true';
                
                if (hasSeenProtocol) {
                  // Se já viu, vai direto para o Copiloto
                  if (onNavigate) onNavigate('copiloto');
                } else {
                  // Se não viu, mostra o aviso (Overlay)
                  setShowCopilotOverlay(true);
                }
              }
              else if (tool.route && onNavigate) onNavigate(tool.route);
            }}
          >
            <div className="tool-card-content">
              <span className="tool-card-title text-lg">{tool.title}</span>
              <span className="tool-card-subtitle text-xs">{tool.subtitle}</span>
            </div>
            <div style={{ marginLeft: 'auto', marginRight: '24px', opacity: 0.5 }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            {tool.locked && <LockedLayerVIP />}
          </div>
        ))}
      </div>
      
      <CopilotActivationOverlay isVisible={showCopilotOverlay} onClose={() => { setShowCopilotOverlay(false); onNavigate?.('copiloto'); }} />
    </main>
  );
};