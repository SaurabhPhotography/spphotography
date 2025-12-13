import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Priya & Rahul Sharma',
    event: 'Wedding Photography',
    quote: 'Saurabh captured our wedding day with such artistry and emotion. Every photograph tells our love story beautifully. We couldn\'t have asked for a better photographer!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Ananya Gupta',
    event: 'Pre-Wedding Shoot',
    quote: 'The pre-wedding shoot was magical! Saurabh made us feel so comfortable, and the results were absolutely stunning. Highly recommend his services.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Meera & Vikram Patel',
    event: 'Baby Shower',
    quote: 'From our baby shower to maternity shoot, every moment was captured perfectly. The attention to detail and the warmth in every photo is incredible.',
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="section-padding bg-background relative overflow-hidden" ref={ref}>
      {/* Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />

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
              Testimonials
            </span>
            <div className="gold-line" />
          </div>
          <h2 className="section-title">
            Words from
            <span className="block text-gradient-gold">Happy Couples</span>
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 * index }}
              className="relative"
            >
              <div className="bg-card border border-border/50 rounded-lg p-8 h-full relative">
                {/* Quote Icon */}
                <div className="absolute -top-4 left-8">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-soft">
                    <Quote className="w-5 h-5 text-primary-foreground" />
                  </div>
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-6 pt-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground/80 leading-relaxed mb-8 italic">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="border-t border-border/30 pt-6">
                  <h4 className="font-serif text-foreground text-lg">
                    {testimonial.name}
                  </h4>
                  <p className="text-muted-foreground text-sm mt-1">
                    {testimonial.event}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
