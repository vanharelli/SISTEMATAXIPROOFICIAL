import { useState, useEffect } from 'react';

interface CopilotActivationOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export const CopilotActivationOverlay = ({ isVisible, onClose }: CopilotActivationOverlayProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Check persistence lock
    const hasSeen = localStorage.getItem('marketelli_copilot_protocol_seen');
    
    if (isVisible && !hasSeen) {
      setShouldRender(true);
      setIsFadingOut(false);
    }
  }, [isVisible]);

  const handleStart = () => {
    // TRAVA DE PERSISTÊNCIA: Marca como visto para não exibir novamente
    localStorage.setItem('marketelli_copilot_protocol_seen', 'true');
    
    setIsFadingOut(true);
    setTimeout(() => {
      setShouldRender(false);
      onClose();
    }, 800); // Matches the 0.8s transition
  };

  if (!shouldRender && !isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 9999, // High z-index to cover everything
      display: shouldRender ? 'block' : 'none'
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
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: -2,
          opacity: 1,
          filter: 'blur(8px) brightness(0.4)',
          pointerEvents: 'none'
        }}
      />

      {/* Inject Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@900&family=Inter:wght@400;700;900&display=swap');
        
        /* PROTOCOLO DE ATIVAÇÃO - AZUL NEON & DEEP SPACE BLUE - GLASSMORPHISM */ 
        /* Hide global badge when this overlay is active */
        .status-badge-pill {
            display: none !important;
        }

        .protocol-window { 
            position: fixed; 
            inset: 0; 
            z-index: 99999; 
            background-color: transparent !important; /* FORCED TRANSPARENCY */
            display: flex; 
            align-items: center; 
            justify-content: center; 
            opacity: 0; 
            animation: fadeIn 1.2s ease-out forwards; 
        } 

        /* Override animation for fade out - FIX: Keep background opaque to prevent dashboard flash */
        .protocol-window.fading-out {
            transition: background-color 0.8s ease-in-out;
            background-color: #000 !important; /* Fade to black/solid */
        }

        /* Fade out content instead */
        .protocol-window.fading-out .protocol-content {
            transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
            opacity: 0;
            transform: scale(1.1);
        }
 
        @keyframes fadeIn { 
            from { opacity: 0; } 
            to { opacity: 1; } 
        } 
 
        .protocol-content { 
            background: rgba(0, 10, 30, 0.45); /* Deep Space Blue Transparente */
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(0, 243, 255, 0.3); 
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 40px rgba(0, 243, 255, 0.1); 
            padding: 40px 24px; /* Mobile Optimized Padding */
            width: 96%; /* Mobile Width */
            max-width: 340px; /* Mobile Max Width constraint */
            text-align: center; 
            font-family: 'Inter', sans-serif; 
            position: relative; 
            transform: scale(0.95); 
            animation: scaleUp 0.8s ease-out 0.3s forwards; 
            border-radius: 16px; /* Rounded corners match Avisos */
        } 
 
        @keyframes scaleUp { 
            to { transform: scale(1); } 
        } 
 
        .protocol-title { 
            font-family: 'Orbitron', sans-serif; 
            color: #00F3FF; 
            font-size: 1.5rem; /* ~24px */
            letter-spacing: 4px; 
            text-transform: uppercase; 
            margin-bottom: 24px; 
            line-height: 1.3; 
            text-shadow: 0 0 15px rgba(0, 243, 255, 0.6); 
        } 
 
        .protocol-text { 
            color: #EEE; 
            font-size: 14px; /* Mobile readable but compact */
            line-height: 1.6; 
            margin-bottom: 32px; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
            font-weight: 400; 
        } 
 
        /* DESTAQUES EM AZUL NEON */ 
        .highlight { 
            color: #00F3FF; 
            font-weight: 900; 
            text-shadow: 0 0 8px rgba(0, 243, 255, 0.5); 
        } 

        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-4px); }
            100% { transform: translateY(0px); }
        }

        .btn-wrapper {
            display: block; /* Full width block */
            width: 100%;
            animation: float 3s ease-in-out infinite;
        }
 
        .btn-protocol { 
            background: #00F3FF; 
            color: #000; 
            font-family: 'Inter', sans-serif; 
            font-weight: 900; 
            text-transform: uppercase; 
            letter-spacing: 2px; 
            padding: 16px 0; /* Vertical padding only, width set below */
            width: 100%; /* Full width button */
            border-radius: 12px; /* Soft corners */
            border: none; 
            cursor: pointer; 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            box-shadow: 0 0 20px rgba(0, 243, 255, 0.4); 
            font-size: 0.9rem;
        } 
 
        .btn-protocol:hover { 
            box-shadow: 0 0 60px #00F3FF; 
            transform: scale(1.05); 
            letter-spacing: 6px; 
            background: #fff;
            color: #00F3FF;
        } 
 
        .neon-divider { 
            height: 1px; 
            width: 80px; 
            background: #00F3FF; 
            margin: 0 auto 30px; 
            box-shadow: 0 0 10px #00F3FF; 
        } 
      `}</style>

      {/* Main Window */}
      <div id="protocol-activation" className={`protocol-window ${isFadingOut ? 'fading-out' : ''}`}> 
         <div className="protocol-content"> 
             <h2 className="protocol-title">PROTOCOLO DE ATIVAÇÃO<br/>CO-PILOTO 6.0</h2> 
             <div className="neon-divider"></div> 
             <p className="protocol-text"> 
                 ESTA É UMA <span className="highlight">SIMULAÇÃO FIEL</span> DO FUNCIONAMENTO FINAL DO SISTEMA.  
                 PARA EXTRAIR O MELHOR DESEMPENHO E ALCANÇAR <span className="highlight">RESULTADOS REAIS</span>,  
                 É FUNDAMENTAL SEGUIR O <span className="highlight">PASSO A PASSO</span> EXATAMENTE COMO ORIENTADO PELOS NOSSOS INSTRUTORES.  
                 A EXECUÇÃO CORRETA DE CADA ETAPA É O QUE GARANTE <span className="highlight">SEGURANÇA</span>,  
                 CONSISTÊNCIA E <span className="highlight">FATURAMENTO SUSTENTÁVEL</span>. 
             </p> 
             <div className="btn-wrapper">
                 <button className="btn-protocol" onClick={handleStart}>INICIAR OPERAÇÃO</button> 
             </div>
         </div> 
      </div> 
    </div>
  );
};
