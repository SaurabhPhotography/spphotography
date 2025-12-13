import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { CinematicHero } from '@/components/CinematicHero';
import { AboutSection } from '@/components/AboutSection';
import { PortfolioSection } from '@/components/PortfolioSection';
import { ServicesSection } from '@/components/ServicesSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';

const Index = () => {
  const [showNav, setShowNav] = useState(false);

  return (
    <main className="min-h-screen bg-background">
      <Navigation showNav={showNav} />
      <CinematicHero onAnimationComplete={() => setShowNav(true)} />
      <AboutSection />
      <PortfolioSection />
      <ServicesSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </main>
  );
};

export default Index;
