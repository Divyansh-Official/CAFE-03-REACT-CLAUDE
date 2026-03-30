import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FilterBar, MenuItemCard } from '../../components/menu/MenuComponents';
import type { MenuItem } from '../../types/menu.types';
import icons from '../../data/icons.json';
import { debounce } from '../../utils/helpers';

// ─── Full Menu Data ────────────────────────────────────────────
const ALL_CATEGORIES = [
  {
    id: 'c1', slug: 'bobba-milk-tea', name: 'Bobba Milk Tea', emoji: '🧋',
    description: 'Classic milk teas with bouncy tapioca pearls',
    items: ['French Vanilla', 'Royal Thai', 'Green Melon', 'Japanese Matcha', 'Strawberry Matcha'],
    isVeg: true, color: '#FF3B30',
  },
  {
    id: 'c2', slug: 'bobba-milk', name: 'Bobba Milk', emoji: '🥛',
    description: 'Creamy milk-based bubble drinks',
    items: ['Tiger Milk', 'Taiwanese Taro', 'Korean Raspberry Milk', 'Banana Caramel', 'Cold Chocolate'],
    isVeg: true, color: '#FF9500',
  },
  {
    id: 'c3', slug: 'bobba-milkshake', name: 'Bobba Milkshake', emoji: '🍓',
    description: 'Thick, indulgent milkshakes with bubble toppings',
    items: ['Mrs. Blueberry', 'Mango Loves Raspberry', "O'Cookie Biscoff", 'Chocolate Caramel Cream Cheese', 'Strawberry Cream Cheese'],
    isVeg: true, color: '#FFD600',
  },
  {
    id: 'c4', slug: 'popping-iced-tea', name: 'Popping Iced Tea', emoji: '🫧',
    description: 'Refreshing iced teas with popping boba',
    items: ['Lemon Mint', 'Blueberry', 'Peach & Passion', 'King Mango', 'Melon Mania', 'Bobba Blast'],
    isVeg: true, color: '#34C759',
  },
  {
    id: 'c5', slug: 'bubble-cold-coffee', name: 'Bubble Cold Coffee', emoji: '☕',
    description: 'Icy cold coffees with a bubbling twist',
    items: ['Classic', 'Japanese Okinawa', 'Hazelnut', 'Vietnamese', 'Dalgona', 'Chocolate Dalgona'],
    isVeg: true, color: '#6B4226',
  },
  {
    id: 'c6', slug: 'hot-dalgona-coffee', name: 'Hot Dalgona Coffee', emoji: '🔥',
    description: 'Warm and comforting whipped coffees',
    items: ['Classic', 'Caramel', 'Vanilla', 'Hazelnut'],
    isVeg: true, color: '#FF9500',
  },
  {
    id: 'c7', slug: 'popping-sparkling-mojitos', name: 'Popping Sparkling Mojitos', emoji: '🍹',
    description: 'Fizzy, colourful mocktails with popping candy',
    items: ['Shades of Blue', 'Tropical Cooler', 'Love Forever', 'Bloody Orange', 'All Green'],
    isVeg: true, color: '#00BFFF',
  },
  {
    id: 'c8', slug: 'popping-slushies', name: 'Popping Slushies', emoji: '🧊',
    description: 'Icy slushies loaded with popping boba',
    items: ['Blueberry', 'Mango', 'Raspberry', 'Green Apple', 'Strawberry', 'Passion Fruit'],
    isVeg: true, color: '#9B59B6',
  },
  {
    id: 'c9', slug: 'bingsu-sorbet', name: 'Bingsu (Sorbet Style)', emoji: '🍧',
    description: 'Korean shaved ice in fruity sorbet flavours',
    items: ['Jamun Magic', 'Pink Guava', 'Blackberry', 'Watermelon', 'Orange', 'Pomegranate', 'Green Apple', 'Mix Berry'],
    isVeg: true, color: '#E91E63',
  },
  {
    id: 'c10', slug: 'bingsu-premium-creamy', name: 'Bingsu (Premium Creamy)', emoji: '🍨',
    description: 'Luxurious creamy Korean bingsu',
    items: ['Mango Magic', 'Blueberry Blast', 'Strawberry Cream', 'Fruit Cocktail', 'Caramel Banana', 'Hazelnut Coffee', 'Choco Brownie', 'Biscoff Cream Cheese'],
    isVeg: true, color: '#FF6B9D',
  },
  {
    id: 'c11', slug: 'bingsu-asian', name: 'Bingsu (Asian)', emoji: '🍵',
    description: 'Authentic Asian-flavoured bingsu creations',
    items: ['Taro Cream Cheese', 'Tiger Milk Cream Cheese', 'Matcha Strawberry Cream Cheese', 'Thai Tea Cream Cheese'],
    isVeg: true, color: '#4CAF50',
  },
  {
    id: 'c12', slug: 'mini-churros', name: 'Mini Churros', emoji: '🍩',
    description: 'Crispy, golden mini churros',
    items: ['Classic Sugar', 'Cinnamon Sugar'],
    isVeg: true, color: '#FF9800',
  },
  {
    id: 'c13', slug: 'glazed-churro-loops', name: 'Glazed Churro Loops', emoji: '🎡',
    description: 'Fun loopy churros with gourmet glazes',
    items: ['White Almond', 'Rainbow', 'Oreo', 'Biscoff Crunch', 'Choco Caramel'],
    isVeg: true, color: '#FFD600',
  },
  {
    id: 'c14', slug: 'bubble-ice-cream-float', name: 'Bubble Ice Cream Float', emoji: '🍦',
    description: 'Dreamy ice cream floats with bubble toppings',
    items: ['Thai Tea Float', 'Taro Float', 'Mango Float', 'Okinawa Coffee Float', 'Mango Berry Float', 'Chocolate Oreo Float', 'Biscoff Float'],
    isVeg: true, color: '#FF3B30',
  },
  {
    id: 'c15', slug: 'ice-cream-sundaes', name: 'Ice Cream Sundaes', emoji: '🍨',
    description: 'Delectable sundaes in unique Korean-inspired flavours',
    items: ['Soft Serve', 'Okinawa Delight', 'Chocolate Blast', 'Strawberry Cheese Cream', 'Mango Cheese Cream'],
    isVeg: true, color: '#FF9500',
  },
  {
    id: 'c16', slug: 'holland-fries', name: 'Holland Fries', emoji: '🍟',
    description: 'Crispy Dutch-style fries',
    items: ['Classic Salted', 'Cream & Onion', 'Peri Peri', 'Spanish Tomato'],
    isVeg: true, color: '#FFD600',
  },
  {
    id: 'c17', slug: 'ramen-noodles', name: 'Ramen Noodles', emoji: '🍜',
    description: 'Korean-style ramen bowls — veg & non-veg',
    items: ['Korean Carbonara (Veg)', 'Korean Carbonara (Non-Veg)', 'Korean Kimchi (Veg)', 'Korean Kimchi (Non-Veg)', 'Cheese & Corn (Veg)', 'Hot & Spicy (Veg)'],
    isVeg: false, color: '#FF3B30',
  },
  {
    id: 'c18', slug: 'hot-dogs', name: 'Hot Dogs', emoji: '🌭',
    description: 'American-style loaded hot dogs',
    items: ['American Dog', 'Pickle Dog', 'Smoky BBQ Dog', 'Loaded Cheese Dog', 'Cheesy Schezwan Dog', 'Mexican Nacho Dog'],
    isVeg: false, color: '#FF9500',
  },
  // Hungroo Section
  {
    id: 'c19', slug: 'momos', name: 'Momos', emoji: '🥟',
    description: 'Hungroo\'s legendary momos in 10+ styles',
    items: ['Steamed', 'Fried', 'Manchurian', 'Crunchy Kurkure', 'Creamy', 'Chilli', 'Makhani', 'Honey BBQ', 'Cheese Chilli'],
    isVeg: false, color: '#E91E63',
  },
  {
    id: 'c20', slug: 'hungroo-special-momos', name: 'Hungroo Special Momos', emoji: '⭐',
    description: 'Premium signature momo creations',
    items: ['Angry Momos', 'Afghan Momos', 'Maggi Masala', 'Melted Cheese', 'Cheesy Kurkure'],
    isVeg: false, color: '#FF3B30',
  },
  {
    id: 'c21', slug: 'chicken-wings', name: 'Chicken Wings', emoji: '🍗',
    description: 'Juicy wings in irresistible flavours',
    items: ['Fried', 'Peri Peri', 'Kurkure', 'Honey BBQ', 'Makhni', 'Gravy', 'Cheese Chilli'],
    isVeg: false, color: '#FF9500',
  },
  {
    id: 'c22', slug: 'shawarma-roll', name: 'Shawarma Roll', emoji: '🌯',
    description: 'Loaded rolls bursting with flavour',
    items: ['Fried Chicken', 'Cheese', 'Crunchy Kurkure', 'Seekh Kebab Roll', 'Crunchy Cheese Seekh'],
    isVeg: false, color: '#FF3B30',
  },
  {
    id: 'c23', slug: 'loaded-fries', name: 'Loaded Fries', emoji: '🍟',
    description: 'Next-level fries loaded with sauces and toppings',
    items: ['Smoke BBQ Cheese', 'Peri Peri Honey Cheese', 'Mustard Mayo', 'Chipotle', 'Cheese Overload', 'Hungroo Special Shwarma Cheese'],
    isVeg: false, color: '#FFD600',
  },
  {
    id: 'c24', slug: 'ufo-burgers', name: 'UFO Burgers with Fries', emoji: '🍔',
    description: 'Galaxy-sized gourmet burgers with fries',
    items: ['Mr. BBBQQQQQ', 'Mustard Bomb', 'Chipotle Hecho Mexicana', 'Ultimate Shwarma & Salam Cheese'],
    isVeg: false, color: '#FF9500',
  },
  {
    id: 'c25', slug: 'pasta', name: 'Pasta', emoji: '🍝',
    description: 'Creamy and saucy pasta bowls',
    items: ['White Sauce', 'Red Sauce', 'Makhni', 'Cheese n\' Chilli', 'Shwarma', 'Veg', 'Paneer', 'Chicken'],
    isVeg: false, color: '#FF3B30',
  },
];

// Build mock menu items from categories
const buildMockItems = (): MenuItem[] => {
  const items: MenuItem[] = [];
  const prices = [149, 179, 199, 219, 249, 279, 299, 329];
  ALL_CATEGORIES.forEach((cat) => {
    cat.items.forEach((name, j) => {
      items.push({
        id: `${cat.id}-item-${j}`,
        categoryId: cat.id,
        categorySlug: cat.slug,
        name,
        description: `${name} — a signature ${cat.name} creation, crafted with premium ingredients.`,
        image: `https://picsum.photos/seed/${cat.id}${j}/400/300`,
        gallery: [],
        isVeg: cat.isVeg || j % 3 !== 0,
        isBestSeller: j < 2,
        isAvailable: true,
        basePrice: prices[(j + cat.id.charCodeAt(1)) % prices.length],
        sizes: ['bobba-milk-tea', 'bobba-milk', 'bubble-cold-coffee', 'popping-iced-tea'].includes(cat.slug)
          ? [{ label: '350ml', price: prices[(j + 1) % prices.length] - 30 }, { label: '500ml', price: prices[(j + 1) % prices.length] }]
          : undefined,
        tags: j < 2 ? ['bestseller'] : [],
        offerId: undefined,
      });
    });
  });
  return items;
};

const ALL_ITEMS = buildMockItems();

const MenuPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const debouncedSetSearch = useMemo(() => debounce((v: string) => setDebouncedSearch(v), 300), []);

  const filteredCategories = useMemo(() => {
    if (!debouncedSearch && filter === 'all') return ALL_CATEGORIES;
    return ALL_CATEGORIES.filter((cat) => {
      if (filter === 'veg' && !cat.isVeg) return false;
      if (filter === 'nonveg' && cat.isVeg) return false;
      if (debouncedSearch) {
        return cat.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          cat.items.some((i) => i.toLowerCase().includes(debouncedSearch.toLowerCase()));
      }
      return true;
    });
  }, [debouncedSearch, filter]);

  const featuredItems = useMemo(() =>
    ALL_ITEMS.filter((i) => i.isBestSeller).slice(0, 8),
  []);

  return (
    <div className="pt-20 pb-24 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-accent to-surface py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-2">
              Our <span className="bg-bubble-gradient bg-clip-text text-transparent">Menu</span>
            </h1>
            <p className="text-text-secondary">From bubble teas to burgers — explore {ALL_ITEMS.length}+ items</p>
          </motion.div>

          {/* Search */}
          <div className="max-w-xl mx-auto relative mb-6">
            <img src={icons.search.url} alt="" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
            <input
              type="text"
              placeholder="Search drinks, food, flavours..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); debouncedSetSearch(e.target.value); }}
              className="w-full bg-card border border-white/20 rounded-full py-3 pl-12 pr-5 text-white
                outline-none focus:border-primary/60 transition-colors text-sm placeholder:text-text-secondary"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setDebouncedSearch(''); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white"
              >
                ×
              </button>
            )}
          </div>

          {/* Filters */}
          <FilterBar active={filter} onChange={setFilter} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Items */}
        {!debouncedSearch && filter === 'all' && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl font-bold text-white">🔥 Best Sellers</h2>
              <Link to="/menu/bobba-milk-tea" className="text-primary text-sm font-bold hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredItems.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Category Grid */}
        <div>
          <h2 className="font-display text-2xl font-bold text-white mb-5">
            {debouncedSearch ? `Results for "${debouncedSearch}"` : 'All Categories'}
          </h2>

          {filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-text-secondary">No results found for "{debouncedSearch}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredCategories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/menu/${cat.slug}`}
                    className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-white/10
                      hover:border-primary/40 hover:shadow-brand transition-all duration-300 group"
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0
                        group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      {cat.emoji}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-sm truncate group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-text-secondary text-xs mt-0.5 truncate">{cat.description}</p>
                      <p className="text-secondary text-xs font-bold mt-1">{cat.items.length} items</p>
                    </div>
                    <span className="text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0">→</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
