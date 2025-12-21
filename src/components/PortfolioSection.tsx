import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Play } from 'lucide-react';
import { usePortfolioItems, getCategoryLabel } from '@/hooks/usePortfolioItems';
import { getYouTubeThumbnail, isYouTubeUrl, getEmbedUrl } from '@/lib/embedUtils';

// Import fallback portfolio images
import prewedding1 from '@/assets/portfolio/prewedding-1.jpg';
import wedding1 from '@/assets/portfolio/wedding-1.jpg';
import babyshower1 from '@/assets/portfolio/babyshower-1.jpg';
import birthday1 from '@/assets/portfolio/birthday-1.jpg';
import drone1 from '@/assets/portfolio/drone-1.jpg';
import model1 from '@/assets/portfolio/model-1.jpg';

const categories = [
  'All',
  'Wedding',
  'Pre-Wedding',
  'Baby Shower & Maternity',
  'Birthdays & Family',
  'Drone Shoot',
  'Model & Candid',
];

// Mapping from display label to URL slug
const categorySlugMapping: Record<string, string> = {
  'Wedding': 'wedding',
  'Pre-Wedding': 'pre-wedding',
  'Baby Shower & Maternity': 'baby-shower-maternity',
  'Birthdays & Family': 'birthdays-family',
  'Drone Shoot': 'drone',
  'Model & Candid': 'model-candid',
};

// Fallback static items (shown when no database items exist)
const fallbackItems = [
  { id: '1', category: 'Wedding', slug: 'wedding', image: wedding1, title: 'Royal Wedding Celebration' },
  { id: '2', category: 'Pre-Wedding', slug: 'pre-wedding', image: prewedding1, title: 'Golden Hour Romance' },
  { id: '3', category: 'Baby Shower & Maternity', slug: 'baby-shower-maternity', image: babyshower1, title: 'Blessed Beginnings' },
  { id: '4', category: 'Birthdays & Family', slug: 'birthdays-family', image: birthday1, title: 'First Birthday Joy' },
  { id: '5', category: 'Drone Shoot', slug: 'drone', image: drone1, title: 'Aerial Wedding View' },
  { id: '6', category: 'Model & Candid', slug: 'model-candid', image: model1, title: 'Elegant Portrait' },
];

export const PortfolioSection = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  const { items: dbItems, loading } = usePortfolioItems();

  // Use database items if available, otherwise use fallback
  const hasDbItems = dbItems.length > 0;

  // Navigate to category gallery
  const handleCategoryClick = (categorySlug: string) => {
    navigate(`/gallery/${categorySlug}`);
  };

  const filteredDbItems = activeCategory === 'All'
    ? dbItems
    : dbItems.filter((item) => getCategoryLabel(item.category) === activeCategory);

  const filteredFallbackItems = activeCategory === 'All'
    ? fallbackItems
    : fallbackItems.filter((item) => item.category === activeCategory);

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
          {categories.map((category) => (
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
            Loading portfolio...
          </div>
        )}

        {/* Portfolio Grid - Database Items */}
        {!loading && hasDbItems && (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredDbItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group relative aspect-[4/5] overflow-hidden rounded-lg cursor-pointer card-hover bg-muted"
                  onClick={() => handleCategoryClick(item.category)}
                >
                  {/* Embed Preview */}
                  <div className="absolute inset-0 pointer-events-none">
                    {item.media_type === 'video' && isYouTubeUrl(item.embed_url) ? (
                      <img 
                        src={getYouTubeThumbnail(item.embed_url) || ''} 
                        alt={item.title || 'Video thumbnail'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <iframe
                        src={getEmbedUrl(item.embed_url)}
                        className="w-full h-full object-cover"
                        allow="autoplay"
                        loading="lazy"
                      />
                    )}
                  </div>
                  
                  {/* Video Play Overlay */}
                  {item.media_type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 pointer-events-none">
                    <span className="text-primary text-xs uppercase tracking-wider font-medium">
                      {getCategoryLabel(item.category)}
                    </span>
                    {item.title && (
                      <h3 className="text-foreground font-serif text-xl mt-2">
                        {item.title}
                      </h3>
                    )}
                  </div>

                  {/* Corner Decoration */}
                  <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Portfolio Grid - Fallback Static Items */}
        {!loading && !hasDbItems && (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredFallbackItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group relative aspect-[4/5] overflow-hidden rounded-lg cursor-pointer card-hover"
                  onClick={() => handleCategoryClick(item.slug)}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-primary text-xs uppercase tracking-wider font-medium">
                      {item.category}
                    </span>
                    <h3 className="text-foreground font-serif text-xl mt-2">
                      {item.title}
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
