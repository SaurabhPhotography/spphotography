import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PortfolioItem, getCategoryLabel } from '@/hooks/usePortfolioItems';
import { getYouTubeThumbnail, isYouTubeUrl } from '@/lib/embedUtils';
import { GalleryLightbox } from '@/components/GalleryLightbox';

type PortfolioCategory = 'wedding' | 'pre-wedding' | 'baby-shower-maternity' | 'birthdays-family' | 'drone' | 'model-candid';

const categorySlugMapping: Record<string, PortfolioCategory> = {
  'wedding': 'wedding',
  'pre-wedding': 'pre-wedding',
  'baby-shower-maternity': 'baby-shower-maternity',
  'birthdays-family': 'birthdays-family',
  'drone': 'drone',
  'model-candid': 'model-candid',
};

const CategoryGallery = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categoryKey = category ? categorySlugMapping[category] : null;
  const categoryLabel = categoryKey ? getCategoryLabel(categoryKey) : 'Gallery';

  useEffect(() => {
    const fetchItems = async () => {
      if (!categoryKey) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('category', categoryKey)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setItems(data);
      }
      setLoading(false);
    };

    fetchItems();
  }, [categoryKey]);

  const handleItemClick = (index: number) => {
    setLightboxIndex(index);
  };

  const handleCloseLightbox = () => {
    setLightboxIndex(null);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (lightboxIndex === null) return;
    
    if (direction === 'prev') {
      setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : items.length - 1);
    } else {
      setLightboxIndex(lightboxIndex < items.length - 1 ? lightboxIndex + 1 : 0);
    }
  };

  if (!categoryKey) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-foreground mb-4">Category Not Found</h1>
          <button
            onClick={() => navigate('/')}
            className="text-primary hover:underline"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50"
      >
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/#portfolio')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">Back to Portfolio</span>
          </button>
        </div>
      </motion.header>

      {/* Page Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="gold-line" />
            <span className="text-primary uppercase tracking-[0.2em] text-xs font-medium">
              Gallery
            </span>
            <div className="gold-line" />
          </div>
          <h1 className="section-title">
            {categoryLabel}
          </h1>
          <p className="section-subtitle mx-auto mt-4">
            {items.length} {items.length === 1 ? 'item' : 'items'} in this collection
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground mt-4">Loading gallery...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No items in this category yet.</p>
            <button
              onClick={() => navigate('/#portfolio')}
              className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-300"
            >
              Back to Portfolio
            </button>
          </div>
        )}

        {/* Gallery Grid */}
        {!loading && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {items.map((item, index) => (
              <GalleryThumbnail
                key={item.id}
                item={item}
                index={index}
                onClick={() => handleItemClick(index)}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && items[lightboxIndex] && (
        <GalleryLightbox
          items={items}
          currentIndex={lightboxIndex}
          onClose={handleCloseLightbox}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
};

interface GalleryThumbnailProps {
  item: PortfolioItem;
  index: number;
  onClick: () => void;
}

const GalleryThumbnail = ({ item, index, onClick }: GalleryThumbnailProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isVideo = item.media_type === 'video';
  const isYouTube = isYouTubeUrl(item.embed_url);
  
  // Get thumbnail URL
  const thumbnailUrl = isYouTube 
    ? getYouTubeThumbnail(item.embed_url, 'high')
    : item.embed_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer bg-muted shadow-soft hover:shadow-lg transition-shadow duration-300"
      onClick={onClick}
    >
      {/* Thumbnail Image */}
      {isYouTube || isVideo ? (
        <img
          src={thumbnailUrl || ''}
          alt={item.title || 'Gallery item'}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
      ) : (
        <iframe
          src={thumbnailUrl}
          title={item.title || 'Gallery item'}
          className="w-full h-full object-cover pointer-events-none"
          loading="lazy"
        />
      )}

      {/* Loading Skeleton */}
      {!imageLoaded && (isYouTube || isVideo) && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Video Play Overlay */}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <Play className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Title */}
      {item.title && (
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-foreground text-sm font-medium truncate">{item.title}</p>
        </div>
      )}
    </motion.div>
  );
};

export default CategoryGallery;
