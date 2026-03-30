import { useEffect, useRef } from 'react';

// ── Config ────────────────────────────────────────────────────
const COLORS: [number, number, number][] = [
  [255, 59, 48],   // brand red
  [255, 149, 0],   // brand orange
  [255, 214, 0],   // brand yellow
  [255, 255, 255], // white accent
];

type ParticleStyle = 'ring' | 'dot';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: [number, number, number];
  alpha: number;
  phase: number;
  type: ParticleStyle;
  lw: number; // ring stroke width
}

const isMobile = () => window.innerWidth < 768;

function createParticle(W: number, H: number, mobile: boolean): Particle {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const isRing = Math.random() < (mobile ? 0.45 : 0.60);

  return {
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.15,
    vy: -(0.12 + Math.random() * 0.22), // float upward
    r: isRing
      ? 5 + Math.random() * (mobile ? 10 : 16)
      : 1 + Math.random() * 2.5,
    color,
    alpha: 0.07 + Math.random() * 0.16,
    phase: Math.random() * Math.PI * 2,
    type: isRing ? 'ring' : 'dot',
    lw: 0.5 + Math.random() * 0.7,
  };
}

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mobile = isMobile();
    const COUNT = mobile ? 22 : 44;

    let W = 0;
    let H = 0;
    let particles: Particle[] = [];

    // ── Setup canvas size ─────────────────────────────────────
    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    resize();

    // ── Spawn particles spread across full canvas ─────────────
    particles = Array.from({ length: COUNT }, () => createParticle(W, H, mobile));

    // ── Animation loop ────────────────────────────────────────
    const animate = (timestamp: number) => {
      frameRef.current = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, W, H);

      const t = timestamp * 0.001;

      particles.forEach((p) => {
        // Move
        p.x += p.vx + Math.sin(t * 0.35 + p.phase) * 0.06;
        p.y += p.vy;

        // Wrap: float off top → respawn at bottom
        if (p.y < -p.r * 2) {
          p.y = H + p.r;
          p.x = Math.random() * W;
        }
        if (p.x < -p.r * 2) p.x = W + p.r;
        if (p.x > W + p.r * 2) p.x = -p.r;

        // Soft pulse
        const pulse = p.alpha + Math.sin(t * 1.1 + p.phase) * 0.03;
        const alpha = Math.max(0.03, Math.min(0.28, pulse));

        const [r, g, b] = p.color;
        ctx.globalAlpha = alpha;

        if (p.type === 'ring') {
          // Thin circle outline — the main aesthetic element
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgb(${r},${g},${b})`;
          ctx.lineWidth = p.lw;
          ctx.stroke();
        } else {
          // Tiny filled dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fill();
        }
      });

      ctx.globalAlpha = 1;
    };

    frameRef.current = requestAnimationFrame(animate);

    // ── Resize handler ────────────────────────────────────────
    const onResize = () => {
      resize();
      // Re-spread particles so they cover new dimensions
      particles = Array.from({ length: COUNT }, () => createParticle(W, H, isMobile()));
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

export default ParticleBackground;





// import { useEffect, useRef } from 'react';
// import * as THREE from 'three';

// const isMobile = window.innerWidth < 768;
// const PARTICLE_COUNT = isMobile ? 20 : 60;
// const BRAND_COLORS = [0xff3b30, 0xffd600, 0xff9500, 0xff6b35];

// export const ParticleBackground: React.FC = () => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const frameRef = useRef<number>(0);
//   const mouseRef = useRef({ x: 0, y: 0 });

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     // ─── Setup ────────────────────────────────────────────────
//     const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.setClearColor(0x000000, 0);

//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//     camera.position.z = 5;

//     // ─── Particles ────────────────────────────────────────────
//     const particles: {
//       mesh: THREE.Mesh;
//       velocity: THREE.Vector3;
//       drift: THREE.Vector3;
//     }[] = [];

//     const geometries = [
//       new THREE.SphereGeometry(0.08, 8, 8),
//       new THREE.SphereGeometry(0.05, 8, 8),
//       new THREE.SphereGeometry(0.12, 8, 8),
//     ];

//     for (let i = 0; i < PARTICLE_COUNT; i++) {
//       const color = BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)];
//       const material = new THREE.MeshBasicMaterial({
//         color,
//         transparent: true,
//         opacity: 0.15 + Math.random() * 0.15,
//       });
//       const geo = geometries[Math.floor(Math.random() * geometries.length)];
//       const mesh = new THREE.Mesh(geo, material);

//       // Random initial positions
//       mesh.position.set(
//         (Math.random() - 0.5) * 14,
//         (Math.random() - 0.5) * 10,
//         (Math.random() - 0.5) * 4
//       );

//       const velocity = new THREE.Vector3(
//         (Math.random() - 0.5) * 0.002,
//         0.003 + Math.random() * 0.006, // float upward
//         0
//       );
//       const drift = new THREE.Vector3(
//         (Math.random() - 0.5) * 0.001,
//         0,
//         0
//       );

//       scene.add(mesh);
//       particles.push({ mesh, velocity, drift });
//     }

//     // ─── Mouse tracking ───────────────────────────────────────
//     const onMouseMove = (e: MouseEvent) => {
//       mouseRef.current = {
//         x: (e.clientX / window.innerWidth - 0.5) * 2,
//         y: -(e.clientY / window.innerHeight - 0.5) * 2,
//       };
//     };
//     window.addEventListener('mousemove', onMouseMove);

//     // ─── Resize handler ───────────────────────────────────────
//     const onResize = () => {
//       camera.aspect = window.innerWidth / window.innerHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(window.innerWidth, window.innerHeight);
//     };
//     window.addEventListener('resize', onResize);

//     // ─── Animation loop ───────────────────────────────────────
//     let lastTime = 0;
//     const animate = (time: number) => {
//       frameRef.current = requestAnimationFrame(animate);
//       const delta = Math.min((time - lastTime) / 16.67, 3); // clamp delta
//       lastTime = time;

//       particles.forEach(({ mesh, velocity, drift }) => {
//         mesh.position.x += (velocity.x + drift.x) * delta;
//         mesh.position.y += velocity.y * delta;

//         // Mouse parallax (desktop only)
//         if (!isMobile) {
//           mesh.position.x += mouseRef.current.x * 0.0003 * delta;
//           mesh.position.y += mouseRef.current.y * 0.0003 * delta;
//         }

//         // Wrap around edges
//         if (mesh.position.y > 6) mesh.position.y = -6;
//         if (mesh.position.x > 8) mesh.position.x = -8;
//         if (mesh.position.x < -8) mesh.position.x = 8;
//       });

//       renderer.render(scene, camera);
//     };

//     frameRef.current = requestAnimationFrame(animate);

//     return () => {
//       cancelAnimationFrame(frameRef.current);
//       window.removeEventListener('mousemove', onMouseMove);
//       window.removeEventListener('resize', onResize);
//       renderer.dispose();
//       geometries.forEach((g) => g.dispose());
//     };
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       className="fixed inset-0 pointer-events-none"
//       style={{ zIndex: 0 }}
//     />
//   );
// };

// export default ParticleBackground;