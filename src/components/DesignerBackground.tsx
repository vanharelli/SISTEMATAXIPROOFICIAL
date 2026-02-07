export const DesignerBackground = () => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: '#050505', // Preto Obsidian
      overflow: 'hidden',
      zIndex: 0
    }}>
      <style>{`
        @keyframes move {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(200px, 250px) scale(1.6); }
        }

        .glass-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          mix-blend-mode: screen;
          opacity: 0.75;
          animation: move 8s infinite alternate ease-in-out;
        }

        .purple {
          width: 600px; height: 600px;
          background: #3B0764; /* Roxo Escuro */
          top: -100px; left: -100px;
        }

        .gold {
          width: 400px; height: 400px;
          background: #78350F; /* Dourado Escuro */
          bottom: -50px; right: -50px;
          animation-delay: -5s;
        }

        .blue {
          width: 500px; height: 500px;
          background: #172554; /* Azul Escuro */
          top: 40%; left: 30%;
          animation-duration: 15s;
          opacity: 0.3;
        }

        /* Grid de Design - Para provar que a tela está ativa */
        .design-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), 
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          z-index: 5;
        }
      `}</style>

      {/* Grid de Design */}
      <div className="design-grid"></div>

      {/* Blobs */}
      <div className="glass-blob purple"></div>
      <div className="glass-blob gold"></div>
      <div className="glass-blob blue"></div>

      {/* Blur Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 4
      }}></div>
    </div>
  );
};
