export const AuthSecureScanner = () => {
  return (
    <>
      <style>
        {`
          @keyframes globalScan {
            0% { top: -10%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 110%; opacity: 0; }
          }
          @keyframes spinCW {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes spinCCW {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-360deg); }
          }
          @keyframes intensePulse {
            0%, 100% { background-color: rgba(0, 0, 0, 0.85); box-shadow: inset 0 0 100px rgba(0,0,0,0.9); }
            50% { background-color: rgba(212, 175, 55, 0.15); box-shadow: inset 0 0 150px rgba(212, 175, 55, 0.3); }
          }
          @keyframes breathingText {
            0%, 100% { opacity: 0.8; transform: scale(1); text-shadow: 0 0 10px rgba(255,255,255,0.5); }
            50% { opacity: 1; transform: scale(1.05); text-shadow: 0 0 20px rgba(255,255,255,0.9); }
          }
        `}
      </style>

      <div 
        className="fixed inset-0 z-[9999] backdrop-blur-[40px] flex items-center justify-center overflow-hidden"
        style={{
          animation: 'intensePulse 4s ease-in-out infinite'
        }}
      >
        
        {/* LASER BLADE (NEON) - FORCED ANIMATION */}
        <div 
          className="absolute left-0 w-full h-[20px] pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
            boxShadow: '0 0 60px 15px #D4AF37',
            animation: 'globalScan 3s linear infinite'
          }}
        />

        {/* CONTAINER CENTRAL */}
        <div className="relative flex flex-col items-center justify-center">
          
          {/* TRI-RING LOADING ENGINE */}
          <div className="relative flex items-center justify-center mb-12 w-64 h-64">
            
            {/* Anel Externo (Dourado) - Spin Lento */}
            <div 
              className="absolute w-48 h-48 rounded-full border-[6px] border-[#D4AF37] border-t-transparent"
              style={{ animation: 'spinCW 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite' }}
            />
            
            {/* Anel Médio (Branco Puro) - Spin Anti-Horário */}
            <div 
              className="absolute w-32 h-32 rounded-full border-[6px] border-white border-b-transparent"
              style={{ 
                filter: 'drop-shadow(0 0 15px #fff)',
                animation: 'spinCCW 1.5s linear infinite' 
              }}
            />
            
            {/* Anel Interno (Dourado Neon) - Spin Rápido */}
            <div 
              className="absolute w-20 h-20 rounded-full border-[6px] border-[#FFD700] border-l-transparent"
              style={{ 
                boxShadow: '0 0 15px #FFD700',
                animation: 'spinCW 0.6s linear infinite' 
              }}
            />
            
          </div>

          {/* TYPOGRAPHY (GHOST WHITE) */}
          <div className="flex flex-col items-center z-20 text-center">
            <h2 
              className="text-white font-black tracking-[15px] text-2xl ml-3" 
              style={{ textShadow: '0 0 30px #fff' }}
            >
              VERIFICANDO
            </h2>
            <span 
              className="text-white text-sm mt-6 tracking-[6px] font-bold"
              style={{ animation: 'breathingText 3s ease-in-out infinite' }}
            >
              CRIPTOGRAFIA NÍVEL 7
            </span>
          </div>

        </div>
      </div>
    </>
  );
};
