export const LiquidNeonBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0f0c29] z-0">
      {/* Aurora Blobs Container */}
      <div className="absolute inset-0 opacity-60 mix-blend-screen filter blur-[80px]">
        {/* Blob 1: Purple - Top Left */}
        <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-purple-600 rounded-full opacity-40 animate-blob mix-blend-multiply" />
        
        {/* Blob 2: Magenta - Top Right */}
        <div className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-fuchsia-600 rounded-full opacity-40 animate-blob animation-delay-2000 mix-blend-multiply" />
        
        {/* Blob 3: Subtle Gold - Bottom Center */}
        <div className="absolute bottom-[-20%] left-[20%] w-[80vw] h-[80vw] bg-yellow-600 rounded-full opacity-20 animate-blob animation-delay-4000 mix-blend-multiply" />
        
        {/* Blob 4: Deep Indigo - Center/Moving */}
        <div className="absolute top-[20%] left-[20%] w-[50vw] h-[50vw] bg-indigo-800 rounded-full opacity-30 animate-pulse mix-blend-overlay" />
      </div>

      {/* Noise Texture Overlay for "Liquid" feel */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />
      
      {/* Animation Keyframes (injected style for self-containment) */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 4s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 1.5s;
        }
        .animation-delay-4000 {
          animation-delay: 3s;
        }
      `}</style>
    </div>
  );
};
