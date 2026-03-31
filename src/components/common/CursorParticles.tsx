// import React, { useEffect, useRef } from 'react';

// type Particle = {
//   el: HTMLSpanElement;
//   x: number;
//   y: number;
//   size: number;
//   life: number;
//   dx: number;
//   dy: number;
// };

// const COLORS = [
//   'rgba(236,72,153,0.75)',   // pink
//   'rgba(168,85,247,0.75)',   // purple
//   'rgba(34,211,238,0.65)',   // cyan
// ];

// export const CursorParticles: React.FC = () => {
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const dotRef = useRef<HTMLDivElement | null>(null);
//   const ringRef = useRef<HTMLDivElement | null>(null);
//   const glowRef = useRef<HTMLDivElement | null>(null);

//   const mouseX = useRef(-100);
//   const mouseY = useRef(-100);
//   const ringX = useRef(-100);
//   const ringY = useRef(-100);

//   const visible = useRef(false);
//   const isPointer = useRef(false);
//   const isDesktop = useRef(false);
//   const rafRef = useRef<number | null>(null);
//   const particlesRef = useRef<Particle[]>([]);
//   const lastParticleTime = useRef(0);

//   useEffect(() => {
//     const finePointer = window.matchMedia('(pointer: fine)').matches;
//     isDesktop.current = finePointer;

//     if (!finePointer) return;

//     const createParticle = (x: number, y: number) => {
//       if (!containerRef.current) return;

//       const now = performance.now();
//       if (now - lastParticleTime.current < 40) return; // lower frequency
//       lastParticleTime.current = now;

//       const el = document.createElement('span');
//       const size = Math.random() * 6 + 4;
//       const color = COLORS[Math.floor(Math.random() * COLORS.length)];

//       el.style.position = 'absolute';
//       el.style.left = `${x - size / 2}px`;
//       el.style.top = `${y - size / 2}px`;
//       el.style.width = `${size}px`;
//       el.style.height = `${size}px`;
//       el.style.borderRadius = '9999px';
//       el.style.pointerEvents = 'none';
//       el.style.background = color;
//       el.style.boxShadow = `0 0 10px ${color}`;
//       el.style.opacity = '0.9';
//       el.style.willChange = 'transform, opacity';
//       el.style.transform = 'translate3d(0,0,0) scale(1)';

//       containerRef.current.appendChild(el);

//       particlesRef.current.push({
//         el,
//         x,
//         y,
//         size,
//         life: 1,
//         dx: (Math.random() - 0.5) * 1.2,
//         dy: -(Math.random() * 1.6 + 0.6),
//       });

//       // hard limit particles
//       if (particlesRef.current.length > 18) {
//         const old = particlesRef.current.shift();
//         if (old?.el.parentNode) old.el.parentNode.removeChild(old.el);
//       }
//     };

//     const updatePointerState = (target: EventTarget | null) => {
//       const el = target as HTMLElement | null;
//       if (!el) return;

//       const interactive = el.closest(
//         'a, button, [role="button"], input, textarea, select, label, .cursor-hover'
//       );

//       isPointer.current = !!interactive;
//     };

//     const handleMove = (e: MouseEvent) => {
//       mouseX.current = e.clientX;
//       mouseY.current = e.clientY;
//       visible.current = true;

//       createParticle(e.clientX, e.clientY);
//     };

//     const handleOver = (e: MouseEvent) => updatePointerState(e.target);
//     const handleLeave = () => (visible.current = false);
//     const handleEnter = () => (visible.current = true);

//     const animate = () => {
//       // smooth follow for ring/glow
//       ringX.current += (mouseX.current - ringX.current) * 0.18;
//       ringY.current += (mouseY.current - ringY.current) * 0.18;

//       const pointerScale = isPointer.current ? 1.18 : 1;
//       const ringSize = isPointer.current ? 42 : 34;
//       const glowSize = isPointer.current ? 26 : 20;
//       const dotSize = isPointer.current ? 10 : 8;

//       if (dotRef.current) {
//         dotRef.current.style.transform = `translate3d(${mouseX.current - dotSize / 2}px, ${mouseY.current - dotSize / 2}px, 0) scale(${pointerScale})`;
//         dotRef.current.style.opacity = visible.current ? '1' : '0';
//       }

//       if (ringRef.current) {
//         ringRef.current.style.width = `${ringSize}px`;
//         ringRef.current.style.height = `${ringSize}px`;
//         ringRef.current.style.transform = `translate3d(${ringX.current - ringSize / 2}px, ${ringY.current - ringSize / 2}px, 0)`;
//         ringRef.current.style.opacity = visible.current ? '1' : '0';
//       }

//       if (glowRef.current) {
//         glowRef.current.style.width = `${glowSize}px`;
//         glowRef.current.style.height = `${glowSize}px`;
//         glowRef.current.style.transform = `translate3d(${ringX.current - glowSize / 2}px, ${ringY.current - glowSize / 2}px, 0)`;
//         glowRef.current.style.opacity = visible.current ? (isPointer.current ? '0.22' : '0.14') : '0';
//       }

//       // animate particles manually (cheap)
//       particlesRef.current = particlesRef.current.filter((p) => {
//         p.life -= 0.04;
//         p.x += p.dx;
//         p.y += p.dy;

//         if (p.life <= 0) {
//           if (p.el.parentNode) p.el.parentNode.removeChild(p.el);
//           return false;
//         }

//         p.el.style.transform = `translate3d(${p.x - parseFloat(p.el.style.left)}px, ${p.y - parseFloat(p.el.style.top)}px, 0) scale(${1 + (1 - p.life) * 0.8})`;
//         p.el.style.opacity = `${p.life}`;

//         return true;
//       });

//       rafRef.current = requestAnimationFrame(animate);
//     };

//     rafRef.current = requestAnimationFrame(animate);

//     window.addEventListener('mousemove', handleMove, { passive: true });
//     document.addEventListener('mouseover', handleOver, { passive: true });
//     document.addEventListener('mouseleave', handleLeave);
//     document.addEventListener('mouseenter', handleEnter);

//     return () => {
//       if (rafRef.current) cancelAnimationFrame(rafRef.current);

//       window.removeEventListener('mousemove', handleMove);
//       document.removeEventListener('mouseover', handleOver);
//       document.removeEventListener('mouseleave', handleLeave);
//       document.removeEventListener('mouseenter', handleEnter);

//       particlesRef.current.forEach((p) => {
//         if (p.el.parentNode) p.el.parentNode.removeChild(p.el);
//       });
//       particlesRef.current = [];
//     };
//   }, []);

//   if (!isDesktop.current) return null;

//   return (
//     <>
//       <style>{`
//         @media (pointer: fine) {
//           html, body, a, button, [role="button"], .cursor-hover {
//             cursor: none !important;
//           }
//         }
//       `}</style>

//       <div
//         ref={containerRef}
//         className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
//       >
//         {/* Outer Ring */}
//         <div
//           ref={ringRef}
//           className="absolute rounded-full border"
//           style={{
//             width: 34,
//             height: 34,
//             borderColor: 'rgba(236,72,153,0.45)',
//             boxShadow:
//               '0 0 10px rgba(236,72,153,0.25), 0 0 20px rgba(168,85,247,0.18)',
//             background:
//               'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
//             willChange: 'transform, opacity, width, height',
//             transform: 'translate3d(-100px,-100px,0)',
//             opacity: 0,
//           }}
//         />

//         {/* Inner Dot */}
//         <div
//           ref={dotRef}
//           className="absolute rounded-full"
//           style={{
//             width: 8,
//             height: 8,
//             background:
//               'linear-gradient(135deg, rgba(236,72,153,1), rgba(168,85,247,1), rgba(34,211,238,0.95))',
//             boxShadow:
//               '0 0 8px rgba(236,72,153,0.7), 0 0 16px rgba(168,85,247,0.45)',
//             willChange: 'transform, opacity',
//             transform: 'translate3d(-100px,-100px,0)',
//             opacity: 0,
//           }}
//         />

//         {/* Glow */}
//         <div
//           ref={glowRef}
//           className="absolute rounded-full blur-md"
//           style={{
//             width: 20,
//             height: 20,
//             background:
//               'radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(236,72,153,0.16) 40%, rgba(168,85,247,0.1) 70%, transparent 100%)',
//             willChange: 'transform, opacity, width, height',
//             transform: 'translate3d(-100px,-100px,0)',
//             opacity: 0,
//           }}
//         />
//       </div>
//     </>
//   );
// };