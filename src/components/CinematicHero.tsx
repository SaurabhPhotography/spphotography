import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import weddingHero from '@/assets/wedding-hero.jpg';

interface CinematicHeroProps {
  onAnimationComplete: () => void;
}

export const CinematicHero = ({ onAnimationComplete }: CinematicHeroProps) => {
  const [phase, setPhase] = useState<'camera' | 'zoom' | 'reveal' | 'shrink' | 'complete'>('camera');

  useEffect(() => {
    const timeline = [
      { phase: 'zoom' as const, delay: 1000 },
      { phase: 'reveal' as const, delay: 3500 },
      { phase: 'shrink' as const, delay: 5000 },
      { phase: 'complete' as const, delay: 6500 },
    ];

    const timeouts = timeline.map(({ phase, delay }) =>
      setTimeout(() => setPhase(phase), delay)
    );

    return () => timeouts.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase === 'complete') {
      onAnimationComplete();
    }
  }, [phase, onAnimationComplete]);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-gradient-radial" />
      
      {/* Subtle Particles/Stars Effect */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Camera Animation Container */}
      <AnimatePresence>
        {phase !== 'complete' && (
          <motion.div
            className="relative z-10"
            animate={
              phase === 'shrink'
                ? { scale: 0.12, x: '-42vw', y: '-42vh' }
                : { scale: 1, x: 0, y: 0 }
            }
            transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Camera Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="relative"
            >
              {/* Camera SVG */}
              <svg
                width="320"
                height="220"
                viewBox="0 0 320 220"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-2xl"
              >
                {/* Camera Body */}
                <rect x="40" y="50" width="240" height="140" rx="12" fill="#1a1a1a" />
                <rect x="40" y="50" width="240" height="140" rx="12" stroke="#2a2a2a" strokeWidth="2" />
                
                {/* Top Details */}
                <rect x="60" y="35" width="80" height="20" rx="4" fill="#1a1a1a" />
                <rect x="60" y="35" width="80" height="20" rx="4" stroke="#2a2a2a" strokeWidth="1" />
                
                {/* Flash */}
                <rect x="200" y="35" width="60" height="18" rx="3" fill="#1a1a1a" />
                <rect x="210" y="40" width="40" height="8" rx="2" fill="#333" />
                
                {/* Mode Dial */}
                <circle cx="260" y="60" r="15" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
                <circle cx="260" cy="60" r="8" fill="#222" />
                
                {/* Brand Name */}
                <text x="70" y="170" fill="#c9a962" fontSize="14" fontFamily="serif" letterSpacing="2">
                  SAURABH
                </text>
                
                {/* Bottom Details */}
                <rect x="50" y="175" width="30" height="8" rx="2" fill="#333" />
                <rect x="240" y="175" width="30" height="8" rx="2" fill="#333" />
              </svg>

              {/* Camera Lens - This is the focal point */}
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-2"
                animate={
                  phase === 'zoom'
                    ? { scale: 4.5 }
                    : phase === 'reveal'
                    ? { scale: 4.5 }
                    : { scale: 1 }
                }
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Outer Lens Ring */}
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 p-2 shadow-2xl">
                  {/* Middle Lens Ring */}
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 p-2">
                    {/* Inner Lens Ring */}
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-zinc-900 to-black p-1 relative overflow-hidden">
                      {/* Lens Glass / Image Reveal */}
                      <motion.div
                        className="w-full h-full rounded-full overflow-hidden relative"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: phase === 'zoom' || phase === 'reveal' ? 1 : 0 }}
                        transition={{ duration: 0.8 }}
                      >
                        <img
                          src={weddingHero}
                          alt="Wedding moment"
                          className="w-full h-full object-cover scale-150"
                        />
                        {/* Lens Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                      </motion.div>
                      
                      {/* Lens Reflection when not showing image */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-700/50 via-transparent to-transparent"
                        animate={{ opacity: phase === 'camera' ? 1 : 0 }}
                        transition={{ duration: 0.5 }}
                      />
                      
                      {/* Aperture Blades Hint */}
                      <motion.div
                        className="absolute inset-2 rounded-full"
                        style={{
                          background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 100%)',
                        }}
                        animate={{ opacity: phase === 'camera' ? 1 : 0 }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Lens Focus Ring */}
                <div className="absolute -inset-2 rounded-full border-4 border-zinc-700/50" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final Hero Content - Appears after camera animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'complete' ? 1 : 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="absolute inset-0 z-20"
      >
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src={weddingHero}
            alt="Wedding photography"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: phase === 'complete' ? 1 : 0, y: phase === 'complete' ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-4xl"
          >
            {/* Decorative Line */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-px bg-primary/60" />
              <span className="text-primary uppercase tracking-[0.3em] text-xs font-medium">
                Premium Wedding Photography
              </span>
              <div className="w-16 h-px bg-primary/60" />
            </div>

            {/* Main Title */}
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-foreground mb-6 leading-tight">
              Saurabh
              <span className="block text-gradient-gold">Photography</span>
            </h1>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-foreground/80 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
              Turning moments into <span className="text-primary italic">timeless memories</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="hero"
                size="lg"
                onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Book Your Shoot
              </Button>
              <Button
                variant="heroOutline"
                size="lg"
                onClick={() => document.querySelector('#portfolio')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Portfolio
              </Button>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-foreground/50 text-xs tracking-widest uppercase">Scroll</span>
              <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
