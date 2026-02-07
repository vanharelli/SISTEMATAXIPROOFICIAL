export const AccessGranted = () => {
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.95)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 20
    }}>
      <style>
        {`
          @keyframes phase1-lift { 
            0% { transform: translateY(0); } 
            100% { transform: translateY(-35px); } 
          } 
          
          @keyframes phase2-glow { 
            to { border-color: #30c522; filter: drop-shadow(0 0 30px #30c522); } 
          } 
          
          @keyframes phase3-hinge-swing { 
            0% { transform: translateY(-35px) rotateY(0deg); } 
            100% { transform: translateY(-35px) rotateY(130deg); } 
          }

          @keyframes bgPulseIndustrial {
            0% { background: rgba(48, 197, 34, 0.05); }
            30% { background: rgba(48, 197, 34, 0.05); } /* Wait for lift */
            40% { background: rgba(48, 197, 34, 0.4); } /* Intense pulse on glow */
            50% { background: rgba(48, 197, 34, 0.1); }
            100% { background: rgba(48, 197, 34, 0.05); }
          }

          .shackle-industrial {
            width: 140px; /* Aumentado para alinhar com o corpo de 160px */
            height: 120px; /* Mais alto para proporção */
            border: 16px solid #555;
            border-bottom: none;
            border-radius: 70px 70px 0 0; /* Raio ajustado para nova largura (140/2) */
            position: absolute;
            top: 30px; /* Ajustado para penetração correta com nova altura */
            left: 50%;
            margin-left: -70px; /* Center: 140/2 */
            transform-origin: 132px 100%; /* FIX: 140px width - 8px (half border) = 132px */
            z-index: 1;
            box-sizing: border-box;
            
            /* SEQUENCE: Lift (1.5s) -> Glow (1.0s) -> Swing (2.5s) = 5.0s Total */
            animation: 
                phase1-lift 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards, 
                phase2-glow 1.0s 1.5s forwards, 
                phase3-hinge-swing 2.5s 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; 
          }
        `}
      </style>

      {/* 3D LOCK CONTAINER */}
      <div style={{
        width: '200px',
        height: '240px',
        position: 'relative',
        perspective: '1000px',
        marginBottom: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* SHACKLE (ARCO INDUSTRIAL) */}
        <div className="shackle-industrial" />

        {/* BODY (CORPO) */}
        <div style={{
          width: '160px',
          height: '120px',
          background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
          borderRadius: '12px',
          position: 'absolute',
          bottom: 0,
          zIndex: 2,
          boxShadow: '0 10px 30px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.3), 0 0 50px rgba(212, 175, 55, 0.4)'
        }} />
      </div>

      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        animation: 'bgPulseIndustrial 5s linear forwards'
      }} />

      <h2 style={{ 
        color: '#30c522', 
        letterSpacing: '6px', 
        textShadow: '0 0 20px #30c522, 0 0 40px #30c522',
        fontSize: '1.8rem',
        margin: '0 0 10px 0',
        textAlign: 'center',
        zIndex: 10,
        opacity: 0,
        animation: 'fadeIn 0.5s 1.5s forwards' // Aparece junto com o Glow
      }}>ACESSO LIBERADO</h2>
      
      <h3 style={{
        background: 'linear-gradient(to right, #D4AF37, #FFD700, #D4AF37)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        color: 'transparent',
        letterSpacing: '12px',
        fontSize: '1.4rem', /* Scaled to ~10% visual impact */
        fontWeight: 800,
        opacity: 0,
        margin: '10px 0 0 0',
        textAlign: 'center',
        zIndex: 10,
        animation: 'fadeIn 0.5s 1.8s forwards'
      }}>SISTEMA TÁXI PRO 5.0</h3>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};
