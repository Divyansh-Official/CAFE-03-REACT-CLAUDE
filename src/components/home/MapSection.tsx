import React from 'react';
import cafe from '../../data/cafe.json';

export const MapSection: React.FC = () => (
  <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <div className="text-center mb-10">
      <h2 className="font-display text-4xl font-bold text-white mb-2">
        Find <span className="bg-bubble-gradient bg-clip-text text-transparent">Us Here</span>
      </h2>
      <p className="text-text-secondary">Come visit us at Patel Market, Chandigarh</p>
    </div>
    <div className="grid lg:grid-cols-2 gap-8 items-center">
      <div className="bg-card rounded-2xl overflow-hidden border border-white/10 h-64 sm:h-80 relative">
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=76.77,30.72,76.79,30.74&layer=mapnik&marker=${cafe.coordinates.lat},${cafe.coordinates.lng}`}
          className="w-full h-full"
          title="Bobba Bobba Location"
          loading="lazy"
        />
        <div className="absolute inset-0 pointer-events-none border-2 border-primary/20 rounded-2xl" />
      </div>

      <div className="space-y-5">
        <div className="bg-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">📍</span>
            <div>
              <p className="font-bold text-white mb-1">Our Location</p>
              <p className="text-text-secondary text-sm">{cafe.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🕐</span>
            <div>
              <p className="font-bold text-white mb-0.5">Opening Hours</p>
              <p className="text-text-secondary text-sm">{cafe.openingHours}, All Days</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">📞</span>
            <div>
              <p className="font-bold text-white mb-0.5">Call / WhatsApp</p>
              <a href={`tel:${cafe.phone}`} className="text-primary font-semibold">{cafe.phone}</a>
            </div>
          </div>
        </div>

        <a
          href={cafe.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-bubble-gradient text-white font-bold hover:opacity-90 transition-opacity shadow-brand"
        >
          📍 Get Directions on Google Maps
        </a>
      </div>
    </div>
  </section>
);