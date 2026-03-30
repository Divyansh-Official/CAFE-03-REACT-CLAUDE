import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItemCard } from '../../components/menu/MenuComponents';
import type { MenuItem } from '../../types/menu.types';
import { useCartStore } from '../../store/cartStore';
import { PrimaryButton, Modal, Badge } from '../../components/ui';
import { formatCurrency } from '../../utils/helpers';
import icons from '../../data/icons.json';
import toast from 'react-hot-toast';

// Re-use the same data definition (in production this comes from API)
const CATEGORY_DATA: Record<string, {
  name: string; emoji: string; description: string; color: string; isVeg: boolean;
  items: string[];
}> = {
  'bobba-milk-tea': { name: 'Bobba Milk Tea', emoji: '🧋', description: 'Classic milk teas with bouncy tapioca pearls', color: '#FF3B30', isVeg: true, items: ['French Vanilla', 'Royal Thai', 'Green Melon', 'Japanese Matcha', 'Strawberry Matcha'] },
  'bobba-milk': { name: 'Bobba Milk', emoji: '🥛', description: 'Creamy milk-based bubble drinks', color: '#FF9500', isVeg: true, items: ['Tiger Milk', 'Taiwanese Taro', 'Korean Raspberry Milk', 'Banana Caramel', 'Cold Chocolate'] },
  'bobba-milkshake': { name: 'Bobba Milkshake', emoji: '🍓', description: 'Thick, indulgent milkshakes with bubble toppings', color: '#FFD600', isVeg: true, items: ["Mrs. Blueberry", "Mango Loves Raspberry", "O'Cookie Biscoff", "Chocolate Caramel Cream Cheese", "Strawberry Cream Cheese"] },
  'popping-iced-tea': { name: 'Popping Iced Tea', emoji: '🫧', description: 'Refreshing iced teas with popping boba', color: '#34C759', isVeg: true, items: ['Lemon Mint', 'Blueberry', 'Peach & Passion', 'King Mango', 'Melon Mania', 'Bobba Blast'] },
  'bubble-cold-coffee': { name: 'Bubble Cold Coffee', emoji: '☕', description: 'Icy cold coffees with a bubbling twist', color: '#6B4226', isVeg: true, items: ['Classic', 'Japanese Okinawa', 'Hazelnut', 'Vietnamese', 'Dalgona', 'Chocolate Dalgona'] },
  'hot-dalgona-coffee': { name: 'Hot Dalgona Coffee', emoji: '🔥', description: 'Warm whipped coffees', color: '#FF9500', isVeg: true, items: ['Classic', 'Caramel', 'Vanilla', 'Hazelnut'] },
  'popping-sparkling-mojitos': { name: 'Popping Sparkling Mojitos', emoji: '🍹', description: 'Fizzy colourful mocktails', color: '#00BFFF', isVeg: true, items: ['Shades of Blue', 'Tropical Cooler', 'Love Forever', 'Bloody Orange', 'All Green'] },
  'popping-slushies': { name: 'Popping Slushies', emoji: '🧊', description: 'Icy slushies loaded with popping boba', color: '#9B59B6', isVeg: true, items: ['Blueberry', 'Mango', 'Raspberry', 'Green Apple', 'Strawberry', 'Passion Fruit'] },
  'bingsu-sorbet': { name: 'Bingsu (Sorbet Style)', emoji: '🍧', description: 'Korean shaved ice in fruity sorbet flavours', color: '#E91E63', isVeg: true, items: ['Jamun Magic', 'Pink Guava', 'Blackberry', 'Watermelon', 'Orange', 'Pomegranate', 'Green Apple', 'Mix Berry'] },
  'bingsu-premium-creamy': { name: 'Bingsu (Premium Creamy)', emoji: '🍨', description: 'Luxurious creamy Korean bingsu', color: '#FF6B9D', isVeg: true, items: ['Mango Magic', 'Blueberry Blast', 'Strawberry Cream', 'Fruit Cocktail', 'Caramel Banana', 'Hazelnut Coffee', 'Choco Brownie', 'Biscoff Cream Cheese'] },
  'bingsu-asian': { name: 'Bingsu (Asian)', emoji: '🍵', description: 'Authentic Asian-flavoured bingsu', color: '#4CAF50', isVeg: true, items: ['Taro Cream Cheese', 'Tiger Milk Cream Cheese', 'Matcha Strawberry Cream Cheese', 'Thai Tea Cream Cheese'] },
  'mini-churros': { name: 'Mini Churros', emoji: '🍩', description: 'Crispy golden mini churros', color: '#FF9800', isVeg: true, items: ['Classic Sugar', 'Cinnamon Sugar'] },
  'glazed-churro-loops': { name: 'Glazed Churro Loops', emoji: '🎡', description: 'Fun loopy churros with gourmet glazes', color: '#FFD600', isVeg: true, items: ['White Almond', 'Rainbow', 'Oreo', 'Biscoff Crunch', 'Choco Caramel'] },
  'bubble-ice-cream-float': { name: 'Bubble Ice Cream Float', emoji: '🍦', description: 'Dreamy ice cream floats', color: '#FF3B30', isVeg: true, items: ['Thai Tea Float', 'Taro Float', 'Mango Float', 'Okinawa Coffee Float', 'Mango Berry Float', 'Chocolate Oreo Float', 'Biscoff Float'] },
  'ice-cream-sundaes': { name: 'Ice Cream Sundaes', emoji: '🍨', description: 'Delectable sundaes in Korean-inspired flavours', color: '#FF9500', isVeg: true, items: ['Soft Serve', 'Okinawa Delight', 'Chocolate Blast', 'Strawberry Cheese Cream', 'Mango Cheese Cream'] },
  'holland-fries': { name: 'Holland Fries', emoji: '🍟', description: 'Crispy Dutch-style fries', color: '#FFD600', isVeg: true, items: ['Classic Salted', 'Cream & Onion', 'Peri Peri', 'Spanish Tomato'] },
  'ramen-noodles': { name: 'Ramen Noodles', emoji: '🍜', description: 'Korean-style ramen bowls', color: '#FF3B30', isVeg: false, items: ['Korean Carbonara (Veg)', 'Korean Carbonara (Non-Veg)', 'Korean Kimchi (Veg)', 'Korean Kimchi (Non-Veg)', 'Cheese & Corn (Veg)', 'Hot & Spicy (Veg)'] },
  'hot-dogs': { name: 'Hot Dogs', emoji: '🌭', description: 'American-style loaded hot dogs', color: '#FF9500', isVeg: false, items: ['American Dog', 'Pickle Dog', 'Smoky BBQ Dog', 'Loaded Cheese Dog', 'Cheesy Schezwan Dog', 'Mexican Nacho Dog'] },
  'momos': { name: 'Momos', emoji: '🥟', description: "Hungroo's legendary momos", color: '#E91E63', isVeg: false, items: ['Steamed', 'Fried', 'Manchurian', 'Crunchy Kurkure', 'Creamy', 'Chilli', 'Makhani', 'Honey BBQ', 'Cheese Chilli'] },
  'hungroo-special-momos': { name: 'Hungroo Special Momos', emoji: '⭐', description: 'Premium signature momo creations', color: '#FF3B30', isVeg: false, items: ['Angry Momos', 'Afghan Momos', 'Maggi Masala', 'Melted Cheese', 'Cheesy Kurkure'] },
  'chicken-wings': { name: 'Chicken Wings', emoji: '🍗', description: 'Juicy wings in irresistible flavours', color: '#FF9500', isVeg: false, items: ['Fried', 'Peri Peri', 'Kurkure', 'Honey BBQ', 'Makhni', 'Gravy', 'Cheese Chilli'] },
  'shawarma-roll': { name: 'Shawarma Roll', emoji: '🌯', description: 'Loaded rolls bursting with flavour', color: '#FF3B30', isVeg: false, items: ['Fried Chicken', 'Cheese', 'Crunchy Kurkure', 'Seekh Kebab Roll', 'Crunchy Cheese Seekh'] },
  'loaded-fries': { name: 'Loaded Fries', emoji: '🍟', description: 'Next-level fries with toppings', color: '#FFD600', isVeg: false, items: ['Smoke BBQ Cheese', 'Peri Peri Honey Cheese', 'Mustard Mayo', 'Chipotle', 'Cheese Overload', 'Hungroo Special Shwarma Cheese'] },
  'ufo-burgers': { name: 'UFO Burgers with Fries', emoji: '🍔', description: 'Galaxy-sized gourmet burgers', color: '#FF9500', isVeg: false, items: ['Mr. BBBQQQQQ', 'Mustard Bomb', 'Chipotle Hecho Mexicana', 'Ultimate Shwarma & Salam Cheese'] },
  'pasta': { name: 'Pasta', emoji: '🍝', description: 'Creamy and saucy pasta bowls', color: '#FF3B30', isVeg: false, items: ['White Sauce', 'Red Sauce', 'Makhni', "Cheese n' Chilli", 'Shwarma', 'Veg', 'Paneer', 'Chicken'] },
};

const PRICES = [149, 179, 199, 219, 249, 279, 299, 329];
const hasSizes = (slug: string) => ['bobba-milk-tea', 'bobba-milk', 'bubble-cold-coffee', 'popping-iced-tea'].includes(slug);

// ─── Item Detail Modal ────────────────────────────────────────
const ItemDetailModal: React.FC<{
  item: MenuItem | null;
  onClose: () => void;
  categorySlug: string;
}> = ({ item, onClose, categorySlug }) => {
  const { addItem } = useCartStore();
  const [selectedSize, setSelectedSize] = useState<string>('500ml');
  const [qty, setQty] = useState(1);

  if (!item) return null;

  const price = item.sizes
    ? item.sizes.find((s) => s.label === selectedSize)?.price ?? item.basePrice
    : item.basePrice;

  const handleAdd = () => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      image: item.image,
      size: item.sizes ? selectedSize : undefined,
      quantity: qty,
      unitPrice: price,
      isVeg: item.isVeg,
      addOns: [],
    });
    toast.success(`${item.name} added to cart! 🛒`);
    onClose();
  };

  return (
    <Modal isOpen={!!item} onClose={onClose} size="md">
      <div>
        <div className="relative h-56 sm:h-64 overflow-hidden">
          <img
            src={item.image || `https://picsum.photos/seed/${item.id}/600/400`}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <img src={item.isVeg ? icons.veg.url : icons.nonveg.url} alt="" className="w-6 h-6" />
            {item.isBestSeller && <Badge variant="secondary">🔥 Best Seller</Badge>}
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-display text-2xl font-bold text-white mb-1">{item.name}</h3>
          <p className="text-text-secondary text-sm mb-4">{item.description}</p>

          {/* Size selector */}
          {item.sizes && item.sizes.length > 0 && (
            <div className="mb-4">
              <p className="text-white font-semibold text-sm mb-2">Choose Size</p>
              <div className="flex gap-2">
                {item.sizes.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setSelectedSize(s.label)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-sm font-semibold transition-all
                      ${selectedSize === s.label
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-white/20 text-text-secondary hover:border-white/40'
                      }`}
                  >
                    {s.label}<br />
                    <span className="text-xs font-bold">{formatCurrency(s.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty selector */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-white font-semibold text-sm">Quantity</p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-full px-2 py-1">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-primary/50 transition-colors font-bold"
              >
                −
              </button>
              <span className="text-white font-bold w-6 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-primary/50 transition-colors font-bold"
              >
                +
              </button>
            </div>
          </div>

          <PrimaryButton className="w-full justify-center" onClick={handleAdd} size="lg">
            Add to Cart — {formatCurrency(price * qty)}
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
};

// ─── CategoryPage ─────────────────────────────────────────────
const CategoryPage: React.FC = () => {
  const { categorySlug = '' } = useParams();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const category = CATEGORY_DATA[categorySlug];

  const items: MenuItem[] = useMemo(() => {
    if (!category) return [];
    return category.items.map((name, j) => ({
      id: `${categorySlug}-item-${j}`,
      categoryId: categorySlug,
      categorySlug,
      name,
      description: `${name} — a signature ${category.name} creation, crafted with premium ingredients.`,
      image: `https://picsum.photos/seed/${categorySlug}${j}/400/300`,
      gallery: Array.from({ length: 4 }, (_, k) => `https://picsum.photos/seed/${categorySlug}${j}${k}/400/300`),
      isVeg: category.isVeg || j % 3 !== 0,
      isBestSeller: j < 2,
      isAvailable: true,
      basePrice: PRICES[(j + categorySlug.charCodeAt(0)) % PRICES.length],
      sizes: hasSizes(categorySlug)
        ? [{ label: '350ml', price: PRICES[j % PRICES.length] - 30 }, { label: '500ml', price: PRICES[j % PRICES.length] }]
        : undefined,
      tags: j < 2 ? ['bestseller'] : [],
    }));
  }, [category, categorySlug]);

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="font-display text-2xl font-bold text-white mb-2">Category not found</h2>
        <button onClick={() => navigate('/menu')} className="text-primary font-bold mt-4">← Back to Menu</button>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-24 min-h-screen">
      {/* Hero Banner */}
      <div
        className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${category.color}15, #0F0F1A)` }}
      >
        <div className="max-w-7xl mx-auto">
          <Link to="/menu" className="inline-flex items-center gap-2 text-text-secondary hover:text-white text-sm mb-6 transition-colors">
            ← Back to Menu
          </Link>
          <div className="flex items-center gap-5">
            <motion.div
              className="text-6xl sm:text-8xl"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {category.emoji}
            </motion.div>
            <div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-white">{category.name}</h1>
              <p className="text-text-secondary mt-1">{category.description}</p>
              <p className="text-secondary font-bold text-sm mt-2">{items.length} items available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <MenuItemCard item={item} onDetailClick={setSelectedItem} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} categorySlug={categorySlug} />
    </div>
  );
};

export default CategoryPage;
