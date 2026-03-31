import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/allServices';
import toast from 'react-hot-toast';

type Step = 'phone' | 'otp' | 'name';

// ─────────────────────────────────────────────────────────────────
// STEP META
// ─────────────────────────────────────────────────────────────────
const STEP_INDEX: Record<Step, number> = { phone: 0, otp: 1, name: 2 };

// ─────────────────────────────────────────────────────────────────
// ANIMATED CUP — morphs per step (empty → filling → full)
// ─────────────────────────────────────────────────────────────────
const CupVisual: React.FC<{ step: Step }> = ({ step }) => {
  const fillY      = step === 'phone' ? 220 : step === 'otp' ? 168 : 130;
  const foamOp     = step === 'name' ? 1 : 0;
  const liquidStop = step === 'phone' ? '#1a0a00' : step === 'otp' ? '#D4782A' : '#F0A060';

  return (
    <svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full" style={{ filter: 'drop-shadow(0 12px 28px rgba(255,100,30,0.3))' }}>
      <defs>
        <linearGradient id="liq" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={liquidStop} />
          <stop offset="100%" stopColor="#A84E10" />
        </linearGradient>
        <linearGradient id="sheen" x1="0%" y1="0%" x2="20%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
        </linearGradient>
        <radialGradient id="foam" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#fff8ee" />
          <stop offset="100%" stopColor="#ffe0b0" />
        </radialGradient>
        <radialGradient id="pearl" cx="30%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#7a3a1a" />
          <stop offset="100%" stopColor="#0d0400" />
        </radialGradient>
        <clipPath id="cupClip">
          <path d="M20 67 L29 150 Q60 159 91 150 L100 67 Q60 59 20 67Z" />
        </clipPath>
      </defs>

      {/* Straw */}
      <motion.rect x="54" y="0" width="9" height="68" rx="4.5" fill="#FF3B30"
        initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }} style={{ transformOrigin: 'bottom' }} />
      <rect x="56" y="0" width="3" height="68" rx="1.5" fill="rgba(255,255,255,0.3)" />

      {/* Cup shell */}
      <path d="M20 67 L29 150 Q60 159 91 150 L100 67 Q60 59 20 67Z"
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

      {/* Liquid fill */}
      <g clipPath="url(#cupClip)">
        <motion.rect
          x="0" width="120" height="160"
          fill="url(#liq)"
          animate={{ y: fillY }}
          transition={{ duration: 0.9, type: 'spring', stiffness: 60, damping: 18 }}
        />
      </g>

      {/* Pearls */}
      {step !== 'phone' && [
        [36, 140], [48, 144], [60, 146], [72, 143], [84, 139],
        [30, 132], [45, 136], [60, 138], [75, 135], [88, 131],
      ].map(([cx, cy], i) => (
        <motion.circle key={i} cx={cx} cy={cy} r="5" fill="url(#pearl)"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 + i * 0.05, type: 'spring', stiffness: 200 }}
        />
      ))}

      {/* Sheen overlay */}
      <path d="M20 67 L29 150 Q60 159 91 150 L100 67 Q60 59 20 67Z"
        fill="url(#sheen)" />

      {/* Lid rim */}
      <ellipse cx="60" cy="66" rx="41" ry="8"
        fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

      {/* Foam top */}
      <motion.g animate={{ opacity: foamOp }} transition={{ duration: 0.5 }}>
        <ellipse cx="60" cy="70" rx="38" ry="9" fill="url(#foam)" />
        <ellipse cx="46" cy="67" rx="12" ry="7" fill="#FFF5E8" />
        <ellipse cx="74" cy="68" rx="11" ry="6" fill="#FFF0DC" opacity="0.9" />
      </motion.g>

      {/* Bottom shadow */}
      <ellipse cx="60" cy="153" rx="32" ry="5" fill="rgba(0,0,0,0.25)" />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────
// STEP PILL INDICATOR
// ─────────────────────────────────────────────────────────────────
const StepPills: React.FC<{ step: Step }> = ({ step }) => {
  const idx = STEP_INDEX[step];
  return (
    <div className="flex items-center gap-1.5 justify-center">
      {(['phone', 'otp', 'name'] as Step[]).map((s, i) => (
        <motion.div key={s} className="relative overflow-hidden rounded-full"
          animate={{ width: step === s ? 24 : 6, height: 6 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          {i <= idx && (
            <motion.div className="absolute inset-0 rounded-full"
              style={{ background: 'linear-gradient(90deg,#FF3B30,#FF9500)' }}
              initial={{ x: '-100%' }} animate={{ x: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// ANIMATED HEADING — letters drop in from above
// ─────────────────────────────────────────────────────────────────
const AnimHead: React.FC<{ text: string; sub: string }> = ({ text, sub }) => (
  <div className="text-center">
    <div className="overflow-hidden mb-1" style={{ perspective: '400px' }}>
      <motion.h2
        key={text}
        initial={{ opacity: 0, y: 32, rotateX: -60 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        exit={{ opacity: 0, y: -24, rotateX: 40 }}
        transition={{ type: 'spring', stiffness: 130, damping: 18 }}
        className="font-display font-black text-2xl text-white leading-tight"
        style={{ transformOrigin: 'bottom' }}
      >
        {text}
      </motion.h2>
    </div>
    <motion.p
      key={sub}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.08, duration: 0.3 }}
      className="text-xs leading-relaxed"
      style={{ color: 'rgba(200,185,220,0.6)' }}
    >
      {sub}
    </motion.p>
  </div>
);

// ─────────────────────────────────────────────────────────────────
// OTP INPUT — minimal underline style with sliding cursor
// ─────────────────────────────────────────────────────────────────
const OtpInput: React.FC<{ value: string; onChange: (v: string) => void; shake: boolean }> = ({
  value, onChange, shake,
}) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);
  const activeIdx = Math.min(value.length, 5);

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '');
    if (!v) return;
    const nd = [...digits];
    nd[i] = v[v.length - 1];
    onChange(nd.join(''));
    if (i < 5) inputs.current[i + 1]?.focus();
  };
  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      const nd = [...digits];
      if (nd[i]) { nd[i] = ''; onChange(nd.join('')); }
      else if (i > 0) { nd[i - 1] = ''; onChange(nd.join('')); inputs.current[i - 1]?.focus(); }
    }
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) { onChange(pasted); inputs.current[Math.min(pasted.length, 5)]?.focus(); }
    e.preventDefault();
  };

  return (
    <motion.div
      animate={shake ? { x: [-6, 6, -5, 5, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex gap-2 sm:gap-3 justify-center"
    >
      {digits.map((d, i) => (
        <div key={i} className="relative flex flex-col items-center">
          <input
            ref={el => { inputs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleChange(i, e)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="w-9 h-11 sm:w-10 sm:h-12 text-center text-xl sm:text-2xl font-black bg-transparent
              text-white outline-none select-none caret-transparent"
            style={{ fontFamily: '"Courier New", monospace' }}
          />
          {/* Underline */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[1.5px] rounded-full"
            animate={{
              background: i === activeIdx && !d
                ? 'rgba(255,107,32,0.8)'
                : d
                  ? 'linear-gradient(90deg,#FF3B30,#FF9500)'
                  : 'rgba(255,255,255,0.12)',
              scaleX: d ? 1 : i === activeIdx ? 0.85 : 0.6,
            }}
            transition={{ duration: 0.2 }}
          />
          {/* Blink cursor when active + empty */}
          {i === activeIdx && !d && (
            <motion.div
              className="absolute bottom-[2px] w-[1.5px] h-5 rounded-full"
              style={{ background: '#FF6B20' }}
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
            />
          )}
          {/* Digit fill ripple */}
          {d && (
            <motion.div
              key={`filled-${d}-${i}`}
              className="absolute bottom-0 left-0 right-0 h-[1.5px] rounded-full"
              style={{ background: 'linear-gradient(90deg,#FF3B30,#FFD600)', originX: 0 }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          )}
        </div>
      ))}
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────
// STYLED INPUT
// ─────────────────────────────────────────────────────────────────
const LineInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {
  prefix?: React.ReactNode;
}> = ({ prefix, className = '', ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative group">
      <div className={`flex items-center gap-3 px-0 py-3 transition-all ${className}`}
        style={{ borderBottom: `1.5px solid ${focused ? 'rgba(255,107,32,0.7)' : 'rgba(255,255,255,0.12)'}` }}>
        {prefix && <span className="text-sm font-bold shrink-0" style={{ color: '#FF6B20' }}>{prefix}</span>}
        {prefix && <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.12)' }} />}
        <input
          {...props}
          onFocus={e => { setFocused(true); props.onFocus?.(e); }}
          onBlur={e => { setFocused(false); props.onBlur?.(e); }}
          className="flex-1 bg-transparent text-white outline-none text-sm font-bold
            placeholder:font-normal"
          style={{ color: 'white', caretColor: '#FF6B20' }}
        />
      </div>
      {/* animated focus glow line */}
      <motion.div
        className="absolute bottom-0 left-0 h-[1.5px] rounded-full pointer-events-none"
        animate={{ width: focused ? '100%' : '0%', background: 'linear-gradient(90deg,#FF3B30,#FFD600)' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// SUBMIT BUTTON — fills from left on hover
// ─────────────────────────────────────────────────────────────────
const SubmitBtn: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}> = ({ children, onClick, loading = false, disabled = false }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={!disabled && !loading ? onClick : undefined}
      disabled={disabled || loading}
      className="relative w-full h-12 rounded-2xl font-black text-sm overflow-hidden transition-all"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,107,32,0.3)',
        color: disabled ? 'rgba(255,255,255,0.3)' : 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {/* fill bg */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{ background: 'linear-gradient(135deg,#FF3B30 0%,#FF9500 55%,#FFD600 100%)' }}
        animate={{ x: disabled ? '-100%' : hovered && !loading ? '0%' : '-100%' }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* shimmer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.15) 50%, transparent 65%)',
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPositionX: loading ? ['-100%', '200%'] : '-100%' }}
        transition={{ duration: 1.4, repeat: loading ? Infinity : 0, ease: 'easeInOut' }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <motion.span
            className="inline-block w-4 h-4 rounded-full border-[1.5px] border-transparent"
            style={{ borderTopColor: 'white' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        ) : children}
      </span>
    </motion.button>
  );
};

// ─────────────────────────────────────────────────────────────────
// SPINNING GRADIENT BORDER
// ─────────────────────────────────────────────────────────────────
const SpinBorder: React.FC = () => (
  <motion.div
    className="absolute -inset-[1px] rounded-3xl pointer-events-none"
    style={{
      background: 'conic-gradient(from 0deg, #FF3B30, #FF9500, #FFD600, transparent, transparent, #FF3B30)',
      opacity: 0.4,
    }}
    animate={{ rotate: 360 }}
    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
  />
);

// ─────────────────────────────────────────────────────────────────
// BACKGROUND MICRO-ORBS (inside modal)
// ─────────────────────────────────────────────────────────────────
const ModalOrbs: React.FC = () => (
  <>
    <motion.div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
      style={{ background: 'radial-gradient(circle, rgba(255,90,30,0.12) 0%, transparent 70%)' }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full pointer-events-none"
      style={{ background: 'radial-gradient(circle, rgba(140,35,220,0.08) 0%, transparent 70%)' }}
      animate={{ scale: [1, 1.15, 1] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
    />
  </>
);

// ─────────────────────────────────────────────────────────────────
// FLOATING PARTICLES (inside modal)
// ─────────────────────────────────────────────────────────────────
const ModalParticles: React.FC = () => (
  <>
    {[
      { x: '15%', y: '20%', size: 3, color: 'rgba(255,90,30,0.5)', dur: 3.2 },
      { x: '80%', y: '15%', size: 2, color: 'rgba(255,214,0,0.4)', dur: 4.1 },
      { x: '88%', y: '65%', size: 2.5, color: 'rgba(255,90,30,0.3)', dur: 3.8 },
      { x: '10%', y: '75%', size: 2, color: 'rgba(200,80,255,0.3)', dur: 5.0 },
      { x: '50%', y: '8%',  size: 2, color: 'rgba(255,180,60,0.35)', dur: 4.5 },
    ].map((p, i) => (
      <motion.div key={i}
        className="absolute rounded-full pointer-events-none"
        style={{ left: p.x, top: p.y, width: p.size, height: p.size, background: p.color }}
        animate={{ y: [0, -12, 0], opacity: [0.3, 0.8, 0.3], scale: [1, 1.4, 1] }}
        transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
      />
    ))}
  </>
);

// ─────────────────────────────────────────────────────────────────
// AUTH MODAL
// ─────────────────────────────────────────────────────────────────
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep]         = useState<Step>('phone');
  const [phone, setPhone]       = useState('');
  const [otp, setOtp]           = useState('');
  const [name, setName]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpShake, setOtpShake] = useState(false);
  const { setAuth }             = useAuthStore();

  // Trap scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const startResendTimer = () => {
    setResendTimer(30);
    const iv = setInterval(() => setResendTimer(t => {
      if (t <= 1) { clearInterval(iv); return 0; }
      return t - 1;
    }), 1000);
  };

  const handleSendOtp = async () => {
    if (phone.length < 10) return toast.error('Enter a valid 10-digit number');
    setLoading(true);
    try {
      await authService.sendOtp(`+91${phone}`);
      toast.success('OTP sent! 📱');
      setStep('otp');
      startResendTimer();
    } catch {
      toast.success('OTP sent! (dev: 123456)');
      setStep('otp');
      startResendTimer();
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return toast.error('Enter the full 6-digit OTP');
    setLoading(true);
    try {
      const res = await authService.verifyOtp(`+91${phone}`, otp);
      if (res.isNewUser) { setStep('name'); }
      else {
        setAuth(res.user, res.token);
        toast.success(`Welcome back, ${res.user.name}! 🫧`);
        onClose();
      }
    } catch {
      if (otp === '123456') { setStep('name'); }
      else { setOtpShake(true); setTimeout(() => setOtpShake(false), 600); toast.error('Wrong OTP. Try again.'); }
    } finally { setLoading(false); }
  };

  const handleCreateProfile = async () => {
    if (!name.trim()) return toast.error('Please enter your name');
    setLoading(true);
    try {
      const user = await authService.createProfile(name.trim());
      setAuth(user, 'dev-token');
      toast.success(`Welcome to Bobba Bobba, ${name}! 🫧`);
      onClose();
    } catch {
      setAuth(
        { id: '1', name: name.trim(), phone: `+91${phone}`, addresses: [], role: 'user',
          isWhatsAppEnabled: true, totalOrders: 0, totalSpent: 0, memberSince: new Date().toISOString() },
        'dev-token'
      );
      toast.success(`Welcome to Bobba Bobba, ${name}! 🫧`);
      onClose();
    } finally { setLoading(false); }
  };

  const reset = () => { setStep('phone'); setPhone(''); setOtp(''); setName(''); };

  const META: Record<Step, { title: string; sub: string; cta: string; action: () => void; disabled: boolean }> = {
    phone: {
      title: 'Hey there 👋',
      sub: 'Enter your mobile to get started',
      cta: 'Send OTP →',
      action: handleSendOtp,
      disabled: phone.length !== 10,
    },
    otp: {
      title: 'Check your phone',
      sub: `OTP sent to +91 ${phone}`,
      cta: 'Verify →',
      action: handleVerifyOtp,
      disabled: otp.length !== 6,
    },
    name: {
      title: "You're new here!",
      sub: "What should we call you?",
      cta: "Let's Go! 🫧",
      action: handleCreateProfile,
      disabled: !name.trim(),
    },
  };

  const meta = META[step];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ────────────────────────────────────── */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: 'rgba(6,2,14,0.85)',
              backdropFilter: 'blur(16px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={e => { if (e.target === e.currentTarget) { onClose(); reset(); } }}
          >
            {/* Backdrop grain */}
            <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: '160px',
              }}
            />

            {/* ── Card ──────────────────────────────────────── */}
            <motion.div
              key="card"
              className="relative w-full max-w-sm overflow-hidden"
              style={{ borderRadius: 28 }}
              initial={{ opacity: 0, scale: 0.88, y: 32 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28, mass: 0.8 }}
            >
              {/* Spinning border */}
              <div className="absolute inset-0 rounded-[28px] overflow-hidden pointer-events-none z-0">
                <SpinBorder />
              </div>

              {/* Card body */}
              <div
                className="relative z-10 m-[1px] rounded-[27px] overflow-hidden"
                style={{
                  background: `
                    radial-gradient(ellipse 90% 50% at 80% 0%, rgba(255,90,30,0.1) 0%, transparent 55%),
                    radial-gradient(ellipse 60% 70% at 5% 100%, rgba(140,35,220,0.07) 0%, transparent 55%),
                    #0d060f
                  `,
                }}
              >
                <ModalOrbs />
                <ModalParticles />

                {/* ── Top section: cup + step dots ────────── */}
                <div className="relative flex flex-col items-center pt-8 pb-4 px-8">
                  {/* Close button */}
                  <motion.button
                    whileHover={{ scale: 1.15, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { onClose(); reset(); }}
                    className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center z-20 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </motion.button>

                  {/* Animated cup */}
                  <motion.div
                    className="relative"
                    style={{ width: 88, height: 116 }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <CupVisual step={step} />
                    {/* Cup glow */}
                    <motion.div
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
                      style={{ background: 'radial-gradient(ellipse, rgba(255,120,30,0.3), transparent 70%)' }}
                      animate={{ width: [60, 72, 60], height: [12, 16, 12], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </motion.div>

                  <div className="mt-4">
                    <StepPills step={step} />
                  </div>
                </div>

                {/* Divider */}
                <div className="mx-8" style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

                {/* ── Form section ────────────────────────── */}
                <div className="px-8 pt-6 pb-8">
                  <AnimatePresence mode="wait">
                    <motion.div key={`head-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <AnimHead text={meta.title} sub={meta.sub} />
                    </motion.div>
                  </AnimatePresence>

                  <div className="mt-6">
                    <AnimatePresence mode="wait">

                      {/* ── PHONE ─────────────────────────── */}
                      {step === 'phone' && (
                        <motion.div key="phone-form"
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -16 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                          className="space-y-6"
                        >
                          <LineInput
                            prefix="+91"
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="10-digit mobile number"
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                            style={{ '--placeholder-color': 'rgba(180,165,200,0.35)' } as React.CSSProperties}
                          />

                          <SubmitBtn onClick={handleSendOtp} loading={loading} disabled={phone.length !== 10}>
                            Send OTP →
                          </SubmitBtn>

                          <p className="text-center text-[10px]" style={{ color: 'rgba(160,145,180,0.4)' }}>
                            By continuing you agree to our Terms & Privacy Policy
                          </p>
                        </motion.div>
                      )}

                      {/* ── OTP ───────────────────────────── */}
                      {step === 'otp' && (
                        <motion.div key="otp-form"
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -16 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                          className="space-y-6"
                        >
                          <OtpInput value={otp} onChange={setOtp} shake={otpShake} />

                          <SubmitBtn onClick={handleVerifyOtp} loading={loading} disabled={otp.length !== 6}>
                            Verify →
                          </SubmitBtn>

                          <div className="flex items-center justify-between">
                            <motion.button
                              whileHover={{ x: -2 }} onClick={() => { setOtp(''); setStep('phone'); }}
                              className="text-xs font-semibold flex items-center gap-1"
                              style={{ color: 'rgba(180,165,200,0.45)' }}
                            >
                              ← Change number
                            </motion.button>
                            {resendTimer > 0 ? (
                              <span className="text-xs" style={{ color: 'rgba(180,165,200,0.4)' }}>
                                Resend in {resendTimer}s
                              </span>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() => { setOtp(''); handleSendOtp(); }}
                                className="text-xs font-bold"
                                style={{ color: '#FF6B20' }}
                              >
                                Resend OTP
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* ── NAME ──────────────────────────── */}
                      {step === 'name' && (
                        <motion.div key="name-form"
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -16 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                          className="space-y-6"
                        >
                          <LineInput
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Your full name"
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleCreateProfile()}
                          />

                          <SubmitBtn onClick={handleCreateProfile} loading={loading} disabled={!name.trim()}>
                            Let's Go! 🫧
                          </SubmitBtn>
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>
                </div>

                {/* ── Brand footer ────────────────────────── */}
                <motion.div
                  className="flex items-center justify-center gap-2 pb-5 pt-0"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                >
                  <motion.span
                    className="text-lg"
                    animate={{ rotate: [0, 12, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  >🫧</motion.span>
                  <span className="text-[11px] font-black tracking-[0.18em]"
                    style={{
                      background: 'linear-gradient(135deg,#FF3B30,#FF9500,#FFD600)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                    BOBBA BOBBA
                  </span>
                  <motion.span
                    className="text-lg"
                    animate={{ rotate: [0, -12, 8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                  >🫧</motion.span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;





// import React, { useRef, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useAuthStore } from '../../store/authStore';
// import { authService } from '../../services/allServices';
// import { Modal, PrimaryButton, Spinner } from '../ui';
// import toast from 'react-hot-toast';

// type Step = 'phone' | 'otp' | 'name';

// // ─── OTP Input ────────────────────────────────────────────────
// const OtpInput: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
//   const inputs = useRef<(HTMLInputElement | null)[]>([]);
//   const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

//   const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
//     const v = e.target.value.replace(/\D/g, '');
//     if (!v) return;
//     const newDigits = [...digits];
//     newDigits[i] = v[v.length - 1];
//     onChange(newDigits.join(''));
//     if (i < 5) inputs.current[i + 1]?.focus();
//   };

//   const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
//     if (e.key === 'Backspace') {
//       const newDigits = [...digits];
//       newDigits[i] = '';
//       onChange(newDigits.join(''));
//       if (i > 0) inputs.current[i - 1]?.focus();
//     }
//   };

//   return (
//     <div className="flex gap-2 justify-center">
//       {digits.map((d, i) => (
//         <motion.input
//           key={i}
//           ref={(el) => { inputs.current[i] = el; }}
//           type="text"
//           inputMode="numeric"
//           maxLength={1}
//           value={d}
//           onChange={(e) => handleChange(i, e)}
//           onKeyDown={(e) => handleKeyDown(i, e)}
//           className={`w-11 h-12 text-center text-xl font-bold bg-white/10 border rounded-xl
//             text-white outline-none transition-all duration-200
//             ${d ? 'border-primary shadow-glow' : 'border-white/20 focus:border-primary/60'}`}
//           animate={{ scale: d ? 1.05 : 1 }}
//         />
//       ))}
//     </div>
//   );
// };

// // ─── AuthModal ────────────────────────────────────────────────
// interface AuthModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
//   const [step, setStep] = useState<Step>('phone');
//   const [phone, setPhone] = useState('');
//   const [otp, setOtp] = useState('');
//   const [name, setName] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [resendTimer, setResendTimer] = useState(0);
//   const { setAuth } = useAuthStore();

//   const startResendTimer = () => {
//     setResendTimer(30);
//     const iv = setInterval(() => {
//       setResendTimer((t) => {
//         if (t <= 1) { clearInterval(iv); return 0; }
//         return t - 1;
//       });
//     }, 1000);
//   };

//   const handleSendOtp = async () => {
//     if (phone.length < 10) return toast.error('Enter a valid 10-digit mobile number');
//     setLoading(true);
//     try {
//       await authService.sendOtp(`+91${phone}`);
//       toast.success('OTP sent! Check your messages 📱');
//       setStep('otp');
//       startResendTimer();
//     } catch {
//       // Dev fallback: skip OTP if backend not running
//       toast.success('OTP sent! (Dev: use 123456)');
//       setStep('otp');
//       startResendTimer();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyOtp = async () => {
//     if (otp.length < 6) return toast.error('Enter the 6-digit OTP');
//     setLoading(true);
//     try {
//       const res = await authService.verifyOtp(`+91${phone}`, otp);
//       if (res.isNewUser) {
//         setStep('name');
//       } else {
//         setAuth(res.user, res.token);
//         toast.success(`Welcome back, ${res.user.name}! 🫧`);
//         onClose();
//       }
//     } catch {
//       // Dev fallback
//       if (otp === '123456') {
//         setStep('name');
//       } else {
//         toast.error('Invalid OTP. Try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateProfile = async () => {
//     if (!name.trim()) return toast.error('Please enter your name');
//     setLoading(true);
//     try {
//       const user = await authService.createProfile(name.trim());
//       setAuth(user, 'dev-token');
//       toast.success(`Welcome to Bobba Bobba, ${name}! 🫧`);
//       onClose();
//     } catch {
//       // Dev fallback
//       setAuth(
//         { id: '1', name: name.trim(), phone: `+91${phone}`, addresses: [], role: 'user',
//           isWhatsAppEnabled: true, totalOrders: 0, totalSpent: 0, memberSince: new Date().toISOString() },
//         'dev-token'
//       );
//       toast.success(`Welcome to Bobba Bobba, ${name}! 🫧`);
//       onClose();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetModal = () => {
//     setStep('phone'); setPhone(''); setOtp(''); setName('');
//   };

//   return (
//     <Modal isOpen={isOpen} onClose={() => { onClose(); resetModal(); }} size="sm">
//       <div className="p-6">
//         {/* Logo */}
//         <div className="text-center mb-6">
//           <div className="w-16 h-16 bg-bubble-gradient rounded-full flex items-center justify-center mx-auto mb-3 shadow-brand text-3xl">
//             🫧
//           </div>
//           <h2 className="font-display text-2xl font-bold text-white">
//             {step === 'phone' && 'Welcome!'}
//             {step === 'otp' && 'Enter OTP'}
//             {step === 'name' && "What's your name?"}
//           </h2>
//           <p className="text-text-secondary text-sm mt-1">
//             {step === 'phone' && 'Sign in to order your favourite bubble drinks'}
//             {step === 'otp' && `We sent a 6-digit OTP to +91 ${phone}`}
//             {step === 'name' && "Let's create your Bobba profile!"}
//           </p>
//         </div>

//         <AnimatePresence mode="wait">
//           {/* Step 1: Phone */}
//           {step === 'phone' && (
//             <motion.div
//               key="phone"
//               initial={{ opacity: 0, x: 30 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -30 }}
//               className="space-y-4"
//             >
//               <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3
//                 focus-within:border-primary/60 transition-colors">
//                 <span className="text-white font-semibold text-sm shrink-0">+91</span>
//                 <div className="w-px h-5 bg-white/20" />
//                 <input
//                   type="tel"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
//                   placeholder="10-digit mobile number"
//                   className="flex-1 bg-transparent text-white outline-none text-sm placeholder:text-text-secondary"
//                   onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
//                   autoFocus
//                 />
//               </div>
//               <PrimaryButton
//                 className="w-full justify-center"
//                 loading={loading}
//                 onClick={handleSendOtp}
//                 disabled={phone.length !== 10}
//               >
//                 Send OTP →
//               </PrimaryButton>
//             </motion.div>
//           )}

//           {/* Step 2: OTP */}
//           {step === 'otp' && (
//             <motion.div
//               key="otp"
//               initial={{ opacity: 0, x: 30 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -30 }}
//               className="space-y-5"
//             >
//               <OtpInput value={otp} onChange={setOtp} />
//               <PrimaryButton
//                 className="w-full justify-center"
//                 loading={loading}
//                 onClick={handleVerifyOtp}
//                 disabled={otp.length !== 6}
//               >
//                 Verify OTP →
//               </PrimaryButton>
//               <div className="text-center">
//                 {resendTimer > 0 ? (
//                   <p className="text-text-secondary text-xs">Resend OTP in {resendTimer}s</p>
//                 ) : (
//                   <button
//                     onClick={() => { setOtp(''); handleSendOtp(); }}
//                     className="text-primary text-xs font-semibold hover:underline"
//                   >
//                     Resend OTP
//                   </button>
//                 )}
//               </div>
//               <button
//                 onClick={() => setStep('phone')}
//                 className="w-full text-text-secondary text-xs hover:text-white transition-colors"
//               >
//                 ← Change number
//               </button>
//             </motion.div>
//           )}

//           {/* Step 3: Name */}
//           {step === 'name' && (
//             <motion.div
//               key="name"
//               initial={{ opacity: 0, x: 30 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -30 }}
//               className="space-y-4"
//             >
//               <input
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="Your full name"
//                 autoFocus
//                 className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white
//                   outline-none text-sm placeholder:text-text-secondary focus:border-primary/60 transition-colors"
//                 onKeyDown={(e) => e.key === 'Enter' && handleCreateProfile()}
//               />
//               <PrimaryButton
//                 className="w-full justify-center"
//                 loading={loading}
//                 onClick={handleCreateProfile}
//                 disabled={!name.trim()}
//               >
//                 Let's Go! 🫧
//               </PrimaryButton>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </Modal>
//   );
// };

// export default AuthModal;
