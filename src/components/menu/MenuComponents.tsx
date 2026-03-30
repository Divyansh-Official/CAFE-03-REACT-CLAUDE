import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { MenuItem, MenuCategory } from '../../types/menu.types';
import { useCartStore } from '../../store/cartStore';
import { useOfferStore } from '../../store/offerStore';
import { Badge, PrimaryButton } from '../ui';
import { formatCurrency, applyDiscount } from '../../utils/helpers';
import icons from '../../data/icons.json';
import toast from 'react-hot-toast';

// ─── MenuItemCard ─────────────────────────────────────────────
interface MenuItemCardProps {
  item: MenuItem;
  onDetailClick?: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onDetailClick }) => {
  const { addItem } = useCartStore();
  const { getOfferForItem } = useOfferStore();
  const offer = getOfferForItem(item.id);
  const [adding, setAdding] = useState(false);
  const [count, setCount] = useState(0);

  const displayPrice = offer
    ? applyDiscount(item.basePrice, offer.type, offer.value)
    : item.basePrice;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdding(true);
    setCount((c) => c + 1);
    addItem({
      menuItemId: item.id,
      name: item.name,
      image: item.image || `https://picsum.photos/seed/${item.id}/400/300`,
      quantity: 1,
      unitPrice: displayPrice,
      isVeg: item.isVeg,
      addOns: [],
    });
    toast.success(`${item.name} added to cart! 🛒`, { duration: 1500 });
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="bg-card rounded-2xl overflow-hidden border border-white/10 hover:border-primary/30
        hover:shadow-brand transition-all duration-300 cursor-pointer group"
      onClick={() => onDetailClick?.(item)}
    >
      {/* Image */}
      <div className="relative overflow-hidden h-44 sm:h-48">
        <img
          src={item.image || `https://picsum.photos/seed/${item.id}/400/300`}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <img
            src={item.isVeg ? icons.veg.url : icons.nonveg.url}
            alt={item.isVeg ? 'Veg' : 'Non-Veg'}
            className="w-5 h-5"
            title={item.isVeg ? 'Veg' : 'Non-Veg'}
          />
          {item.isBestSeller && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">🔥 Best</Badge>
          )}
        </div>
        {offer && (
          <div className="absolute top-2 right-2">
            <Badge variant="primary" className="text-[10px]">
              {offer.type === 'percentage' ? `${offer.value}% OFF` : `₹${offer.value} OFF`}
            </Badge>
          </div>
        )}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-white text-sm leading-tight mb-1 line-clamp-1">{item.name}</h3>
        {item.description && (
          <p className="text-text-secondary text-xs leading-snug mb-3 line-clamp-2">{item.description}</p>
        )}

        {/* Sizes */}
        {item.sizes && item.sizes.length > 0 && (
          <div className="flex gap-1 mb-3 flex-wrap">
            {item.sizes.map((s) => (
              <span key={s.label} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-text-secondary border border-white/10">
                {s.label} — {formatCurrency(s.price)}
              </span>
            ))}
          </div>
        )}

        {/* Price + Add button */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-white font-bold text-base">{formatCurrency(displayPrice)}</span>
            {offer && (
              <span className="text-text-secondary text-xs line-through ml-1.5">
                {formatCurrency(item.basePrice)}
              </span>
            )}
          </div>

          {item.isAvailable && (
            <motion.button
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary text-white text-xs font-bold
                hover:bg-primary/90 active:scale-95 transition-all"
              whileTap={{ scale: 0.92 }}
              disabled={adding}
            >
              <AnimatePresence mode="wait">
                {count > 0 ? (
                  <motion.span
                    key="count"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 bg-white text-primary rounded-full text-[10px] flex items-center justify-center font-black"
                  >
                    {count}
                  </motion.span>
                ) : null}
              </AnimatePresence>
              + Add
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── CategoryCard ─────────────────────────────────────────────
interface CategoryCardProps {
  category: MenuCategory;
  hasOffer?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, hasOffer }) => (
  <Link to={`/menu/${category.slug}`}>
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 hover:border-primary/40
        hover:shadow-brand transition-all duration-300 cursor-pointer group h-48 sm:h-56"
    >
      {/* Background image */}
      <img
        src={category.image || `https://picsum.photos/seed/${category.slug}/600/400`}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Offer badge */}
      {hasOffer && (
        <div className="absolute top-3 right-3">
          <Badge variant="primary">OFFER</Badge>
        </div>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-display font-bold text-white text-lg leading-tight">{category.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-text-secondary text-xs">{category.itemCount} items</span>
          <span className="text-primary text-xs font-bold group-hover:translate-x-1 transition-transform duration-200">
            Explore →
          </span>
        </div>
      </div>
    </motion.div>
  </Link>
);

// ─── FilterBar ────────────────────────────────────────────────
interface FilterBarProps {
  active: string;
  onChange: (filter: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ active, onChange }) => {
  const filters = [
    { key: 'all', label: 'All', emoji: '🍴' },
    { key: 'veg', label: 'Veg', emoji: '🥦' },
    { key: 'nonveg', label: 'Non-Veg', emoji: '🍗' },
    { key: 'bestseller', label: 'Best Sellers', emoji: '🔥' },
    { key: 'offer', label: 'Offers', emoji: '🏷️' },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((f) => (
        <motion.button
          key={f.key}
          onClick={() => onChange(f.key)}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap
            border transition-all duration-200 shrink-0
            ${active === f.key
              ? 'bg-primary text-white border-primary shadow-brand'
              : 'bg-card text-text-secondary border-white/10 hover:border-primary/40 hover:text-white'
            }`}
        >
          <span>{f.emoji}</span>
          {f.label}
        </motion.button>
      ))}
    </div>
  );
};

// ─── OfferTag ─────────────────────────────────────────────────
export const OfferTag: React.FC<{ type: string; value: number }> = ({ type, value }) => (
  <span className="inline-flex items-center gap-1 bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full border border-primary/30">
    🏷️ {type === 'percentage' ? `${value}% OFF` : `₹${value} OFF`}
  </span>
);

// ─── ImageGallery ─────────────────────────────────────────────
export const ImageGallery: React.FC<{ images: string[]; title?: string }> = ({ images, title }) => {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((img, i) => (
          <motion.button
            key={i}
            className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border border-white/10
              hover:border-primary/40 transition-colors"
            whileHover={{ scale: 1.04 }}
            onClick={() => setLightboxIdx(i)}
          >
            <img src={img} alt={`${title} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIdx(null)}
          >
            <button
              className="absolute top-4 right-4 text-white text-3xl hover:text-primary"
              onClick={() => setLightboxIdx(null)}
            >×</button>
            <button
              className="absolute left-4 text-white text-4xl hover:text-primary"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => Math.max(0, (i ?? 0) - 1)); }}
            >‹</button>
            <motion.img
              key={lightboxIdx}
              src={images[lightboxIdx]}
              alt="Gallery"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute right-4 text-white text-4xl hover:text-primary"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => Math.min(images.length - 1, (i ?? 0) + 1)); }}
            >›</button>
            <div className="absolute bottom-4 text-text-secondary text-sm">
              {lightboxIdx + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
