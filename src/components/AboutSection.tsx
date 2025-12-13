import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Camera, Heart, Award } from 'lucide-react';
import photographerPortrait from '@/assets/photographer-portrait.jpg';

export const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const stats = [
    { icon: Camera, value: '500+', label: 'Events Captured' },
    { icon: Heart, value: '8+', label: 'Years of Passion' },
    { icon: Award, value: '100%', label: 'Happy Couples' },
  ];

  return (
    <section id="about" className="section-padding bg-gradient-dark relative overflow-hidden" ref={ref}>
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative"
          >
            <div className="relative aspect-[3/4] max-w-md mx-auto lg:mx-0">
              {/* Main Image */}
              <div className="relative z-10 rounded-lg overflow-hidden shadow-card">
                <img
                  src={photographerPortrait}
                  alt="Saurabh - Professional Photographer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              </div>
              
              {/* Decorative Frame */}
              <div className="absolute -inset-4 border border-primary/20 rounded-lg -z-0" />
              <div className="absolute -inset-8 border border-primary/10 rounded-lg -z-0" />
              
              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -bottom-6 -right-6 bg-card border border-border rounded-lg p-4 shadow-card z-20"
              >
                <div className="text-center">
                  <span className="block text-3xl font-serif text-primary">8+</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Years</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            {/* Section Label */}
            <div className="flex items-center gap-4 mb-6">
              <div className="gold-line" />
              <span className="text-primary uppercase tracking-[0.2em] text-xs font-medium">
                About Me
              </span>
            </div>

            {/* Title */}
            <h2 className="section-title mb-8">
              Capturing Life's Most
              <span className="block text-gradient-gold">Beautiful Moments</span>
            </h2>

            {/* Story */}
            <div className="space-y-6 text-foreground/80 leading-relaxed">
              <p>
                For over eight years, I've had the incredible privilege of capturing love stories 
                across India. Every wedding, every celebration, every intimate moment tells a 
                unique story waiting to be preserved forever.
              </p>
              <p>
                My approach combines cinematic vision with genuine emotion. I don't just take 
                photographs—I capture the stolen glances, the happy tears, the unscripted 
                laughter, and the quiet moments of pure joy that make your day extraordinary.
              </p>
              <p className="text-primary italic font-serif text-lg">
                "Every frame I capture is a piece of your story, preserved for generations to cherish."
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border/50">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-serif text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
