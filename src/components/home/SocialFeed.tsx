import React from 'react';
import { motion } from 'framer-motion';
import icons from '../../data/icons.json';
import cafe from '../../data/cafe.json';

export const SocialFeed: React.FC = () => {
  const PLACEHOLDER_POSTS = Array.from({ length: 9 }, (_, i) => ({
    id: String(i),
    imageUrl: `https://picsum.photos/seed/bobba${i}/400/400`,
    caption: 'Fresh Bobba goodness! 🫧🧋 #BobbaBobba #BubbleTea #Chandigarh',
    likes: 120 + i * 43,
    timestamp: new Date(Date.now() - i * 86400000).toISOString(),
    permalink: cafe.social.instagram,
  }));

  return (
    <section className="py-16 bg-accent/30 border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <img src={icons.instagram.url} alt="" className="w-7 h-7" />
            <h2 className="font-display text-[clamp(1.5rem,5vw,2.25rem)] font-bold text-white">
              @bobbabobbaofficial
            </h2>
          </div>
          <p className="text-text-secondary">Follow us for daily bubble bliss</p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {PLACEHOLDER_POSTS.slice(0, 9).map((post, i) => (
            <motion.a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square overflow-hidden rounded-xl group block"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <img
                src={post.imageUrl}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                <div className="text-white font-bold">❤️ {post.likes}</div>
                <img src={icons.instagram.url} alt="" className="w-8 h-8 opacity-80" />
              </div>
            </motion.a>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href={cafe.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-bold hover:opacity-90 transition-opacity"
          >
            <img src={icons.instagram.url} alt="" className="w-5 h-5" />
            Follow on Instagram
          </a>
        </div>
      </div>
    </section>
  );
};