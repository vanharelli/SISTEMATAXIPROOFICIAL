import React, { createContext, useContext, useEffect, useState } from 'react';

interface SkynetHistory {
  currentPillar: 'dashboard' | 'pillar1' | 'pillar2' | 'pillar3' | 'copiloto' | 'comunidade' | 'calculadora';
  currentStep: number;
  completedSteps: string[]; // Format: "pillarId:stepId"
  lastInteraction: number;
  completionTimePillar1?: number; // STRATEGIC LOCK: Timestamp for Pillar 1 completion
  firstAccess: number; // Timestamp do primeiro acesso (Ciclo de 10 dias)
  unlockedLevel: number;
  pillarProgress: { [key: string]: number };
  isDebugMode: boolean;
}

interface GlobalProgressContextType {
  history: SkynetHistory;
  updateProgress: (pillar: SkynetHistory['currentPillar'], step: number) => void;
  markStepCompleted: (pillar: SkynetHistory['currentPillar'], step: number) => void;
  markPillar1Complete: () => void;
  navigate: (screen: SkynetHistory['currentPillar']) => void;
  unlockNextLevel: (level: number) => void;
  resetHistory: () => void;
  toggleDebugMode: () => void;
  isPillar2Ready: () => boolean;
  isPillar2Unlocked: boolean;
}

const GlobalProgressContext = createContext<GlobalProgressContextType | undefined>(undefined);

const HISTORY_KEY = 'skynet_history';
const EXPIRATION_SECONDS = 10 * 24 * 60 * 60; // 10 dias = 864.000 segundos
const MS_PER_SECOND = 1000;

export const GlobalProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<SkynetHistory>(() => {
    // SYNCHRONOUS LOAD: Prevent "Step 0" flicker by reading storage immediately
    try {
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      if (savedHistory) {
        const parsed: SkynetHistory = JSON.parse(savedHistory);
        const now = Date.now();
        const referenceTime = parsed.firstAccess || parsed.lastInteraction;
        const diffSeconds = (now - referenceTime) / MS_PER_SECOND;

        if (diffSeconds <= EXPIRATION_SECONDS) {
          return {
            currentPillar: parsed.currentPillar || 'dashboard',
            currentStep: parsed.currentStep || 0,
            completedSteps: parsed.completedSteps || [],
            lastInteraction: now,
            firstAccess: parsed.firstAccess || now,
            unlockedLevel: parsed.unlockedLevel || 1,
            pillarProgress: parsed.pillarProgress || {},
            isDebugMode: parsed.isDebugMode !== undefined ? parsed.isDebugMode : true,
          };
        } else {
            console.warn('SKYNET_HISTORY EXPIRED (SYNC LOAD). RESETTING.');
        }
      }
    } catch (e) {
      console.error('Failed to parse skynet_history (SYNC LOAD)', e);
    }
    
    // Default Fallback
    return {
      currentPillar: 'dashboard',
      currentStep: 0,
      completedSteps: [],
      lastInteraction: Date.now(),
      firstAccess: Date.now(),
      unlockedLevel: 1,
      pillarProgress: {},
      isDebugMode: true,
    };
  });

  // Load history on mount (Redundant but safe for side-effects/validation)
  useEffect(() => {
    // We already loaded in useState, but we keep this for consistency 
    // or if we want to run specific validation logic that requires effects.
    // For now, the synchronous load handles the critical initial render.
  }, []);

  // Save history whenever it changes
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const updateProgress = (pillar: SkynetHistory['currentPillar'], step: number) => {
    setHistory(prev => ({
      ...prev,
      currentPillar: pillar,
      currentStep: step,
      lastInteraction: Date.now(),
      pillarProgress: {
        ...prev.pillarProgress,
        [pillar]: step
      }
    }));
  };

  const markStepCompleted = (pillar: SkynetHistory['currentPillar'], step: number) => {
    const stepId = `${pillar}:${step}`;
    setHistory(prev => {
      if (prev.completedSteps.includes(stepId)) return prev;
      return {
        ...prev,
        completedSteps: [...prev.completedSteps, stepId],
        lastInteraction: Date.now(),
      };
    });
  };

  const markPillar1Complete = () => {
    setHistory(prev => {
      if (prev.completionTimePillar1) return prev;
      const now = Date.now();
      // SYNC LEGACY STORAGE for Dashboard compatibility
      localStorage.setItem('completionTimePillar1', now.toString());
      return {
        ...prev,
        completionTimePillar1: now,
        lastInteraction: Date.now()
      };
    });
  };

  const navigate = (screen: SkynetHistory['currentPillar']) => {
    setHistory(prev => {
        // Restore step for the target screen, default to 0
        const nextStep = prev.pillarProgress?.[screen] || 0;
        return {
            ...prev,
            currentPillar: screen,
            currentStep: nextStep,
            lastInteraction: Date.now(),
        };
    });
  };

  const unlockNextLevel = (level: number) => {
    setHistory(prev => {
        if (level > prev.unlockedLevel) {
            return {
                ...prev,
                unlockedLevel: level,
                lastInteraction: Date.now()
            };
        }
        return prev;
    });
    // Update global level
    localStorage.setItem('marketelli_unlocked_level', level.toString());
    
    // ATOMIC UNLOCK TRIGGERS (Legacy Compatibility)
    if (level >= 2) localStorage.setItem('marketelli_pilar2_unlocked', 'true');
    if (level >= 3) localStorage.setItem('marketelli_pilar3_unlocked', 'true');
    if (level >= 4) localStorage.setItem('marketelli_vip_unlocked', 'true');
  };

  const toggleDebugMode = () => {
    setHistory(prev => ({
      ...prev,
      isDebugMode: !prev.isDebugMode
    }));
  };

  const resetHistory = () => {
    const initialHistory: SkynetHistory = {
      currentPillar: 'dashboard',
      currentStep: 0,
      completedSteps: [],
      lastInteraction: Date.now(),
      firstAccess: Date.now(),
      unlockedLevel: 1,
      pillarProgress: {},
      isDebugMode: history.isDebugMode, // Preserve debug mode on reset
    };
    setHistory(initialHistory);
    
    // Clear Core History
    localStorage.setItem(HISTORY_KEY, JSON.stringify(initialHistory));
    localStorage.setItem('marketelli_unlocked_level', '1');
    
    // Clear Module Chat Histories (Protocolo de 10 Dias)
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('skynet_chat_') || key.startsWith('marketelli_')) {
            // Preserve specific keys if needed, but for hard reset we clean most.
            // Keeping 'marketelli_unlocked_level' as it was just set above.
            if (key !== 'marketelli_unlocked_level') {
                localStorage.removeItem(key);
            }
        }
    });
  };

  const isPillar2Ready = () => {
      if (!history.completionTimePillar1) return false;
      // 30 SECONDS
      const DURATION = 30 * 1000; 
      return Date.now() - history.completionTimePillar1 >= DURATION;
  };

  return (
    <GlobalProgressContext.Provider value={{ 
      history, 
      updateProgress, 
      markStepCompleted, 
      markPillar1Complete,
      navigate,
      unlockNextLevel,
      resetHistory,
      toggleDebugMode,
      isPillar2Ready,
      isPillar2Unlocked: history.unlockedLevel >= 2
    }}>
      {children}
    </GlobalProgressContext.Provider>
  );
};

export const useGlobalProgress = () => {
  const context = useContext(GlobalProgressContext);
  if (context === undefined) {
    throw new Error('useGlobalProgress must be used within a GlobalProgressProvider');
  }
  return context;
};
