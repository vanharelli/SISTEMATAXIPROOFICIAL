export const GalaxyBlueBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020617] z-0">
      {/* Deep Space Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0B1120] to-[#0f172a] opacity-90" />

      {/* Galaxy Nebulas */}
      <div className="absolute inset-0 opacity-40 mix-blend-screen filter blur-[100px]">
        {/* Blue Nebula - Top Left */}
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-blue-600 rounded-full opacity-30 animate-pulse-slow mix-blend-screen" />
        
        {/* Cyan Nebula - Bottom Right */}
        <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-cyan-500 rounded-full opacity-20 animate-pulse-slow animation-delay-2000 mix-blend-screen" />
        
        {/* Deep Purple Core - Center */}
        <div className="absolute top-[20%] left-[20%] w-[60vw] h-[60vw] bg-indigo-900 rounded-full opacity-40 animate-pulse mix-blend-overlay" />
      </div>

      {/* Stars Layer */}
      <div className="stars-container absolute inset-0">
        <div className="stars-sm"></div>
        <div className="stars-md"></div>
        <div className="stars-lg"></div>
      </div>

      {/* Grid Overlay for "Tech" feel (Optional, kept subtle) */}
      <div className="absolute inset-0 opacity-[0.05]" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.1) 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }} 
      />

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 4s;
        }
        
        /* Stars Generation via Box Shadow (Performance efficient for static/slow stars) */
        /* Function to generate random stars would be needed if using SCSS, but here we mock a few or use a background image if available. 
           Since we can't easily generate 100s of box-shadows in raw CSS string without pre-processor, 
           we will use a radial gradient pattern for stars. 
        */
        
        .stars-container {
            background-image: 
                radial-gradient(1px 1px at 10% 10%, white 1px, transparent 0),
                radial-gradient(1px 1px at 20% 20%, white 1px, transparent 0),
                radial-gradient(2px 2px at 30% 70%, rgba(0, 243, 255, 0.8) 1px, transparent 0),
                radial-gradient(1px 1px at 40% 40%, white 1px, transparent 0),
                radial-gradient(1px 1px at 50% 90%, white 1px, transparent 0),
                radial-gradient(2px 2px at 60% 30%, rgba(0, 243, 255, 0.8) 1px, transparent 0),
                radial-gradient(1px 1px at 70% 80%, white 1px, transparent 0),
                radial-gradient(1px 1px at 80% 10%, white 1px, transparent 0),
                radial-gradient(2px 2px at 90% 50%, rgba(0, 243, 255, 0.8) 1px, transparent 0);
            background-size: 200px 200px;
            opacity: 0.6;
            animation: twinkle 5s infinite linear;
        }

        @keyframes twinkle {
            0% { opacity: 0.6; transform: translateY(0); }
            50% { opacity: 0.8; }
            100% { opacity: 0.6; transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};
