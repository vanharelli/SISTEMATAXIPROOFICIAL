import { useEffect, useRef } from 'react';

export const MoneyRainBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let intervalId: ReturnType<typeof setInterval>;

    const createMoney = () => {
      // Safety check in case component unmounted
      if (!container) return;

      const el = document.createElement('div');
      el.className = 'money-glitter';
      
      // 50% dos elementos com efeito de purpurina 
      if (Math.random() > 0.5) {
          el.classList.add('sparkle');
      }
      
      el.innerText = '$';
      el.style.left = Math.random() * 100 + '%';
      el.style.fontSize = (Math.random() * 20 + 24) + 'px';
      el.style.animationDuration = (Math.random() * 4 + 6) + 's';
      el.style.animationDelay = '0s';
      el.style.opacity = '0.9';

      container.appendChild(el);
      
      // Remove o elemento após a animação terminar 
      const duration = parseFloat(el.style.animationDuration) * 1000;
      setTimeout(() => {
          if (el.parentNode === container) {
             el.remove();
          }
      }, duration);
    };
    
    // Criar símbolos iniciais 
    for (let i = 0; i < 60; i++) {
        createMoney();
    }
    
    // Gerar novos símbolos continuamente 
    intervalId = setInterval(() => {
        createMoney();
    }, 150);

    return () => {
      clearInterval(intervalId);
      if (container) {
          container.innerHTML = ''; 
      }
    };
  }, []);

  return (
    <div className="bg-container">
      <style>{`
         .bg-container { 
             position: absolute; 
             inset: 0; 
             z-index: 0; 
             background: #000; 
             overflow: hidden; 
         } 
 
         .breathe-layer { 
             position: absolute; 
             inset: 0; 
             background: radial-gradient(circle at center, #000b1e 0%, #000 80%); 
             animation: breathe 10s ease-in-out infinite; 
         } 
 
         #money-rain { 
             position: absolute; 
             inset: 0; 
             pointer-events: none; 
         } 
 
         #money-rain-tiny { 
             position: absolute; 
             inset: 0; 
             pointer-events: none; 
         } 
 
         .money-glitter { 
             position: absolute; 
             color: #D4AF37; 
             font-family: serif; 
             font-weight: bold; 
             font-size: 32px; 
             text-shadow: 0 0 3px #D4AF37; 
             animation: money-fall linear infinite; 
         } 
 
         /* Efeito de purpurina intermitente */ 
         .money-glitter.sparkle { 
             animation: money-fall linear infinite, sparkle-glow 0.6s ease-in-out infinite; 
         } 
 
         @keyframes breathe { 
             0%, 100% { 
                 opacity: 0.3; 
                 transform: scale(1); 
             } 
             50% { 
                 opacity: 0.6; 
                 transform: scale(1.1); 
             } 
         } 
 
         @keyframes money-fall { 
             0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; } 
             100% { transform: translateY(100vh) rotate(360deg); opacity: 1; } 
         } 
 
         .money-tiny { 
             position: absolute; 
             color: #D4AF37; 
             font-family: serif; 
             font-weight: bold; 
             font-size: 8px; 
             opacity: 0.6; 
             text-shadow: 0 0 2px #D4AF37; 
             animation: money-fall-tiny linear infinite; 
         } 
 
         .money-matrix { 
             position: absolute; 
             color: #D4AF37; 
             font-family: 'Courier New', monospace; 
             font-weight: bold; 
             font-size: 10px; 
             opacity: 0.7; 
             text-shadow: 0 0 3px #D4AF37; 
             animation: money-fall-matrix linear infinite; 
             letter-spacing: 2px; 
         } 
 
         @keyframes money-fall-matrix { 
             0% { transform: translateY(-10vh); opacity: 0.7; } 
             100% { transform: translateY(100vh); opacity: 0.7; } 
         } 
 
         @keyframes sparkle-glow { 
             0%, 100% { 
                 text-shadow: 0 0 3px #D4AF37; 
                 filter: none; 
             } 
             50% { 
                 text-shadow: 0 0 8px #D4AF37, 0 0 15px #FFD700, 0 0 20px #FFF; 
                 filter: drop-shadow(0 0 6px #D4AF37) drop-shadow(0 0 3px #FFD700); 
             } 
         } 
      `}</style>
      <div className="breathe-layer"></div>
      <div id="money-rain" ref={containerRef}></div>
      <div id="money-rain-tiny"></div>
      <div id="money-matrix-rain"></div>
    </div>
  );
};
