import { motion } from 'framer-motion';
import { Instagram, Facebook, Youtube, Heart } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-background border-t border-border/30">
      <div className="container mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h3 className="font-serif text-3xl text-foreground">
              Saurabh <span className="text-primary">Photography</span>
            </h3>
            <p className="text-muted-foreground mt-4 max-w-md mx-auto">
              Turning moments into timeless memories. Premium wedding and event photography across India.
            </p>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex justify-center gap-4 mb-8"
          >
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-12 h-12 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300"
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-8 mb-8"
          >
            {['Home', 'About', 'Portfolio', 'Services', 'Contact'].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm uppercase tracking-wider"
              >
                {link}
              </a>
            ))}
          </motion.div>

          {/* Divider */}
          <div className="w-32 h-px bg-border mx-auto mb-8" />

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-sm"
          >
            <p className="flex items-center justify-center gap-2">
              © {currentYear} Saurabh Photography. Made with{' '}
              <Heart className="w-4 h-4 text-primary fill-primary" /> in India by
              <a
              href="https://devendra-data-canvas.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors font-semibold"
            >
              Portfolio_.hub
            </a>
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};


