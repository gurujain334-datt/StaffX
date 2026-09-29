import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { COLOR_THEMES } from '../../lib/theme';

interface TelemetryNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  pulseSpeed: number;
}

export const Background7D: React.FC = () => {
  const { colorTheme, spatial7DEnabled, theme } = useApp();
  const activeDef = COLOR_THEMES[colorTheme] || COLOR_THEMES.cyan;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Real-time pointer tracking for 7D spatial parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!spatial7DEnabled) return;

    const handlePointerMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x: nx, y: ny });
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, [spatial7DEnabled]);

  // Derived dimensional coordinates for subtle 3D tilt
  const tiltX = mousePos.y * -6;
  const tiltY = mousePos.x * 6;
  const shiftX = mousePos.x * 20;
  const shiftY = mousePos.y * 20;

  // Primary cyan RGB matching Command OS
  const rgb = activeDef.accentRgb || '6, 182, 212';

  // High-performance canvas telemetry node network
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Initialize spatial telemetry nodes
    const nodeCount = Math.min(Math.floor((width * height) / 38000), 38);
    const nodes: TelemetryNode[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 1.2,
        alpha: Math.random() * 0.4 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
      });
    }

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Draw faint interconnecting vector lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const lineAlpha = (1 - dist / 140) * 0.12;
            ctx.strokeStyle = `rgba(${rgb}, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update telemetry nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        node.x += node.vx;
        node.y += node.vy;

        // Wrap around boundaries
        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;

        const currentAlpha = node.alpha + Math.sin(tick * node.pulseSpeed) * 0.15;
        const safeAlpha = Math.max(0.1, Math.min(0.8, currentAlpha));

        // Outer glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${safeAlpha * 0.2})`;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = theme === 'dark'
          ? `rgba(255, 255, 255, ${safeAlpha * 0.8})`
          : `rgba(${rgb}, ${safeAlpha * 0.95})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [rgb]);

  return (
    <div 
      aria-hidden="true" 
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'
      }`}
      style={{ perspective: '1200px' }}
    >
      {/* 1. Precise Cyber Blueprint Grid matching Command OS */}
      <div 
        className="absolute inset-0 bg-grid-subtle transition-opacity duration-700"
        style={{
          opacity: 0.85,
          transform: spatial7DEnabled 
            ? `translate3d(${-shiftX * 0.25}px, ${-shiftY * 0.25}px, 0px)` 
            : 'none',
          transition: 'transform 0.3s cubic-bezier(0.1, 0.9, 0.2, 1)',
        }}
      />

      {/* 2. Top-Center Command Horizon Ambient Glow (Electric Cyan/Teal) */}
      <div 
        className={`absolute -top-[120px] left-1/2 -translate-x-1/2 w-[85vw] max-w-[1200px] h-[450px] rounded-full animate-horizon-glow filter blur-[90px] transition-all duration-700 pointer-events-none ${
          theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-multiply opacity-25'
        }`}
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 30%, rgba(${rgb}, 0.22) 0%, rgba(14, 165, 233, 0.12) 40%, rgba(37, 99, 235, 0.05) 65%, transparent 80%)`,
          transform: spatial7DEnabled
            ? `translate3d(calc(-50% + ${shiftX * 0.4}px), ${shiftY * 0.3}px, 0px)`
            : 'translate(-50%, 0)',
        }}
      />

      {/* 3. Upper-Right Event Core Accent Glow (Deep Azure/Cobalt) */}
      <div 
        className={`absolute top-[5%] -right-[10%] w-[55vw] max-w-[700px] h-[55vw] max-h-[700px] rounded-full filter blur-[120px] pointer-events-none ${
          theme === 'dark' ? 'mix-blend-screen opacity-80' : 'mix-blend-multiply opacity-15'
        }`}
        style={{
          background: `radial-gradient(circle, rgba(37, 99, 235, 0.14) 0%, rgba(${rgb}, 0.08) 45%, transparent 70%)`,
          transform: spatial7DEnabled
            ? `translate3d(${shiftX * 0.5}px, ${shiftY * 0.5}px, 0px)`
            : 'none',
        }}
      />

      {/* 4. Mid-Screen Bottom Ambient Fill */}
      <div 
        className={`absolute -bottom-[20%] left-[10%] w-[60vw] max-w-[800px] h-[400px] rounded-full filter blur-[140px] pointer-events-none ${
          theme === 'dark' ? 'mix-blend-screen opacity-60' : 'mix-blend-multiply opacity-15'
        }`}
        style={{
          background: `radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, rgba(30, 58, 138, 0.06) 50%, transparent 75%)`,
        }}
      />

      {/* 5. Animated Cyber Radar Reticle in the background (Telemetry Coordinate Rings) */}
      <div 
        className="absolute top-[8%] right-[6%] w-[420px] h-[420px] sm:w-[560px] sm:h-[560px] opacity-[0.14] hidden md:block pointer-events-none"
        style={{
          transform: spatial7DEnabled
            ? `translate3d(${shiftX * 0.6}px, ${shiftY * 0.6}px, 0px) rotateX(${tiltX * 0.8}deg) rotateY(${tiltY * 0.8}deg)`
            : 'none',
          transition: 'transform 0.4s cubic-bezier(0.1, 0.9, 0.2, 1)',
        }}
      >
        {/* Slow Clockwise Ring */}
        <svg viewBox="0 0 400 400" className="w-full h-full animate-radar-slow stroke-current" style={{ color: activeDef.primaryHex }}>
          <circle cx="200" cy="200" r="180" fill="none" strokeWidth="1" strokeDasharray="6 8" opacity="0.7" />
          <circle cx="200" cy="200" r="130" fill="none" strokeWidth="0.8" strokeDasharray="2 12" opacity="0.5" />
          <circle cx="200" cy="200" r="80" fill="none" strokeWidth="1" strokeDasharray="14 14" opacity="0.6" />
          {/* Crosshairs */}
          <line x1="200" y1="10" x2="200" y2="390" strokeWidth="0.6" opacity="0.3" strokeDasharray="4 6" />
          <line x1="10" y1="200" x2="390" y2="200" strokeWidth="0.6" opacity="0.3" strokeDasharray="4 6" />
        </svg>

        {/* Counter-Clockwise Inner Reticle */}
        <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full animate-radar-reverse stroke-current" style={{ color: activeDef.primaryHex }}>
          <circle cx="200" cy="200" r="155" fill="none" strokeWidth="0.8" strokeDasharray="24 16" opacity="0.6" />
          <circle cx="200" cy="200" r="105" fill="none" strokeWidth="0.6" opacity="0.4" />
          {/* Compass ticks */}
          <line x1="200" y1="20" x2="200" y2="35" strokeWidth="1.5" opacity="0.8" />
          <line x1="200" y1="365" x2="200" y2="380" strokeWidth="1.5" opacity="0.8" />
          <line x1="20" y1="200" x2="35" y2="200" strokeWidth="1.5" opacity="0.8" />
          <line x1="365" y1="200" x2="380" y2="200" strokeWidth="1.5" opacity="0.8" />
        </svg>
      </div>

      {/* 6. High-Tech Cyber Scanline (Laser Beam Sweep) */}
      <div className="absolute inset-x-0 h-[2px] animate-cyber-scan pointer-events-none">
        <div 
          className="w-full h-full"
          style={{
            background: `linear-gradient(90deg, transparent 0%, rgba(${rgb}, 0.1) 20%, rgba(${rgb}, 0.75) 50%, rgba(${rgb}, 0.1) 80%, transparent 100%)`,
            boxShadow: `0 0 14px 2px rgba(${rgb}, 0.55)`,
          }}
        />
      </div>

      {/* 7. Canvas Telemetry Node Layer */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
      />

      {/* 8. Vignette Edge Depth & Horizon Horizon Falloff */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-300"
        style={{
          background: theme === 'dark'
            ? 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 35%, rgba(2, 4, 10, 0.75) 80%, rgba(2, 4, 10, 0.95) 100%)'
            : 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 35%, rgba(248, 250, 252, 0.75) 80%, rgba(248, 250, 252, 0.95) 100%)',
        }}
      />
    </div>
  );
};
