import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { COLOR_THEMES, ColorTheme } from '../../lib/theme';
import { Sparkles, Compass, Check, Palette, Eye, Activity } from 'lucide-react';

interface React7DTransitionProps {
  children: React.ReactNode;
  routeKey: string;
}

/**
 * React 7D Spatial Perspective Transition
 * Implements 7 dimensional space-time transformation metrics:
 * 1. X-axis spatial velocity glide
 * 2. Y-axis levitation lift
 * 3. Z-axis depth zoom & perspective scaling
 * 4. Pitch rotation (Rotate X horizon tilt)
 * 5. Yaw rotation (Rotate Y lateral parallax angle)
 * 6. Chrono-focal blur (depth-of-field transition)
 * 7. Quantum light opacity and chromatic coherence
 */
export const React7DTransition: React.FC<React7DTransitionProps> = ({ children, routeKey }) => {
  const { spatial7DEnabled } = useApp();

  if (!spatial7DEnabled) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={routeKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="w-full perspective-1400" style={{ perspective: '1400px' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={routeKey}
          initial={{
            opacity: 0,
            scale: 0.94,
            y: 22,
            rotateX: 4.5,
            rotateY: -1.5,
            filter: 'blur(7px)',
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            rotateX: 0,
            rotateY: 0,
            filter: 'blur(0px)',
          }}
          exit={{
            opacity: 0,
            scale: 1.03,
            y: -16,
            rotateX: -3.5,
            rotateY: 1.5,
            filter: 'blur(5px)',
          }}
          transition={{
            type: 'spring',
            damping: 26,
            stiffness: 220,
            mass: 0.85,
          }}
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: '50% 30%',
          }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/**
 * Interactive 7D Card with real-time 3D tilt and chromatic reflection
 */
interface React7DCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowIntensity?: 'subtle' | 'vibrant' | 'none';
}

export const React7DCard: React.FC<React7DCardProps> = ({
  children,
  className = '',
  glowIntensity = 'subtle',
  ...props
}) => {
  const { spatial7DEnabled, colorTheme } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!spatial7DEnabled || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -6;
    const rotY = ((x - centerX) / centerX) * 6;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const currentTheme = COLOR_THEMES[colorTheme];

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1000px',
      }}
      className={`relative transition-all duration-300 ${className}`}
      {...props}
    >
      <div
        style={{
          transform: spatial7DEnabled && isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(12px)`
            : 'rotateX(0deg) rotateY(0deg) translateZ(0px)',
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out',
        }}
        className="w-full h-full relative"
      >
        {children}

        {/* 7D Specular Glare Layer */}
        {spatial7DEnabled && isHovered && glowIntensity !== 'none' && (
          <div
            className="absolute inset-0 pointer-events-none rounded-xl transition-opacity duration-200 mix-blend-overlay"
            style={{
              background: `radial-gradient(circle 220px at ${glarePosition.x}% ${glarePosition.y}%, ${currentTheme.glowRgba}, transparent 70%)`,
              opacity: isHovered ? 0.4 : 0,
            }}
          />
        )}
      </div>
    </div>
  );
};

/**
 * 7D Floating Studio Controller
 * Gives the user complete control over colour themes and 7D spatial dynamics
 */
export const Floating7DStudio: React.FC = () => {
  const { colorTheme, setColorTheme, spatial7DEnabled, toggle7D, theme, toggleTheme } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const themeList = Object.values(COLOR_THEMES);
  const activeDef = COLOR_THEMES[colorTheme];

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {/* Expanded Control Studio Panel */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="mb-3 w-80 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-2xl text-white"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                style={{ background: activeDef.gradient }}
              >
                <Compass className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold tracking-tight">7D Futuristic Studio</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Theme & Multi-Dimensional Space</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Color Palette Switcher */}
          <div className="mt-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Colour Palette ({activeDef.name})
            </span>
            <div className="grid grid-cols-5 gap-2">
              {themeList.map(item => {
                const isSelected = item.id === colorTheme;
                return (
                  <button
                    key={item.id}
                    onClick={() => setColorTheme(item.id)}
                    className={`group relative flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 dark:border-white bg-slate-800 scale-105 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-900/60'
                    }`}
                    title={item.name}
                  >
                    <span
                      className="w-5 h-5 rounded-full shadow-inner flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ background: item.gradient }}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </span>
                    <span className="text-[9px] font-bold mt-1 text-slate-600 dark:text-slate-300 truncate w-full text-center">
                      {item.name.split(' ')[1] || item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7D Spatial Dynamic Transitions Toggle */}
          <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className={`w-4 h-4 ${spatial7DEnabled ? 'text-emerald-500' : 'text-slate-400'}`} />
              <div>
                <span className="text-xs font-bold block">React 7D Transitions</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {spatial7DEnabled ? '7-Axis Perspective Motion' : 'Standard 2D Mode'}
                </span>
              </div>
            </div>

            <button
              onClick={toggle7D}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                spatial7DEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <motion.span
                animate={{ x: spatial7DEnabled ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 left-0 w-4 h-4 rounded-full bg-slate-900 shadow-sm"
              />
            </button>
          </div>

          {/* Theme Mode Toggle (Dark/Light) */}
          <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Appearance</span>
            <button
              onClick={toggleTheme}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Floating Trigger Pill */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-900/90 dark:bg-slate-800/90 hover:bg-slate-900 dark:hover:bg-slate-700 text-white shadow-xl backdrop-blur-md border border-slate-700/80 cursor-pointer transition-all"
        style={{
          boxShadow: `0 4px 20px ${activeDef.glowRgba}`,
        }}
      >
        <span
          className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0"
          style={{ backgroundColor: activeDef.primaryHex }}
        />
        <span className="text-xs font-bold tracking-tight">{activeDef.name}</span>
        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase font-mono-num bg-slate-900/20 text-white">
          {spatial7DEnabled ? '7D ON' : '2D'}
        </span>
      </motion.button>
    </div>
  );
};
