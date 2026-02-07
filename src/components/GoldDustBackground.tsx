import { useEffect, useRef } from 'react';

export const GoldDustBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height - canvas!.height;
        this.size = Math.random() * 3 + 2; // 2 to 5px
        this.speedY = Math.random() * 1.5 + 0.5; // 0.5 to 2.0
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 2;
        this.opacity = Math.random() * 0.4 + 0.2; // 0.2 to 0.6 (User Spec)
        this.color = Math.random() > 0.6 ? '#D4AF37' : '#FFF5B7'; // Gold or Light Gold
      }

      update() {
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.y > canvas!.height) {
          this.y = -10;
          this.x = Math.random() * canvas!.width;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;
        
        // Shadow Blur (Glow)
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;

        // Draw Nugget (Irregular Shape)
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size * 0.8, -this.size * 0.3);
        ctx.lineTo(this.size, this.size * 0.5);
        ctx.lineTo(0, this.size);
        ctx.lineTo(-this.size, this.size * 0.5);
        ctx.lineTo(-this.size * 0.8, -this.size * 0.3);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
      }
    }

    const init = () => {
      particles = [];
      const numberOfParticles = Math.floor(window.innerWidth * 0.08); // Optimization
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      // Clear with slight trail or just clear?
      // "background exclusive" - let's just clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      background: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000000 100%)',
      overflow: 'hidden'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
    </div>
  );
};
