import { useState, useEffect } from 'react';
import './styles/core.css'; // Core styles first
import './styles/layout.css'; // Layout styles second
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { AvisosScreen } from './screens/AvisosScreen';
import { ChatInstalacaoScreen, ChatEstrategiaScreen, ChatOperacionalScreen, ChatCopilotoScreen, ChatComunidadeScreen, ChatCalculadoraScreen } from './screens/ChatScreens';
import { Header } from './components/Header';
import { StatusBadge } from './components/StatusBadge'; // Badge Global
import { GlitchUnlockOverlay } from './components/GlitchUnlockOverlay';
import { PWAInstallModal } from './components/PWAInstallModal'; // Import PWA Modal
import { useGlobalProgress } from './context/GlobalProgressContext';

export const App = () => {
  // PWA INSTALL LOGIC
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPWAModal, setShowPWAModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // 1. Trigger Installation Prompt
      deferredPrompt.prompt();
      
      // 2. Wait for User Choice (Install or Cancel)
      await deferredPrompt.userChoice;
      
      // 3. Clear Prompt & Close Modal
      setDeferredPrompt(null);
      setShowPWAModal(false);
    }
    
    // 4. Redirect to Kiwify (After interaction or if prompt missing)
    // window.location.href = 'https://pay.kiwify.com.br/F4YMAcB';
  };

  const handleDismissPWA = () => {
    setShowPWAModal(false);
    localStorage.setItem('marketelli_pwa_dismissed', 'true');
  };

  // PERSISTENT GATEWAY & SKIP LOGIC
  // Check for valid session + completed entry flag
  const hasEntry = localStorage.getItem('marketelli_has_completed_entry') === 'true';
  const hasSession = !!localStorage.getItem('skynet_history');
  
  // DIRECT DEMO STRATEGY: Bypass Auth
  const [isLogged, setIsLogged] = useState(false);
  const [hasSeenAvisos, setHasSeenAvisos] = useState(hasEntry && hasSession);
  
  // Navigation & Progression State managed by GlobalProgressContext
  const { history, navigate, unlockNextLevel } = useGlobalProgress();

  // STANDALONE MODE ENFORCEMENT: Always show Login first
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      console.log('Running in Standalone Mode: Forcing Login Screen');
      setIsLogged(false);
    }
  }, []);

  // Safety Check: If session expires (context clears storage), force logout
  useEffect(() => {
    // Disabled for Demo Strategy
    /*
    if (isLogged && !localStorage.getItem('marketelli_has_completed_entry')) {
      setIsLogged(false);
      setHasSeenAvisos(false);
    }
    */
  }, [history, isLogged]);

  const currentScreen = history.currentPillar;
  const unlockedLevel = history.unlockedLevel;

  // AUTO-TRIGGER PWA MODAL
  useEffect(() => {
    // TRIGGER ON LOGIN PAGE (!isLogged) OR DASHBOARD
    if (deferredPrompt && (!isLogged || currentScreen === 'dashboard')) {
      const hasDismissed = localStorage.getItem('marketelli_pwa_dismissed');
      if (!hasDismissed) {
        setShowPWAModal(true);
      }
    }
  }, [deferredPrompt, isLogged, currentScreen]);
  
  const [showUnlockEffect, setShowUnlockEffect] = useState(false); // Used to trigger unlock effect on return
  
  // Configuração dinâmica para o Overlay de Desbloqueio (Transição entre Pilares)
  interface UnlockConfig {
    title: string;
    buttonText: string;
    initialText: string;
    target: 'dashboard' | 'pillar1' | 'pillar2' | 'pillar3' | 'copiloto' | 'comunidade' | 'calculadora';
  }
  const [unlockConfig, setUnlockConfig] = useState<UnlockConfig | null>(null);

  // Security: Visibility Change Listener removed to prevent unwanted resets/redirects on focus loss.
  // This allows the app to STAY on the current screen when returning from minimized state.


  const handleNavigate = (screen: 'dashboard' | 'pillar1' | 'pillar2' | 'pillar3' | 'copiloto' | 'comunidade' | 'calculadora') => {
    // Logic: Returning from Pillar 1 unlocks Pillar 2, Returning from Pillar 2 unlocks Pillar 3
    // UPDATED: Strict progression check. Only unlock if 100% completed.
    if (screen === 'dashboard') {
      // PILAR 1 -> PILAR 2: REMOVED AUTO-UNLOCK.
      // Now strictly handled by the "Acessar Pilar 2" button in ChatScreens.tsx
      
      if (currentScreen === 'pillar2' && unlockedLevel < 3) {
        // Pilar 2 ends at step 11 ("VITÓRIA! SEU SITE ESTÁ NO AR").
        if (history.currentStep >= 11) {
          unlockNextLevel(3);
          setShowUnlockEffect(true);
        }
      } else if (currentScreen === 'pillar3' && unlockedLevel < 4) {
        // Universalização do Pilar 3: Ao retornar, marca como concluído (Nível 4)
        unlockNextLevel(4);
        setShowUnlockEffect(true);
      }
    }

    // Update currentScreen via context
    navigate(screen);
  };

  // Native Back Button Handling
  useEffect(() => {
    if (currentScreen !== 'dashboard') {
      window.history.pushState(null, '', window.location.href);
    }
  }, [currentScreen]);

  useEffect(() => {
    const handlePopState = () => {
      if (currentScreen !== 'dashboard') {
        handleNavigate('dashboard');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentScreen]);

  const getHeaderTitle = () => {
    switch (currentScreen) {
      case 'pillar1': return 'INSTRUTOR DE INSTALAÇÃO - PILAR 1 (IA CHATGPT)';
      case 'pillar2': return 'INSTRUTORA WEBDESIGNER - PILAR 2 SITE PROFISSIONAL';
      case 'pillar3': return 'CHEFE OPERACIONAL - PILAR 3 GOOGLE ADS';
      case 'copiloto': return 'COPILOTO 6.0 - ATENDIMENTO AUTOMATIZADO';
      case 'calculadora': return 'CALCULADORA PRO - SIMULAÇÃO FINANCEIRA V5.0';
      case 'comunidade': return 'COMUNIDADE VIP - REDE OPERACIONAL ELITE';
      default: return 'SISTEMA TÁXI PRO 5.0';
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <DashboardScreen 
            onNavigate={handleNavigate}
            unlockedLevel={unlockedLevel}
            showUnlockEffect={showUnlockEffect}
            onDismissEffect={() => setShowUnlockEffect(false)}
          />
        );
      case 'pillar1':
        return (
          <ChatInstalacaoScreen 
            onNavigate={handleNavigate} 
            onUnlock={() => unlockNextLevel(2)}
            onShowUnlock={() => {
              setUnlockConfig({
                title: "PILAR 2 DESBLOQUEADO",
                buttonText: "ACESSAR PILAR 2",
                initialText: "> INICIALIZANDO PROTOCOLO PILAR 2...",
                target: 'pillar2'
              });
            }} 
          />
        );
      case 'pillar2':
        return (
          <ChatEstrategiaScreen 
            onNavigate={handleNavigate}
            onUnlock={() => unlockNextLevel(3)}
            onShowUnlock={() => {
              setUnlockConfig({
                title: "PILAR 3 DESBLOQUEADO",
                buttonText: "ACESSAR PILAR 3",
                initialText: "> INICIALIZANDO PROTOCOLO PILAR 3...",
                target: 'pillar3'
              });
            }}
          />
        );
      case 'pillar3':
        return <ChatOperacionalScreen onNavigate={handleNavigate} />;
      case 'copiloto':
        return <ChatCopilotoScreen />;
      case 'calculadora':
        return <ChatCalculadoraScreen />;
      case 'comunidade':
        return <ChatComunidadeScreen />;
      default:
        // CORREÇÃO DE SEGURANÇA (ANTI-BLACKOUT):
        // Se o estado da tela for inválido ou indefinido, renderiza a Dashboard por padrão.
        // Isso impede que o app fique em tela preta caso a navegação falhe.
        return (
          <DashboardScreen 
            onNavigate={handleNavigate}
            unlockedLevel={unlockedLevel || 1}
            showUnlockEffect={showUnlockEffect}
            onDismissEffect={() => setShowUnlockEffect(false)}
          />
        );
    }
  };

  return (
    // CORREÇÃO MESTRE: h-[100dvh] para altura dinâmica real no celular e overflow-hidden para travar scroll
    <div 
      className="h-[100dvh] w-full relative overflow-hidden bg-[#0a0a0a] overscroll-none"
    >
      
      {/* Background Video Layer - Absoluto e Z-10 */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-10"
        style={{
          filter: 'blur(12px) brightness(0.45) saturate(1.1)',
          transform: 'scale(1.05)',
        }}
      >
        <source src="https://cdn.pixabay.com/video/2016/11/28/6561-193466580_large.mp4" type="video/mp4" />
      </video>

      {/* Vignette Contrast Layer */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, transparent 40%, #050505 100%)',
          opacity: 0.7
        }}
      />

      {!isLogged ? (
        <div className="relative z-10 w-full h-full flex flex-col overflow-y-auto">
          <LoginScreen onLogin={() => setIsLogged(true)} />
        </div>
      ) : !hasSeenAvisos ? (
        <div className="relative z-10 w-full h-full flex flex-col overflow-y-auto">
          <AvisosScreen onConfirm={() => setHasSeenAvisos(true)} />
        </div>
      ) : (
        // WRAPPER PRINCIPAL DO APP LOGADO
        // CORREÇÃO: h-full garante que o container respeite o 100dvh do pai
        <div className="relative z-10 w-full h-full flex flex-col justify-between items-center overflow-hidden">
          {!(unlockConfig?.title === "PILAR 2 DESBLOQUEADO" || unlockConfig?.title === "PILAR 3 DESBLOQUEADO") && (
            <Header 
              currentScreen={currentScreen} 
              onBack={() => handleNavigate('dashboard')}
              title={getHeaderTitle()}
              deferredPrompt={deferredPrompt}
              onInstall={handleInstallClick}
            />
          )}
          
          <div className="app-container flex-1 w-full h-full flex flex-col overflow-hidden relative" style={{ paddingTop: (unlockConfig?.title === "PILAR 2 DESBLOQUEADO" || unlockConfig?.title === "PILAR 3 DESBLOQUEADO" || ['pillar1', 'pillar2', 'pillar3', 'copiloto', 'comunidade', 'calculadora'].includes(currentScreen)) ? '0' : '65px' }}>
            {renderScreen()}
          </div>
          
          {/* Badge hidden on specific chat screens per user request */}
          {!['pillar1', 'pillar2', 'pillar3', 'copiloto', 'calculadora', 'comunidade'].includes(currentScreen) && (
            <StatusBadge unlockedLevel={unlockedLevel} />
          )}
          <GlitchUnlockOverlay 
            isVisible={!!unlockConfig} 
            title={unlockConfig?.title}
            buttonText={unlockConfig?.buttonText}
            initialText={unlockConfig?.initialText}
            onUnlock={() => {
              if (unlockConfig) {
                const target = unlockConfig.target;
                setUnlockConfig(null);
                handleNavigate(target);
              }
            }} 
          />
        </div>
      )}

      {/* PWA AUTOMATED MODAL - GLOBAL LAYER */}
      {showPWAModal && (
        <PWAInstallModal 
          deferredPrompt={deferredPrompt}
          onInstall={handleInstallClick}
          onDismiss={handleDismissPWA}
        />
      )}
    </div>
  );
};