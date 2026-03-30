import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import cafe from '../../data/cafe.json';
import icons from '../../data/icons.json';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-accent border-t border-white/10 pt-12 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-bubble-gradient flex items-center justify-center shadow-brand">
                <span className="text-2xl">🫧</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold bg-bubble-gradient bg-clip-text text-transparent">
                  Bobba Bobba & Hungroo
                </h3>
                <p className="text-text-secondary text-xs">{cafe.tagline}</p>
              </div>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs mb-5">
              {cafe.description}. Come visit us or order online — happiness delivered in a cup!
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {[
                { href: cafe.social.instagram, icon: icons.instagram.url, label: 'Instagram' },
                { href: cafe.social.facebook, icon: icons.facebook.url, label: 'Facebook' },
                { href: cafe.social.zomato, icon: icons.zomato.url, label: 'Zomato' },
                { href: cafe.social.whatsapp, icon: icons.whatsapp.url, label: 'WhatsApp' },
              ].map(({ href, icon, label }) =>
                href ? (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    aria-label={label}
                  >
                    <img src={icon} alt={label} className="w-5 h-5" />
                  </motion.a>
                ) : null
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                ['/menu', 'Full Menu'],
                ['/menu/bobba-milk-tea', 'Bobba Drinks'],
                ['/menu/momos', 'Hungroo Momos'],
                ['/menu/bingsu-premium-creamy', 'Bingsu'],
                ['/gallery', 'Gallery'],
                ['/orders', 'Track Order'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-text-secondary text-sm hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-white mb-4">Find Us</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <img src={icons.location.url} alt="" className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-text-secondary text-sm leading-snug">{cafe.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <img src={icons.phone.url} alt="" className="w-4 h-4 shrink-0" />
                <a href={`tel:${cafe.phone}`} className="text-text-secondary text-sm hover:text-primary transition-colors">
                  {cafe.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <img src={icons.time.url} alt="" className="w-4 h-4 shrink-0" />
                <p className="text-text-secondary text-sm">{cafe.openingHours}</p>
              </div>
              <a
                href={`mailto:${cafe.email}`}
                className="block text-text-secondary text-sm hover:text-primary transition-colors truncate"
              >
                {cafe.email}
              </a>
            </div>

            {/* Order Platforms */}
            <div className="mt-4">
              <p className="text-text-secondary text-xs mb-2">Order online:</p>
              <div className="flex gap-2">
                {cafe.social.zomato && (
                  <a
                    href={cafe.social.zomato}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-colors"
                  >
                    Zomato
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-secondary text-xs">
            © {year} Bobba Bobba & Hungroo. All rights reserved.
          </p>
          <p className="text-text-secondary text-xs">
            Crafted with 🫧 in Chandigarh
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
