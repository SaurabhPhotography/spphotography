import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { getOptimizedThumbnail } from '@/lib/embedUtils';

// Import fallback portfolio images
import prewedding1 from '@/assets/portfolio/prewedding-1.jpg';
import wedding1 from '@/assets/portfolio/wedding-1.jpg';
import babyshower1 from '@/assets/portfolio/babyshower-1.jpg';
import birthday1 from '@/assets/portfolio/birthday-1.jpg';
import drone1 from '@/assets/portfolio/drone-1.jpg';
import model1 from '@/assets/portfolio/model-1.jpg';

interface PortfolioCategory {
  id: string;
  name: string;
  slug: string;
  display_label: string;
  thumbnail_url: string;
  display_order: number;
}

// Fallback categories with static images
const fallbackCategories: PortfolioCategory[] = [
  { id: 'wedding', slug: 'wedding', display_label: 'Wedding', thumbnail_url: wedding1, display_order: 1, name: 'wedding' },
  { id: 'pre-wedding', slug: 'pre-wedding', display_label: 'Pre-Wedding', thumbnail_url: prewedding1, display_order: 2, name: 'pre-wedding' },
  { id: 'baby-shower-maternity', slug: 'baby-shower-maternity', display_label: 'Baby Shower & Maternity', thumbnail_url: babyshower1, display_order: 3, name: 'baby-shower-maternity' },
  { id: 'birthdays-family', slug: 'birthdays-family', display_label: 'Birthdays & Family', thumbnail_url: birthday1, display_order: 4, name: 'birthdays-family' },
  { id: 'drone', slug: 'drone', display_label: 'Drone Shoot', thumbnail_url: drone1, display_order: 5, name: 'drone' },
  { id: 'model-candid', slug: 'model-candid', display_label: 'Model & Candid', thumbnail_url: model1, display_order: 6, name: 'model-candid' },
];

export const PortfolioSection = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('portfolio_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data) {
        setCategories(data);
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  // Navigate to category gallery
  const handleCategoryClick = (categorySlug: string) => {
    navigate(`/gallery/${categorySlug}`);
  };

  // Use database categories if available, otherwise use fallback
  // Filter out 'all' category from display
  const allCategories = categories.length > 0 ? categories : fallbackCategories;
  const hasDbCategories = categories.length > 0;
  
  // Remove 'all' category from cards display
  const categoriesForCards = allCategories.filter(cat => cat.slug !== 'all');
  
  // Filter categories based on active selection
  const displayCategories = activeCategory === 'All' 
    ? categoriesForCards 
    : categoriesForCards.filter(cat => cat.display_label === activeCategory);

  // Category filter buttons
  const categoryFilters = [
    'All',
    'Wedding',
    'Pre-Wedding',
    'Baby Shower & Maternity',
    'Birthdays & Family',
    'Drone Shoot',
    'Model & Candid',
  ];

  return (
    <section id="portfolio" className="section-padding bg-background relative" ref={ref}>
      <div className="container mx-auto">
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
              Portfolio
            </span>
            <div className="gold-line" />
          </div>
          <h2 className="section-title">
            Stories Captured in
            <span className="block text-gradient-gold">Every Frame</span>
          </h2>
          <p className="section-subtitle mx-auto mt-6">
            Each photograph tells a unique story of love, joy, and celebration.
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categoryFilters.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'bg-card text-muted-foreground hover:bg-accent/30 hover:text-foreground border border-border/50'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 text-muted-foreground">
            Loading categories...
          </div>
        )}

        {/* Category Cards Grid */}
        {!loading && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {displayCategories.map((category, index) => (
                <motion.div
                  key={category.id || category.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group relative aspect-[4/5] overflow-hidden rounded-lg cursor-pointer card-hover"
                  onClick={() => handleCategoryClick(category.slug)}
                >
                  {/* Category Thumbnail */}
                  <img
                    src={hasDbCategories ? getOptimizedThumbnail(category.thumbnail_url, 'photo', 800) : category.thumbnail_url}
                    alt={category.display_label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    onMouseEnter={(e) => {
                      // Preload full-res on hover
                      const img = new Image();
                      img.src = category.thumbnail_url;
                    }}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-primary text-xs uppercase tracking-wider font-medium">
                      Category
                    </span>
                    <h3 className="text-foreground font-serif text-xl mt-2">
                      {category.display_label}
                    </h3>
                  </div>

                  {/* Corner Decoration */}
                  <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
};
