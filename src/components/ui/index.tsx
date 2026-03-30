import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── PrimaryButton ────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  children, loading, icon, size = 'md', className = '', ...props
}) => {
  const sizeClasses = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-base', lg: 'px-8 py-4 text-lg' };
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center gap-2 rounded-full font-bold bg-bubble-gradient text-white shadow-brand
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${className}`}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {loading ? <Spinner size="sm" /> : icon}
      {children}
    </motion.button>
  );
};

export const SecondaryButton: React.FC<ButtonProps> = ({
  children, loading, icon, size = 'md', className = '', ...props
}) => {
  const sizeClasses = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-base', lg: 'px-8 py-4 text-lg' };
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center gap-2 rounded-full font-bold border-2 border-primary text-primary
        hover:bg-primary hover:text-white transition-all duration-200 ${sizeClasses[size]} ${className}`}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {loading ? <Spinner size="sm" /> : icon}
      {children}
    </motion.button>
  );
};

export const GhostButton: React.FC<ButtonProps> = ({
  children, icon, size = 'md', className = '', ...props
}) => {
  const sizeClasses = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-base', lg: 'px-7 py-3.5 text-lg' };
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center gap-2 rounded-full font-semibold text-text-secondary
        hover:text-white hover:bg-white/10 transition-all duration-200 ${sizeClasses[size]} ${className}`}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {icon}
      {children}
    </motion.button>
  );
};

export const IconButton: React.FC<ButtonProps & { 'aria-label': string }> = ({
  children, className = '', ...props
}) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className={`p-2 rounded-full hover:bg-white/10 transition-colors duration-200 ${className}`}
    {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
  >
    {children}
  </motion.button>
);

// ─── Badge ────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className = '' }) => {
  const variantClasses = {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-black',
    success: 'bg-success text-white',
    warning: 'bg-warning text-black',
    error: 'bg-red-600 text-white',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold
      ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// ─── Spinner ──────────────────────────────────────────────────
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md', className = ''
}) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={`${sizes[size]} border-2 border-white/30 border-t-white rounded-full animate-spin ${className}`} />
  );
};

// ─── Modal ────────────────────────────────────────────────────
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl'
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className={`relative w-full ${sizeClasses[size]} bg-card rounded-2xl shadow-card overflow-hidden`}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {title && (
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h3 className="text-lg font-bold text-white font-display">{title}</h3>
                <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
                  <span className="text-2xl">×</span>
                </button>
              </div>
            )}
            <div className="overflow-y-auto max-h-[80vh]">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Drawer ───────────────────────────────────────────────────
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  side?: 'left' | 'right';
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, children, title, side = 'right' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className={`absolute top-0 ${side === 'right' ? 'right-0' : 'left-0'} h-full w-full max-w-md
              bg-card shadow-2xl flex flex-col`}
            initial={{ x: side === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'right' ? '100%' : '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {title && (
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h3 className="text-lg font-bold text-white font-display">{title}</h3>
                <button onClick={onClose} className="text-text-secondary hover:text-white p-1 rounded-full hover:bg-white/10">
                  <span className="text-2xl leading-none">×</span>
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Tooltip ─────────────────────────────────────────────────
export const Tooltip: React.FC<{ children: React.ReactNode; text: string }> = ({ children, text }) => (
  <div className="relative group inline-flex">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-white text-black
      rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
      {text}
    </div>
  </div>
);

// ─── SkeletonCard ─────────────────────────────────────────────
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-card rounded-2xl overflow-hidden animate-pulse ${className}`}>
    <div className="h-48 bg-white/10" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-white/10 rounded w-3/4" />
      <div className="h-3 bg-white/10 rounded w-1/2" />
      <div className="h-6 bg-white/10 rounded w-1/3" />
    </div>
  </div>
);

// ─── ProgressBar ─────────────────────────────────────────────
interface ProgressBarProps {
  steps: string[];
  currentStep: number;
  icons?: React.ReactNode[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep, icons }) => (
  <div className="w-full">
    <div className="flex items-center justify-between relative">
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/20">
        <motion.div
          className="h-full bg-bubble-gradient"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
      </div>
      {steps.map((step, i) => (
        <div key={step} className="flex flex-col items-center gap-2 z-10">
          <motion.div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
              ${i <= currentStep ? 'bg-bubble-gradient border-primary' : 'bg-card border-white/20'}`}
            animate={{ scale: i === currentStep ? 1.2 : 1 }}
          >
            {icons?.[i] ?? (i < currentStep ? '✓' : i + 1)}
          </motion.div>
          <span className={`text-xs font-medium hidden sm:block ${i <= currentStep ? 'text-white' : 'text-text-secondary'}`}>
            {step}
          </span>
        </div>
      ))}
    </div>
  </div>
);
