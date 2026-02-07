import { useEffect, useRef, useState } from 'react';
import { useGlobalProgress } from '../context/GlobalProgressContext';
import { SkynetLensBackground } from '../components/SkynetLensBackground';
import { LiquidNeonBackground } from '../components/LiquidNeonBackground';
import { GalaxyBlueBackground } from '../components/GalaxyBlueBackground';
import { GoldDustBackground } from '../components/GoldDustBackground';
import { NeonLock } from '../components/Armor';
import { GlitchUnlockOverlay } from '../components/GlitchUnlockOverlay';
import { Send, ChevronLeft, Lock, ArrowRight } from 'lucide-react';
import { UserData, BrainResponse, BotMessage } from '../logic/BrainFunctions';
import { processCopiloto } from '../logic/copiloto/CopilotoEngine';
import { processComunidade } from '../logic/comunidade/ComunidadeEngine';
import { processCalculadora } from '../logic/calculadora/CalculadoraEngine';
import { Typewriter } from '../components/Typewriter';

// --- TYPES ---
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  action?: {
    label: string;
    url: string;
    isUnlockAction?: boolean;
    isP3LockAction?: boolean;
    payload?: string;
  };
  alreadyAnimated?: boolean;
  typingFinished?: boolean;
  delay?: number;
  actionClicked?: boolean; // Prevent double clicks
}

const getTheme = (chatType: string) => {
    if (chatType === 'pillar2') {
        return {
            primary: '#8B5CF6', // Amethyst/Purple
            bgUser: 'rgba(139, 92, 246, 0.2)',
            borderUser: 'rgba(139, 92, 246, 0.4)',
            borderBot: '#8B5CF6',
            suggestionBg: 'rgba(139, 92, 246, 0.1)',
            suggestionBorder: 'rgba(139, 92, 246, 0.3)',
            suggestionShadow: 'rgba(139, 92, 246, 0.1)',
            actionBg: 'rgba(139, 92, 246, 0.2)',
            actionColor: '#8B5CF6',
            actionBorder: '#8B5CF6'
        };
    }
    if (chatType === 'pillar3') {
        return {
            primary: '#D4AF37', // Gold
            bgUser: 'rgba(212, 175, 55, 0.2)',
            borderUser: 'rgba(212, 175, 55, 0.4)',
            borderBot: '#D4AF37',
            suggestionBg: 'rgba(212, 175, 55, 0.1)',
            suggestionBorder: 'rgba(212, 175, 55, 0.3)',
            suggestionShadow: 'rgba(212, 175, 55, 0.1)',
            actionBg: 'rgba(212, 175, 55, 0.2)',
            actionColor: '#D4AF37',
            actionBorder: '#D4AF37'
        };
    }
    if (chatType === 'comunidade') {
        return {
            primary: '#F97316', // Orange
            bgUser: 'rgba(249, 115, 22, 0.2)',
            borderUser: 'rgba(249, 115, 22, 0.4)',
            borderBot: '#F97316',
            suggestionBg: 'rgba(249, 115, 22, 0.1)',
            suggestionBorder: 'rgba(249, 115, 22, 0.3)',
            suggestionShadow: 'rgba(249, 115, 22, 0.1)',
            actionBg: 'rgba(249, 115, 22, 0.2)',
            actionColor: '#F97316',
            actionBorder: '#F97316'
        };
    }
    // Default Green (Pillar 1) - Emerald Theme #30c522
    if (chatType === 'copiloto') {
        return {
            primary: '#3B82F6', // Neon Blue
            bgUser: 'rgba(59, 130, 246, 0.2)',
            borderUser: 'rgba(59, 130, 246, 0.4)',
            borderBot: '#3B82F6',
            suggestionBg: 'rgba(59, 130, 246, 0.1)',
            suggestionBorder: 'rgba(59, 130, 246, 0.3)',
            suggestionShadow: 'rgba(59, 130, 246, 0.1)',
            actionBg: 'rgba(59, 130, 246, 0.2)',
            actionColor: '#3B82F6',
            actionBorder: '#3B82F6'
        };
    }
    // SURGICAL UPDATE: Custom Green for Pillar 1 ONLY (#30c522)
    if (chatType === 'pillar1') {
        return {
            primary: '#30c522',
            bgUser: 'rgba(48, 197, 34, 0.2)',
            borderUser: 'rgba(48, 197, 34, 0.4)',
            borderBot: '#30c522',
            suggestionBg: 'rgba(48, 197, 34, 0.1)',
            suggestionBorder: 'rgba(48, 197, 34, 0.3)',
            suggestionShadow: 'rgba(48, 197, 34, 0.1)',
            actionBg: 'rgba(48, 197, 34, 0.2)',
            actionColor: '#30c522',
            actionBorder: '#30c522'
        };
    }
    return {
        primary: '#30c522', // Emerald Green (Standardized)
        bgUser: 'rgba(48, 197, 34, 0.2)',
        borderUser: 'rgba(48, 197, 34, 0.4)',
        borderBot: '#30c522',
        suggestionBg: 'rgba(48, 197, 34, 0.1)',
        suggestionBorder: 'rgba(48, 197, 34, 0.3)',
        suggestionShadow: 'rgba(48, 197, 34, 0.1)',
        actionBg: 'rgba(48, 197, 34, 0.2)',
        actionColor: '#30c522',
        actionBorder: '#30c522'
    };
};

const TypingIndicator = ({ color = '#30c522' }: { color?: string }) => (
  <div style={{
    alignSelf: 'flex-start',
    padding: '12px 14px',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.05)',
    borderLeft: `2px solid ${color}`,
    color: '#fff',
    marginBottom: 10,
    animation: 'fadeIn 0.3s ease-in-out'
  }}>
    <span className="dot-pulse">...</span>
    <style>{`
      .dot-pulse {
        display: inline-block;
        font-weight: bold;
        letter-spacing: 2px;
        animation: pulse 1.5s infinite;
      }
      @keyframes pulse {
        0% { opacity: 0.3; }
        50% { opacity: 1; }
        100% { opacity: 0.3; }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  </div>
);

interface ChatInterfaceProps {
  title: string;
  chatType: 'pillar1' | 'pillar2' | 'pillar3' | 'copiloto' | 'comunidade' | 'calculadora';
  customBackground?: React.ReactNode;
  initialMessages?: Message[];
  processor: (step: number, text: string, extraData?: any) => Promise<any>;
  onShowUnlock?: () => void; // Triggers Visual Transition (Overlay)
  onUnlock?: () => void; // Triggers State Update (Silent)
  onP3Lock?: () => void;
  onNavigate?: (screen: any) => void;
}

// --- DEMO STRATEGY COMPONENT ---
const UnlockProModal = ({ onDismiss }: { onDismiss: () => void }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
    }} onClick={onDismiss}>
      <div style={{
        background: 'rgba(10, 10, 10, 0.95)',
        border: '1px solid #D4AF37',
        boxShadow: '0 0 40px rgba(212, 175, 55, 0.2)',
        padding: '32px',
        borderRadius: '24px',
        maxWidth: '90%',
        width: '400px',
        transform: isVisible ? 'scale(1)' : 'scale(0.9)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        textAlign: 'center'
      }} onClick={e => e.stopPropagation()}>
        
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(212, 175, 55, 0.4)',
          marginBottom: '8px'
        }}>
           <Lock size={40} color="#000" strokeWidth={2.5} />
        </div>

        <div>
          <h3 style={{ 
            color: '#D4AF37', 
            fontSize: '1.5rem', 
            fontWeight: '800', 
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Compre agora a versão PRO
          </h3>
          <p style={{ 
            color: '#ccc', 
            fontSize: '1rem', 
            lineHeight: '1.5'
          }}>
            Get full access to all pillars, advanced tools, and the VIP community now.
          </p>
        </div>

        <button 
          onClick={() => window.location.href = 'https://pay.kiwify.com.br/F4YMAcB'}
          style={{
            width: '100%',
            padding: '16px',
            background: '#D4AF37',
            color: '#000',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '10px',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          UNLOCK NOW <ArrowRight size={20} />
        </button>
        
        <button 
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#666',
            fontSize: '0.9rem',
            cursor: 'pointer',
            marginTop: '8px',
            textDecoration: 'underline'
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};

// --- HELPER: COUNTDOWN ACTION BUTTON ---
const CountdownAction = ({ action, theme, onClick, onUnlock }: any) => {
    const { unlockNextLevel } = useGlobalProgress();
    const [timeLeft, setTimeLeft] = useState(0);
    const [isReady, setIsReady] = useState(false);
    
    useEffect(() => {
        // SURGICAL UPDATE: 36 Hours Lock = 129,600,000 ms
        const LOCK_DURATION = 129600000; 
        
        // SYNC: Use global start time reference
        let start = parseInt(localStorage.getItem('marketelli_start_time') || '0');
        
        // PRIMARY TRIGGER: Set start time ONLY when this button appears (End of Pilar 1)
        if (!start) {
            start = Date.now();
            localStorage.setItem('marketelli_start_time', start.toString());
        }
        
        const tick = () => {
            const now = Date.now();
            const elapsed = now - start;
            const remaining = Math.max(0, LOCK_DURATION - elapsed);
            
            setTimeLeft(remaining);
            if (remaining <= 0) {
                setIsReady(true);
            }
        };
        
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (!isReady) {
        return (
            <button
                disabled
                className="chat-action-btn"
                style={{
                    marginTop: 10,
                    padding: '12px 24px',
                    backgroundColor: 'rgba(128,128,128,0.2)', // Grayed out
                    color: '#aaa',
                    border: `1px solid #555`,
                    borderRadius: 8,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: 14,
                    cursor: 'not-allowed',
                    alignSelf: 'flex-start',
                    boxShadow: 'none',
                    width: '100%' // Make it clear
                }}
            >
                {`Preparando seu site... Liberação em: ${formatTime(timeLeft)}`}
            </button>
        );
    }

    return (
        <button
            onClick={() => {
                // Ensure unlock state is set when clicked via Context
                unlockNextLevel(2);
                if (onUnlock) onUnlock();
                onClick();
            }}
            className="chat-action-btn fade-in-button"
            style={{
                marginTop: 10,
                padding: '12px 24px',
                backgroundColor: theme.actionBg,
                color: theme.actionColor,
                border: `1px solid ${theme.actionBorder}`,
                borderRadius: 8,
                textAlign: 'center',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: 14,
                cursor: 'pointer',
                alignSelf: 'flex-start',
                boxShadow: `0 0 15px ${theme.actionBg}`,
                animation: 'fadeIn 1s ease-in-out'
            }}
        >
            {action.label}
        </button>
    );
};

// --- UNIFIED CHAT SCREEN ---
const UnifiedChatScreen = ({ 
  title: _title, 
  chatType, 
  customBackground, 
  initialMessages = [], 
  processor, 
  onShowUnlock,
  onUnlock,
  onP3Lock,
  onNavigate
}: ChatInterfaceProps) => {
  const { history, updateProgress, markPillar1Complete } = useGlobalProgress();
  const currentStep = history.pillarProgress[chatType] || 0;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [userData, setUserData] = useState<UserData>({});
  const [showGlitchOverlay, setShowGlitchOverlay] = useState(false);
  const [showProModal, setShowProModal] = useState(false); // DEMO STRATEGY STATE
  
  const [isInputVisible, setIsInputVisible] = useState<boolean>(() => {
    if (chatType !== 'copiloto') return true;
    // INITIALIZATION PERSISTENCE: Check localStorage immediately to prevent flicker
    try {
        const savedHistory = localStorage.getItem('skynet_history');
        const savedChat = localStorage.getItem(`skynet_chat_${chatType}`);
        
        if (savedHistory) {
            const h = JSON.parse(savedHistory);
            const step = h.pillarProgress?.[chatType] || 0;
            
            let isFinished = false;
            if (savedChat) {
                const msgs = JSON.parse(savedChat);
                const last = msgs[msgs.length - 1];
                isFinished = last?.action?.label === "REINICIAR SIMULAÇÃO";
            }
            
            return step >= 2 && !isFinished;
        }
    } catch (e) {}
    return false;
  });

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef<string | null>(null);
  const pendingUnlockRef = useRef(false);
  const storageKey = `skynet_chat_${chatType}`;
  const theme = getTheme(chatType);

  // VISIBILITY LOCK & STATE RECOVERY
  // Ensures input visibility is strictly tied to the step and finished state.
  // Persists across minimizes, focus loss, and navigation.
  useEffect(() => {
    const checkVisibility = () => {
        if (chatType !== 'copiloto') return;

        const lastMsg = messages[messages.length - 1];
        // Check if the conversation is finished (Reset button present)
        let isFinished = lastMsg?.action?.label === "REINICIAR SIMULAÇÃO";
        
        // ROBUSTNESS CHECK: Fallback to localStorage if context appears reset (step 0)
        // This prevents input from hiding when app is minimized/restored and context re-initializes.
        let effectiveStep = currentStep;
        if (effectiveStep === 0) {
             try {
                const saved = localStorage.getItem('skynet_history');
                if (saved) {
                    const h = JSON.parse(saved);
                    effectiveStep = h.pillarProgress?.[chatType] || 0;
                }
             } catch(e) {}
        }

        // DOUBLE CHECK: If messages are not yet loaded (empty state), verify 'Finished' status from storage
        // This prevents input from briefly appearing if the chat was actually finished.
        if (messages.length === 0) {
            try {
                const savedChat = localStorage.getItem(`skynet_chat_${chatType}`);
                if (savedChat) {
                    const msgs = JSON.parse(savedChat);
                    const last = msgs[msgs.length - 1];
                    if (last?.action?.label === "REINICIAR SIMULAÇÃO") {
                        isFinished = true;
                    }
                }
            } catch(e) {}
        }

        // Visibility Rule: Step >= 2 AND Not Finished
        // We prioritize the persistent state (effectiveStep) over volatile state.
        if (effectiveStep >= 2 && !isFinished) {
            setIsInputVisible(true);
        } else {
            setIsInputVisible(false);
        }
    };

    // Run immediately on dependency change
    checkVisibility();

    // FORCE RE-CHECK ON VISIBILITY/FOCUS
    // This catches edge cases where the browser might have suspended the thread
    // or context was momentarily lost during backgrounding.
    const handleRecheck = () => {
        // Small delay to ensure any state hydration has occurred
        setTimeout(checkVisibility, 50);
    };

    window.addEventListener('visibilitychange', handleRecheck);
    window.addEventListener('focus', handleRecheck);
    
    return () => {
        window.removeEventListener('visibilitychange', handleRecheck);
        window.removeEventListener('focus', handleRecheck);
    };
  }, [currentStep, chatType, messages]);

  // LOAD HISTORY & INITIALIZE
  useEffect(() => {
    // TRAVA DE DISPARO ÚNICO (Anti-Duplicidade / Strict Mode)
    // Garante que a inicialização ocorra apenas uma vez por chatType
    if (initializedRef.current === chatType) return;
    initializedRef.current = chatType;

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        const savedCheckpoint = parseInt(localStorage.getItem(`skynet_checkpoint_${chatType}`) || '-1');
        
        // SANEAMENTO DE HIDRATAÇÃO (Remover duplicatas por ID)
        const uniqueMap = new Map();
        parsed.forEach((msg: any, index: number) => {
            if (msg.id) {
                // FORCE SNAPSHOT: Ensure restored messages are static based on CHECKPOINT
                // CHECKPOINT SYSTEM: Messages with index <= saved index are rendered instantly.
                // Animation restarts only at message index + 1 (new incoming messages).
                const shouldAnimate = index > savedCheckpoint;
                msg.alreadyAnimated = !shouldAnimate;
                msg.typingFinished = !shouldAnimate;
                uniqueMap.set(msg.id, msg);
            }
        });
        const uniqueMsgs = Array.from(uniqueMap.values());

        // Restore messages
        setMessages(uniqueMsgs);
      } catch (e) {
        console.error("Error loading chat history", e);
      }
    } else {
      // New Session Logic
      if (initialMessages.length > 0) {
        setMessages(initialMessages);
      } else {
        // If no hardcoded initial messages, trigger Step 0 of processor
        // But only if we are at step 0 AND no history exists
        if (currentStep === 0) {
             // FINAL SAFETY: Check storage one last time to prevent Intro Loop
             // if context was reset but history exists.
             const historyCheck = localStorage.getItem('skynet_history');
             let hasProgress = false;
             if (historyCheck) {
                 try {
                    const h = JSON.parse(historyCheck);
                    if (h.pillarProgress?.[chatType] > 0) hasProgress = true;
                 } catch(e) {}
             }
             
             if (!hasProgress) {
                 triggerProcessor(0, 'init');
             }
        }
      }
    }
  }, [chatType]); // Reload when chatType changes

  // SAVE HISTORY
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, suggestions, isProcessing]);

  const triggerProcessor = async (step: number, text: string, _isAutoInit: boolean = false) => {
    setIsProcessing(true);
    try {
        const response = await processor(step, text, userData);
        
        if (response.newData) {
            setUserData(prev => ({ ...prev, ...response.newData }));
        }

        if (response.botMessages && response.botMessages.length > 0) {
            // Check for Unlock Actions in new messages and trigger IMMEDIATE unlock
            const hasUnlockAction = response.botMessages.some((msg: any) => 
                (typeof msg !== 'string' && msg.action && msg.action.isUnlockAction)
            );

            // FIX: Enable Atomic Unlock for ALL pillars (Synchronous State Update)
            if (hasUnlockAction && (onShowUnlock || onUnlock)) {
                console.log("Unlock Action Detected in Bot Message - Setting Pending Unlock");
                pendingUnlockRef.current = true;
            }

            const newMsgs: Message[] = response.botMessages.map((msg: any, idx: number) => ({
                id: `bot-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
                text: typeof msg === 'string' ? msg : msg.text,
                sender: (typeof msg !== 'string' && msg.sender) ? msg.sender : 'bot',
                action: typeof msg !== 'string' && msg.action ? msg.action : undefined,
                typingFinished: false,
                delay: typeof msg !== 'string' && msg.delay ? msg.delay : 0
            }));

            for (const msg of newMsgs) {
                if (msg.delay && msg.delay > 0) {
                    await new Promise(r => setTimeout(r, msg.delay));
                }
                setMessages(prev => {
                    // Surgical Deduplication: Check if identical message exists in last 3 messages
                    const recentMessages = prev.slice(-3);
                    const isDuplicate = recentMessages.some(m => m.text === msg.text && m.sender === msg.sender);
                    if (isDuplicate) return prev;
                    return [...prev, msg];
                });
            }
        }

        if (response.suggestions) {
            setSuggestions(response.suggestions);
        }

        if (response.nextStep !== step) {
            updateProgress(chatType, response.nextStep);
            
            // Check for specific flags
            // Pilar 1 Unlock
            if (chatType === 'pillar1' && response.nextStep === 17) {
                // STRATEGIC LOCK: Removed early trigger to ensure ATOMIC UNLOCK.
                // Unlock is now triggered exclusively in handleMessageComplete (after Typewriter finishes).
            }
            // Pilar 2 Unlock (Transition to Pilar 3)
            if (chatType === 'pillar2' && response.nextStep === 12 && onShowUnlock) {
                // ATOMIC UNLOCK: Ensure synchronous state update for Pillar 2 -> 3 transition
                pendingUnlockRef.current = true;
            }
            // Pilar 3 Lock
            // We need to check if the ACTION triggered the lock or the step
            // Usually the action click triggers it.
        }

    } catch (err) {
        console.error(err);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleSendMessage = async (text: string, isHidden: boolean = false) => {
    if (!text.trim()) return;

    // Special Commands
    if (text === 'Reiniciar' || text === 'RESTORE_SESSION') {
        // Clear history logic if needed
    }

    if (!isHidden) {
        const userMsg: Message = {
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text,
            sender: 'user',
            alreadyAnimated: true,
            typingFinished: true
        };
        
        setMessages(prev => [...prev, userMsg]);
        setInputText(''); // Auto-Clear Input
    }
    setSuggestions([]); // Clear suggestions while processing

    await triggerProcessor(currentStep, text);
  };

  const handleActionClick = (action: any, msgId?: string) => {
      // 0. Disable Double Click
      if (msgId) {
          const msg = messages.find(m => m.id === msgId);
          if (msg?.actionClicked) return;
          
          setMessages(prev => prev.map(m => 
              m.id === msgId ? { ...m, actionClicked: true } : m
          ));
      }

      // DIRECT DEMO STRATEGY: Intercept "INICIAR" buttons for Pillars 1 & 2
      if (action.label && (action.label.toUpperCase().includes("INICIAR PILAR 1") || action.label.toUpperCase().includes("INICIAR PILAR 2"))) {
          setShowProModal(true);
          return;
      }

      // Fim do Loop de Efeito: Se for ação de desbloqueio, apenas navega.
      // O desbloqueio visual (Glitch) já foi acionado pelo useEffect (Gatilho Antecipado).
      if (action.isUnlockAction) {
          // ⚡ STRATEGIC LOCK: Pillar 1 -> Pillar 2
          if (chatType === 'pillar1') {
             // INTERCEPT NAVIGATION FOR GLITCH EFFECT
             setShowGlitchOverlay(true);
             return;
          }

          // SAFEGUARD: Ensure state is unlocked even if atomic trigger was missed (e.g. reload)
          if (onUnlock) onUnlock();

          // FIX: Manual Trigger for Pillar 2 (User requested button click)
          if (chatType === 'pillar2' && onShowUnlock) {
              onShowUnlock();
              return;
          }

          if (onNavigate) {
              if (chatType === 'pillar2') onNavigate('pillar3');
          }
          return; // Interrompe para não disparar onShowUnlock novamente
      }

      if (action.isP3LockAction && onP3Lock) {
          onP3Lock();
      }
      if (action.url && action.url !== '#') {
          window.open(action.url, '_blank');
      }
      
      // PRIORIDADE 1: PAYLOAD (Comando Oculto)
      // Usado para fluxos internos (ex: Intro do Pilar 1) sem exibir texto duplicado ou confuso.
      // EXCEÇÃO: O botão "REINICIAR SIMULAÇÃO" antigo pode ter payload, mas deve ser tratado pela lógica de reinício abaixo.
      if (action.payload && action.label !== "REINICIAR SIMULAÇÃO") {
          handleSendMessage(action.payload, true);
          return;
      }

      // If action has a label that should act as a message (e.g. "INICIAR PILAR 1")
      // We can trigger it.
      if (action.label.includes("INICIAR PILAR 2")) {
          handleSendMessage("CONTINUAR");
          return;
      }

      // COPILOTO: Restart Logic (End of Flow)
       if (chatType === 'copiloto' && action.label === "REINICIAR SIMULAÇÃO") {
           setMessages([]);
           setSuggestions([]);
           setInputText('');
           updateProgress('copiloto', 0);
           triggerProcessor(0, 'reset');
           return;
       }
      
      // Generic Action-to-Message Handler (UX Flow Standardization)
      if (action.url === '#' || action.url === '') {
          handleSendMessage(action.label);
      }
  };

  const handleMessageComplete = (id: string) => {
    setMessages(prev => {
        const index = prev.findIndex(m => m.id === id);
        const newMessages = prev.map((m, i) => i === index ? { ...m, typingFinished: true } : m);
        
        // CHECKPOINT SYSTEM: Save the index of the last fully typed message
        if (index !== -1) {
            localStorage.setItem(`skynet_checkpoint_${chatType}`, index.toString());
        }

        // Check if this was the last message and we have a pending unlock
        const isLastMessage = index === prev.length - 1;
        const msg = prev[index];
        // Robustness: Check ref OR message property
        const shouldUnlock = pendingUnlockRef.current || msg?.action?.isUnlockAction;

        if (isLastMessage && shouldUnlock) {
            console.log("Last message finished typing. Triggering ATOMIC UNLOCK.");
            
            // ATOMIC UNLOCK: Update State Immediately & Synchronously
            // We force the next level to be unlocked in localStorage BEFORE any state update or reload.
            if (chatType === 'pillar1') {
                // STRATEGIC LOCK: Mark Pillar 1 as complete immediately to start timer
                markPillar1Complete();
                // The Dashboard will handle the timer-based unlock of Pillar 2.
            } else if (chatType === 'pillar2') {
                localStorage.setItem('marketelli_pilar3_unlocked', 'true');
                const lvl = parseInt(localStorage.getItem('marketelli_unlocked_level') || '0');
                if (lvl < 3) localStorage.setItem('marketelli_unlocked_level', '3');
            }

            // ATOMIC UNLOCK: Update State Immediately
            if (onUnlock) onUnlock();
            
            // NOTE: We do NOT call onShowUnlock() here. 
            // The Visual Transition (Overlay) is triggered by the Action Button.
            
            pendingUnlockRef.current = false;
        }
        
        return newMessages;
    });
  };

  return (
    <div style={{
      width: '100%',
      height: '100dvh', // FIX: Dynamic Viewport for Mobile
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
        {/* Background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            {customBackground}
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
            
            {/* Header / Title could go here if not global */}

            {/* Messages */}
            <div ref={scrollRef} style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0px',
                paddingTop: '85px', // AJUSTE CIRÚRGICO: Espaço para o Header (Pass-through effect)
                paddingBottom: '100px', // FIX: Increased padding for absolute input
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch' // iOS momentum scrolling
            }}>
                {messages.map((msg, index) => {
                    // Sequencing logic: only show if previous finished?
                    // For simplicity in this refactor, we show all, but animate typing if not finished.
                    // To enforce strict sequencing like before:
                    const previousFinished = index === 0 || messages[index - 1].typingFinished;
                    if (!previousFinished && msg.sender === 'bot') return null;

                    return (
                        <div key={msg.id} style={{
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '90%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                        }}>
                            {/* Message Bubble */}
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: 15,
                                background: msg.sender === 'user' ? theme.bgUser : 'rgba(255,255,255,0.05)',
                                border: msg.sender === 'user' ? `1px solid ${theme.borderUser}` : '1px solid rgba(255,255,255,0.06)',
                                borderLeft: msg.sender === 'bot' ? `2px solid ${theme.borderBot}` : undefined,
                                color: '#fff',
                                fontSize: 15,
                                lineHeight: 1.5,
                                fontWeight: 300,
                                position: 'relative',
                                backdropFilter: 'blur(10px)',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                overflowWrap: 'anywhere'
                            }}>
                                {msg.sender === 'bot' ? (
                                    msg.alreadyAnimated ? (
                                        <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                                    ) : (
                                        <Typewriter text={msg.text} speed={26} onComplete={() => handleMessageComplete(msg.id)} onUpdate={scrollToBottom} />
                                    )
                                ) : (
                                    msg.text
                                )}
                            </div>
                            
                            {/* Action Button - Outside Bubble */}
                            {msg.action && (msg.typingFinished || msg.alreadyAnimated) && index === messages.length - 1 && (
                                chatType === 'pillar1' && msg.action.isUnlockAction ? (
                                    <CountdownAction 
                                        action={msg.action}
                                        theme={theme}
                                        onUnlock={onUnlock}
                                        onClick={() => handleActionClick(msg.action, msg.id)}
                                    />
                                ) : (
                                <button 
                                    onClick={() => handleActionClick(msg.action, msg.id)}
                                    disabled={msg.actionClicked}
                                    className="action-button-glow"
                                    style={{
                                        marginTop: 8,
                                        padding: '10px 20px',
                                        background: theme.actionBg,
                                        color: theme.actionColor,
                                        border: `1px solid ${theme.actionBorder}`,
                                        borderRadius: 8,
                                        textAlign: 'center',
                                        textDecoration: 'none',
                                        fontWeight: 'bold',
                                        fontSize: 14,
                                        cursor: msg.actionClicked ? 'default' : 'pointer',
                                        alignSelf: 'flex-start',
                                        boxShadow: `0 0 15px ${theme.actionBg}`,
                                        opacity: msg.actionClicked ? 0.5 : 1,
                                        pointerEvents: msg.actionClicked ? 'none' : 'auto'
                                    }}
                                >
                                    {msg.action.label}
                                </button>
                                )
                            )}
                        </div>
                    );
                })}

                {isProcessing && <TypingIndicator color={theme.primary} />}
            </div>

            {/* Input Area */}
            {['pillar1', 'pillar2', 'pillar3', 'comunidade'].includes(chatType) ? (
                // Clean layout for pillars & comunidade: NO floating buttons or text input. 
                // All actions are now embedded in the message stream via msg.action
                <div style={{ padding: 0 }} />
            ) : (
                // Default layout with text input for other chats (Copiloto, Calculadora)
                // HIDE INPUT for Copiloto until simulation starts
                <div style={{ 
                    padding: '20px',
                    opacity: isInputVisible ? 1 : 0,
                    pointerEvents: isInputVisible ? 'auto' : 'none',
                    transition: 'opacity 0.5s ease-in-out',
                    position: 'absolute', // FIX: Input Stability
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    background: 'transparent' // Gradient handled by background or parent if needed
                }}>
                     {/* Suggestions */}
                     {suggestions.length > 0 && !isProcessing && chatType !== 'copiloto' && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10, justifyContent: 'center' }}>
                            {suggestions.map((sugg, i) => (
                                <button key={i} onClick={() => handleSendMessage(sugg)} style={{
                                    padding: '10px 16px',
                                    borderRadius: 20,
                                    background: theme.suggestionBg,
                                    border: `1px solid ${theme.suggestionBorder}`,
                                    color: theme.primary,
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}>
                                    {sugg}
                                </button>
                            ))}
                        </div>
                     )}

                     <div style={{
                          display: 'flex',
                          gap: 10,
                          alignItems: 'center',
                          background: 'rgba(0,0,0,0.6)',
                          padding: '10px',
                          borderRadius: 30,
                          border: chatType === 'copiloto' ? '1px solid #3B82F6' : `1px solid ${theme.borderUser}`
                     }}>
                          <input 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                            placeholder="Digite sua mensagem..."
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                color: '#fff',
                                outline: 'none',
                                padding: '0 15px'
                            }}
                          />
                          <button onClick={() => handleSendMessage(inputText)} style={{
                              background: theme.primary,
                              border: 'none',
                              borderRadius: '50%',
                              width: 40,
                              height: 40,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                          }}>
                              <Send size={18} color={chatType === 'copiloto' ? '#fff' : '#000'} />
                          </button>
                     </div>
                </div>
            )}
        </div>
        
        {/* GLITCH TRANSITION OVERLAY */}
        <GlitchUnlockOverlay 
            isVisible={showGlitchOverlay} 
            onUnlock={() => {
                setShowGlitchOverlay(false);
                markPillar1Complete(); // ATOMIC UPDATE: Ensure P1 is marked complete
                if (onUnlock) onUnlock(); // TRIGGER UNLOCK: Unlocks Pillar 2 in Dashboard
                if (onNavigate) onNavigate('pillar2');
            }}
            title="PILAR 2 DESBLOQUEADO"
            buttonText="ACESSAR PILAR 2"
        />

        {/* DEMO STRATEGY MODAL */}
        {showProModal && (
            <UnlockProModal onDismiss={() => setShowProModal(false)} />
        )}
    </div>
  );
};

// --- WRAPPERS ---

// --- PILAR 1 LOGIC & CONTENT (INTEGRATED) ---

interface Pilar1StepData {
  text: string | string[];
  suggestions: string[];
  action?: {
    label: string;
    url: string;
    isUnlockAction?: boolean;
    isP3LockAction?: boolean;
    payload?: string;
  };
  contextoIA: string;
  unlockLevel?: number;
}

const PILAR1_INTRO = [
  {
    text: `<span>Olá, Seja bem-vindo(a) ao <span style="color: #30c522; font-weight: bold;">Sistema Taxi Pro 5.0</span>.<br />Aqui começa sua <span style="color: #30c522; font-weight: 600;">jornada de evolução profissional</span>.</span>`,
    delay: 1000,
    action: { label: 'CONTINUAR', url: '#', payload: 'CONTINUAR_1' }
  }
];

const PILAR1_CONTINUAR_1 = [
  {
    text: `<span>Eu sou seu instrutor e o administrador desta <span style="color: #30c522; font-weight: 600;">infraestrutura</span>, pode me chamar de <span style="color: #30c522; font-weight: bold;">NONATO</span>.<br /><br />Minha função é <span style="color: #30c522; font-weight: 600;">codificar sua operação</span> e garantir que cada engrenagem funcione perfeitamente.</span>`,
    delay: 1000,
    action: { label: 'CONTINUAR', url: '#', payload: 'CONTINUAR_2' }
  }
];

const PILAR1_CONTINUAR_2 = [
  {
    text: `<span>Nosso foco é a <span style="color: #30c522; font-weight: 600;">alta performance</span>: o <span style="color: #30c522; font-weight: bold;">COPILOTO 6.0</span> atende o cliente com precisão enquanto você dirige.<br /><br />Como o <span style="color: #30c522; font-weight: bold; text-transform: uppercase;">Mecânico</span> desta unidade, vou instalar agora um <span style="color: #30c522; font-weight: bold; text-transform: uppercase;">motor v8 biturbo</span> no seu WhatsApp.<br /><br />Daqui pra frente, siga o <span style="color: #30c522; font-weight: 600;">passo a passo certinho</span>. Não pule etapas nem faça ajustes fora do combinado. Cada detalhe faz diferença para o copiloto funcionar redondo.<br /><br />Podemos começar?</span>`,
    delay: 1000,
    action: { label: 'INICIAR PILAR 1', url: '#' }
  }
];

const PILAR1_MENTALIDADE = [
  {
    text: "🏆 <span style=\"color: #30c522; font-weight: bold;\">MENTALIDADE DE VENCEDOR</span>\n\nAntes de apertarmos qualquer botão, precisamos alinhar a direção.\n\nVocê está construindo a sua empresa automatizada de <span style=\"color: #30c522; font-weight: bold;\">ELITE</span> 🚕.\nO amadorismo ficou lá fora.\n\n⚠️ <span style=\"color: #30c522; font-weight: bold;\">REGRA DE OURO:</span>\nAqui é igual <span style=\"color: #30c522; font-weight: 600;\">manutenção bem feita</span>: cada passo tem sua ordem. <span style=\"color: #30c522; font-weight: 600;\">Não avance antes da hora</span> e <span style=\"color: #30c522; font-weight: 600;\">não tente improvisar</span>. Finalize cada etapa com atenção e só aperte o botão quando tudo estiver concluído.\n\n<span style=\"color: #30c522; font-weight: bold;\">Estamos combinados?</span> 🤝",
    delay: 1000,
    action: { label: 'CONTINUAR', url: '#', payload: 'PILAR1_MAPA' }
  }
];

const PILAR1_MAPA = [
  {
    text: "🗺️ <span style=\"color: #30c522; font-weight: bold;\">MAPA DA INSTALAÇÃO</span>\n\nO <span style=\"color: #30c522; font-weight: bold;\">SISTEMA TAXI PRO 5.0</span> funciona em 3 bases:\n\n🧠 <span style=\"color: #30c522; font-weight: bold;\">PILAR 1:</span> (AGORA) Instalando o Cérebro.\n💻 <span style=\"color: #30c522; font-weight: bold;\">PILAR 2:</span> Seu Escritório Virtual (Site).\n📈 <span style=\"color: #30c522; font-weight: bold;\">PILAR 3:</span> Atração de Passageiros (Escala).\n\nVamos percorrer 🚀 <span style=\"color: #30c522; font-weight: bold;\">12 FASES</span> rápidas, passo a passo. Tudo mastigado para você não errar.",
    delay: 1000,
    action: { label: 'CONTINUAR', url: '#', payload: 'PILAR1_FASES' }
  }
];

const PILAR1_STEPS: Record<number, Pilar1StepData> = {
  0: {
    text: [
      "Siga a sequência exata das <span style=\"color: #30c522; font-weight: 600;\">12 FASES DO PILAR 1</span>:\n\n🧱 1 <span style=\"color: #30c522; font-weight: 600;\">A FUNDAÇÃO</span>\n🏠 2 <span style=\"color: #30c522; font-weight: 600;\">LOCAL DE TRABALHO</span>\n🔐 3 <span style=\"color: #30c522; font-weight: 600;\">CRIANDO SUA CONTA (OPENAI)</span>\n⛽ 4 <span style=\"color: #30c522; font-weight: 600;\">O COMBUSTÍVEL DA IA</span>\n🗝️ 5 <span style=\"color: #30c522; font-weight: 600;\">A CHAVE SECRETA</span>\n🔌 6 <span style=\"color: #30c522; font-weight: 600;\">LIGANDO OS CABOS</span>\n⚙️ 7 <span style=\"color: #30c522; font-weight: 600;\">CONFIGURAÇÃO DE IA</span>\n📊 8 <span style=\"color: #30c522; font-weight: 600;\">PARÂMETROS DE IA</span>\n🤖 9 <span style=\"color: #30c522; font-weight: 600;\">O COPILOTO 6.0</span>\n🏷️ 10 <span style=\"color: #30c522; font-weight: 600;\">SUA MARCA</span>\n🚫 11 <span style=\"color: #30c522; font-weight: 600;\">ONDE NÃO MEXER</span>\n🏁 12 <span style=\"color: #30c522; font-weight: 600;\">TESTE FINAL</span>\n🎁 <span style=\"color: #30c522; font-weight: 600;\">SUPER BÔNUS</span>\n\nClique no botão para avançar somente após concluir exatamente o que foi instruído.\n\nPronto para a Fase 1?"
    ],
    suggestions: [],
    action: { label: "CONTINUAR", url: "#" },
    contextoIA: "Visão geral do sistema e lista das 12 fases do Pilar 1."
  },
  1: {
    text: "🏗️ <span style=\"color: #30c522; font-weight: bold;\">FASE 1: A FUNDAÇÃO</span>\n\n> Instale o app oficial no botão abaixo ⬇️.\n\n⚠️ <span style=\"color: #30c522; font-weight: bold;\">AVISO IMPORTANTE:</span>\n\nAbra o app e invista na <span style=\"color: #30c522; font-weight: 600;\">VERSÃO PREMIUM</span> mensal. É ela que libera o acesso à <span style=\"color: #30c522; font-weight: 600;\">IA</span> e remove <span style=\"color: #30c522; font-weight: 600;\">anúncios chatos</span> que travam o sistema.\n\n<a href=\"https://play.google.com/store/apps/details?id=com.guibais.whatsauto\" target=\"_blank\" style=\"display: inline-block; background-color: rgba(48, 197, 34, 0.2); color: #30c522; padding: 10px 20px; border: 1px solid #30c522; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px;\">BAIXAR WHATAUTO 📥</a>",
    suggestions: [],
    action: {
      label: "CONTINUAR",
      url: "#"
    },
    contextoIA: "Fase 1: Instalação e compra da versão Premium."
  },
  2: {
    text: "🔒 <span style=\"color: #30c522; font-weight: bold;\">PERMISSÕES OBRIGATÓRIAS:</span>\n\n• Notificações: <span style=\"color: #30c522; font-weight: 600;\">ATIVAR TODAS</span>, dos apps <span style=\"color: #30c522; font-weight: 600;\">WhatsApp</span>, <span style=\"color: #30c522; font-weight: 600;\">WhatsApp Business</span> e <span style=\"color: #30c522; font-weight: 600;\">WhatAuto</span>.\n• Sobrepor apps e tela de bloqueio: <span style=\"color: #30c522; font-weight: 600;\">PERMITIR TUDO</span> QUE FOR SOLICITADO.\n• Bateria 🔋: Selecione <span style=\"color: #30c522; font-weight: 600;\">SEM RESTRIÇÕES.</span>\n\nSem essas permissões, a <span style=\"color: #30c522; font-weight: 600;\">IA</span> não funciona.\n\nInstalou e deu as <span style=\"color: #30c522; font-weight: 600;\">PERMISSÕES</span> necessárias?",
    suggestions: [],
    action: { label: "CONTINUAR", url: "#" },
    contextoIA: "Fase 1.5: Configuração de permissões críticas do Android."
  },
  3: {
    text: "🏠 <span style=\"color: #30c522; font-weight: bold;\">FASE 2: LOCAL DE TRABALHO</span>\n\nVamos definir onde a IA vai atuar.\n\n> Abra o WhatAuto e clique na aba <span style=\"color: #30c522; font-weight: 600;\">MENU</span> 📱 (a primeira à esquerda, ícone de grade/quadrados).\n\n> Clique em <span style=\"color: #30c522; font-weight: 600;\">'Apps Suportados'</span>.\n\n> Ligue a chavinha <span style=\"color: #30c522; font-weight: 600;\">APENAS</span> do <span style=\"color: #30c522; font-weight: 600;\">WhatsApp Business</span> (ou do WhatsApp que você usa para trabalho).\n• <span style=\"color: #30c522; font-weight: 600;\">Importante:</span> Desligue todos os outros para evitar erros.\n\nA IA já sabe onde vai trabalhar?",
    suggestions: [],
    action: { label: "CONTINUAR", url: "#" },
    contextoIA: "Fase 2: Seleção dos apps onde a IA vai responder."
  },
  4: {
    text: "🔐 <span style=\"color: #30c522; font-weight: bold;\">FASE 3: CRIANDO SUA CONTA (OPENAI)</span>\n\nVamos conectar a inteligência agora 🧠.\n\n> Clique no botão abaixo <span style=\"color: #30c522; font-weight: 600;\">CADASTRAR NA OPENAI</span>.\n\nUse sua <span style=\"color: #30c522; font-weight: 600;\">conta Google</span> para agilizar o cadastro.\n\nQuando vir o painel da OpenAI, volte aqui.\n\n<a href=\"https://platform.openai.com/signup\" target=\"_blank\" style=\"display: inline-block; background-color: rgba(48, 197, 34, 0.2); color: #30c522; padding: 10px 20px; border: 1px solid #30c522; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px;\">CADASTRAR NA OPENAI 🌐</a>",
    suggestions: [],
    action: {
      label: "CONTINUAR",
      url: "#"
    },
    contextoIA: "Fase 3: Cadastro na OpenAI."
  },
  5: {
    text: "⛽ <span style=\"color: #30c522; font-weight: bold;\">FASE 4: O COMBUSTÍVEL DA IA</span>\n\nPara a IA pensar e atender no automático, ela precisa de créditos (custa centavos por conversa).\n\n> Clique no botão abaixo <span style=\"color: #30c522; font-weight: 600;\">ADICIONAR SALDO</span> 💸.\n\n> Adicione o mínimo de <span style=\"color: #30c522; font-weight: 600;\">$5 no cartão</span> (aprox. R$35). O site é seguro.\n\nECONOMIA: Um único passageiro paga o seu mês inteiro de IA.\n\nSem créditos, o seu <span style=\"color: #30c522; font-weight: 600;\">COPILOTO</span> vai ficar <span style=\"color: #30c522; font-weight: 600;\">MUDO</span> 🔇.\n\n<a href=\"https://platform.openai.com/account/billing/overview\" target=\"_blank\" style=\"display: inline-block; background-color: rgba(48, 197, 34, 0.2); color: #30c522; padding: 10px 20px; border: 1px solid #30c522; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px;\">ADICIONAR SALDO 💳</a>",
    suggestions: [],
    action: {
      label: "CONTINUAR",
      url: "#"
    },
    contextoIA: "Fase 4: Adição de saldo na OpenAI."
  },
  6: {
    text: "🗝 <span style=\"color: #30c522; font-weight: bold;\">FASE 5: A CHAVE MESTRA</span>\n\n> Clique no botão abaixo <span style=\"color: #30c522; font-weight: 600;\">API KEYS</span>.\n\n> Clique em <span style=\"color: #30c522; font-weight: 600;\">'+ Create new secret key'</span>.\n\n> Nomeie como <span style=\"color: #30c522; font-weight: 600;\">Taxipro</span> ou <span style=\"color: #30c522; font-weight: 600;\">MotoristaPRO</span> e clique em <span style=\"color: #30c522; font-weight: 600;\">'Create secret key'</span>.\n\n<span style=\"color: #30c522; font-weight: 600;\">MUITA ATENÇÃO AGORA:</span>\n\n<span style=\"color: #30c522; font-weight: 600;\">COPIE O CÓDIGO</span> 📝 (sk-...) e salve.\nEssa chave só aparece uma vez.\nGuarde no seu <span style=\"color: #30c522; font-weight: 600;\">bloco de notas</span> ou crie uma conversa no WhatsApp e mande para você mesmo.\n\n<a href=\"https://platform.openai.com/api-keys\" target=\"_blank\" style=\"display: inline-block; background-color: rgba(48, 197, 34, 0.2); color: #30c522; padding: 10px 20px; border: 1px solid #30c522; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px;\">API KEYS 🔑</a>",
    suggestions: [],
    action: {
      label: "CONTINUAR",
      url: "#"
    },
    contextoIA: "Fase 5: Geração da chave API secreta."
  },
  7: {
    text: "🔌 <span style=\"color: #30c522; font-weight: bold;\">FASE 6: LIGANDO OS CABOS</span>\n\nAgora vamos colocar a chave API no WhatAuto.\n\n> Abra o WhatAuto e vá na aba <span style=\"color: #30c522; font-weight: 600;\">MENU</span> 📱 (a primeira aba da esquerda).\n\n> Clique logo abaixo no quadrado <span style=\"color: #30c522; font-weight: 600;\">'Resposta da IA'</span>.\n\n> Na tela que abrir, verifique se a aba superior <span style=\"color: #30c522; font-weight: 600;\">'ChatGPT'</span> está selecionada (verde).\n\n<span style=\"color: #30c522; font-weight: 600;\">PREENCHA OS CAMPOS NA TELA:</span>\n> <span style=\"color: #30c522; font-weight: 600;\">Chave da API:</span> Cole o código <code>sk-...</code> no campo onde tem um ícone de olho.\n> <span style=\"color: #30c522; font-weight: 600;\">Model:</span> Clique na setinha e selecione <span style=\"color: #30c522; font-weight: 600;\">OBRIGATORIAMENTE</span> o <span style=\"color: #30c522; font-weight: 600;\">gpt-4o-mini</span>.\n> Clique no botão grande <span style=\"color: #30c522; font-weight: 600;\">SALVAR</span> 💾.",
    suggestions: [],
    action: { label: "CONTINUAR", url: "#" },
    contextoIA: "Fase 6: Inserção do chave API e seleção do modelo gpt-4o-mini."
  },
  8: {
    text: "⚙️ <span style=\"color: #30c522; font-weight: bold;\">FASE 7: CONFIGURAÇÃO DE IA</span>\n\nVamos ajustar agora a memória da IA.\n\n> Na mesma tela (embaixo do botão SALVAR dentro de RESPOSTA DA IA).\n> Clique em <span style=\"color: #30c522; font-weight: 600;\">'Configurações de IA'</span>.\n> Em 'Quantas mensagens a IA deve lembrar por conversa?', coloque <span style=\"color: #30c522; font-weight: 600;\">10</span>.\n> Clique em <span style=\"color: #30c522; font-weight: 600;\">OK</span> e depois na setinha para <span style=\"color: #30c522; font-weight: 600;\">Voltar</span> ↩️.\n\nFaça exatamente assim para funcionar perfeitamente.",
    suggestions: [],
    action: { label: "CONTINUAR", url: "#" },
    contextoIA: "Fase 7: Ajuste do histórico de memória da IA."
  },
  9: {
    text: "📊 <span style=\"color: #30c522; font-weight: bold;\">FASE 8: PARÂMETROS DE IA</span>\n\nConfigure esses números exatamente assim para um atendimento <span style=\"color: #30c522; font-weight: 600;\">PROFISSIONAL</span>:\n> Temperature: <span style=\"color: #30c522; font-weight: 600;\">0.7</span>\n> Max Tokens: <span style=\"color: #30c522; font-weight: 600;\">500</span>\n> Top P: <span style=\"color: #30c522; font-weight: 600;\">1.0</span>\n> Frequency Penalty: <span style=\"color: #30c522; font-weight: 600;\">0.5</span>\n\nIsso evita que a IA seja <span style=\"color: #30c522; font-weight: 600;\">REPETITIVA</span> ou <span style=\"color: #30c522; font-weight: 600;\">LIMITADA</span>.\nAgora clique na setinha no topo para voltar.",
    suggestions: [],
    action: { label: "CONTINUAR", url: "#" },
    contextoIA: "Fase 8: Calibração técnica dos parâmetros de resposta."
  },
  10: {
    text: "🤖 <span style=\"color: #30c522; font-weight: bold;\">FASE 9: O COPILOTO 6.0</span>\n\nChegou a hora de dar personalidade à sua IA.\n\n> Copie o Script que eu te enviei no botão abaixo ⬇️.\n\n> Dentro de RESPOSTA DE IA, clique em <span style=\"color: #30c522; font-weight: 600;\">'Treinar IA'</span> (Personalidade).\n\n> Clique no botão abaixo <span style=\"color: #30c522; font-weight: 600;\">+ADICIONAR</span> e cole o Script do <span style=\"color: #30c522; font-weight: 600;\">COPILOTO 6.0</span> dentro.\n\n> Agora clique no ícone de Check ✅ no topo para <span style=\"color: #30c522; font-weight: 600;\">SALVAR</span> o Script do <span style=\"color: #30c522; font-weight: 600;\">COPILOTO</span> e na setinha para voltar.\n\nFez exatamente como te falei?\n\n<a href=\"https://docs.google.com/document/d/1GN8DfF_iYWn_9oRXOoYgOK7A1dxF0kfqNEGo-bAaRcw/edit?usp=sharing\" target=\"_blank\" style=\"display: inline-block; background-color: rgba(48, 197, 34, 0.2); color: #30c522; padding: 10px 20px; border: 1px solid #30c522; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px;\">BAIXAR SCRIPT COPILOTO 📜</a>",
    suggestions: [],
    action: {
      label: "CONTINUAR",
      url: "#"
    },
    contextoIA: "Fase 9: Inserção do Script de personalidade (Prompt)."
  },
  11: {
    text: "🏷️ <span style=\"color: #30c522; font-weight: bold;\">FASE 10: SUA MARCA</span>\n\nIsso coloca uma etiqueta no topo das respostas (<span style=\"color: #30c522; font-weight: 600;\">OPCIONAL</span>).\n\n> Na tela inicial, clique nos <span style=\"color: #30c522; font-weight: 600;\">3 Pontinhos (⋮)</span> no topo direito.\n> Clique em Configurações e vá na opção <span style=\"color: #30c522; font-weight: 600;\">Cabeçalho e rodapé da Resposta</span>.\n> Ative a chave <span style=\"color: #30c522; font-weight: 600;\">CABEÇALHO DE RESPOSTA</span> e, em mensagem, escreva o nome do seu negócio.\nExemplo: <code>[Táxi VIP]</code> ou <code>[Atendimento Executivo]</code>.\n\n<span style=\"color: #30c522; font-weight: bold;\">Quando quiser tirar a etiqueta, é só desativar a chave de resposta.</span>\n\nAperte o Botão abaixo e vamos continuar.",
    suggestions: [],
    action: { label: "CONTINUAR", url: "#" },
    contextoIA: "Fase 10: Configuração opcional de cabeçalho."
  },
  12: {
    text: "🚫 <span style=\"color: #30c522; font-weight: bold;\">FASE 11: ONDE NÃO MEXER</span>\n\nVolte à tela inicial e vá na aba <span style=\"color: #30c522; font-weight: 600;\">MENU</span>.\n\n<span style=\"color: #FF3131; font-weight: bold;\">ONDE NÃO MEXER:</span> Não mexa nos seguintes botões:\n ❌ Mensagem de Boas-vindas\n ❌ Resposta com listas\n ❌ Resposta com palavra chave\n ❌ Servidor\n ❌ Planilha\n\nDeixe como está, não precisamos mexer nisso!",
    suggestions: [],
    action: { label: "CONTINUAR", url: "#" },
    contextoIA: "Fase 11: Alertas sobre funções que devem permanecer desligadas."
  },
  13: {
    text: "🔛 <span style=\"color: #30c522; font-weight: bold;\">FASE 12: LIGANDO A IA (CHATGPT)</span>\n\nAgora que tudo está configurado, vamos ativar o seu <span style=\"color: #30c522; font-weight: 600;\">COPILOTO 6.0</span> 🤖.\n> Vá para a tela inicial e acesse a aba <span style=\"color: #30c522; font-weight: 600;\">INÍCIO</span>.\n> Vá em <span style=\"color: #30c522; font-weight: 600;\">'Texto de resposta automática'</span>.\n> Clique nele, quando abrir, marque a opção (Resposta da IA) e selecione <span style=\"color: #30c522; font-weight: 600;\">ChatGPT</span>.\n> Clique no ícone de \"Check\" ✅ no topo para salvar.\n> Na aba Início, ligue a chave <span style=\"color: #30c522; font-weight: 600;\">RESPOSTAS AUTOMÁTICAS</span>.\n> Ela deve ficar verde e dizer <span style=\"color: #30c522; font-weight: 600;\">LIGADA</span>. Em 'Texto de resposta automática', tem que estar escrito <span style=\"color: #30c522; font-weight: 600;\">(CHATGPT)</span>.",
    suggestions: [],
    action: { label: "CONTINUAR", url: "#" },
    contextoIA: "Fase 12: Ativação final do sistema."
  },
  14: {
    text: "Dica importante: Sempre que for responder um cliente manualmente, lembre-se de <span style=\"color: #30c522; font-weight: 600;\">DESATIVAR</span> 📴 o COPILOTO. Caso contrário, a IA continuará respondendo simultaneamente, podendo gerar mensagens duplicadas ou conflitantes.\n\nDica extra: Se o cliente enviar uma mensagem e a IA não responder, basta fechar o aplicativo e abri-lo novamente. Quando a janela flutuante do app aparecer, isso indica que a IA voltará a responder normalmente.\n\nAgora, na tela inicial, vá na aba <span style=\"color: #30c522; font-weight: 600;\">MENU</span>, clique em <span style=\"color: #30c522; font-weight: 600;\">TEST REPLY (ou TESTAR RESPOSTA)</span> 📲 e mande um (Oi!).\nSe você receber uma resposta, é sinal que o copiloto está funcionando no seu WhatsApp.",
    suggestions: [],
    action: { label: "CONTINUAR", url: "#" },
    contextoIA: "Dicas de operação e teste final de funcionamento."
  },
  15: {
    text: [
      "🏆 <span style=\"color: #30c522; font-weight: bold;\">VITÓRIA: PILAR 1 100% CONCLUÍDO</span>\n\nParabéns, motorista. Fico muito satisfeito em ver que você seguiu corretamente cada fase do Pilar 1.\n\nO <span style=\"color: #30c522; font-weight: 600;\">COPILOTO</span> está ativo e pronto para atender enquanto você dirige 🚕.\nLembre-se apenas de um ponto essencial: uma <span style=\"color: #30c522; font-weight: 600;\">Inteligência Artificial</span> forte precisa de uma <span style=\"color: #30c522; font-weight: 600;\">fachada profissional</span> para converter mais vendas."
    ],
    suggestions: [],
    action: {
      label: "CONTINUAR",
      url: "#"
    },
    contextoIA: "Pilar 1 concluído. Mensagem de vitória."
  },
  16: {
    text: [
      "🎁 <span style=\"color: #30c522; font-weight: bold;\">SUPER BÔNUS: CRÉDITOS GRÁTIS</span>\n\nPara pagar a mensalidade do WhatAuto sem tirar do seu bolso, instale o <span style=\"color: #30c522; font-weight: 600;\">Google Opinion Rewards</span>, deixe ativada sua <span style=\"color: #30c522; font-weight: 600;\">localização</span> e permita tudo que o app solicitar.\n\nVocê vai ganhar <span style=\"color: #30c522; font-weight: 600;\">créditos na PLAYSTORE</span> respondendo pesquisas rápidas para o Google. Não há custo para participar e as perguntas levam poucos minutos.\n\nO funcionamento é simples: ao permitir todas as solicitações do aplicativo, incluindo configurações e acesso à localização, o sistema passa a identificar os locais que você frequenta. Com base nesses deslocamentos, o app envia pesquisas rápidas relacionadas a lugares que você visitou recentemente.\n\nClique no botão abaixo.\n\n<a href=\"https://play.google.com/store/apps/details?id=com.google.android.apps.paidtasks\" target=\"_blank\" style=\"display: inline-block; background-color: rgba(48, 197, 34, 0.2); color: #30c522; padding: 10px 20px; border: 1px solid #30c522; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px;\">BAIXAR GOOGLE REWARDS 💰</a>"
    ],
    suggestions: [],
    action: {
      label: "CONTINUAR",
      url: "#"
    },
    contextoIA: "Super Bônus: Google Rewards."
  },
  17: {
    text: [
      "<strong>SEU PROGRESSO:</strong>\n ✅ <span style=\"color: #30c522; font-weight: 600;\">PILAR 1: CONCLUÍDO</span>\n ⏳ <span style=\"color: #30c522; font-weight: 600;\">PILAR 2: SITE PROFISSIONAL</span>\n\nClique no <span style=\"color: #30c522; font-weight: 600;\">BOTÃO ACESSAR PILAR 2</span>."
    ],
    suggestions: [],
    action: {
      label: "ACESSAR PILAR 2",
      url: "#",
      isUnlockAction: true
    },
    unlockLevel: 2,
    contextoIA: "Transição para o Pilar 2."
  }
};

const processPilar1 = async (
    step: number, 
    text: string
): Promise<BrainResponse> => {
    const lowerText = text.trim().toUpperCase();
    let nextStep = step;
    let botMessages: (string | BotMessage)[] = [];
    let suggestions: string[] = [];
    let error = false;

    // Obtém os dados do passo atual (ou do passo 0 se inválido)
    const stepData = PILAR1_STEPS[step] || PILAR1_STEPS[0];
    
    // Verifica se o usuário enviou o comando de avanço esperado (Baseado no Botão)
    // Agora validamos diretamente pelo label da ação, já que input de texto livre foi removido.
    const expectedCommand = stepData.action?.label?.toUpperCase() || "CONTINUAR";
    const isCorrectCommand = lowerText === expectedCommand || lowerText === "CONTINUAR";

    // Lógica de Avanço de Fase (Caminho Feliz)
    if (isCorrectCommand) {
        // Usuário acertou o comando do passo atual. Avança para o próximo.
        nextStep = step + 1;
        
        // Se for o último passo (Vitória -> Pilar 2), mantém ou redireciona?
        if (!PILAR1_STEPS[nextStep]) {
             // Fim do fluxo.
             return { botMessages: [], nextStep, error: false, suggestions: [] };
        }

        // Pega o conteúdo do NOVO passo
        const nextStepData = PILAR1_STEPS[nextStep];
        
        if (Array.isArray(nextStepData.text)) {
            botMessages = nextStepData.text.map((t, index) => ({
                sender: 'bot',
                text: t,
                action: index === nextStepData.text.length - 1 ? nextStepData.action : undefined
            }));
        } else {
            botMessages = [{ 
                sender: 'bot', 
                text: nextStepData.text,
                action: nextStepData.action
            }];
        }
        suggestions = nextStepData.suggestions;

        return { botMessages, nextStep, error, suggestions };
    }

    // Se o usuário NÃO digitou o comando esperado
    else {
        // Restauração de Sessão (Histórico Completo)
        if (text === 'RESTORE_SESSION') {
             for (let i = 0; i <= step; i++) {
                 const sData = PILAR1_STEPS[i];
                 if (!sData) continue;

                 // Mensagens do Bot
                 if (Array.isArray(sData.text)) {
                     sData.text.forEach((t, idx) => {
                         botMessages.push({
                             sender: 'bot',
                             text: t,
                             action: idx === sData.text.length - 1 ? sData.action : undefined
                         });
                     });
                 } else {
                     botMessages.push({
                         sender: 'bot',
                         text: sData.text,
                         action: sData.action
                     });
                 }
             }
             suggestions = PILAR1_STEPS[step]?.suggestions || [];
             return { botMessages, nextStep, error, suggestions };
        }

        // Se for uma inicialização (step 0)
        if (step === 0) {
            // Caso 1: Inicialização da tela (Carrega a Intro STEP 1 do Nonato)
            if (text === '' || text === 'init') {
                botMessages = PILAR1_INTRO.map(item => ({
                    sender: 'bot',
                    text: item.text,
                    action: item.action,
                    delay: item.delay
                }));
                return { botMessages, nextStep: 0, error: false, suggestions: [] };
            }

            // Caso 1.5: Transições de Intro
            if (text === 'CONTINUAR_1') {
                botMessages = PILAR1_CONTINUAR_1.map(item => ({
                    sender: 'bot',
                    text: item.text,
                    action: item.action,
                    delay: item.delay
                }));
                return { botMessages, nextStep: 0, error: false, suggestions: [] };
            }
            if (text === 'CONTINUAR_2') {
                botMessages = PILAR1_CONTINUAR_2.map(item => ({
                    sender: 'bot',
                    text: item.text,
                    action: item.action,
                    delay: item.delay
                }));
                return { botMessages, nextStep: 0, error: false, suggestions: [] };
            }

            // Caso 2: Usuário clicou em "INICIAR PILAR" (Carrega o conteúdo real do Step 0 - Mentalidade)
            if (text === 'INICIAR' || text === 'INICIAR PILAR' || text === 'INICIAR PILAR 1') {
                botMessages = PILAR1_MENTALIDADE.map(item => ({
                    sender: 'bot',
                    text: item.text,
                    action: item.action,
                    delay: item.delay
                }));
                return { botMessages, nextStep: 0, error: false, suggestions: [] };
            }

            if (text === 'PILAR1_MAPA') {
                botMessages = PILAR1_MAPA.map(item => ({
                    sender: 'bot',
                    text: item.text,
                    action: item.action,
                    delay: item.delay
                }));
                return { botMessages, nextStep: 0, error: false, suggestions: [] };
            }

            if (text === 'PILAR1_FASES') {
                if (Array.isArray(stepData.text)) {
                        botMessages = stepData.text.map((t, index) => ({
                        sender: 'bot',
                        text: t,
                        action: index === stepData.text.length - 1 ? stepData.action : undefined
                    }));
                } else {
                        botMessages = [{ 
                        sender: 'bot', 
                        text: stepData.text,
                        action: stepData.action
                    }];
                }
                suggestions = stepData.suggestions;
                return { botMessages, nextStep, error, suggestions };
            }
        }

        // Caso contrário, ignoramos inputs inválidos (já que o input de texto está oculto).
        // Apenas retornamos o estado atual sem mensagens novas.
        return { botMessages: [], nextStep, error: false, suggestions: [] };
    }
};

// --- PILAR 2 LOGIC & CONTENT (INTEGRATED) ---

interface Pilar2StepData {
    text: string | string[];
    suggestions: string[];
    action?: {
        label: string;
        url: string;
        isUnlockAction?: boolean;
        payload?: string;
    };
    actionIndex?: number;
    contextoIA: string;
    expectedInput?: string;
    unlockLevel?: number;
}

const LINKS = {
    MODELO: "https://sites.google.com/d/1iYz7IZSoIvcb_vNmsMiaxYbuSQ6QBiFI/p/14hQ9Kr1mNnPf7aUruIh92x_e1ggzelQy/edit",
    PAINEL: "https://sites.google.com/new",
    WA_LINK: "https://create.wa.link/",
    HOSTINGER: "https://hostinger.com.br?REFERRALCODE=Marketelli",
    QR_CODE: "https://www.the-qrcode-generator.com/"
};

// --- PILAR 2 INTRO SEQUENCES ---
const PILAR2_INTRO = [
    {
        text: `<span> Seu motor já foi estabilizado pelo <span style="color: #8B5CF6; font-weight: 600;">NONATO</span>, agora é hora de dar cara ao seu negócio. Eu sou a <span style="color: #8B5CF6; font-weight: bold;">MONALISA</span> e vou projetar sua <span style="color: #8B5CF6; font-weight: 600;">Presença Digital de Elite</span>.<br /> A partir de agora, transformaremos sua operação em uma vitrine de <span style="color: #8B5CF6; font-weight: 600;">autoridade absoluta</span> para atrair passageiros de alto valor. </span>`,
        delay: 1000,
        action: { label: 'CONTINUAR', url: '#', payload: 'CONTINUAR_2' }
    }
];

const PILAR2_CONTINUAR_2 = [
    {
        text: `<span> Não basta ser o melhor no que faz; o mercado precisa perceber isso antes mesmo de você abrir a porta do carro.<br /> Vamos construir o seu <span style="color: #8B5CF6; font-weight: 600;">Site Profissional</span> seguindo os padrões visuais do <span style="color: #8B5CF6; font-weight: bold;">SISTEMA TÁXI PRO 5.0</span>.<br /> Sua identidade visual será o seu maior ativo de <span style="color: #8B5CF6; font-weight: 600;">vendas automáticas</span>. </span>`,
        delay: 1000,
        action: { label: 'CONTINUAR', url: '#', payload: 'INICIAR_PILAR_2' }
    }
];

const PILAR2_INICIAR_FLOW = [
    {
        text: `<span> Chegou o momento de abandonar o amadorismo e assumir o controle da sua <span style="color: #8B5CF6; font-weight: 600;">Marca Própria</span>.<br /> Foque na execução. Cada pixel do seu novo site foi pensado para converter curiosos em <span style="color: #8B5CF6; font-weight: 600;">clientes fiéis</span>.<br /> Iniciando protocolo de design agora. Preste atenção. </span>`,
        delay: 1000,
        action: { label: 'INICIAR PILAR 2', url: '#', payload: 'PILAR2_ROADMAP' }
    }
];

const PILAR2_ROADMAP = [
    {
        text: "<span style=\"color: #8B5CF6; font-weight: bold;\">Sistema Táxi Pro</span> 🚕 segue avançando:\n\n✅ <span style=\"color: #8B5CF6; font-weight: bold;\">PILAR 1:</span> ROBÔ DE ATENDIMENTO (Concluído)\n🚀 <span style=\"color: #8B5CF6; font-weight: bold;\">PILAR 2:</span> SITE PROFISSIONAL (Iniciando)\n🔒 <span style=\"color: #8B5CF6; font-weight: bold;\">PILAR 3:</span> GOOGLE ADS (Bloqueado)\n\nVamos levantar sua estrutura em <span style=\"color: #8B5CF6; font-weight: bold;\">9 FASES</span>\n(cola em mim que é sucesso):\n\n 🟦 1. A Clonagem\n 👁️ 2. Conferência do Painel\n 👤 3. Identidade Visual (Nome e Foto)\n 🏢 4. Dados Corporativos (Rodapé)\n 🔗 5. Geração de Links (WhatsApp)\n 🔌 6. Conexão dos Botões\n 🚀 7. Publicação Oficial\n 🛡️ 8. A Blindagem (Domínio Próprio)\n 🎁 9. BÔNUS\n\nVamos fazer isso bem feito?\n\nTô pronta quando você estiver.",
        delay: 1000,
        action: { label: 'CONTINUAR', url: '#', payload: 'START_STEPS' }
    }
];

const PILAR2_STEPS: Record<number, Pilar2StepData> = {
    0: {
        text: [
            "Aguardando inicialização..."
        ],
        suggestions: [],
        action: { label: "INICIAR", url: "#" },
        contextoIA: "Estado inicial do Pilar 2."
    },
    1: {
        text: "🟦 <span style=\"color: #8B5CF6; font-weight: bold;\">FASE 1: PREPARANDO O SITE</span>\n\nPra não ter erro, segue exatamente essa ordem aqui, tá?\n\nVamos clonar o site e limpar a bagunça.\n\n<span style=\"color: #8B5CF6; font-weight: bold;\">PRIMEIRO LEIA A INSTRUÇÃO DEPOIS CLIQUE NO BOTAO ABAIXO:</span>\n\n1. ⚠️ <span style=\"color: #8B5CF6; font-weight: bold;\">(MUITO IMPORTANTE) Seu navegador precisa estar no MODO COMPUTADOR/DESKTOP:</span>\n\nAssim que abrir, <span style=\"color: #8B5CF6; font-weight: bold;\">não toca em nada</span> 🚫!\n\nVai nos <span style=\"color: #8B5CF6; font-weight: bold;\">3 pontinhos</span> do navegador (canto superior)\ne marca a opção <span style=\"color: #8B5CF6; font-weight: bold;\">\"Para Computador\"</span> 💻\n(ou \"Versão para Desktop\").\n\nSem isso não dá pra mexer!\n\n<a href=\"" + LINKS.MODELO + "\" target=\"_blank\" style=\"display: inline-block; background-color: rgba(139, 92, 246, 0.2); color: #8B5CF6; padding: 10px 20px; border: 1px solid #8B5CF6; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px;\">CLONAR SITE</a>",
        suggestions: [],
        action: {
            label: "CONTINUAR",
            url: "#"
        },
        contextoIA: "Fase 1: Clonagem e Limpeza - Parte 1."
    },
    2: {
        text: "<span style=\"color: #8B5CF6; font-weight: bold;\"></span>\n📋 <span style=\"color: #8B5CF6; font-weight: bold;\">VAMOS CLONAR O SITE:</span>\n\nNo topo direito,\nclica nos <span style=\"color: #8B5CF6; font-weight: bold;\">3 pontinhos verticais</span> (perto do botão Publicar)\ne escolhe <span style=\"color: #8B5CF6; font-weight: bold;\">\"FAZER UMA CÓPIA\"</span>.\n\nDá o nome <span style=\"color: #8B5CF6; font-weight: bold;\">\"Meu Site Oficial\"</span> e aperta OK.\n\n3 🗑️ <span style=\"color: #8B5CF6; font-weight: bold;\">LIMPEZA OBRIGATÓRIA:</span>\n\nPra você não editar o arquivo errado sem querer,\nvamos apagar o original agora.\n\nAcesse o Painel Geral no botão abaixo:\n\n<a href=\"https://sites.google.com/u/0/new/?authuser=0\" target=\"_blank\" style=\"display: inline-block; background-color: rgba(139, 92, 246, 0.2); color: #8B5CF6; padding: 10px 20px; border: 1px solid #8B5CF6; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px; margin-bottom: 10px;\">PAINEL GOOGLE SITES ⚙️</a>\n\n<span style=\"color: #8B5CF6; font-weight: bold;\">Sua Missão:</span>\n\nIdentifique o arquivo chamado <span style=\"color: #8B5CF6; font-weight: bold;\">\"Modelo Marketelli\"</span>,\nclica nos 3 pontinhos dele e seleciona <span style=\"color: #8B5CF6; font-weight: bold;\">REMOVER (LIXEIRA)</span> 🚮.\n\nFica apenas com o site que você criou.\n\nAgora você já tem um site pronto na mão!",
        suggestions: [],
        action: {
            label: "CONTINUAR",
            url: "#"
        },
        contextoIA: "Fase 1: Clonagem e Limpeza - Parte 2."
    },
    3: {
        text: "👁️ <span style=\"color: #8B5CF6; font-weight: bold;\">FASE 2: CONFERÊNCIA</span>\n\nBoa! Agora você é o dono da cópia do site.\nVamos conferir?\n\n1 Agora acesse o site que você copiou.\n\n2 Olha no canto superior esquerdo da tela.\n\n3 O nome do site é o que você copiou ou ainda está \"Modelo Marketelli\"?\n\nSe estiver vendo o <span style=\"color: #8B5CF6; font-weight: bold;\">seu nome</span> lá,\ntá tudo certo! ✅",
        suggestions: [],
        action: {
            label: "CONTINUAR",
            url: "#"
        },
        contextoIA: "Fase 2: Conferência."
    },
    4: {
        text: "👤 <span style=\"color: #8B5CF6; font-weight: bold;\">FASE 3: SUA MARCA</span>\n\nAgora é a hora de deixar tudo com a <span style=\"color: #8B5CF6; font-weight: bold;\">sua cara</span>.\n\n<span style=\"color: #8B5CF6; font-weight: bold;\">Dica de amiga:</span>\n\nDá um zoom 🔍 com os dedos (pinça)\npra facilitar o clique.\n\n<span style=\"color: #8B5CF6; font-weight: bold;\">NOME (CABEÇALHO):</span>\n\n1. Clica no texto do topo (onde diz \"Ponto de Táxi\").\n\n2. Apaga e escreve seu <span style=\"color: #8B5CF6; font-weight: bold;\">Nome</span> ou <span style=\"color: #8B5CF6; font-weight: bold;\">Nome da Empresa</span>.\n\n🖼️ <span style=\"color: #8B5CF6; font-weight: bold;\">FOTO DE CAPA:</span>\n\n1. Clica 1 vez na imagem grande de fundo.\n\n2. No menu (nos 3 pontinhos), clica em <span style=\"color: #8B5CF6; font-weight: bold;\">\"Substituir Imagem\"</span> &gt; <span style=\"color: #8B5CF6; font-weight: bold;\">\"Fazer Upload\"</span>.\n\n3. Escolhe sua melhor foto (você e o carro) na galeria.\nCapricha!",
        suggestions: [],
        action: {
            label: "CONTINUAR",
            url: "#"
        },
        contextoIA: "Fase 3: Identidade Visual."
    },
    5: {
        text: "🏢 <span style=\"color: #8B5CF6; font-weight: bold;\">FASE 4: RODAPÉ PROFISSIONAL</span>\n\nA parte chata (jurídica) eu já deixei pronta pra você.\n\nSó falta o <span style=\"color: #8B5CF6; font-weight: bold;\">toque final</span>.\n\n<span style=\"color: #8B5CF6; font-weight: bold;\">LÁ NO FIM DA PÁGINA:</span>\n\n1. Rola até o rodapé (final da página).\n\n2. Clica em <span style=\"color: #8B5CF6; font-weight: bold;\">\"Editar Rodapé\"</span> 📜\ne edita os textos \"+40 Anos de Tradição\".\n\n3. Coloca o seu <span style=\"color: #8B5CF6; font-weight: bold;\">tempo real de praça</span>\ne sua <span style=\"color: #8B5CF6; font-weight: bold;\">cidade base</span> 📍.\n\n4. Clica em \"ENDEREÇO AQUI\"\ne coloca o endereço do local que você normalmente atende.",
        suggestions: [],
        action: {
            label: "CONTINUAR",
            url: "#"
        },
        contextoIA: "Fase 4: Rodapé."
    },
    6: {
        text: "🔗 <span style=\"color: #8B5CF6; font-weight: bold;\">FASE 5: SEU LINK DE ATENDIMENTO</span>\n\nAgora vamos criar o <span style=\"color: #8B5CF6; font-weight: bold;\">link inteligente</span>\npro botão do site chamar seu COPILOTO.\n\n1. Clica no botão abaixo <span style=\"color: #8B5CF6; font-weight: bold;\">\"GERADOR DE LINK\"</span>.\n\n2. Desce a página até a parte onde você pode digitar seu número 📱.\n\n3. Na mensagem, escreve algo simpático como:\n\n<em>\"Olá, vim pelo seu site, você está disponível agora?\" 💬</em>\n\n4. Clica em <span style=\"color: #8B5CF6; font-weight: bold;\">\"Generate my wa.link\"</span>,\nvai abrir uma página e no final dela clica em <span style=\"color: #8B5CF6; font-weight: bold;\">\"Copy link\"</span>.\n\n<a href=\"" + LINKS.WA_LINK + "\" target=\"_blank\" style=\"display: inline-block; background-color: rgba(139, 92, 246, 0.2); color: #8B5CF6; padding: 10px 20px; border: 1px solid #8B5CF6; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px;\">GERADOR DE LINK 🔗</a>",
        suggestions: [],
       action: {
            label: "CONTINUAR",
            url: "#"
        },
        contextoIA: "Fase 5: Link do WhatsApp."
    },
    7: {
        text: "🔌 <span style=\"color: #8B5CF6; font-weight: bold;\">FASE 6: LIGANDO O MOTOR</span>\n\nAtenção, Sócio: os botões do site são <span style=\"color: #8B5CF6; font-weight: bold;\">imagens profissionais</span> 🖼️.\n\nO jeito de colocar o link tem um segredinho.\n\n1 Clica em cima da <span style=\"color: #8B5CF6; font-weight: bold;\">IMAGEM DO BOTÃO \"CHAMAR AGORA\"</span> (2 cliques).\n\n2 Vai aparecer uma barra flutuante acima dela.\n\n3 Clica no ícone de <span style=\"color: #8B5CF6; font-weight: bold;\">INSERIR LINK</span> 🔗.\n\n4 Cola o seu link do WhatsApp e clica em <span style=\"color: #8B5CF6; font-weight: bold;\">APLICAR</span>.\n\n5 Repete o processo no botão <span style=\"color: #8B5CF6; font-weight: bold;\">\"AGENDAR CORRIDA\"</span>.\n\n6 No botão <span style=\"color: #8B5CF6; font-weight: bold;\">\"LIGAR PARA MOTORISTA AGORA\"</span> 📞\ncole isso:\n\n<code>tel:+55DDD999999999</code>\n\ne aplique.",
        suggestions: [],
        action: {
            label: "CONTINUAR",
            url: "#"
        },
        contextoIA: "Fase 6: Conexão dos botões."
    },
    8: {
        text: "🚀 <span style=\"color: #8B5CF6; font-weight: bold;\">FASE 7: INAUGURAÇÃO</span>\n\nChegou a hora de mostrar pro mundo!\n\n1 No topo direito, clica no botão azul <span style=\"color: #8B5CF6; font-weight: bold;\">\"PUBLICAR\"</span> 🌐.\n\n2 Em <span style=\"color: #8B5CF6; font-weight: bold;\">\"Endereço da Web\"</span>, cria um nome simples e sem espaços\n(ex: taxidojoao).\n\n3 Clica no botão <span style=\"color: #8B5CF6; font-weight: bold;\">\"PUBLICAR\"</span> final.\n\n🔥 <span style=\"color: #8B5CF6; font-weight: bold;\">TESTE DE FOGO:</span>\n\n1 Clica no ícone de <span style=\"color: #8B5CF6; font-weight: bold;\">CLIPE</span> 📎 no topo da tela\npra copiar o link final do site publicado.\n\n2 Cola o link em uma aba nova no navegador e faz os testes!\n\nVê se os botões estão chamando no WhatsApp corretamente\ne se o último botão leva pra ligação direta.",
        suggestions: [],
        action: {
            label: "CONTINUAR",
            url: "#"
        },
        contextoIA: "Fase 7: Publicação e Teste."
    },
    9: {
        text: "🛡️ <span style=\"color: #8B5CF6; font-weight: bold;\">FASE 8: SEGURANÇA NO GOOGLE (OPCIONAL)</span>\n\n⚠️ <span style=\"color: #8B5CF6; font-weight: bold;\">ALERTA DE AMIGA:</span>\n\nSeu site gratuito já funciona, viu?\nPorém, ele está em um <span style=\"color: #8B5CF6; font-weight: bold;\">\"terreno alugado\"</span> 🏠.\n\nPro <span style=\"color: #8B5CF6; font-weight: bold;\">PILAR 3 (Google Ads)</span>,\nexiste um <span style=\"color: #8B5CF6; font-weight: bold;\">RISCO REAL</span> do seu site ser bloqueado\nse você não tiver um domínio próprio (<code>.com.br</code>).\n\nPra jogar o jogo profissional,\neu recomendo registrar seu <span style=\"color: #8B5CF6; font-weight: bold;\">nome</span> (OPCIONAL).\n\n<span style=\"color: #8B5CF6; font-weight: bold;\">POR QUE FAZER ISSO?</span>\n\n1. <span style=\"color: #8B5CF6; font-weight: bold;\">Segurança</span> 🔐:\nevita perder sua conta de anúncios.\n\n2. <span style=\"color: #8B5CF6; font-weight: bold;\">Autoridade:</span>\n<code>taxidojoao.com.br</code> passa muito mais confiança.\n\n3. <span style=\"color: #8B5CF6; font-weight: bold;\">Custo</span> 💰:\nmenos de R$ 40,00 por ano (preço de uma corrida curta).\n\n<span style=\"color: #8B5CF6; font-weight: bold;\">(OPCIONAL) LINK COM DESCONTO NA HOSTINGER:</span>\n\nBotão abaixo <span style=\"color: #8B5CF6; font-weight: bold;\">\"REGISTRAR DOMÍNIO\"</span>.\n\n<em>Se preferir não registrar agora, sem problemas.\nSiga ciente dos riscos, tá?</em>\n\n<a href=\"" + LINKS.HOSTINGER + "\" target=\"_blank\" style=\"display: inline-block; background-color: #8B5CF6; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px;\">REGISTRAR DOMÍNIO 🌐</a>",
        suggestions: [],
        action: {
            label: "CONTINUAR",
            url: "#"
        },
        contextoIA: "Fase 8: Segurança."
    },
    10: {
        text: "🎁 <span style=\"color: #8B5CF6; font-weight: bold;\">BÔNUS: DOMINAÇÃO DE RUA (QR CODE)</span>\n\nVamos levar seu site pro <span style=\"color: #8B5CF6; font-weight: bold;\">mundo físico</span> 🏙️!\n\n<span style=\"color: #8B5CF6; font-weight: bold;\">TUTORIAL RÁPIDO:</span>\n\n1. Clica no botão abaixo <span style=\"color: #8B5CF6; font-weight: bold;\">\"GERAR QR CODE\"</span>.\n\n2. Em <span style=\"color: #8B5CF6; font-weight: bold;\">\"Your URL\"</span>, cola o <span style=\"color: #8B5CF6; font-weight: bold;\">LINK DO SEU SITE</span>\n(aquele que você copiou no ícone de clipe 📎).\n\n3. Clica em <span style=\"color: #8B5CF6; font-weight: bold;\">\"Create QR Code\"</span>,\ndepois em <span style=\"color: #8B5CF6; font-weight: bold;\">\"DOWNLOAD PNG\"</span> e salva a imagem.\n\n💡 <span style=\"color: #8B5CF6; font-weight: bold;\">DICA DE OURO:</span>\n\nImprima 🖨️ e deixe na recepção de <span style=\"color: #8B5CF6; font-weight: bold;\">hotéis parceiros</span>.\n\nOfereça comissão por corridas longas.\n\nCole um QR Code no painel do carro ou no vidro traseiro.\n\n<a href=\"" + LINKS.QR_CODE + "\" target=\"_blank\" style=\"display: inline-block; background-color: #8B5CF6; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px;\">GERAR QR CODE 📱</a>",
        suggestions: [],
        action: {
            label: "CONTINUAR",
            url: "#"
        },
        contextoIA: "Bônus: QR Code."
    },
    11: {
        text: "🏆 <span style=\"color: #8B5CF6; font-weight: bold;\">AEEE! VITÓRIA! SEU SITE ESTÁ NO AR.</span>\n\n🚀 <span style=\"color: #8B5CF6; font-weight: bold;\">PRÓXIMA ETAPA: O GRANDE SALTO (PILAR 3)</span>\n\nVocê já tem a <span style=\"color: #8B5CF6; font-weight: bold;\">Máquina</span> e a <span style=\"color: #8B5CF6; font-weight: bold;\">Vitrine</span>.\n\nFalta o <span style=\"color: #8B5CF6; font-weight: bold;\">Combustível</span> ⛽.\n\nPor motivos de segurança e estratégia,\no <span style=\"color: #8B5CF6; font-weight: bold;\">PILAR 3 (TRÁFEGO PAGO)</span> entra como próximo passo.\n\n📊 <span style=\"color: #8B5CF6; font-weight: bold;\">SEU PROGRESSO:</span>\n\n✅ <span style=\"color: #8B5CF6; font-weight: bold;\">PILAR 1: CONCLUÍDO</span>\n✅ <span style=\"color: #8B5CF6; font-weight: bold;\">PILAR 2: CONCLUÍDO</span>.\n\nAproveita pra curtir seu site novo!\nClique no botão abaixo ACESSAR PILAR 3",
        suggestions: [],
        action: {
            label: "ACESSAR PILAR 3",
            url: "#",
            isUnlockAction: true
        },
        unlockLevel: 3,
        contextoIA: "Encerramento e Transição para Pilar 3."
    }
};

const processPilar2 = async (
    step: number, 
    text: string
): Promise<BrainResponse> => {
    const lowerText = text.trim().toUpperCase();
    let nextStep = step;
    let botMessages: (string | BotMessage)[] = [];
    let suggestions: string[] = [];
    let error = false;

    // Use PILAR2_STEPS
    const stepData = PILAR2_STEPS[step] || PILAR2_STEPS[0];
    
    // Check command
    const expectedCommand = stepData.action?.label?.toUpperCase() || "CONTINUAR";
    const payload = stepData.action?.payload?.toUpperCase();
    
    const isCorrectCommand = lowerText === expectedCommand || 
                           lowerText === "CONTINUAR" || 
                           (payload && lowerText === payload);

    if (isCorrectCommand) {
        nextStep = step + 1;
        
        if (!PILAR2_STEPS[nextStep]) {
            return { botMessages: [], nextStep, error: false, suggestions: [] };
        }

        const nextStepData = PILAR2_STEPS[nextStep];
        
        botMessages = [{ 
            sender: 'bot', 
            text: Array.isArray(nextStepData.text) ? nextStepData.text[0] : nextStepData.text,
            action: nextStepData.action
        }];
        suggestions = nextStepData.suggestions;

        return { botMessages, nextStep, error, suggestions };
    }
    
    // Restore session
    if (text === 'RESTORE_SESSION') {
         for (let i = 0; i <= step; i++) {
             const sData = PILAR2_STEPS[i];
             if (!sData) continue;

             botMessages.push({
                 sender: 'bot',
                 text: Array.isArray(sData.text) ? sData.text[0] : sData.text,
                 action: sData.action
             });
         }
         suggestions = PILAR2_STEPS[step]?.suggestions || [];
         return { botMessages, nextStep, error, suggestions };
    }

    // Init logic (step 0)
    if (step === 0) {
        // Initial Loading
        if (text === '' || text === 'init') {
            botMessages = PILAR2_INTRO.map(item => ({
                sender: 'bot',
                text: item.text,
                action: item.action,
                delay: item.delay
            }));
            return { botMessages, nextStep: 0, error: false, suggestions: [] };
        }

        // Intro Flow: CONTINUAR_2 -> INICIAR_PILAR_2 -> PILAR2_ROADMAP -> START_STEPS
        if (text === 'CONTINUAR_2') {
             botMessages = PILAR2_CONTINUAR_2.map(item => ({
                sender: 'bot',
                text: item.text,
                action: item.action,
                delay: item.delay
            }));
            return { botMessages, nextStep: 0, error: false, suggestions: [] };
        }
        
        if (text === 'INICIAR_PILAR_2') {
             botMessages = PILAR2_INICIAR_FLOW.map(item => ({
                sender: 'bot',
                text: item.text,
                action: item.action,
                delay: item.delay
            }));
            return { botMessages, nextStep: 0, error: false, suggestions: [] };
        }

        if (text === 'PILAR2_ROADMAP') {
             botMessages = PILAR2_ROADMAP.map(item => ({
                sender: 'bot',
                text: item.text,
                action: item.action,
                delay: item.delay
            }));
            return { botMessages, nextStep: 0, error: false, suggestions: [] };
        }

        if (text === 'START_STEPS') {
            // Trigger Step 1
             const nextStepData = PILAR2_STEPS[1];
             botMessages = [{ 
                sender: 'bot', 
                text: Array.isArray(nextStepData.text) ? nextStepData.text[0] : nextStepData.text,
                action: nextStepData.action
            }];
            return { botMessages, nextStep: 1, error: false, suggestions: [] };
        }
    }

    return { botMessages: [], nextStep, error: false, suggestions: [] };
};

// --- PILAR 3 LOGIC & CONTENT (INTEGRATED) ---

interface Pilar3StepData {
    text: string | { content: string; delay: number }[];
    action?: {
        label: string;
        url: string;
        isUnlockAction?: boolean;
        isP3LockAction?: boolean;
    };
    suggestions: string[];
    contextoIA: string;
    actionIndex?: number;
}

const PILAR3_STEPS: Record<number, Pilar3StepData> = {
    0: {
        text: "Olhe ao redor. A maioria está apenas fazendo o dia a dia, mas poucos sabem construir uma <span style=\"color: #D4AF37; font-weight: 600;\">dinastia</span>. Eu sou o <span style=\"color: #D4AF37; font-weight: bold;\">LUCAS</span> e estou aqui para garantir que você não seja apenas mais um motorista com um aplicativo bonitinho, mas uma <span style=\"color: #D4AF37; font-weight: 600;\">operação de elite</span> que esmaga a concorrência.",
        action: {
            label: "CONTINUAR",
            url: "#"
        },
        suggestions: [],
        contextoIA: "Lucas intro part 1"
    },
    1: {
        text: "Aqui o nível subiu e as regras mudaram. Para entrar no meu círculo e rodar minha estratégia de tráfego pago, você precisa de postura de dono. Celular é para quem consome; para faturar alto e dominar a praça, você precisa de <span style=\"color: #D4AF37; font-weight: 600;\">infraestrutura</span>: computador e domínio próprio.",
        action: {
            label: "CONTINUAR",
            url: "#"
        },
        suggestions: [],
        contextoIA: "Lucas intro part 2"
    },
    2: {
        text: "Sem isso, você está apenas alugando espaço na terra dos outros e o risco de ser expulso é real. O motor já foi ajustado, está impecável. Seu site profissional está pronto para te entregar a <span style=\"color: #D4AF37; font-weight: 600;\">autoridade máxima</span> que o mercado exige.",
        action: {
            label: "CONTINUAR",
            url: "#"
        },
        suggestions: [],
        contextoIA: "Lucas intro part 3"
    },
    3: {
        text: "Agora, a execução está sob meu comando. Minha missão é trazer <span style=\"color: #D4AF37; font-weight: 600;\">ROI sólido</span> e <span style=\"color: #D4AF37; font-weight: 600;\">dinheiro no seu bolso</span>; essa é minha única obrigação. Pela sua seriedade, você garantiu 60 minutos de <span style=\"color: #D4AF37; font-weight: 600;\">consultoria individual</span> comigo para blindarmos sua conta de <span style=\"color: #D4AF37; font-weight: bold;\">Google Ads</span> contra bloqueios.",
        action: {
            label: "CONTINUAR",
            url: "#"
        },
        suggestions: [],
        contextoIA: "Lucas intro part 4"
    },
    4: {
        text: "Mas eu só entrego o meu tempo para quem prova que aguenta o tranco. Você tem 7 dias para organizar sua logística, dominar o que o Nonato e a Monalisa entregaram. Domine o <span style=\"color: #D4AF37; font-weight: bold;\">WhatAuto</span>; aprenda a mecânica. Se a engrenagem falhar, refaça do zero até ficar perfeito.",
        action: {
            label: "CONTINUAR",
            url: "#"
        },
        suggestions: [],
        contextoIA: "Lucas intro part 5"
    },
    5: {
        text: "Domine a máquina e não tenha medo de clicar; o site deve seguir o seu padrão de excelência. A Monalisa vai garantir o seu passo a passo. Prepare sua infraestrutura e ative sua <span style=\"color: #D4AF37; font-weight: bold;\">máquina de vendas</span> agora.",
        action: {
            label: "CONTINUAR",
            url: "#"
        },
        suggestions: [],
        contextoIA: "Lucas intro part 6"
    },
    6: {
        text: "Em 7 dias, eu te aguardo aqui para mudarmos o seu patamar. Vamos rodar o <span style=\"color: #D4AF37; font-weight: bold;\">Google Ads</span> no limite e injetar os clientes mais qualificados da sua região direto no seu WhatsApp. Vejo você no topo.",
        action: {
            label: "ATIVAR MÁQUINA DE VENDAS",
            url: "#",
            isUnlockAction: false,
            isP3LockAction: true
        },
        suggestions: [],
        contextoIA: "Lucas intro final"
    }
};

const processPilar3 = async (
    step: number, 
    text: string
): Promise<BrainResponse> => {
    const lowerText = text.trim().toUpperCase();
    let nextStep = step;
    let botMessages: (string | BotMessage)[] = [];
    let suggestions: string[] = [];
    let error = false;

    // Use PILAR3_STEPS
    const stepData = PILAR3_STEPS[step] || PILAR3_STEPS[0];
    
    // Check command
    const expectedCommand = stepData.action?.label?.toUpperCase() || "CONTINUAR";
    
    const isCorrectCommand = lowerText === expectedCommand || 
                           lowerText === "CONTINUAR" || 
                           lowerText === "AVANÇAR";

    if (isCorrectCommand) {
        nextStep = step + 1;
        
        if (!PILAR3_STEPS[nextStep]) {
            return { botMessages: [], nextStep, error: false, suggestions: [] };
        }

        const nextStepData = PILAR3_STEPS[nextStep];
        
        botMessages = [{ 
            sender: 'bot', 
            text: typeof nextStepData.text === 'string' ? nextStepData.text : (nextStepData.text as any)[0].content,
            action: nextStepData.action
        }];
        suggestions = nextStepData.suggestions || [];

        return { botMessages, nextStep, error, suggestions };
    }
    else {
        if (text === 'RESTORE_SESSION' || (step === 0 && (text === '' || text === 'init' || text === 'INICIAR'))) {
            if (text === 'RESTORE_SESSION') {
                for (let i = 0; i <= step; i++) {
                     const sData = PILAR3_STEPS[i];
                     if (!sData) continue;
                     botMessages.push({
                         sender: 'bot',
                         text: typeof sData.text === 'string' ? sData.text : (sData.text as any)[0].content,
                         action: sData.action
                     });
                 }
            } else {
                botMessages = [{ 
                    sender: 'bot', 
                    text: typeof stepData.text === 'string' ? stepData.text : (stepData.text as any)[0].content,
                    action: stepData.action 
                }];
            }
            suggestions = stepData.suggestions || [];
            return { botMessages, nextStep, error, suggestions };
        }

        // Modo Estrito: Se o comando não for reconhecido, não faz nada (não chama IA).
        return { botMessages: [], nextStep, error: false, suggestions: [] };
    }
};

export const ChatInstalacaoScreen = ({ onNavigate, onShowUnlock, onUnlock }: { onNavigate?: any, onShowUnlock?: () => void, onUnlock?: () => void }) => {
    return (
        <UnifiedChatScreen 
            title="INSTRUTOR NONATO"
            chatType="pillar1"
            customBackground={<SkynetLensBackground />}
            processor={(step, text) => processPilar1(step, text)}
            onShowUnlock={onShowUnlock}
            onUnlock={onUnlock}
            onNavigate={onNavigate}
        />
    );
};

export const ChatEstrategiaScreen = ({ onNavigate, onShowUnlock, onUnlock }: { onNavigate?: any, onShowUnlock?: () => void, onUnlock?: () => void }) => {
    return (
        <UnifiedChatScreen 
            title="WEB DESIGNER"
            chatType="pillar2"
            customBackground={<LiquidNeonBackground />}
            processor={(step, text) => processPilar2(step, text)}
            onShowUnlock={onShowUnlock}
            onUnlock={onUnlock}
            onNavigate={onNavigate}
        />
    );
};

// --- DYNASTY LOCK SCREEN (PILAR 3 FINAL STATE) ---
const DynastyLockScreen = ({ onNavigate }: { onNavigate?: (screen: any) => void }) => {
    const { navigate, history } = useGlobalProgress(); // Access history for firstAccess
    const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60; // 604800 seconds

    const [timeLeft, setTimeLeft] = useState(() => {
        // Persistence: Tied to User's Initial Entry (history.firstAccess)
        const startTime = history.firstAccess;
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        return Math.max(0, SEVEN_DAYS_SECONDS - elapsed);
    });
    const [isUnlocked, setIsUnlocked] = useState(false);

    useEffect(() => {
        // Initial check
        if (timeLeft <= 0) {
            setIsUnlocked(true);
            return;
        }

        const timer = setInterval(() => {
            // Robust check against system time
            const startTime = history.firstAccess;
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = Math.max(0, SEVEN_DAYS_SECONDS - elapsed);
            
            setTimeLeft(remaining);
            
            if (remaining <= 0) {
                setIsUnlocked(true);
                clearInterval(timer);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [history.firstAccess]);

    // Color Logic: 7d-4d (Red) | 4d-1d (Orange) | <1d (Green)
    const getColor = () => {
        const FOUR_DAYS = 4 * 24 * 60 * 60;
        const ONE_DAY = 1 * 24 * 60 * 60;
        
        if (timeLeft > FOUR_DAYS) return '#EF4444'; // Red
        if (timeLeft > ONE_DAY) return '#F97316'; // Orange
        return '#30c522'; // Neon Green
    };

    const currentColor = getColor();

    // Helper to format DD:HH:MM:SS
    const formatTime = (totalSeconds: number) => {
        const d = Math.floor(totalSeconds / (3600 * 24));
        const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.floor(totalSeconds % 60);
        return `${d.toString().padStart(2, '0')}:${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: '#050505',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Courier New', monospace"
        }}>
            {/* BACK BUTTON */}
            <div 
                onClick={() => {
                   if (onNavigate) onNavigate('dashboard');
                   else navigate('dashboard');
                }}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    cursor: 'pointer',
                    zIndex: 10000,
                    padding: '10px'
                }}
            >
                <ChevronLeft size={32} color="#D4AF37" strokeWidth={1.5} />
            </div>

            <style>
                {`
                    @keyframes pulse-red-aura {
                        0% { filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.4)); }
                        50% { filter: drop-shadow(0 0 60px rgba(239, 68, 68, 0.9)); }
                        100% { filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.4)); }
                    }
                    @keyframes bounce-neon-green {
                        0%, 100% { transform: translateY(0); box-shadow: 0 0 15px rgba(48, 197, 34, 0.4); }
                        50% { transform: translateY(-5px); box-shadow: 0 0 30px rgba(48, 197, 34, 0.8); }
                    }
                `}
            </style>

            {/* Icon & Glow */}
            <div style={{
                marginBottom: '40px',
                animation: !isUnlocked ? 'pulse-red-aura 2s infinite ease-in-out' : 'none',
                transition: 'all 1s ease'
            }}>
                <NeonLock 
                    isOpen={isUnlocked} 
                    size={100} 
                    color={isUnlocked ? '#30c522' : '#EF4444'} 
                    glowColor={isUnlocked ? '#30c522' : '#EF4444'} 
                />
            </div>

            {/* Header */}
            <h1 style={{
                color: '#fff',
                fontSize: '28px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                marginBottom: '15px',
                textAlign: 'center',
                letterSpacing: '3px'
            }}>
                {isUnlocked ? "ACESSO LIBERADO: BEM-VINDO AO CÍRCULO DOS 3%" : "CONFIGURANDO SEU ACESSO DE ELITE.."}
            </h1>

            <p style={{
                color: '#9CA3AF',
                fontSize: '14px',
                textAlign: 'center',
                maxWidth: '600px',
                lineHeight: '1.5',
                marginBottom: '50px'
            }}>
                {isUnlocked 
                    ? "A preparação acabou. Você provou que está pronto para o meu time. Vamos blindar sua conta e colocar sua máquina para rodar agora."
                    : "O sistema está processando sua entrada no círculo restrito. A paciência agora é o preço da sua nova autoridade no mercado."
                }
            </p>

            {/* Timer or Action Button */}
            {!isUnlocked ? (
                <div style={{
                    fontSize: '50px',
                    fontWeight: 'bold',
                    color: currentColor,
                    marginBottom: '30px',
                    textShadow: `0 0 30px ${currentColor}`,
                    fontVariantNumeric: 'tabular-nums'
                }}>
                    {formatTime(timeLeft)}
                </div>
            ) : (
                <button 
                    onClick={() => window.open('https://wa.me/5511999999999?text=Quero%20acessar%20minha%20consultoria%20de%20elite', '_blank')}
                    style={{
                        backgroundColor: 'rgba(48, 197, 34, 0.05)',
                        color: '#30c522',
                        border: '2px solid #30c522',
                        padding: '20px 40px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        animation: 'bounce-neon-green 2s infinite',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        transition: 'all 0.3s ease'
                    }}
                >
                    ACESSAR CONSULTORIA 60MIN
                </button>
            )}

            {/* Footer Quote */}
            {!isUnlocked && (
                <p style={{
                    marginTop: '20px',
                    color: '#9e5320ff',
                    fontSize: '12px',
                    fontStyle: 'italic',
                    letterSpacing: '0.5px'
                }}>
                    "O tempo de preparação separou você dos demais. Sua máquina está calibrada. Estou te esperando do lado de cá para o próximo nível."
                </p>
            )}
        </div>
    );
};

export const ChatOperacionalScreen = ({ onNavigate }: { onNavigate?: any, onP3Lock?: () => void }) => {
    const [showDynastyLock, setShowDynastyLock] = useState(false);

    useEffect(() => {
        // Check persistence on mount
        const isLocked = localStorage.getItem('pilar3_maquina_ativada') === 'true';
        if (isLocked) {
            setShowDynastyLock(true);
        }
    }, []);

    const handleLock = () => {
        localStorage.setItem('pilar3_maquina_ativada', 'true');
        // If no timestamp exists, set it now
        if (!localStorage.getItem('pilar3_lock_timestamp')) {
            localStorage.setItem('pilar3_lock_timestamp', Date.now().toString());
        }
        setShowDynastyLock(true);
    };

    if (showDynastyLock) {
        return <DynastyLockScreen onNavigate={onNavigate} />;
    }

    return (
        <UnifiedChatScreen 
            title="GESTOR DE TRÁFEGO"
            chatType="pillar3"
            customBackground={<GoldDustBackground />}
            processor={(step, text) => processPilar3(step, text)}
            onP3Lock={handleLock}
            onNavigate={onNavigate}
        />
    );
};

export const ChatCopilotoScreen = () => {
    // Copiloto Intro is handled by processCopiloto Step 0
    return (
        <UnifiedChatScreen 
            title="COPILOTO 6.0"
            chatType="copiloto"
            customBackground={<GalaxyBlueBackground />}
            processor={(step, text, userData) => processCopiloto(step, text, userData)}
        />
    );
};

export const ChatComunidadeScreen = () => {
    return (
        <UnifiedChatScreen 
            title="COMUNIDADE VIP"
            chatType="comunidade"
            customBackground={<GoldDustBackground />}
            processor={(step, text, userData) => processComunidade(step, text, userData)}
        />
    );
};

export const ChatCalculadoraScreen = () => {
    return (
        <UnifiedChatScreen 
            title="CALCULADORA PRO"
            chatType="calculadora"
            customBackground={<SkynetLensBackground />}
            processor={(step, text, userData) => processCalculadora(step, text, userData)}
        />
    );
};
