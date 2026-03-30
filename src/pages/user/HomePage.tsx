import React from 'react';
import { HeroSection } from '../../components/home/HeroSection';
import { OfferBanner } from '../../components/home/OfferBanner';
import { FeaturedCategories } from '../../components/home/FeaturedCategories';
import { StatsSection } from '../../components/home/StatsSection';
import { TestimonialsSection } from '../../components/home/TestimonialsSection';
import { SocialFeed } from '../../components/home/SocialFeed';
import { MapSection } from '../../components/home/MapSection';


const HomePage: React.FC = () => {
  return (
    <div className="relative">
      <HeroSection />
      <OfferBanner />
      <FeaturedCategories />
      <StatsSection />
      <TestimonialsSection />
      <SocialFeed />
      <MapSection />
    </div>
  );
};

export default HomePage;
