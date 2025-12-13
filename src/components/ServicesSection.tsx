import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Camera, Heart, Baby, Cake, Plane, User } from 'lucide-react';

const services = [
  {
    icon: Heart,
    title: 'Wedding Photography',
    description: 'Complete coverage of your special day with cinematic storytelling, from pre-wedding rituals to the grand celebration.',
  },
  {
    icon: Camera,
    title: 'Pre-Wedding Shoots',
    description: 'Romantic couple sessions in stunning locations, capturing your love story before the big day.',
  },
  {
    icon: Baby,
    title: 'Baby Shower & Maternity',
    description: 'Celebrating the beautiful journey of motherhood with elegant and emotional photography.',
  },
  {
    icon: Cake,
    title: 'Birthdays & Family Events',
    description: 'From first birthdays to family reunions, capturing joyful moments and precious memories.',
  },
  {
    icon: Plane,
    title: 'Drone Photography',
    description: 'Breathtaking aerial shots that add a cinematic dimension to your event coverage.',
  },
  {
    icon: User,
    title: 'Model & Candid Shoots',
    description: 'Professional portfolio shoots and candid photography for models, actors, and artists.',
  },
];

export const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="services" className="section-padding bg-card relative overflow-hidden" ref={ref}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="gold-line" />
            <span className="text-primary uppercase tracking-[0.2em] text-xs font-medium">
              Services
            </span>
            <div className="gold-line" />
          </div>
          <h2 className="section-title">
            What I Offer
          </h2>
          <p className="section-subtitle mx-auto mt-6">
            Professional photography services tailored to capture your most precious moments.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="group relative"
            >
              <div className="bg-background border border-border/50 rounded-lg p-8 h-full transition-all duration-500 hover:border-primary/30 hover:shadow-soft">
                {/* Icon */}
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-serif text-xl text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {service.description}
                </p>

                {/* Contact Link */}
                <div className="mt-6 pt-6 border-t border-border/30">
                  <span className="text-primary text-xs uppercase tracking-wider font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Contact for Packages →
                  </span>
                </div>

                {/* Hover Corner Accent */}
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-primary/50" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
