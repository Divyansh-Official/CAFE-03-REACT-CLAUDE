import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';

const MOCK_CATEGORIES = [
  { id: '1', slug: 'bobba-milk-tea', name: 'Bobba Milk Tea', emoji: '🧋', itemCount: 5, color: '#FF3B30' },
  { id: '2', slug: 'bingsu-premium-creamy', name: 'Bingsu', emoji: '🍧', itemCount: 8, color: '#FF9500' },
  { id: '3', slug: 'momos', name: 'Momos', emoji: '🥟', itemCount: 12, color: '#FFD600' },
  { id: '4', slug: 'ramen-noodles', name: 'Ramen Noodles', emoji: '🍜', itemCount: 4, color: '#34C759' },
  { id: '5', slug: 'bubble-cold-coffee', name: 'Bubble Coffee', emoji: '☕', itemCount: 6, color: '#FF3B30' },
  { id: '6', slug: 'loaded-fries', name: 'Loaded Fries', emoji: '🍟', itemCount: 6, color: '#FF9500' },
  { id: '7', slug: 'chicken-wings', name: 'Chicken Wings', emoji: '🍗', itemCount: 7, color: '#FFD600' },
  { id: '8', slug: 'shawarma-roll', name: 'Shawarma Roll', emoji: '🌯', itemCount: 5, color: '#FF3B30' },
];

export const FeaturedCategories: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h2 className="font-display text-4xl font-bold text-white mb-2">
          What Are You <span className="bg-bubble-gradient bg-clip-text text-transparent">Craving?</span>
        </h2>
        <p className="text-text-secondary">From bubble teas to momos — we've got it all</p>
      </motion.div>

      <div className="hidden lg:grid lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {MOCK_CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.07, duration: 0.4 }}
          >
            <Link
              to={`/menu/${cat.slug}`}
              className="flex flex-col items-center gap-3 p-4 bg-card rounded-2xl border border-white/10
                hover:border-primary/40 hover:shadow-brand group transition-all duration-300"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg
                  group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: `${cat.color}20` }}
              >
                {cat.emoji}
              </div>
              <div className="text-center">
                <p className="text-white text-xs font-bold leading-tight group-hover:text-primary transition-colors">{cat.name}</p>
                <p className="text-text-secondary text-[10px]">{cat.itemCount} items</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="lg:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
        {MOCK_CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.id}
            className="shrink-0 snap-start"
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.07 }}
          >
            <Link
              to={`/menu/${cat.slug}`}
              className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-white/10 w-28"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${cat.color}20` }}
              >
                {cat.emoji}
              </div>
              <p className="text-white text-xs font-bold text-center leading-tight">{cat.name}</p>
              <p className="text-text-secondary text-[10px]">{cat.itemCount} items</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all duration-200"
        >
          View Full Menu <span>→</span>
        </Link>
      </div>
    </section>
  );
};