import React, { useEffect, useRef, useState } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

const AnimatedCounter: React.FC<{ target: number; suffix?: string; prefix?: string }> = ({
  target, suffix = '', prefix = ''
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 80, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) motionValue.set(target);
  }, [isInView, motionValue, target]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (v) => setDisplay(Math.round(v)));
    return () => unsubscribe();
  }, [springValue]);

  return (
    <span ref={ref}>
      {prefix}{display.toLocaleString('en-IN')}{suffix}
    </span>
  );
};

export const StatsSection: React.FC = () => {
  const stats = [
    { value: 10000, suffix: '+', label: 'Happy Customers', emoji: '😊' },
    { value: 50000, suffix: '+', label: 'Orders Served', emoji: '🧋' },
    { value: 80, suffix: '+', label: 'Menu Items', emoji: '🍴' },
    { value: 15, suffix: 'K+', label: 'Instagram Followers', emoji: '❤️' },
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-primary/5 via-card to-secondary/5 border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(({ value, suffix, label, emoji }) => (
            <div key={label} className="text-center p-6 bg-card/50 rounded-2xl border border-white/10">
              <div className="text-4xl mb-2">{emoji}</div>
              <div className="text-3xl sm:text-4xl font-display font-bold bg-bubble-gradient bg-clip-text text-transparent">
                <AnimatedCounter target={value} suffix={suffix} />
              </div>
              <p className="text-text-secondary text-sm mt-1 font-body">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};