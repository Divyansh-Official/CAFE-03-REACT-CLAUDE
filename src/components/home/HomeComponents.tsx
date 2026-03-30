import React from 'react';
import { OfferBanner } from './OfferBanner';
import { FeaturedCategories } from './FeaturedCategories';
import { StatsSection } from './StatsSection';
import { TestimonialsSection } from './TestimonialsSection';
import { SocialFeed } from './SocialFeed';
import { MapSection } from './MapSection';

const HomeComponents: React.FC = () => {
  return (
    <>
      <OfferBanner />
      <FeaturedCategories />
      <StatsSection />
      <TestimonialsSection />
      <SocialFeed />
      <MapSection />
    </>
  );
};

export default HomeComponents;





// import React, { useEffect, useRef, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
// import { useQuery } from '@tanstack/react-query';
// import { offerService, socialService } from '../../services/allServices';
// import { useOfferStore } from '../../store/offerStore';
// import type { Offer } from '../../types/offer.types';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Autoplay } from 'swiper/modules';
// import 'swiper/css';
// import icons from '../../data/icons.json';
// import cafe from '../../data/cafe.json';

// // ─── OfferBanner ──────────────────────────────────────────────
// export const OfferBanner: React.FC = () => {
//   const { data: offers } = useQuery({
//     queryKey: ['active-offers'],
//     queryFn: offerService.getActiveOffers,
//     staleTime: 5 * 60 * 1000,
//   });
//   const setActiveOffers = useOfferStore((s) => s.setActiveOffers);

//   useEffect(() => {
//     if (offers) setActiveOffers(offers);
//   }, [offers, setActiveOffers]);

//   if (!offers || offers.length === 0) return null;

//   const tiles = [...offers, ...offers]; // duplicate for seamless loop

//   return (
//     <div className="bg-primary/10 border-y border-primary/20 py-3 overflow-hidden cursor-default">
//       <div className="flex animate-marquee gap-6 whitespace-nowrap hover:[animation-play-state:paused]">
//         {tiles.map((offer: Offer, i: number) => (
//           <div
//             key={`${offer.id}-${i}`}
//             className="inline-flex items-center gap-3 bg-card rounded-full px-5 py-2 border border-white/10 shrink-0"
//           >
//             <img src={icons.offer.url} alt="" className="w-4 h-4" />
//             <span className="font-bold text-sm text-white">{offer.name}</span>
//             <span className="text-secondary font-black text-sm">
//               {offer.type === 'percentage' ? `${offer.value}% OFF` : `₹${offer.value} OFF`}
//             </span>
//             <span className="text-text-secondary text-xs">{offer.description}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // ─── FeaturedCategories ───────────────────────────────────────
// const MOCK_CATEGORIES = [
//   { id: '1', slug: 'bobba-milk-tea', name: 'Bobba Milk Tea', emoji: '🧋', itemCount: 5, color: '#FF3B30' },
//   { id: '2', slug: 'bingsu-premium-creamy', name: 'Bingsu', emoji: '🍧', itemCount: 8, color: '#FF9500' },
//   { id: '3', slug: 'momos', name: 'Momos', emoji: '🥟', itemCount: 12, color: '#FFD600' },
//   { id: '4', slug: 'ramen-noodles', name: 'Ramen Noodles', emoji: '🍜', itemCount: 4, color: '#34C759' },
//   { id: '5', slug: 'bubble-cold-coffee', name: 'Bubble Coffee', emoji: '☕', itemCount: 6, color: '#FF3B30' },
//   { id: '6', slug: 'loaded-fries', name: 'Loaded Fries', emoji: '🍟', itemCount: 6, color: '#FF9500' },
//   { id: '7', slug: 'chicken-wings', name: 'Chicken Wings', emoji: '🍗', itemCount: 7, color: '#FFD600' },
//   { id: '8', slug: 'shawarma-roll', name: 'Shawarma Roll', emoji: '🌯', itemCount: 5, color: '#FF3B30' },
// ];

// export const FeaturedCategories: React.FC = () => {
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true, margin: '-80px' });

//   return (
//     <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
//       <motion.div
//         ref={ref}
//         initial={{ opacity: 0, y: 30 }}
//         animate={isInView ? { opacity: 1, y: 0 } : {}}
//         transition={{ duration: 0.5 }}
//         className="text-center mb-10"
//       >
//         <h2 className="font-display text-4xl font-bold text-white mb-2">
//           What Are You <span className="bg-bubble-gradient bg-clip-text text-transparent">Craving?</span>
//         </h2>
//         <p className="text-text-secondary">From bubble teas to momos — we've got it all</p>
//       </motion.div>

//       {/* Scrollable row on mobile, grid on desktop */}
//       <div className="hidden lg:grid lg:grid-cols-4 xl:grid-cols-8 gap-4">
//         {MOCK_CATEGORIES.map((cat, i) => (
//           <motion.div
//             key={cat.id}
//             initial={{ opacity: 0, y: 20 }}
//             animate={isInView ? { opacity: 1, y: 0 } : {}}
//             transition={{ delay: i * 0.07, duration: 0.4 }}
//           >
//             <Link
//               to={`/menu/${cat.slug}`}
//               className="flex flex-col items-center gap-3 p-4 bg-card rounded-2xl border border-white/10
//                 hover:border-primary/40 hover:shadow-brand group transition-all duration-300"
//             >
//               <div
//                 className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg
//                   group-hover:scale-110 transition-transform duration-300"
//                 style={{ backgroundColor: `${cat.color}20` }}
//               >
//                 {cat.emoji}
//               </div>
//               <div className="text-center">
//                 <p className="text-white text-xs font-bold leading-tight group-hover:text-primary transition-colors">{cat.name}</p>
//                 <p className="text-text-secondary text-[10px]">{cat.itemCount} items</p>
//               </div>
//             </Link>
//           </motion.div>
//         ))}
//       </div>

//       {/* Mobile horizontal scroll */}
//       <div className="lg:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
//         {MOCK_CATEGORIES.map((cat, i) => (
//           <motion.div
//             key={cat.id}
//             className="shrink-0 snap-start"
//             initial={{ opacity: 0, x: 20 }}
//             animate={isInView ? { opacity: 1, x: 0 } : {}}
//             transition={{ delay: i * 0.07 }}
//           >
//             <Link
//               to={`/menu/${cat.slug}`}
//               className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-white/10 w-28"
//             >
//               <div
//                 className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
//                 style={{ backgroundColor: `${cat.color}20` }}
//               >
//                 {cat.emoji}
//               </div>
//               <p className="text-white text-xs font-bold text-center leading-tight">{cat.name}</p>
//               <p className="text-text-secondary text-[10px]">{cat.itemCount} items</p>
//             </Link>
//           </motion.div>
//         ))}
//       </div>

//       <div className="text-center mt-8">
//         <Link
//           to="/menu"
//           className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all duration-200"
//         >
//           View Full Menu <span>→</span>
//         </Link>
//       </div>
//     </section>
//   );
// };

// // ─── StatsSection ─────────────────────────────────────────────
// const AnimatedCounter: React.FC<{ target: number; suffix?: string; prefix?: string }> = ({
//   target, suffix = '', prefix = ''
// }) => {
//   const ref = useRef<HTMLSpanElement>(null);
//   const isInView = useInView(ref, { once: true });
//   const motionValue = useMotionValue(0);
//   const springValue = useSpring(motionValue, { stiffness: 80, damping: 20 });
//   const [display, setDisplay] = useState(0);

//   useEffect(() => {
//     if (isInView) motionValue.set(target);
//   }, [isInView, motionValue, target]);

//   useEffect(() => {
//     springValue.on('change', (v) => setDisplay(Math.round(v)));
//   }, [springValue]);

//   return (
//     <span ref={ref}>
//       {prefix}{display.toLocaleString('en-IN')}{suffix}
//     </span>
//   );
// };

// export const StatsSection: React.FC = () => {
//   const stats = [
//     { value: 10000, suffix: '+', label: 'Happy Customers', emoji: '😊' },
//     { value: 50000, suffix: '+', label: 'Orders Served', emoji: '🧋' },
//     { value: 80, suffix: '+', label: 'Menu Items', emoji: '🍴' },
//     { value: 15, suffix: 'K+', label: 'Instagram Followers', emoji: '❤️' },
//   ];

//   return (
//     <section className="py-16 bg-gradient-to-r from-primary/5 via-card to-secondary/5 border-y border-white/10">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
//           {stats.map(({ value, suffix, label, emoji }) => (
//             <div key={label} className="text-center p-6 bg-card/50 rounded-2xl border border-white/10">
//               <div className="text-4xl mb-2">{emoji}</div>
//               <div className="text-3xl sm:text-4xl font-display font-bold bg-bubble-gradient bg-clip-text text-transparent">
//                 <AnimatedCounter target={value} suffix={suffix} />
//               </div>
//               <p className="text-text-secondary text-sm mt-1 font-body">{label}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// // ─── TestimonialsSection ──────────────────────────────────────
// const MOCK_REVIEWS = [
//   { id: '1', name: 'Priya Sharma', rating: 5, text: 'The Matcha Bobba is absolutely divine! Best bubble tea in Chandigarh, hands down. The ambiance is super cool too!', date: '2024-01-15' },
//   { id: '2', name: 'Arjun Singh', rating: 5, text: 'Tried the Bingsu and it was mind-blowing. The Korean vibes are on point. Will definitely come back!', date: '2024-01-20' },
//   { id: '3', name: 'Mehak Kapoor', rating: 5, text: 'Hungroo momos are to die for! Especially the Afghan Momos. Such a unique combo with bubble tea. Love this place!', date: '2024-02-01' },
//   { id: '4', name: 'Rohit Verma', rating: 5, text: 'The Korean Ramen was perfect on a cold night. Staff is so friendly and the place is always buzzing with energy!', date: '2024-02-10' },
//   { id: '5', name: 'Simran Kaur', rating: 5, text: "My go-to spot for dates and hangouts! The Popping Sparkling Mojitos are absolutely gorgeous and delicious.", date: '2024-02-18' },
// ];

// export const TestimonialsSection: React.FC = () => {
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true });

//   return (
//     <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" ref={ref}>
//       <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         animate={isInView ? { opacity: 1, y: 0 } : {}}
//         className="text-center mb-10"
//       >
//         <h2 className="font-display text-4xl font-bold text-white mb-2">
//           What Our <span className="bg-bubble-gradient bg-clip-text text-transparent">Bubblers</span> Say
//         </h2>
//         <p className="text-text-secondary">Real reviews from real happiness</p>
//       </motion.div>

//       <Swiper
//         modules={[Autoplay]}
//         spaceBetween={20}
//         autoplay={{ delay: 3500, disableOnInteraction: false }}
//         loop
//         breakpoints={{
//           0: { slidesPerView: 1 },
//           640: { slidesPerView: 2 },
//           1024: { slidesPerView: 3 },
//         }}
//       >
//         {MOCK_REVIEWS.map((review) => (
//           <SwiperSlide key={review.id}>
//             <div className="bg-card rounded-2xl p-6 border border-white/10 h-full">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="w-10 h-10 rounded-full bg-bubble-gradient flex items-center justify-center font-bold text-white text-sm">
//                   {review.name.charAt(0)}
//                 </div>
//                 <div>
//                   <p className="text-white font-bold text-sm">{review.name}</p>
//                   <div className="flex gap-0.5">
//                     {Array.from({ length: review.rating }).map((_, i) => (
//                       <span key={i} className="text-secondary text-xs">★</span>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//               <p className="text-text-secondary text-sm leading-relaxed">"{review.text}"</p>
//             </div>
//           </SwiperSlide>
//         ))}
//       </Swiper>
//     </section>
//   );
// };

// // ─── SocialFeed ───────────────────────────────────────────────
// export const SocialFeed: React.FC = () => {
//   const PLACEHOLDER_POSTS = Array.from({ length: 9 }, (_, i) => ({
//     id: String(i),
//     imageUrl: `https://picsum.photos/seed/bobba${i}/400/400`,
//     caption: 'Fresh Bobba goodness! 🫧🧋 #BobbaBobba #BubbleTea #Chandigarh',
//     likes: 120 + i * 43,
//     timestamp: new Date(Date.now() - i * 86400000).toISOString(),
//     permalink: cafe.social.instagram,
//   }));

//   return (
//     <section className="py-16 bg-accent/30 border-y border-white/10">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center mb-10">
//           <div className="inline-flex items-center gap-2 mb-3">
//             <img src={icons.instagram.url} alt="" className="w-7 h-7" />
//            <h2 className="font-display text-[clamp(1.5rem,5vw,2.25rem)] font-bold text-white">@bobbabobbaofficial</h2>
//           </div>
//           <p className="text-text-secondary">Follow us for daily bubble bliss</p>
//         </div>

//         <div className="grid grid-cols-3 gap-2 sm:gap-3">
//           {PLACEHOLDER_POSTS.slice(0, 9).map((post, i) => (
//             <motion.a
//               key={post.id}
//               href={post.permalink}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="relative aspect-square overflow-hidden rounded-xl group block"
//               initial={{ opacity: 0, scale: 0.9 }}
//               whileInView={{ opacity: 1, scale: 1 }}
//               viewport={{ once: true }}
//               transition={{ delay: i * 0.05 }}
//               whileHover={{ scale: 1.02 }}
//             >
//               <img
//                 src={post.imageUrl}
//                 alt={post.caption}
//                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                 loading="lazy"
//               />
//               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300
//                 flex flex-col items-center justify-center gap-2">
//                 <div className="text-white font-bold">❤️ {post.likes}</div>
//                 <img src={icons.instagram.url} alt="" className="w-8 h-8 opacity-80" />
//               </div>
//             </motion.a>
//           ))}
//         </div>

//         <div className="text-center mt-8">
//           <a
//             href={cafe.social.instagram}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400
//               text-white font-bold hover:opacity-90 transition-opacity"
//           >
//             <img src={icons.instagram.url} alt="" className="w-5 h-5" />
//             Follow on Instagram
//           </a>
//         </div>
//       </div>
//     </section>
//   );
// };

// // ─── MapSection ───────────────────────────────────────────────
// export const MapSection: React.FC = () => (
//   <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
//     <div className="text-center mb-10">
//       <h2 className="font-display text-4xl font-bold text-white mb-2">
//         Find <span className="bg-bubble-gradient bg-clip-text text-transparent">Us Here</span>
//       </h2>
//       <p className="text-text-secondary">Come visit us at Patel Market, Chandigarh</p>
//     </div>
//     <div className="grid lg:grid-cols-2 gap-8 items-center">
//       {/* Map placeholder (real Leaflet map in MapSection.tsx) */}
//       <div className="bg-card rounded-2xl overflow-hidden border border-white/10 h-64 sm:h-80 relative">
//         <iframe
//           src={`https://www.openstreetmap.org/export/embed.html?bbox=76.77${cafe.coordinates.lng},${cafe.coordinates.lat},76.79,30.74&layer=mapnik&marker=${cafe.coordinates.lat},${cafe.coordinates.lng}`}
//           className="w-full h-full"
//           title="Bobba Bobba Location"
//           loading="lazy"
//         />
//         <div className="absolute inset-0 pointer-events-none border-2 border-primary/20 rounded-2xl" />
//       </div>
//       {/* Info */}
//       <div className="space-y-5">
//         <div className="bg-card rounded-2xl p-6 border border-white/10">
//           <div className="flex items-start gap-3 mb-4">
//             <span className="text-3xl">📍</span>
//             <div>
//               <p className="font-bold text-white mb-1">Our Location</p>
//               <p className="text-text-secondary text-sm">{cafe.address}</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3 mb-4">
//             <span className="text-2xl">🕐</span>
//             <div>
//               <p className="font-bold text-white mb-0.5">Opening Hours</p>
//               <p className="text-text-secondary text-sm">{cafe.openingHours}, All Days</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <span className="text-2xl">📞</span>
//             <div>
//               <p className="font-bold text-white mb-0.5">Call / WhatsApp</p>
//               <a href={`tel:${cafe.phone}`} className="text-primary font-semibold">{cafe.phone}</a>
//             </div>
//           </div>
//         </div>
//         <a
//           href={cafe.googleMapsUrl}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-bubble-gradient
//             text-white font-bold hover:opacity-90 transition-opacity shadow-brand"
//         >
//           📍 Get Directions on Google Maps
//         </a>
//       </div>
//     </div>
//   </section>
// );
