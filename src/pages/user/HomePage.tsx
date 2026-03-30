import React from 'react';
import { HeroSection } from '../../components/home/HeroSection';
import {
  OfferBanner,
  FeaturedCategories,
  StatsSection,
  TestimonialsSection,
  SocialFeed,
  MapSection,
} from '../../components/home/HomeComponents';

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
