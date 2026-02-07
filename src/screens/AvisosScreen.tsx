import { useEffect, useState } from 'react';
import '../styles/layout.css';
import '../styles/modules.css';
import '../styles/effects.css';

interface AvisosScreenProps {
  onConfirm: () => void;
}

export const AvisosScreen = ({ onConfirm }: AvisosScreenProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trava de Sessão: Verifica se o protocolo já foi visto
    const hasSeenProtocol = sessionStorage.getItem('protocolo_visto');
    
    if (hasSeenProtocol) {
      onConfirm(); // Pula a tela se já visto nesta sessão
      return;
    }

    // Efeito Fade In ao montar o componente
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [onConfirm]);

  const standardGold = '#D4AF37'; // Dourado Padrão do Sistema Taxi Pro

  // Função de confirmação com gravação na sessão
  const handleConfirm = () => {
    sessionStorage.setItem('protocolo_visto', 'true');
    onConfirm();
  };

  return (
    // Container de Proteção: Padrão de Luxo com Transparência para Vídeo
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center py-12 px-6 overflow-y-auto" style={{
      background: 'transparent', // Transparent for video visibility
      position: 'relative',
      zIndex: 10,
      fontFamily: "system-ui, -apple-system, sans-serif",
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.8s ease-out'
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
          pointerEvents: 'none'
        }}
      />

      {/* Camada 2 (Efeito Vidro) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        src="https://v.ftcdn.net/05/11/48/44/700_F_511484439_N5R7IeK35YI9Y9S8Y6H3O2B1C8V6X5Z4_ST.mp4"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: -1,
          opacity: 0.4,
          mixBlendMode: 'screen',
          pointerEvents: 'none'
        }}
      />
      <style>{`
        @keyframes neonPulse {
          0% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.2); }
          50% { box-shadow: 0 0 40px rgba(212, 175, 55, 0.5); }
          100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.2); }
        }
      `}</style>

      {/* Efeito Neon Dourado (Glow) de Fundo */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '300px',
        height: '300px',
        backgroundColor: 'rgba(212, 175, 55, 0.12)',
        filter: 'blur(50px)',
        borderRadius: '9999px',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Módulo Flutuante (Glassmorphism) */}
{/* Módulo Flutuante (Glassmorphism) - Ajustado: Mais fino e mais alto */}
<div className="relative z-10 w-[94%] max-w-[400px] rounded-2xl" style={{
  padding: '15px 24px', // Aumentamos o padding vertical (40px) para crescer 4% na vertical
  background: 'radial-gradient(circle at top left, rgba(255, 255, 255, 0), transparent 40%), rgba(0, 0, 0, 0.4)',
  backdropFilter: 'blur(56px) saturate(250%)',
  WebkitBackdropFilter: 'blur(112px) saturate(150%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 60px 50px 0 rgba(135, 113, 69, 0.06)'
      }}>

        {/* Agrupamento de Alerta: Ícone, Título e Texto */}
<div className="flex flex-col items-center space-y-6 text-center w-full" style={{ marginTop: '10px' }}>
          
          {/* Ícone de Alerta */}
          <div style={{
            filter: `drop-shadow(0 0 15px #d4af3799)`
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L1 21H23L12 2ZM12 6L19.53 19H4.47L12 6ZM11 10V14H13V10H11ZM11 16V18H13V16H11Z" fill={standardGold} fillOpacity="0.3"/>
              <path d="M12 2L1 21H23L12 2ZM12 6L19.53 19H4.47L12 6ZM11 10V14H13V10H11ZM11 16V18H13V16H11Z" fill={standardGold}/>
              <path d="M11 10H13V14H11V10ZM11 16H13V18H11V16Z" fill="#d4af3799"/>
            </svg>
          </div>

          {/* Título */}
          <h2 style={{
            color: standardGold,
            fontSize: '1.5rem',
            letterSpacing: '4px',
            fontWeight: 800,
            textTransform: 'uppercase',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            margin: '16px 25px 8px'
          }}>
            PROTOCOLO DE ATIVAÇÃO
          </h2>

          {/* Bloco de Texto */}
          <div className="flex flex-col gap-4 text-white/80 max-w-[320px] mx-auto">
            <p className="text-sm leading-relaxed">
              O <strong style={{ color: standardGold, fontWeight: 700 }}>Sistema Taxi Pro 5.0</strong> é uma central de inteligência e automação focada na engenharia de atendimento via WhatsApp.
            </p>
            
            <p className="text-sm leading-relaxed">
              A operação do motor <strong style={{ color: standardGold, fontWeight: 700 }}>WhatsAuto</strong> requer a ativação da licença de Inteligência Artificial para fluxo contínuo de dados.
            </p>
            
            <p className="text-sm leading-relaxed">
              Mecanismos <strong style={{ color: standardGold, fontWeight: 700 }}>Antipirataria Nível 9</strong> estão ativos para garantir a segurança dos dados e o uso exclusivo por operadores autorizados.
            </p>
          </div>

        </div>
      </div>

      {/* Botão de Base (Separado, Compacto e Centralizado) */}
      <div className="w-full max-w-[340px] mx-auto relative z-10" style={{ marginTop: '5px', marginBottom: '24px' }}>
        <button
          onClick={handleConfirm}
          className="activation-protocol-btn w-full transition-all duration-700 ease-out hover:scale-[1.02] active:scale-[0.98]"
          style={{
            borderRadius: '12px',
            padding: '20px',
            fontSize: '0.9rem',
            background: `linear-gradient(135deg, ${standardGold} 0%, #e5ad20f5 100%)`,
            border: 'none',
            color: '#000',
            fontWeight: 900,
            letterSpacing: '5px',
            boxShadow: '0 4px 20px rgba(212, 175, 55, 0.15)'
          }}
        >
          CONFIRMAR E AVANÇAR
        </button>
      </div>
    </div>
  );
};
