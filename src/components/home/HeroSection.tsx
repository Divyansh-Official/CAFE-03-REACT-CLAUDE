import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import cafe from '../../data/cafe.json';

// ── Animated letter by letter ──────────────────────────────────
const AnimatedText: React.FC<{ text: string; startDelay?: number; className?: string }> = ({
  text, startDelay = 0, className = '',
}) => (
  <span className={className} style={{ display: 'inline-flex', flexWrap: 'wrap', perspective: '400px' }}>
    {text.split('').map((char, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 70, rotateX: -90, transformOrigin: 'bottom' }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ delay: startDelay + i * 0.048, type: 'spring', stiffness: 110, damping: 13 }}
        style={{ display: 'inline-block' }}
      >
        {char === ' ' ? '\u00A0' : char}
      </motion.span>
    ))}
  </span>
);

// ── Bubble Tea Cup SVG ─────────────────────────────────────────
const CupSVG: React.FC<{ show?: boolean }> = ({ show = true }) => (
  <svg
    viewBox="0 0 240 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full drop-shadow-2xl"
    style={{ filter: 'drop-shadow(0 30px 60px rgba(255,100,30,0.35)) drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}
  >
    <defs>
      <linearGradient id="drinkFill" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F0A060" />
        <stop offset="50%" stopColor="#D4782A" />
        <stop offset="100%" stopColor="#A84E10" />
      </linearGradient>
      <linearGradient id="glassSheen" x1="0%" y1="0%" x2="30%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.20)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
      </linearGradient>
      <radialGradient id="pearlDark" cx="30%" cy="28%" r="70%">
        <stop offset="0%" stopColor="#7a3a1a" />
        <stop offset="60%" stopColor="#3a1408" />
        <stop offset="100%" stopColor="#0d0400" />
      </radialGradient>
      <radialGradient id="creamTop" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#fff8ee" />
        <stop offset="100%" stopColor="#ffe0b0" />
      </radialGradient>
      <filter id="cupGlow" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="b"/>
        <feFlood floodColor="#FF6B20" floodOpacity="0.4" result="c"/>
        <feComposite in="c" in2="b" operator="in" result="d"/>
        <feMerge><feMergeNode in="d"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    {/* ── Straw ── */}
    <rect x="108" y="0" width="18" height="135" rx="9" fill="#FF3B30" />
    <rect x="112" y="0" width="6" height="135" rx="3" fill="rgba(255,255,255,0.35)" />

    {/* ── Lid rim ── */}
    <ellipse cx="120" cy="128" rx="82" ry="14"
      fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />

    {/* ── Cup body ── */}
    <path
      d="M40 135 L58 300 Q120 318 182 300 L200 135 Q120 118 40 135Z"
      fill="url(#drinkFill)"
    />

    {/* ── Inner shadow (liquid depth) ── */}
    <path
      d="M50 148 L66 293 Q120 308 174 293 L190 148 Q120 133 50 148Z"
      fill="rgba(0,0,0,0.18)"
    />

    {/* ── Glass overlay sheen ── */}
    <path
      d="M40 135 L58 300 Q120 318 182 300 L200 135 Q120 118 40 135Z"
      fill="url(#glassSheen)"
      stroke="rgba(255,255,255,0.18)"
      strokeWidth="1.5"
    />

    {/* ── Left edge highlight stripe ── */}
    <path
      d="M46 148 L62 288 Q68 296 76 292 L60 148 Q52 140 46 148Z"
      fill="rgba(255,255,255,0.07)"
    />

    {/* ── Cream / foam ── */}
    <ellipse cx="120" cy="140" rx="77" ry="18" fill="url(#creamTop)" />
    <ellipse cx="92" cy="134" rx="24" ry="13" fill="#FFF5E8" />
    <ellipse cx="148" cy="136" rx="22" ry="12" fill="#FFF0DC" opacity="0.92" />
    <ellipse cx="120" cy="130" rx="18" ry="10" fill="rgba(255,255,255,0.88)" />

    {/* ── Tapioca pearls ── */}
    {[
      [72,272],[94,280],[116,283],[138,279],[160,272],
      [62,259],[84,266],[108,269],[134,265],[158,260],[176,255],
      [78,248],[104,253],[134,250],[160,246],
    ].map(([cx, cy], i) => (
      <g key={i}>
        <circle cx={cx} cy={cy} r="10" fill="url(#pearlDark)" />
        <circle cx={cx - 3} cy={cy - 3} r="3" fill="rgba(255,255,255,0.16)" />
      </g>
    ))}

    {/* ── Bottom shadow ── */}
    <ellipse cx="120" cy="305" rx="64" ry="9" fill="rgba(0,0,0,0.28)" />
  </svg>
);

// ── Floating pearl sphere ──────────────────────────────────────
const Pearl: React.FC<{ size: number; seed?: number }> = ({ size, seed = 0 }) => {
  const hues = ['#8a3a18', '#5a2012', '#7a3020', '#4a1808'];
  const fill = hues[seed % hues.length];
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id={`p${seed}`} cx="32%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#b05030" />
          <stop offset="40%" stopColor={fill} />
          <stop offset="100%" stopColor="#080200" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="28" fill={`url(#p${seed})`} />
      <circle cx="19" cy="18" r="6" fill="rgba(255,255,255,0.18)" />
      <circle cx="23" cy="14" r="3" fill="rgba(255,255,255,0.25)" />
    </svg>
  );
};

// ── Strawberry SVG ─────────────────────────────────────────────
const Strawberry: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 60 70" fill="none">
    <ellipse cx="30" cy="42" rx="22" ry="26" fill="#FF3B30" />
    <path d="M30 16 Q20 0 12 10 Q20 18 28 22" fill="#34C759" />
    <path d="M30 16 Q40 0 48 10 Q40 18 32 22" fill="#34C759" />
    <path d="M30 16 Q30 0 30 8 Q30 18 30 22" fill="#28A746" />
    {[15,22,29,36,43].flatMap((x, i) => [[x,35],[x+3,47]].map(([cx,cy],j) => (
      <circle key={`${i}-${j}`} cx={cx} cy={cy} r="2" fill="rgba(255,255,255,0.3)" />
    )))}
    <ellipse cx="30" cy="54" rx="14" ry="10" fill="rgba(255,255,255,0.12)" />
  </svg>
);

// ── Leaf SVG ───────────────────────────────────────────────────
const Leaf: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 50 60" fill="none">
    <path d="M25 55 Q5 40 8 18 Q16 5 25 5 Q34 5 42 18 Q45 40 25 55Z" fill="#2EA84E" />
    <path d="M25 55 Q25 30 25 5" stroke="#1a7a36" strokeWidth="1.5" fill="none" />
    <path d="M25 30 Q12 25 8 18" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
    <path d="M25 30 Q38 25 42 18" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
  </svg>
);

// ── Ice Cube SVG ───────────────────────────────────────────────
const IceCube: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" fill="none">
    <rect x="5" y="5" width="40" height="40" rx="8"
      fill="rgba(180,220,255,0.18)" stroke="rgba(180,220,255,0.45)" strokeWidth="1.5" />
    <rect x="10" y="10" width="15" height="12" rx="4"
      fill="rgba(255,255,255,0.12)" />
    <line x1="5" y1="20" x2="45" y2="20" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
    <line x1="22" y1="5" x2="22" y2="45" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
  </svg>
);

// ── Sparkle SVG ────────────────────────────────────────────────
const Sparkle: React.FC<{ size: number; color?: string }> = ({ size, color = '#FFD600' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <path d="M20 2 L22 18 L38 20 L22 22 L20 38 L18 22 L2 20 L18 18 Z"
      fill={color} opacity="0.9" />
    <path d="M20 8 L21 19 L32 20 L21 21 L20 32 L19 21 L8 20 L19 19 Z"
      fill="rgba(255,255,255,0.6)" />
  </svg>
);

// ── Orbiting bubble circle ─────────────────────────────────────
const Bubble: React.FC<{ size: number; opacity?: number }> = ({ size, opacity = 0.5 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <defs>
      <radialGradient id="bgrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
        <stop offset="70%" stopColor="rgba(200,180,255,0.3)" />
        <stop offset="100%" stopColor="rgba(150,100,255,0.05)" />
      </radialGradient>
    </defs>
    <circle cx="20" cy="20" r="18" fill="url(#bgrad)" opacity={opacity}
      stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
    <ellipse cx="14" cy="14" rx="4" ry="3" fill="rgba(255,255,255,0.45)" />
  </svg>
);

// ══════════════════════════════════════════════════════════════
// HERO SECTION
// ══════════════════════════════════════════════════════════════
export const HeroSection: React.FC = () => {
  const navigate   = useNavigate();
  const heroRef    = useRef<HTMLElement>(null);
  const [cupHover, setCupHover] = useState(false);

  // Mouse position for depth parallax
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const spring = { stiffness: 55, damping: 22 };
  const mx = useSpring(rawX, spring);
  const my = useSpring(rawY, spring);

  // Depth-based parallax transforms (different speeds = different z-layers)
  const bg_x    = useTransform(mx, v => `${v * -18}px`);
  const bg_y    = useTransform(my, v => `${v * -14}px`);
  const far_x   = useTransform(mx, v => `${v * -12}px`);
  const far_y   = useTransform(my, v => `${v * -9}px`);
  const mid_x   = useTransform(mx, v => `${v * -6}px`);
  const mid_y   = useTransform(my, v => `${v * -4}px`);
  const cup_x   = useTransform(mx, v => `${v * 3}px`);
  const cup_y   = useTransform(my, v => `${v * 2}px`);
  const near_x  = useTransform(mx, v => `${v * 18}px`);
  const near_y  = useTransform(my, v => `${v * 12}px`);
  const near2_x = useTransform(mx, v => `${v * 28}px`);
  const near2_y = useTransform(my, v => `${v * 20}px`);
  const text_x  = useTransform(mx, v => `${v * -3}px`);
  const text_y  = useTransform(my, v => `${v * -2}px`);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r   = el.getBoundingClientRect();
      const nx  = ((e.clientX - r.left) / r.width  - 0.5) * 2;
      const ny  = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      rawX.set(nx); rawY.set(ny);
    };
    const onLeave = () => { rawX.set(0); rawY.set(0); };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, [rawX, rawY]);

  // Scatter destinations when cup is hovered  (x, y, rotate, scale)
  const scatterMap: Record<string, { hover: object; base: object }> = {
    p1:  { base: {}, hover: { x: -110, y: -80,  rotate: -35, scale: 1.1 } },
    p2:  { base: {}, hover: { x:  130, y: -100, rotate:  25, scale: 1.2 } },
    p3:  { base: {}, hover: { x: -140, y:  60,  rotate: -20, scale: 0.9 } },
    p4:  { base: {}, hover: { x:  150, y:  80,  rotate:  40, scale: 1.0 } },
    p5:  { base: {}, hover: { x: -80,  y:  130, rotate: -50, scale: 1.15 } },
    p6:  { base: {}, hover: { x:  90,  y:  140, rotate:  30, scale: 0.95 } },
    str: { base: {}, hover: { x:  160, y: -120, rotate:  25, scale: 1.3 } },
    ice: { base: {}, hover: { x: -160, y: -90,  rotate: -45, scale: 1.1 } },
    lf1: { base: {}, hover: { x: -180, y:  40,  rotate: -60, scale: 1.2 } },
    lf2: { base: {}, hover: { x:  170, y:  60,  rotate:  55, scale: 1.1 } },
    sp1: { base: {}, hover: { x: -130, y: -160, rotate: -20, scale: 1.4 } },
    sp2: { base: {}, hover: { x:  140, y: -150, rotate:  30, scale: 1.3 } },
    b1:  { base: {}, hover: { x: -100, y: -180, scale: 0.7, opacity: 0 } },
    b2:  { base: {}, hover: { x:  120, y: -170, scale: 0.7, opacity: 0 } },
  };

  const scatterProps = (key: string, extra?: object) => ({
    animate: cupHover ? { ...scatterMap[key].hover, ...extra } : scatterMap[key].base,
    transition: { type: 'spring' as const, stiffness: 140, damping: 18, mass: 0.8 },
  });

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden select-none"
      style={{
        background: `
          radial-gradient(ellipse 90% 70% at 72% 38%, rgba(255, 90, 30, 0.24) 0%, transparent 65%),
          radial-gradient(ellipse 70% 90% at 18% 62%, rgba(140, 35, 220, 0.18) 0%, transparent 62%),
          radial-gradient(ellipse 55% 55% at 48% 98%, rgba(255, 170, 0, 0.14) 0%, transparent 55%),
          radial-gradient(ellipse 40% 40% at 85% 90%, rgba(255, 50, 80, 0.10) 0%, transparent 50%),
          #06020e
        `,
      }}
    >
      {/* ── Atmospheric grain ──────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
        }}
      />

      {/* ── Animated grid lines ─────────────────────────────────── */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          x: bg_x, y: bg_y,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* ── Far floating bubbles (deep background layer) ─────────── */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ x: far_x, y: far_y }}>
        {[
          { top: '8%',  left: '5%',  s: 100, o: 0.12 },
          { top: '60%', left: '2%',  s: 70,  o: 0.08 },
          { top: '15%', left: '88%', s: 130, o: 0.10 },
          { top: '72%', left: '90%', s: 80,  o: 0.09 },
          { top: '40%', left: '50%', s: 200, o: 0.05 },
        ].map((b, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              top: b.top, left: b.left, width: b.s, height: b.s,
              background: `radial-gradient(circle at 35% 35%, rgba(255,140,80,${b.o}), transparent 70%)`,
              border: `1px solid rgba(255,160,80,${b.o * 0.8})`,
            }}
            animate={{ y: [0, -18, 0], scale: [1, 1.04, 1] }}
            transition={{ duration: 5 + i * 1.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
          />
        ))}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* MAIN LAYOUT                                               */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-20 pb-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-4 items-center min-h-[calc(100vh-5rem)]">

          {/* ── LEFT: Text content ─────────────────────────────── */}
          <motion.div
            className="flex flex-col justify-center z-20 relative"
            style={{ x: text_x, y: text_y }}
          >
            {/* Tag badge */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 self-start mb-6 px-4 py-2 rounded-full
                border border-white/15 bg-white/5 backdrop-blur-sm"
            >
              <span className="text-base animate-pulse" style={{ animationDuration: '2.5s' }}>🫧</span>
              <span className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: '#FFD600', letterSpacing: '0.14em' }}>
                {cafe.tagline}
              </span>
            </motion.div>

            {/* Heading */}
            <h1 className="font-display leading-none mb-5" style={{ perspective: '600px' }}>
              <div className="text-[clamp(3rem,8vw,6.5rem)] font-black leading-none"
                style={{
                  background: 'linear-gradient(135deg, #FF3B30 0%, #FF9500 50%, #FFD600 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                <AnimatedText text="THE COOLEST" startDelay={0.15} />
              </div>
              <div className="text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-none text-white mt-1">
                <AnimatedText text="BUBBLE BAR" startDelay={0.65} />
                <motion.span
                  initial={{ opacity: 0, scale: 0, rotate: -30 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 1.35, type: 'spring', stiffness: 200 }}
                  className="inline-block ml-2 align-middle text-[0.7em]"
                  style={{ display: 'inline-block' }}
                >
                  🫧
                </motion.span>
              </div>
            </h1>

            {/* Description */}
            <motion.p
              className="text-base sm:text-lg leading-relaxed max-w-md mb-8"
              style={{ color: 'rgba(200,185,220,0.85)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              {cafe.description}
            </motion.p>

            {/* ── CTAs — redesigned ──────────────────────────────── */}
            <motion.div
              className="flex flex-wrap gap-3 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.25, duration: 0.5 }}
            >
              {/* PRIMARY — Explore Menu */}
              <motion.button
                onClick={() => navigate('/menu')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="relative group overflow-hidden flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm tracking-wide"
                style={{
                  background: 'linear-gradient(135deg, #FF3B30 0%, #FF7A00 55%, #FFD600 100%)',
                  boxShadow: '0 0 28px rgba(255,100,20,0.45), 0 2px 8px rgba(0,0,0,0.4)',
                  color: '#fff',
                  letterSpacing: '0.04em',
                }}
              >
                {/* Shimmer sweep */}
                <motion.span
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  style={{
                    background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{ backgroundPositionX: ['-100%', '200%'] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.4 }}
                />
                <span className="text-base leading-none">🍵</span>
                <span className="relative">Explore Menu</span>
                {/* Arrow */}
                <motion.svg
                  width="14" height="14" viewBox="0 0 14 14" fill="none"
                  className="relative"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <path d="M1 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </motion.button>

              {/* SECONDARY — View Gallery */}
              <motion.button
                onClick={() => navigate('/gallery')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="relative group flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm tracking-wide"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid transparent',
                  backgroundClip: 'padding-box',
                  boxShadow: 'inset 0 0 0 1px rgba(255,150,50,0.35), 0 2px 12px rgba(0,0,0,0.3)',
                  color: 'rgba(255,220,160,0.95)',
                  letterSpacing: '0.04em',
                }}
              >
                {/* Gradient border glow on hover */}
                <motion.span
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
                  style={{
                    boxShadow: 'inset 0 0 0 1px rgba(255,160,60,0.7), 0 0 18px rgba(255,120,30,0.2)',
                  }}
                  transition={{ duration: 0.25 }}
                />
                <span className="text-base leading-none">
                  <img
                  src="https://img.icons8.com/?size=100&id=57212&format=png&color=000000"
                  alt="Gallery"  className="inline-block h-[1em] w-[1em] align-middle object-contain"/>
                </span>
                <span className="relative">View Gallery</span>
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              {[['50+', 'Menu Items'], ['10K+', 'Happy Bubblers'], ['4.8★', 'Rating']].map(([val, label]) => (
                <div key={label} className="text-center">
                  <div className="text-xl sm:text-2xl font-display font-black"
                    style={{
                      background: 'linear-gradient(135deg,#FF3B30,#FF9500,#FFD600)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                    {val}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(180,165,200,0.7)' }}>{label}</div>
                </div>
              ))}

              {/* ── Open Now — moved inline next to stats, right-aligned ── */}
              <motion.div
                className="ml-auto hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-xl self-center"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8 }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                <div>
                  <p className="text-white font-bold text-xs leading-none">Open Now</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(180,165,210,0.65)' }}>{cafe.openingHours}</p>
                </div>
              </motion.div>
            </motion.div>

            {/* ── Open Now — mobile only, below stats row ── */}
            <motion.div
              className="sm:hidden flex items-center gap-2.5 px-4 py-2.5 rounded-xl mt-5 self-start"
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <div>
                <p className="text-white font-bold text-xs leading-none">Open Now</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(180,165,210,0.65)' }}>{cafe.openingHours}</p>
              </div>
            </motion.div>
          </motion.div>

          {/* ── RIGHT: 3D Parallax scene ─────────────────────────── */}
          <motion.div
            className="relative flex items-center justify-center"
            style={{ minHeight: 'clamp(420px, 65vw, 640px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* ── Middle-depth decorative ring ── */}
            <motion.div
              className="pointer-events-none absolute rounded-full"
              style={{
                width: 'clamp(300px, 45vw, 500px)',
                height: 'clamp(300px, 45vw, 500px)',
                x: mid_x, y: mid_y,
                background: 'radial-gradient(circle at 40% 40%, rgba(255,100,30,0.08), transparent 70%)',
                border: '1px solid rgba(255,120,40,0.12)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
            />

            {/* ── Dashed orbit ring ── */}
            <motion.div
              className="pointer-events-none absolute rounded-full"
              style={{
                width: 'clamp(360px, 52vw, 580px)',
                height: 'clamp(360px, 52vw, 580px)',
                x: mid_x, y: mid_y,
                border: '1px dashed rgba(255,180,60,0.10)',
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            />

            {/* ══════════════════════════════════════════════════ */}
            {/* CUP + SCATTER GROUP — hover triggers scatter       */}
            {/* ══════════════════════════════════════════════════ */}
            <motion.div
              className="relative cursor-pointer"
              style={{
                x: cup_x, y: cup_y,
                width: 'clamp(260px, 36vw, 380px)',
                height: 'clamp(350px, 48vw, 500px)',
              }}
              onHoverStart={() => setCupHover(true)}
              onHoverEnd={() => setCupHover(false)}
            >
              {/* ── Main cup – rises on hover ── */}
              <motion.div
                className="relative z-20 w-full h-full"
                animate={cupHover
                  ? { y: -55, scale: 1.06, rotateY: 8, rotateX: -4 }
                  : { y: 0,   scale: 1,    rotateY: 0, rotateX: 0  }
                }
                transition={{ type: 'spring', stiffness: 160, damping: 22, mass: 0.9 }}
                style={{ transformStyle: 'preserve-3d', transformOrigin: 'center bottom' }}
              >
                <CupSVG />
              </motion.div>

              {/* ── Cup glow shadow on floor ── */}
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                style={{ background: 'radial-gradient(ellipse, rgba(255,120,30,0.35), transparent 70%)' }}
                animate={cupHover
                  ? { width: 200, height: 40, opacity: 0.5 }
                  : { width: 160, height: 28, opacity: 0.85 }
                }
                transition={{ type: 'spring', stiffness: 140, damping: 20 }}
              />

              {/* ════════════════════════════════════════════════ */}
              {/* SCATTERED ELEMENTS                               */}
              {/* ════════════════════════════════════════════════ */}

              {/* Pearls */}
              {[
                { id: 'p1', style: { top: '5%',  left: '-18%' }, size: 48, seed: 0, layer: near_x,  ly: near_y  },
                { id: 'p2', style: { top: '10%', right: '-22%'}, size: 54, seed: 1, layer: far_x,   ly: far_y   },
                { id: 'p3', style: { top: '42%', left: '-28%' }, size: 40, seed: 2, layer: near2_x, ly: near2_y },
                { id: 'p4', style: { top: '55%', right: '-30%'}, size: 44, seed: 3, layer: near_x,  ly: near_y  },
                { id: 'p5', style: { bottom:'8%',left: '-15%' }, size: 36, seed: 1, layer: far_x,   ly: far_y   },
                { id: 'p6', style: { bottom:'5%',right:'-18%' }, size: 50, seed: 0, layer: near2_x, ly: near2_y },
              ].map(({ id, style, size, seed, layer, ly }) => (
                <motion.div
                  key={id}
                  className="absolute"
                  style={{ ...style, x: layer, y: ly }}
                  {...scatterProps(id)}
                  animate={{
                    ...(cupHover ? scatterMap[id].hover : scatterMap[id].base),
                  }}
                  transition={{ type: 'spring', stiffness: 130, damping: 16 }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3.5 + seed * 0.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Pearl size={size} seed={seed} />
                  </motion.div>
                </motion.div>
              ))}

              {/* Strawberry */}
              <motion.div
                className="absolute"
                style={{ top: '18%', right: '-30%', x: near_x, y: near_y }}
                {...scatterProps('str')}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 130, damping: 16 }}
              >
                <motion.div
                  animate={{ rotate: [-8, 8, -8], y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Strawberry size={62} />
                </motion.div>
              </motion.div>

              {/* Ice cube */}
              <motion.div
                className="absolute"
                style={{ top: '20%', left: '-30%', x: far_x, y: far_y }}
                {...scatterProps('ice')}
                initial={{ opacity: 0, scale: 0, rotate: 20 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 130, damping: 16 }}
              >
                <motion.div
                  animate={{ rotate: [15, 25, 15], y: [0, -6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <IceCube size={52} />
                </motion.div>
              </motion.div>

              {/* Leaves */}
              <motion.div className="absolute" style={{ bottom: '20%', left: '-22%', x: near2_x, y: near2_y }}
                {...scatterProps('lf1')}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 130, damping: 16 }}>
                <motion.div animate={{ rotate: [-20, -12, -20] }} transition={{ duration: 4.5, repeat: Infinity }}>
                  <Leaf size={44} />
                </motion.div>
              </motion.div>
              <motion.div className="absolute" style={{ bottom: '22%', right: '-20%', x: near_x, y: near_y }}
                {...scatterProps('lf2')}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 130, damping: 16 }}>
                <motion.div animate={{ rotate: [15, 22, 15] }} transition={{ duration: 5, repeat: Infinity }}>
                  <Leaf size={38} />
                </motion.div>
              </motion.div>

              {/* Sparkles */}
              <motion.div className="absolute" style={{ top: '-8%', left: '15%', x: far_x, y: far_y }}
                {...scatterProps('sp1')}
                initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 130, damping: 16 }}>
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                  <Sparkle size={28} color="#FFD600" />
                </motion.div>
              </motion.div>
              <motion.div className="absolute" style={{ top: '-6%', right: '12%', x: near_x, y: near_y }}
                {...scatterProps('sp2')}
                initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 130, damping: 16 }}>
                <motion.div animate={{ rotate: [0, -360] }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
                  <Sparkle size={22} color="#FF9500" />
                </motion.div>
              </motion.div>

              {/* Glass bubbles */}
              <motion.div className="absolute" style={{ top: '28%', left: '8%', x: mid_x, y: mid_y }}
                {...scatterProps('b1')}
                initial={{ opacity: 0 }} whileInView={{ opacity: 0.7 }} viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 130, damping: 16 }}>
                <motion.div animate={{ y: [0, -14, 0], scale: [1, 0.92, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                  <Bubble size={36} opacity={0.65} />
                </motion.div>
              </motion.div>
              <motion.div className="absolute" style={{ top: '35%', right: '5%', x: near_x, y: near_y }}
                {...scatterProps('b2')}
                initial={{ opacity: 0 }} whileInView={{ opacity: 0.55 }} viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 130, damping: 16 }}>
                <motion.div animate={{ y: [0, -10, 0], scale: [1, 1.06, 1] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
                  <Bubble size={28} opacity={0.55} />
                </motion.div>
              </motion.div>

              {/* Hover hint text */}
              <motion.div
                className="absolute bottom-[-32px] left-1/2 -translate-x-1/2 text-xs font-semibold tracking-widest text-center whitespace-nowrap"
                style={{ color: 'rgba(180,160,200,0.5)', letterSpacing: '0.18em' }}
                animate={{ opacity: cupHover ? 0 : [0.4, 0.9, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                HOVER ME
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── Scroll hint ─────────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-8 right-8 hidden sm:flex flex-col items-center gap-2"
        style={{ color: 'rgba(180,165,200,0.45)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
      >
        <span className="text-[10px] tracking-widest" style={{ writingMode: 'vertical-rl', letterSpacing: '0.2em' }}>
          SCROLL
        </span>
        <motion.div
          className="w-px bg-gradient-to-b from-transparent via-current to-transparent"
          style={{ height: 48 }}
          animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;





// import React, { useEffect, useRef, useState } from 'react';
// import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import { PrimaryButton, SecondaryButton } from '../ui';
// import cafe from '../../data/cafe.json';

// // ── Animated letter by letter ──────────────────────────────────
// const AnimatedText: React.FC<{ text: string; startDelay?: number; className?: string }> = ({
//   text, startDelay = 0, className = '',
// }) => (
//   <span className={className} style={{ display: 'inline-flex', flexWrap: 'wrap', perspective: '400px' }}>
//     {text.split('').map((char, i) => (
//       <motion.span
//         key={i}
//         initial={{ opacity: 0, y: 70, rotateX: -90, transformOrigin: 'bottom' }}
//         animate={{ opacity: 1, y: 0, rotateX: 0 }}
//         transition={{ delay: startDelay + i * 0.048, type: 'spring', stiffness: 110, damping: 13 }}
//         style={{ display: 'inline-block' }}
//       >
//         {char === ' ' ? '\u00A0' : char}
//       </motion.span>
//     ))}
//   </span>
// );

// // ── Bubble Tea Cup SVG ─────────────────────────────────────────
// const CupSVG: React.FC<{ show?: boolean }> = ({ show = true }) => (
//   <svg
//     viewBox="0 0 240 320"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//     className="w-full h-full drop-shadow-2xl"
//     style={{ filter: 'drop-shadow(0 30px 60px rgba(255,100,30,0.35)) drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}
//   >
//     <defs>
//       <linearGradient id="drinkFill" x1="0%" y1="0%" x2="100%" y2="100%">
//         <stop offset="0%" stopColor="#F0A060" />
//         <stop offset="50%" stopColor="#D4782A" />
//         <stop offset="100%" stopColor="#A84E10" />
//       </linearGradient>
//       <linearGradient id="glassSheen" x1="0%" y1="0%" x2="30%" y2="100%">
//         <stop offset="0%" stopColor="rgba(255,255,255,0.20)" />
//         <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
//       </linearGradient>
//       <radialGradient id="pearlDark" cx="30%" cy="28%" r="70%">
//         <stop offset="0%" stopColor="#7a3a1a" />
//         <stop offset="60%" stopColor="#3a1408" />
//         <stop offset="100%" stopColor="#0d0400" />
//       </radialGradient>
//       <radialGradient id="creamTop" cx="50%" cy="40%" r="60%">
//         <stop offset="0%" stopColor="#fff8ee" />
//         <stop offset="100%" stopColor="#ffe0b0" />
//       </radialGradient>
//       <filter id="cupGlow" x="-10%" y="-10%" width="120%" height="120%">
//         <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="b"/>
//         <feFlood floodColor="#FF6B20" floodOpacity="0.4" result="c"/>
//         <feComposite in="c" in2="b" operator="in" result="d"/>
//         <feMerge><feMergeNode in="d"/><feMergeNode in="SourceGraphic"/></feMerge>
//       </filter>
//     </defs>

//     {/* ── Straw ── */}
//     <rect x="108" y="0" width="18" height="135" rx="9" fill="#FF3B30" />
//     <rect x="112" y="0" width="6" height="135" rx="3" fill="rgba(255,255,255,0.35)" />

//     {/* ── Lid rim ── */}
//     <ellipse cx="120" cy="128" rx="82" ry="14"
//       fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />

//     {/* ── Cup body ── */}
//     <path
//       d="M40 135 L58 300 Q120 318 182 300 L200 135 Q120 118 40 135Z"
//       fill="url(#drinkFill)"
//     />

//     {/* ── Inner shadow (liquid depth) ── */}
//     <path
//       d="M50 148 L66 293 Q120 308 174 293 L190 148 Q120 133 50 148Z"
//       fill="rgba(0,0,0,0.18)"
//     />

//     {/* ── Glass overlay sheen ── */}
//     <path
//       d="M40 135 L58 300 Q120 318 182 300 L200 135 Q120 118 40 135Z"
//       fill="url(#glassSheen)"
//       stroke="rgba(255,255,255,0.18)"
//       strokeWidth="1.5"
//     />

//     {/* ── Left edge highlight stripe ── */}
//     <path
//       d="M46 148 L62 288 Q68 296 76 292 L60 148 Q52 140 46 148Z"
//       fill="rgba(255,255,255,0.07)"
//     />

//     {/* ── Cream / foam ── */}
//     <ellipse cx="120" cy="140" rx="77" ry="18" fill="url(#creamTop)" />
//     <ellipse cx="92" cy="134" rx="24" ry="13" fill="#FFF5E8" />
//     <ellipse cx="148" cy="136" rx="22" ry="12" fill="#FFF0DC" opacity="0.92" />
//     <ellipse cx="120" cy="130" rx="18" ry="10" fill="rgba(255,255,255,0.88)" />

//     {/* ── Tapioca pearls ── */}
//     {[
//       [72,272],[94,280],[116,283],[138,279],[160,272],
//       [62,259],[84,266],[108,269],[134,265],[158,260],[176,255],
//       [78,248],[104,253],[134,250],[160,246],
//     ].map(([cx, cy], i) => (
//       <g key={i}>
//         <circle cx={cx} cy={cy} r="10" fill="url(#pearlDark)" />
//         <circle cx={cx - 3} cy={cy - 3} r="3" fill="rgba(255,255,255,0.16)" />
//       </g>
//     ))}

//     {/* ── Bottom shadow ── */}
//     <ellipse cx="120" cy="305" rx="64" ry="9" fill="rgba(0,0,0,0.28)" />
//   </svg>
// );

// // ── Floating pearl sphere ──────────────────────────────────────
// const Pearl: React.FC<{ size: number; seed?: number }> = ({ size, seed = 0 }) => {
//   const hues = ['#8a3a18', '#5a2012', '#7a3020', '#4a1808'];
//   const fill = hues[seed % hues.length];
//   return (
//     <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
//       <defs>
//         <radialGradient id={`p${seed}`} cx="32%" cy="30%" r="70%">
//           <stop offset="0%" stopColor="#b05030" />
//           <stop offset="40%" stopColor={fill} />
//           <stop offset="100%" stopColor="#080200" />
//         </radialGradient>
//       </defs>
//       <circle cx="30" cy="30" r="28" fill={`url(#p${seed})`} />
//       <circle cx="19" cy="18" r="6" fill="rgba(255,255,255,0.18)" />
//       <circle cx="23" cy="14" r="3" fill="rgba(255,255,255,0.25)" />
//     </svg>
//   );
// };

// // ── Strawberry SVG ─────────────────────────────────────────────
// const Strawberry: React.FC<{ size: number }> = ({ size }) => (
//   <svg width={size} height={size} viewBox="0 0 60 70" fill="none">
//     <ellipse cx="30" cy="42" rx="22" ry="26" fill="#FF3B30" />
//     <path d="M30 16 Q20 0 12 10 Q20 18 28 22" fill="#34C759" />
//     <path d="M30 16 Q40 0 48 10 Q40 18 32 22" fill="#34C759" />
//     <path d="M30 16 Q30 0 30 8 Q30 18 30 22" fill="#28A746" />
//     {[15,22,29,36,43].flatMap((x, i) => [[x,35],[x+3,47]].map(([cx,cy],j) => (
//       <circle key={`${i}-${j}`} cx={cx} cy={cy} r="2" fill="rgba(255,255,255,0.3)" />
//     )))}
//     <ellipse cx="30" cy="54" rx="14" ry="10" fill="rgba(255,255,255,0.12)" />
//   </svg>
// );

// // ── Leaf SVG ───────────────────────────────────────────────────
// const Leaf: React.FC<{ size: number }> = ({ size }) => (
//   <svg width={size} height={size} viewBox="0 0 50 60" fill="none">
//     <path d="M25 55 Q5 40 8 18 Q16 5 25 5 Q34 5 42 18 Q45 40 25 55Z" fill="#2EA84E" />
//     <path d="M25 55 Q25 30 25 5" stroke="#1a7a36" strokeWidth="1.5" fill="none" />
//     <path d="M25 30 Q12 25 8 18" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
//     <path d="M25 30 Q38 25 42 18" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
//   </svg>
// );

// // ── Ice Cube SVG ───────────────────────────────────────────────
// const IceCube: React.FC<{ size: number }> = ({ size }) => (
//   <svg width={size} height={size} viewBox="0 0 50 50" fill="none">
//     <rect x="5" y="5" width="40" height="40" rx="8"
//       fill="rgba(180,220,255,0.18)" stroke="rgba(180,220,255,0.45)" strokeWidth="1.5" />
//     <rect x="10" y="10" width="15" height="12" rx="4"
//       fill="rgba(255,255,255,0.12)" />
//     <line x1="5" y1="20" x2="45" y2="20" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
//     <line x1="22" y1="5" x2="22" y2="45" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
//   </svg>
// );

// // ── Sparkle SVG ────────────────────────────────────────────────
// const Sparkle: React.FC<{ size: number; color?: string }> = ({ size, color = '#FFD600' }) => (
//   <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
//     <path d="M20 2 L22 18 L38 20 L22 22 L20 38 L18 22 L2 20 L18 18 Z"
//       fill={color} opacity="0.9" />
//     <path d="M20 8 L21 19 L32 20 L21 21 L20 32 L19 21 L8 20 L19 19 Z"
//       fill="rgba(255,255,255,0.6)" />
//   </svg>
// );

// // ── Orbiting bubble circle ─────────────────────────────────────
// const Bubble: React.FC<{ size: number; opacity?: number }> = ({ size, opacity = 0.5 }) => (
//   <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
//     <defs>
//       <radialGradient id="bgrad" cx="35%" cy="30%" r="70%">
//         <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
//         <stop offset="70%" stopColor="rgba(200,180,255,0.3)" />
//         <stop offset="100%" stopColor="rgba(150,100,255,0.05)" />
//       </radialGradient>
//     </defs>
//     <circle cx="20" cy="20" r="18" fill="url(#bgrad)" opacity={opacity}
//       stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
//     <ellipse cx="14" cy="14" rx="4" ry="3" fill="rgba(255,255,255,0.45)" />
//   </svg>
// );

// // ══════════════════════════════════════════════════════════════
// // HERO SECTION
// // ══════════════════════════════════════════════════════════════
// export const HeroSection: React.FC = () => {
//   const navigate   = useNavigate();
//   const heroRef    = useRef<HTMLElement>(null);
//   const [cupHover, setCupHover] = useState(false);

//   // Mouse position for depth parallax
//   const rawX = useMotionValue(0);
//   const rawY = useMotionValue(0);
//   const spring = { stiffness: 55, damping: 22 };
//   const mx = useSpring(rawX, spring);
//   const my = useSpring(rawY, spring);

//   // Depth-based parallax transforms (different speeds = different z-layers)
//   const bg_x    = useTransform(mx, v => `${v * -18}px`);
//   const bg_y    = useTransform(my, v => `${v * -14}px`);
//   const far_x   = useTransform(mx, v => `${v * -12}px`);
//   const far_y   = useTransform(my, v => `${v * -9}px`);
//   const mid_x   = useTransform(mx, v => `${v * -6}px`);
//   const mid_y   = useTransform(my, v => `${v * -4}px`);
//   const cup_x   = useTransform(mx, v => `${v * 3}px`);
//   const cup_y   = useTransform(my, v => `${v * 2}px`);
//   const near_x  = useTransform(mx, v => `${v * 18}px`);
//   const near_y  = useTransform(my, v => `${v * 12}px`);
//   const near2_x = useTransform(mx, v => `${v * 28}px`);
//   const near2_y = useTransform(my, v => `${v * 20}px`);
//   const text_x  = useTransform(mx, v => `${v * -3}px`);
//   const text_y  = useTransform(my, v => `${v * -2}px`);

//   useEffect(() => {
//     const el = heroRef.current;
//     if (!el) return;
//     const onMove = (e: MouseEvent) => {
//       const r   = el.getBoundingClientRect();
//       const nx  = ((e.clientX - r.left) / r.width  - 0.5) * 2;
//       const ny  = ((e.clientY - r.top)  / r.height - 0.5) * 2;
//       rawX.set(nx); rawY.set(ny);
//     };
//     const onLeave = () => { rawX.set(0); rawY.set(0); };
//     el.addEventListener('mousemove', onMove);
//     el.addEventListener('mouseleave', onLeave);
//     return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
//   }, [rawX, rawY]);

//   // Scatter destinations when cup is hovered  (x, y, rotate, scale)
//   const scatterMap: Record<string, { hover: object; base: object }> = {
//     p1:  { base: {}, hover: { x: -110, y: -80,  rotate: -35, scale: 1.1 } },
//     p2:  { base: {}, hover: { x:  130, y: -100, rotate:  25, scale: 1.2 } },
//     p3:  { base: {}, hover: { x: -140, y:  60,  rotate: -20, scale: 0.9 } },
//     p4:  { base: {}, hover: { x:  150, y:  80,  rotate:  40, scale: 1.0 } },
//     p5:  { base: {}, hover: { x: -80,  y:  130, rotate: -50, scale: 1.15 } },
//     p6:  { base: {}, hover: { x:  90,  y:  140, rotate:  30, scale: 0.95 } },
//     str: { base: {}, hover: { x:  160, y: -120, rotate:  25, scale: 1.3 } },
//     ice: { base: {}, hover: { x: -160, y: -90,  rotate: -45, scale: 1.1 } },
//     lf1: { base: {}, hover: { x: -180, y:  40,  rotate: -60, scale: 1.2 } },
//     lf2: { base: {}, hover: { x:  170, y:  60,  rotate:  55, scale: 1.1 } },
//     sp1: { base: {}, hover: { x: -130, y: -160, rotate: -20, scale: 1.4 } },
//     sp2: { base: {}, hover: { x:  140, y: -150, rotate:  30, scale: 1.3 } },
//     b1:  { base: {}, hover: { x: -100, y: -180, scale: 0.7, opacity: 0 } },
//     b2:  { base: {}, hover: { x:  120, y: -170, scale: 0.7, opacity: 0 } },
//   };

//   const scatterProps = (key: string, extra?: object) => ({
//     animate: cupHover ? { ...scatterMap[key].hover, ...extra } : scatterMap[key].base,
//     transition: { type: 'spring' as const, stiffness: 140, damping: 18, mass: 0.8 },
//   });

//   return (
//     <section
//       ref={heroRef}
//       className="relative min-h-screen flex items-center overflow-hidden select-none"
//       style={{
//         background: `
//           radial-gradient(ellipse 90% 70% at 72% 38%, rgba(255, 90, 30, 0.24) 0%, transparent 65%),
//           radial-gradient(ellipse 70% 90% at 18% 62%, rgba(140, 35, 220, 0.18) 0%, transparent 62%),
//           radial-gradient(ellipse 55% 55% at 48% 98%, rgba(255, 170, 0, 0.14) 0%, transparent 55%),
//           radial-gradient(ellipse 40% 40% at 85% 90%, rgba(255, 50, 80, 0.10) 0%, transparent 50%),
//           #06020e
//         `,
//       }}
//     >
//       {/* ── Atmospheric grain ──────────────────────────────────── */}
//       <div
//         className="pointer-events-none absolute inset-0 opacity-[0.035]"
//         style={{
//           backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
//           backgroundSize: '200px',
//         }}
//       />

//       {/* ── Animated grid lines ─────────────────────────────────── */}
//       <motion.div
//         className="pointer-events-none absolute inset-0"
//         style={{
//           x: bg_x, y: bg_y,
//           backgroundImage: `
//             linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
//             linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
//           `,
//           backgroundSize: '80px 80px',
//         }}
//       />

//       {/* ── Far floating bubbles (deep background layer) ─────────── */}
//       <motion.div className="pointer-events-none absolute inset-0" style={{ x: far_x, y: far_y }}>
//         {[
//           { top: '8%',  left: '5%',  s: 100, o: 0.12 },
//           { top: '60%', left: '2%',  s: 70,  o: 0.08 },
//           { top: '15%', left: '88%', s: 130, o: 0.10 },
//           { top: '72%', left: '90%', s: 80,  o: 0.09 },
//           { top: '40%', left: '50%', s: 200, o: 0.05 },
//         ].map((b, i) => (
//           <motion.div
//             key={i}
//             className="absolute rounded-full"
//             style={{
//               top: b.top, left: b.left, width: b.s, height: b.s,
//               background: `radial-gradient(circle at 35% 35%, rgba(255,140,80,${b.o}), transparent 70%)`,
//               border: `1px solid rgba(255,160,80,${b.o * 0.8})`,
//             }}
//             animate={{ y: [0, -18, 0], scale: [1, 1.04, 1] }}
//             transition={{ duration: 5 + i * 1.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
//           />
//         ))}
//       </motion.div>

//       {/* ══════════════════════════════════════════════════════════ */}
//       {/* MAIN LAYOUT                                               */}
//       {/* ══════════════════════════════════════════════════════════ */}
//       <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-20 pb-10">
//         <div className="grid lg:grid-cols-2 gap-8 lg:gap-4 items-center min-h-[calc(100vh-5rem)]">

//           {/* ── LEFT: Text content ─────────────────────────────── */}
//           <motion.div
//             className="flex flex-col justify-center z-20 relative"
//             style={{ x: text_x, y: text_y }}
//           >
//             {/* Tag badge */}
//             <motion.div
//               initial={{ opacity: 0, x: -30 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.2, duration: 0.5 }}
//               className="inline-flex items-center gap-2 self-start mb-6 px-4 py-2 rounded-full
//                 border border-white/15 bg-white/5 backdrop-blur-sm"
//             >
//               <span className="text-base animate-pulse" style={{ animationDuration: '2.5s' }}>🫧</span>
//               <span className="text-xs font-semibold tracking-widest uppercase"
//                 style={{ color: '#FFD600', letterSpacing: '0.14em' }}>
//                 {cafe.tagline}
//               </span>
//             </motion.div>

//             {/* Heading */}
//             <h1 className="font-display leading-none mb-5" style={{ perspective: '600px' }}>
//               <div className="text-[clamp(3rem,8vw,6.5rem)] font-black leading-none"
//                 style={{
//                   background: 'linear-gradient(135deg, #FF3B30 0%, #FF9500 50%, #FFD600 100%)',
//                   WebkitBackgroundClip: 'text',
//                   WebkitTextFillColor: 'transparent',
//                   backgroundClip: 'text',
//                 }}>
//                 <AnimatedText text="THE COOLEST" startDelay={0.15} />
//               </div>
//               <div className="text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-none text-white mt-1">
//                 <AnimatedText text="BUBBLE BAR" startDelay={0.65} />
//                 <motion.span
//                   initial={{ opacity: 0, scale: 0, rotate: -30 }}
//                   animate={{ opacity: 1, scale: 1, rotate: 0 }}
//                   transition={{ delay: 1.35, type: 'spring', stiffness: 200 }}
//                   className="inline-block ml-2 align-middle text-[0.7em]"
//                   style={{ display: 'inline-block' }}
//                 >
//                   🫧
//                 </motion.span>
//               </div>
//             </h1>

//             {/* Description */}
//             <motion.p
//               className="text-base sm:text-lg leading-relaxed max-w-md mb-8"
//               style={{ color: 'rgba(200,185,220,0.85)' }}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 1.1, duration: 0.6 }}
//             >
//               {cafe.description}
//             </motion.p>

//             {/* CTAs */}
//             <motion.div
//               className="flex flex-wrap gap-4"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 1.25, duration: 0.5 }}
//             >
//               <PrimaryButton size="lg" onClick={() => navigate('/menu')}>
//                 Explore Menu 🍵
//               </PrimaryButton>
//               <SecondaryButton size="lg" onClick={() => navigate('/gallery')}>
//                 View Gallery
//               </SecondaryButton>
//             </motion.div>

//             {/* Stats */}
//             <motion.div
//               className="flex gap-8 mt-10"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 1.5, duration: 0.5 }}
//             >
//               {[['50+', 'Menu Items'], ['10K+', 'Happy Bubblers'], ['4.8★', 'Rating']].map(([val, label]) => (
//                 <div key={label} className="text-center">
//                   <div className="text-xl sm:text-2xl font-display font-black"
//                     style={{
//                       background: 'linear-gradient(135deg,#FF3B30,#FF9500,#FFD600)',
//                       WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
//                     }}>
//                     {val}
//                   </div>
//                   <div className="text-xs mt-0.5" style={{ color: 'rgba(180,165,200,0.7)' }}>{label}</div>
//                 </div>
//               ))}
//             </motion.div>
//           </motion.div>

//           {/* ── RIGHT: 3D Parallax scene ─────────────────────────── */}
//           <motion.div
//             className="relative flex items-center justify-center"
//             style={{ minHeight: 'clamp(420px, 65vw, 640px)' }}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.3, duration: 0.6 }}
//           >
//             {/* ── Middle-depth decorative ring ── */}
//             <motion.div
//               className="pointer-events-none absolute rounded-full"
//               style={{
//                 width: 'clamp(300px, 45vw, 500px)',
//                 height: 'clamp(300px, 45vw, 500px)',
//                 x: mid_x, y: mid_y,
//                 background: 'radial-gradient(circle at 40% 40%, rgba(255,100,30,0.08), transparent 70%)',
//                 border: '1px solid rgba(255,120,40,0.12)',
//               }}
//               animate={{ rotate: 360 }}
//               transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
//             />

//             {/* ── Dashed orbit ring ── */}
//             <motion.div
//               className="pointer-events-none absolute rounded-full"
//               style={{
//                 width: 'clamp(360px, 52vw, 580px)',
//                 height: 'clamp(360px, 52vw, 580px)',
//                 x: mid_x, y: mid_y,
//                 border: '1px dashed rgba(255,180,60,0.10)',
//               }}
//               animate={{ rotate: -360 }}
//               transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
//             />

//             {/* ══════════════════════════════════════════════════ */}
//             {/* CUP + SCATTER GROUP — hover triggers scatter       */}
//             {/* ══════════════════════════════════════════════════ */}
//             <motion.div
//               className="relative cursor-pointer"
//               style={{
//                 x: cup_x, y: cup_y,
//                 width: 'clamp(260px, 36vw, 380px)',
//                 height: 'clamp(350px, 48vw, 500px)',
//               }}
//               onHoverStart={() => setCupHover(true)}
//               onHoverEnd={() => setCupHover(false)}
//             >
//               {/* ── Main cup – rises on hover ── */}
//               <motion.div
//                 className="relative z-20 w-full h-full"
//                 animate={cupHover
//                   ? { y: -55, scale: 1.06, rotateY: 8, rotateX: -4 }
//                   : { y: 0,   scale: 1,    rotateY: 0, rotateX: 0  }
//                 }
//                 transition={{ type: 'spring', stiffness: 160, damping: 22, mass: 0.9 }}
//                 style={{ transformStyle: 'preserve-3d', transformOrigin: 'center bottom' }}
//               >
//                 <CupSVG />
//               </motion.div>

//               {/* ── Cup glow shadow on floor ── */}
//               <motion.div
//                 className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
//                 style={{ background: 'radial-gradient(ellipse, rgba(255,120,30,0.35), transparent 70%)' }}
//                 animate={cupHover
//                   ? { width: 200, height: 40, opacity: 0.5 }
//                   : { width: 160, height: 28, opacity: 0.85 }
//                 }
//                 transition={{ type: 'spring', stiffness: 140, damping: 20 }}
//               />

//               {/* ════════════════════════════════════════════════ */}
//               {/* SCATTERED ELEMENTS — all positioned relative to cup */}
//               {/* ════════════════════════════════════════════════ */}

//               {/* Pearls */}
//               {[
//                 { id: 'p1', style: { top: '5%',  left: '-18%' }, size: 48, seed: 0, layer: near_x,  ly: near_y  },
//                 { id: 'p2', style: { top: '10%', right: '-22%'}, size: 54, seed: 1, layer: far_x,   ly: far_y   },
//                 { id: 'p3', style: { top: '42%', left: '-28%' }, size: 40, seed: 2, layer: near2_x, ly: near2_y },
//                 { id: 'p4', style: { top: '55%', right: '-30%'}, size: 44, seed: 3, layer: near_x,  ly: near_y  },
//                 { id: 'p5', style: { bottom:'8%',left: '-15%' }, size: 36, seed: 1, layer: far_x,   ly: far_y   },
//                 { id: 'p6', style: { bottom:'5%',right:'-18%' }, size: 50, seed: 0, layer: near2_x, ly: near2_y },
//               ].map(({ id, style, size, seed, layer, ly }) => (
//                 <motion.div
//                   key={id}
//                   className="absolute"
//                   style={{ ...style, x: layer, y: ly }}
//                   {...scatterProps(id)}
//                   animate={{
//                     ...(cupHover ? scatterMap[id].hover : scatterMap[id].base),
//                     // Override x/y with motion values not possible here — use fixed scatter
//                   }}
//                   transition={{ type: 'spring', stiffness: 130, damping: 16 }}
//                   initial={{ opacity: 0, scale: 0 }}
//                   whileInView={{ opacity: 1, scale: 1 }}
//                   viewport={{ once: true }}
//                 >
//                   <motion.div
//                     animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
//                     transition={{ duration: 3.5 + seed * 0.8, repeat: Infinity, ease: 'easeInOut' }}
//                   >
//                     <Pearl size={size} seed={seed} />
//                   </motion.div>
//                 </motion.div>
//               ))}

//               {/* Strawberry */}
//               <motion.div
//                 className="absolute"
//                 style={{ top: '18%', right: '-30%', x: near_x, y: near_y }}
//                 {...scatterProps('str')}
//                 initial={{ opacity: 0, scale: 0 }}
//                 whileInView={{ opacity: 1, scale: 1 }}
//                 viewport={{ once: true }}
//                 transition={{ type: 'spring', stiffness: 130, damping: 16 }}
//               >
//                 <motion.div
//                   animate={{ rotate: [-8, 8, -8], y: [0, -10, 0] }}
//                   transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
//                 >
//                   <Strawberry size={62} />
//                 </motion.div>
//               </motion.div>

//               {/* Ice cube */}
//               <motion.div
//                 className="absolute"
//                 style={{ top: '20%', left: '-30%', x: far_x, y: far_y }}
//                 {...scatterProps('ice')}
//                 initial={{ opacity: 0, scale: 0, rotate: 20 }}
//                 whileInView={{ opacity: 1, scale: 1 }}
//                 viewport={{ once: true }}
//                 transition={{ type: 'spring', stiffness: 130, damping: 16 }}
//               >
//                 <motion.div
//                   animate={{ rotate: [15, 25, 15], y: [0, -6, 0] }}
//                   transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
//                 >
//                   <IceCube size={52} />
//                 </motion.div>
//               </motion.div>

//               {/* Leaves */}
//               <motion.div className="absolute" style={{ bottom: '20%', left: '-22%', x: near2_x, y: near2_y }}
//                 {...scatterProps('lf1')}
//                 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
//                 transition={{ type: 'spring', stiffness: 130, damping: 16 }}>
//                 <motion.div animate={{ rotate: [-20, -12, -20] }} transition={{ duration: 4.5, repeat: Infinity }}>
//                   <Leaf size={44} />
//                 </motion.div>
//               </motion.div>
//               <motion.div className="absolute" style={{ bottom: '22%', right: '-20%', x: near_x, y: near_y }}
//                 {...scatterProps('lf2')}
//                 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
//                 transition={{ type: 'spring', stiffness: 130, damping: 16 }}>
//                 <motion.div animate={{ rotate: [15, 22, 15] }} transition={{ duration: 5, repeat: Infinity }}>
//                   <Leaf size={38} />
//                 </motion.div>
//               </motion.div>

//               {/* Sparkles */}
//               <motion.div className="absolute" style={{ top: '-8%', left: '15%', x: far_x, y: far_y }}
//                 {...scatterProps('sp1')}
//                 initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
//                 transition={{ type: 'spring', stiffness: 130, damping: 16 }}>
//                 <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
//                   <Sparkle size={28} color="#FFD600" />
//                 </motion.div>
//               </motion.div>
//               <motion.div className="absolute" style={{ top: '-6%', right: '12%', x: near_x, y: near_y }}
//                 {...scatterProps('sp2')}
//                 initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
//                 transition={{ type: 'spring', stiffness: 130, damping: 16 }}>
//                 <motion.div animate={{ rotate: [0, -360] }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
//                   <Sparkle size={22} color="#FF9500" />
//                 </motion.div>
//               </motion.div>

//               {/* Glass bubbles (float up into cup on hover) */}
//               <motion.div className="absolute" style={{ top: '28%', left: '8%', x: mid_x, y: mid_y }}
//                 {...scatterProps('b1')}
//                 initial={{ opacity: 0 }} whileInView={{ opacity: 0.7 }} viewport={{ once: true }}
//                 transition={{ type: 'spring', stiffness: 130, damping: 16 }}>
//                 <motion.div animate={{ y: [0, -14, 0], scale: [1, 0.92, 1] }}
//                   transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
//                   <Bubble size={36} opacity={0.65} />
//                 </motion.div>
//               </motion.div>
//               <motion.div className="absolute" style={{ top: '35%', right: '5%', x: near_x, y: near_y }}
//                 {...scatterProps('b2')}
//                 initial={{ opacity: 0 }} whileInView={{ opacity: 0.55 }} viewport={{ once: true }}
//                 transition={{ type: 'spring', stiffness: 130, damping: 16 }}>
//                 <motion.div animate={{ y: [0, -10, 0], scale: [1, 1.06, 1] }}
//                   transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
//                   <Bubble size={28} opacity={0.55} />
//                 </motion.div>
//               </motion.div>

//               {/* Hover hint text */}
//               <motion.div
//                 className="absolute bottom-[-32px] left-1/2 -translate-x-1/2 text-xs font-semibold tracking-widest text-center whitespace-nowrap"
//                 style={{ color: 'rgba(180,160,200,0.5)', letterSpacing: '0.18em' }}
//                 animate={{ opacity: cupHover ? 0 : [0.4, 0.9, 0.4] }}
//                 transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
//               >
//                 HOVER ME
//               </motion.div>
//             </motion.div>
//           </motion.div>
//         </div>
//       </div>

//       {/* ── Open Now card ──────────────────────────────────────── */}
//       <motion.div
//         className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl"
//         style={{
//           background: 'rgba(255,255,255,0.06)',
//           backdropFilter: 'blur(12px)',
//           border: '1px solid rgba(255,255,255,0.12)',
//         }}
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 1.8 }}
//       >
//         <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
//           <span className="text-green-400 text-sm">✓</span>
//         </div>
//         <div>
//           <p className="text-white font-bold text-sm leading-none">Open Now</p>
//           <p className="text-xs mt-0.5" style={{ color: 'rgba(180,165,210,0.7)' }}>{cafe.openingHours}</p>
//         </div>
//       </motion.div>

//       {/* ── Scroll hint ─────────────────────────────────────────── */}
//       <motion.div
//         className="absolute bottom-8 right-8 hidden sm:flex flex-col items-center gap-2"
//         style={{ color: 'rgba(180,165,200,0.45)' }}
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 2.2 }}
//       >
//         <span className="text-[10px] tracking-widest" style={{ writingMode: 'vertical-rl', letterSpacing: '0.2em' }}>
//           SCROLL
//         </span>
//         <motion.div
//           className="w-px bg-gradient-to-b from-transparent via-current to-transparent"
//           style={{ height: 48 }}
//           animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.3, 0.8, 0.3] }}
//           transition={{ duration: 2, repeat: Infinity }}
//         />
//       </motion.div>
//     </section>
//   );
// };

// export default HeroSection;





// import React from 'react';
// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import { PrimaryButton, SecondaryButton } from '../ui';
// import cafe from '../../data/cafe.json';

// const letterVariants = {
//   hidden: { opacity: 0, y: 40 },
//   visible: (i: number) => ({
//     opacity: 1, y: 0,
//     transition: { delay: i * 0.06, type: 'spring', stiffness: 120, damping: 14 },
//   }),
// };

// const AnimatedText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => (
//   <span className={`inline-flex overflow-hidden ${className}`} aria-label={text}>
//     {text.split('').map((char, i) => (
//       <motion.span
//         key={i}
//         custom={i}
//         variants={letterVariants}
//         initial="hidden"
//         animate="visible"
//         className={char === ' ' ? 'mr-3' : ''}
//       >
//         {char}
//       </motion.span>
//     ))}
//   </span>
// );

// export const HeroSection: React.FC = () => {
//   const navigate = useNavigate();

//   return (
//     <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
//       {/* Background gradient */}
//       <div className="absolute inset-0 bg-hero-gradient z-0" />
//       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,59,48,0.15)_0%,_transparent_60%)] z-0" />
//       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,214,0,0.1)_0%,_transparent_60%)] z-0" />

//       <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
//         <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-4rem)]">
//           {/* Left: Content */}
//           <div className="flex flex-col justify-center text-center lg:text-left">
//             {/* Badge */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.2 }}
//               className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20
//                 rounded-full px-4 py-2 text-sm font-semibold text-secondary mb-6 self-center lg:self-start"
//             >
//               <span className="animate-pulse-slow">🫧</span>
//               {cafe.tagline}
//             </motion.div>

//             {/* Heading */}
//             <h1 className="font-display font-bold leading-none mb-4">
//               <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl bg-bubble-gradient bg-clip-text text-transparent">
//                 <AnimatedText text="THE COOLEST" />
//               </div>
//               <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-white mt-1">
//                 <AnimatedText text="BUBBLE BAR" />
//                 <motion.span
//                   initial={{ opacity: 0, scale: 0 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 1.2, type: 'spring' }}
//                   className="inline-block ml-2"
//                 >
//                   🫧
//                 </motion.span>
//               </div>
//             </h1>

//             {/* Subtext */}
//             <motion.p
//               className="text-text-secondary text-lg sm:text-xl mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.9, duration: 0.5 }}
//             >
//               {cafe.description}
//             </motion.p>

//             {/* CTAs */}
//             <motion.div
//               className="flex flex-wrap gap-4 justify-center lg:justify-start"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 1.1, duration: 0.5 }}
//             >
//               <PrimaryButton size="lg" onClick={() => navigate('/menu')}>
//                 Explore Menu 🍵
//               </PrimaryButton>
//               <SecondaryButton size="lg" onClick={() => navigate('/gallery')}>
//                 View Gallery
//               </SecondaryButton>
//             </motion.div>

//             {/* Stats */}
//             <motion.div
//               className="flex gap-8 mt-10 justify-center lg:justify-start"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 1.4 }}
//             >
//               {[
//                 { value: '50+', label: 'Menu Items' },
//                 { value: '10K+', label: 'Happy Customers' },
//                 { value: '4.8★', label: 'Rating' },
//               ].map(({ value, label }) => (
//                 <div key={label} className="text-center">
//                   <div className="text-2xl font-display font-bold bg-bubble-gradient bg-clip-text text-transparent">
//                     {value}
//                   </div>
//                   <div className="text-text-secondary text-xs font-body">{label}</div>
//                 </div>
//               ))}
//             </motion.div>
//           </div>

//           {/* Right: Hero Visual */}
//           <motion.div
//             className="flex items-center justify-center relative"
//             initial={{ opacity: 0, x: 60 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
//           >
//             {/* Glow rings */}
//             <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-primary/10 blur-3xl animate-pulse-slow" />
//             <div className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-secondary/10 blur-2xl animate-float" />

//             {/* Main bubble visual */}
//             <motion.div
//               className="relative z-10 flex flex-col items-center"
//               animate={{ y: [0, -12, 0] }}
//               transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
//             >
//               {/* Big bubble emoji + visual */}
//               <div className="text-[180px] sm:text-[240px] leading-none select-none drop-shadow-2xl">
//                 🧋
//               </div>

//               {/* Floating bubbles */}
//               {[
//                 { emoji: '🫧', size: 'text-5xl', pos: 'top-0 -left-8', delay: 0 },
//                 { emoji: '🍓', size: 'text-4xl', pos: 'top-8 -right-6', delay: 0.5 },
//                 { emoji: '🫧', size: 'text-3xl', pos: 'bottom-8 -left-4', delay: 1 },
//                 { emoji: '💛', size: 'text-3xl', pos: 'bottom-4 -right-8', delay: 0.3 },
//               ].map(({ emoji, size, pos, delay }) => (
//                 <motion.span
//                   key={pos}
//                   className={`absolute ${size} ${pos} select-none`}
//                   animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
//                   transition={{ duration: 3 + delay, repeat: Infinity, delay }}
//                 >
//                   {emoji}
//                 </motion.span>
//               ))}
//             </motion.div>

//             {/* Info card */}
//             <motion.div
//               className="absolute bottom-4 left-0 bg-card/80 backdrop-blur-sm border border-white/10 rounded-2xl p-4 shadow-card"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 1.5 }}
//             >
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
//                   <span className="text-success text-lg">✓</span>
//                 </div>
//                 <div>
//                   <p className="text-white font-bold text-sm">Open Now</p>
//                   <p className="text-text-secondary text-xs">{cafe.openingHours}</p>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         </div>
//       </div>

//       {/* Scroll hint */}
//       <motion.div
//         className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-secondary"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 2 }}
//       >
//         <span className="text-xs">Scroll to explore</span>
//         <motion.div
//           className="w-5 h-8 border-2 border-white/20 rounded-full flex justify-center pt-1.5"
//           animate={{ opacity: [1, 0.3, 1] }}
//           transition={{ duration: 2, repeat: Infinity }}
//         >
//           <div className="w-1 h-2 bg-white/60 rounded-full" />
//         </motion.div>
//       </motion.div>
//     </section>
//   );
// };

// export default HeroSection;
