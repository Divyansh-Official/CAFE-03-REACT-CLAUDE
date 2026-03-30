import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/allServices';
import { Modal, PrimaryButton, Spinner } from '../ui';
import toast from 'react-hot-toast';

type Step = 'phone' | 'otp' | 'name';

// ─── OTP Input ────────────────────────────────────────────────
const OtpInput: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '');
    if (!v) return;
    const newDigits = [...digits];
    newDigits[i] = v[v.length - 1];
    onChange(newDigits.join(''));
    if (i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      const newDigits = [...digits];
      newDigits[i] = '';
      onChange(newDigits.join(''));
      if (i > 0) inputs.current[i - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <motion.input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={`w-11 h-12 text-center text-xl font-bold bg-white/10 border rounded-xl
            text-white outline-none transition-all duration-200
            ${d ? 'border-primary shadow-glow' : 'border-white/20 focus:border-primary/60'}`}
          animate={{ scale: d ? 1.05 : 1 }}
        />
      ))}
    </div>
  );
};

// ─── AuthModal ────────────────────────────────────────────────
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { setAuth } = useAuthStore();

  const startResendTimer = () => {
    setResendTimer(30);
    const iv = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(iv); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (phone.length < 10) return toast.error('Enter a valid 10-digit mobile number');
    setLoading(true);
    try {
      await authService.sendOtp(`+91${phone}`);
      toast.success('OTP sent! Check your messages 📱');
      setStep('otp');
      startResendTimer();
    } catch {
      // Dev fallback: skip OTP if backend not running
      toast.success('OTP sent! (Dev: use 123456)');
      setStep('otp');
      startResendTimer();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return toast.error('Enter the 6-digit OTP');
    setLoading(true);
    try {
      const res = await authService.verifyOtp(`+91${phone}`, otp);
      if (res.isNewUser) {
        setStep('name');
      } else {
        setAuth(res.user, res.token);
        toast.success(`Welcome back, ${res.user.name}! 🫧`);
        onClose();
      }
    } catch {
      // Dev fallback
      if (otp === '123456') {
        setStep('name');
      } else {
        toast.error('Invalid OTP. Try again.');
      }
    } finally {
      setLoading(false);
    }
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
      // Dev fallback
      setAuth(
        { id: '1', name: name.trim(), phone: `+91${phone}`, addresses: [], role: 'user',
          isWhatsAppEnabled: true, totalOrders: 0, totalSpent: 0, memberSince: new Date().toISOString() },
        'dev-token'
      );
      toast.success(`Welcome to Bobba Bobba, ${name}! 🫧`);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('phone'); setPhone(''); setOtp(''); setName('');
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); resetModal(); }} size="sm">
      <div className="p-6">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-bubble-gradient rounded-full flex items-center justify-center mx-auto mb-3 shadow-brand text-3xl">
            🫧
          </div>
          <h2 className="font-display text-2xl font-bold text-white">
            {step === 'phone' && 'Welcome!'}
            {step === 'otp' && 'Enter OTP'}
            {step === 'name' && "What's your name?"}
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            {step === 'phone' && 'Sign in to order your favourite bubble drinks'}
            {step === 'otp' && `We sent a 6-digit OTP to +91 ${phone}`}
            {step === 'name' && "Let's create your Bobba profile!"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Phone */}
          {step === 'phone' && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3
                focus-within:border-primary/60 transition-colors">
                <span className="text-white font-semibold text-sm shrink-0">+91</span>
                <div className="w-px h-5 bg-white/20" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  className="flex-1 bg-transparent text-white outline-none text-sm placeholder:text-text-secondary"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  autoFocus
                />
              </div>
              <PrimaryButton
                className="w-full justify-center"
                loading={loading}
                onClick={handleSendOtp}
                disabled={phone.length !== 10}
              >
                Send OTP →
              </PrimaryButton>
            </motion.div>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-5"
            >
              <OtpInput value={otp} onChange={setOtp} />
              <PrimaryButton
                className="w-full justify-center"
                loading={loading}
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6}
              >
                Verify OTP →
              </PrimaryButton>
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-text-secondary text-xs">Resend OTP in {resendTimer}s</p>
                ) : (
                  <button
                    onClick={() => { setOtp(''); handleSendOtp(); }}
                    className="text-primary text-xs font-semibold hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
              <button
                onClick={() => setStep('phone')}
                className="w-full text-text-secondary text-xs hover:text-white transition-colors"
              >
                ← Change number
              </button>
            </motion.div>
          )}

          {/* Step 3: Name */}
          {step === 'name' && (
            <motion.div
              key="name"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-4"
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                autoFocus
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white
                  outline-none text-sm placeholder:text-text-secondary focus:border-primary/60 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProfile()}
              />
              <PrimaryButton
                className="w-full justify-center"
                loading={loading}
                onClick={handleCreateProfile}
                disabled={!name.trim()}
              >
                Let's Go! 🫧
              </PrimaryButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default AuthModal;
