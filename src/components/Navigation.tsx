import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  showNav: boolean;
}

const navItems = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Portfolio', href: '#portfolio' },
  { name: 'Services', href: '#services' },
  { name: 'Contact', href: '#contact' },
];

export const Navigation = ({ showNav }: NavigationProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <AnimatePresence>
      {showNav && (
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            isScrolled
              ? 'bg-background/90 backdrop-blur-premium border-b border-border/50'
              : 'bg-transparent'
          }`}
        >
          <nav className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <motion.a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('#home');
                }}
                className="flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center">
                  <span className="text-primary font-serif text-lg font-medium"><img
        src="/logo.png"
        alt="Saurabh Photography Logo"
        width={32}
        height={32}
        className="object-contain"
      />
                    
                  </span>
                </div>
                <div className="hidden sm:block">
                  <span className="font-serif text-lg text-foreground tracking-wide">
                    Saurabh Patle
                  </span>
                  <span className="font-serif text-lg text-primary tracking-wide ml-1">
                    Photography
                  </span>
                </div>
              </motion.a>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
                {navItems.slice(0, -1).map((item) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(item.href);
                    }}
                    className="text-foreground/80 hover:text-primary transition-colors duration-300 tracking-wide uppercase text-xs font-medium relative group"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
                  </motion.a>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scrollToSection('#contact')}
                  className="ml-4"
                >
                  Book Now
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-foreground p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="md:hidden overflow-hidden"
                >
                  <div className="py-6 space-y-4 border-t border-border/30 mt-4">
                    {navItems.map((item, index) => (
                      <motion.a
                        key={item.name}
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection(item.href);
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="block text-foreground/80 hover:text-primary transition-colors duration-300 tracking-wide uppercase text-sm font-medium py-2"
                      >
                        {item.name}
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        </motion.header>
      )}
    </AnimatePresence>
  );
};
