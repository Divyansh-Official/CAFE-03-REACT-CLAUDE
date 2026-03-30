import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const MOCK_REVIEWS = [
  { id: '1', name: 'Priya Sharma', rating: 5, text: 'The Matcha Bobba is absolutely divine! Best bubble tea in Chandigarh, hands down. The ambiance is super cool too!', date: '2024-01-15' },
  { id: '2', name: 'Arjun Singh', rating: 5, text: 'Tried the Bingsu and it was mind-blowing. The Korean vibes are on point. Will definitely come back!', date: '2024-01-20' },
  { id: '3', name: 'Mehak Kapoor', rating: 5, text: 'Hungroo momos are to die for! Especially the Afghan Momos. Such a unique combo with bubble tea. Love this place!', date: '2024-02-01' },
  { id: '4', name: 'Rohit Verma', rating: 5, text: 'The Korean Ramen was perfect on a cold night. Staff is so friendly and the place is always buzzing with energy!', date: '2024-02-10' },
  { id: '5', name: 'Simran Kaur', rating: 5, text: "My go-to spot for dates and hangouts! The Popping Sparkling Mojitos are absolutely gorgeous and delicious.", date: '2024-02-18' },
];

export const TestimonialsSection: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="text-center mb-10"
      >
        <h2 className="font-display text-4xl font-bold text-white mb-2">
          What Our <span className="bg-bubble-gradient bg-clip-text text-transparent">Bubblers</span> Say
        </h2>
        <p className="text-text-secondary">Real reviews from real happiness</p>
      </motion.div>

      <Swiper
        modules={[Autoplay]}
        spaceBetween={20}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        loop
        breakpoints={{
          0: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {MOCK_REVIEWS.map((review) => (
          <SwiperSlide key={review.id}>
            <div className="bg-card rounded-2xl p-6 border border-white/10 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-bubble-gradient flex items-center justify-center font-bold text-white text-sm">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{review.name}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <span key={i} className="text-secondary text-xs">★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">"{review.text}"</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};