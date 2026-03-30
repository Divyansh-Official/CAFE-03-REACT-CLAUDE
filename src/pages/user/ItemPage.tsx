import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { PrimaryButton, Badge } from '../../components/ui';
import { ImageGallery } from '../../components/menu/MenuComponents';
import { formatCurrency, applyDiscount } from '../../utils/helpers';
import icons from '../../data/icons.json';
import toast from 'react-hot-toast';

const PRICES = [149,179,199,219,249,279,299,329];

const ItemPage: React.FC = () => {
  const { categorySlug = '', itemId = '' } = useParams();
  const navigate = useNavigate();
  const { addItem, openCart } = useCartStore();
  const [selectedSize, setSelectedSize] = useState('500ml');
  const [qty, setQty] = useState(1);

  // Build mock item from params
  const index = parseInt(itemId.split('-item-')[1] ?? '0');
  const basePrice = PRICES[(index + (categorySlug.charCodeAt(0) ?? 0)) % PRICES.length];
  const hasSizes = ['bobba-milk-tea','bobba-milk','bubble-cold-coffee','popping-iced-tea'].includes(categorySlug);
  const sizes = hasSizes
    ? [{ label:'350ml', price: basePrice - 30 }, { label:'500ml', price: basePrice }]
    : undefined;
  const displayPrice = sizes ? sizes.find(s => s.label === selectedSize)?.price ?? basePrice : basePrice;
  const gallery = Array.from({length:5}, (_,k) => `https://picsum.photos/seed/${itemId}${k}/600/600`);

  const handleAdd = () => {
    addItem({
      menuItemId: itemId,
      name: `Item from ${categorySlug}`,
      image: gallery[0],
      size: sizes ? selectedSize : undefined,
      quantity: qty,
      unitPrice: displayPrice,
      isVeg: index % 3 !== 0,
      addOns: [],
    });
    toast.success('Added to cart! 🛒');
    openCart();
  };

  return (
    <div className="min-h-screen pt-20 pb-28">
      {/* Back nav */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 mb-4">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm font-semibold">
          ← Back
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Left: Images */}
          <div>
            <motion.div
              initial={{ opacity:0, scale:0.97 }}
              animate={{ opacity:1, scale:1 }}
              className="aspect-square rounded-2xl overflow-hidden border border-white/10 mb-4"
            >
              <img
                src={gallery[0]}
                alt="Item"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <ImageGallery images={gallery} title="Item" />
          </div>

          {/* Right: Details */}
          <motion.div
            initial={{ opacity:0, x:20 }}
            animate={{ opacity:1, x:0 }}
            transition={{ delay:0.1 }}
            className="flex flex-col gap-5"
          >
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <img src={index % 3 !== 0 ? icons.veg.url : icons.nonveg.url} alt="" className="w-5 h-5" />
              <Badge variant="secondary">🔥 Best Seller</Badge>
              <Badge variant="success">In Stock</Badge>
            </div>

            {/* Name */}
            <div>
              <h1 className="font-display text-3xl font-bold text-white leading-tight mb-2">
                Signature {categorySlug.split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ')} #{index+1}
              </h1>
              <p className="text-text-secondary leading-relaxed">
                A premium creation crafted with hand-picked ingredients. Rich, indulgent, and
                satisfying — made fresh for every order. Perfect for any time of the day.
              </p>
            </div>

            {/* Size selector */}
            {sizes && (
              <div>
                <p className="text-white font-bold text-sm mb-2">Choose Size</p>
                <div className="flex gap-3">
                  {sizes.map(s => (
                    <button key={s.label} onClick={() => setSelectedSize(s.label)}
                      className={`flex-1 py-3 rounded-2xl border text-sm font-bold transition-all duration-200
                        ${selectedSize===s.label
                          ? 'border-primary bg-primary/20 text-primary shadow-brand'
                          : 'border-white/20 bg-card text-text-secondary hover:border-white/40'}`}
                    >
                      {s.label}
                      <div className={`text-xs mt-0.5 ${selectedSize===s.label?'text-primary/80':'text-text-secondary'}`}>
                        {formatCurrency(s.price)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Price */}
            <div className="flex items-center justify-between bg-card rounded-2xl p-4 border border-white/10">
              <div>
                <p className="text-text-secondary text-xs mb-0.5">Price</p>
                <p className="font-display text-2xl font-bold bg-bubble-gradient bg-clip-text text-transparent">
                  {formatCurrency(displayPrice * qty)}
                </p>
                {qty > 1 && (
                  <p className="text-text-secondary text-xs">{formatCurrency(displayPrice)} × {qty}</p>
                )}
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-2 py-1.5">
                <button onClick={() => setQty(q=>Math.max(1,q-1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-primary/40 transition-colors font-bold text-lg">
                  −
                </button>
                <motion.span key={qty} initial={{scale:1.3}} animate={{scale:1}}
                  className="text-white font-bold w-6 text-center">{qty}</motion.span>
                <button onClick={() => setQty(q=>q+1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-primary/40 transition-colors font-bold text-lg">
                  +
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <PrimaryButton size="lg" className="w-full justify-center" onClick={handleAdd}>
              Add to Cart — {formatCurrency(displayPrice * qty)} 🛒
            </PrimaryButton>

            {/* Info pills */}
            <div className="flex gap-2 flex-wrap">
              {['Fresh Daily','No Preservatives','Premium Ingredients','Made to Order'].map(t => (
                <span key={t} className="text-[11px] px-3 py-1 rounded-full bg-white/10 text-text-secondary border border-white/10">
                  ✓ {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ItemPage;