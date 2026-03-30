import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, SecondaryButton } from '../ui';
import cafe from '../../data/cafe.json';

const letterVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, type: 'spring', stiffness: 120, damping: 14 },
  }),
};

const AnimatedText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => (
  <span className={`inline-flex overflow-hidden ${className}`} aria-label={text}>
    {text.split('').map((char, i) => (
      <motion.span
        key={i}
        custom={i}
        variants={letterVariants}
        initial="hidden"
        animate="visible"
        className={char === ' ' ? 'mr-3' : ''}
      >
        {char}
      </motion.span>
    ))}
  </span>
);

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-hero-gradient z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,59,48,0.15)_0%,_transparent_60%)] z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,214,0,0.1)_0%,_transparent_60%)] z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-4rem)]">
          {/* Left: Content */}
          <div className="flex flex-col justify-center text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20
                rounded-full px-4 py-2 text-sm font-semibold text-secondary mb-6 self-center lg:self-start"
            >
              <span className="animate-pulse-slow">🫧</span>
              {cafe.tagline}
            </motion.div>

            {/* Heading */}
            <h1 className="font-display font-bold leading-none mb-4">
              <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl bg-bubble-gradient bg-clip-text text-transparent">
                <AnimatedText text="THE COOLEST" />
              </div>
              <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-white mt-1">
                <AnimatedText text="BUBBLE BAR" />
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, type: 'spring' }}
                  className="inline-block ml-2"
                >
                  🫧
                </motion.span>
              </div>
            </h1>

            {/* Subtext */}
            <motion.p
              className="text-text-secondary text-lg sm:text-xl mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              {cafe.description}
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <PrimaryButton size="lg" onClick={() => navigate('/menu')}>
                Explore Menu 🍵
              </PrimaryButton>
              <SecondaryButton size="lg" onClick={() => navigate('/gallery')}>
                View Gallery
              </SecondaryButton>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex gap-8 mt-10 justify-center lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              {[
                { value: '50+', label: 'Menu Items' },
                { value: '10K+', label: 'Happy Customers' },
                { value: '4.8★', label: 'Rating' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-display font-bold bg-bubble-gradient bg-clip-text text-transparent">
                    {value}
                  </div>
                  <div className="text-text-secondary text-xs font-body">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Hero Visual */}
          <motion.div
            className="flex items-center justify-center relative"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
          >
            {/* Glow rings */}
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-primary/10 blur-3xl animate-pulse-slow" />
            <div className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-secondary/10 blur-2xl animate-float" />

            {/* Main bubble visual */}
            <motion.div
              className="relative z-10 flex flex-col items-center"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Big bubble emoji + visual */}
              <div className="text-[180px] sm:text-[240px] leading-none select-none drop-shadow-2xl">
                🧋
              </div>

              {/* Floating bubbles */}
              {[
                { emoji: '🫧', size: 'text-5xl', pos: 'top-0 -left-8', delay: 0 },
                { emoji: '🍓', size: 'text-4xl', pos: 'top-8 -right-6', delay: 0.5 },
                { emoji: '🫧', size: 'text-3xl', pos: 'bottom-8 -left-4', delay: 1 },
                { emoji: '💛', size: 'text-3xl', pos: 'bottom-4 -right-8', delay: 0.3 },
              ].map(({ emoji, size, pos, delay }) => (
                <motion.span
                  key={pos}
                  className={`absolute ${size} ${pos} select-none`}
                  animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3 + delay, repeat: Infinity, delay }}
                >
                  {emoji}
                </motion.span>
              ))}
            </motion.div>

            {/* Info card */}
            <motion.div
              className="absolute bottom-4 left-0 bg-card/80 backdrop-blur-sm border border-white/10 rounded-2xl p-4 shadow-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <span className="text-success text-lg">✓</span>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Open Now</p>
                  <p className="text-text-secondary text-xs">{cafe.openingHours}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <span className="text-xs">Scroll to explore</span>
        <motion.div
          className="w-5 h-8 border-2 border-white/20 rounded-full flex justify-center pt-1.5"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
