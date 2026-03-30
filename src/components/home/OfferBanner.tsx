import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { offerService } from '../../services/allServices';
import { useOfferStore } from '../../store/offerStore';
import type { Offer } from '../../types/offer.types';
import icons from '../../data/icons.json';

export const OfferBanner: React.FC = () => {
  const { data: offers } = useQuery({
    queryKey: ['active-offers'],
    queryFn: offerService.getActiveOffers,
    staleTime: 5 * 60 * 1000,
  });
  const setActiveOffers = useOfferStore((s) => s.setActiveOffers);

  useEffect(() => {
    if (offers) setActiveOffers(offers);
  }, [offers, setActiveOffers]);

  if (!offers || offers.length === 0) return null;

  const tiles = [...offers, ...offers];

  return (
    <div className="bg-primary/10 border-y border-primary/20 py-3 overflow-hidden cursor-default">
      <div className="flex animate-marquee gap-6 whitespace-nowrap hover:[animation-play-state:paused]">
        {tiles.map((offer: Offer, i: number) => (
          <div
            key={`${offer.id}-${i}`}
            className="inline-flex items-center gap-3 bg-card rounded-full px-5 py-2 border border-white/10 shrink-0"
          >
            <img src={icons.offer.url} alt="" className="w-4 h-4" />
            <span className="font-bold text-sm text-white">{offer.name}</span>
            <span className="text-secondary font-black text-sm">
              {offer.type === 'percentage' ? `${offer.value}% OFF` : `₹${offer.value} OFF`}
            </span>
            <span className="text-text-secondary text-xs">{offer.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};