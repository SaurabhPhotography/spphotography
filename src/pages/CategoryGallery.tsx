import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PortfolioItem, getCategoryLabel } from '@/hooks/usePortfolioItems';
import { getOptimizedThumbnail, isYouTubeUrl, isGoogleDriveUrl } from '@/lib/embedUtils';
import { GalleryLightbox } from '@/components/GalleryLightbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type PortfolioCategory = 'wedding' | 'pre-wedding' | 'baby-shower-maternity' | 'birthdays-family' | 'drone' | 'model-candid' | 'all';

const categorySlugMapping: Record<string, PortfolioCategory> = {
  'all': 'all',
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
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
  const [lightboxItems, setLightboxItems] = useState<PortfolioItem[]>([]);

  const categoryKey = category ? categorySlugMapping[category] : null;
  const categoryLabel = categoryKey ? (categoryKey === 'all' ? 'All' : getCategoryLabel(categoryKey)) : 'Gallery';

  useEffect(() => {
    const fetchItems = async () => {
      if (!categoryKey) {
        setLoading(false);
        return;
      }

      let query = supabase
        .from('portfolio_items')
        .select('*');

      // If category is 'all', fetch all items, otherwise filter by category
      if (categoryKey !== 'all') {
        query = query.eq('category', categoryKey);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data) {
        setItems(data);
      }
      setLoading(false);
    };

    fetchItems();
  }, [categoryKey]);

  // Filter items by media type
  const imageItems = items.filter(item => item.media_type === 'photo');
  const videoItems = items.filter(item => item.media_type === 'video');

  const handleItemClick = (index: number, mediaType: 'images' | 'videos') => {
    // Set the appropriate item list for lightbox navigation
    const currentItems = mediaType === 'images' ? imageItems : videoItems;
    setLightboxItems(currentItems);
    setLightboxIndex(index);
  };

  const handleCloseLightbox = () => {
    setLightboxIndex(null);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (lightboxIndex === null) return;
    
    if (direction === 'prev') {
      setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : lightboxItems.length - 1);
    } else {
      setLightboxIndex(lightboxIndex < lightboxItems.length - 1 ? lightboxIndex + 1 : 0);
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
        className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm"
      >
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/#portfolio')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300 group"
          >
            <div className="w-8 h-8 rounded-full bg-card border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
              <ArrowLeft size={16} />
            </div>
            <span className="text-sm font-medium hidden sm:inline">Back to Portfolio</span>
          </button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline">{categoryLabel}</span>
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {imageItems.length} {imageItems.length === 1 ? 'image' : 'images'}
            </span>
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {videoItems.length} {videoItems.length === 1 ? 'video' : 'videos'}
            </span>
          </div>
        </div>
      </motion.header>

      {/* Page Content */}
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="gold-line" />
            <span className="text-primary uppercase tracking-[0.2em] text-xs font-medium">
              Gallery
            </span>
            <div className="gold-line" />
          </div>
          <h1 className="section-title text-3xl md:text-4xl lg:text-5xl">
            {categoryLabel}
          </h1>
          <p className="section-subtitle mx-auto mt-4">
            Explore our curated collection
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

        {/* Gallery with Tabs */}
        {!loading && items.length > 0 && (
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'images' | 'videos')}
            className="w-full"
          >
            {/* Tabs List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-card p-1 text-muted-foreground shadow-sm border border-border/50">
                <TabsTrigger 
                  value="images"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                >
                  <ImageIcon size={16} />
                  Images
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-background/20 text-xs font-semibold">
                    {imageItems.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="videos"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                >
                  <VideoIcon size={16} />
                  Videos
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-background/20 text-xs font-semibold">
                    {videoItems.length}
                  </span>
                </TabsTrigger>
              </TabsList>
            </motion.div>

            {/* Images Tab Content */}
            <TabsContent value="images" className="mt-0">
              {imageItems.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No images in this category yet.</p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6"
                >
                  {imageItems.map((item, index) => (
                    <GalleryThumbnail
                      key={item.id}
                      item={item}
                      index={index}
                      onClick={() => handleItemClick(index, 'images')}
                    />
                  ))}
                </motion.div>
              )}
            </TabsContent>

            {/* Videos Tab Content */}
            <TabsContent value="videos" className="mt-0">
              {videoItems.length === 0 ? (
                <div className="text-center py-12">
                  <VideoIcon size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No videos in this category yet.</p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6"
                >
                  {videoItems.map((item, index) => (
                    <GalleryThumbnail
                      key={item.id}
                      item={item}
                      index={index}
                      onClick={() => handleItemClick(index, 'videos')}
                    />
                  ))}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && lightboxItems[lightboxIndex] && (
        <GalleryLightbox
          items={lightboxItems}
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
  const [imageError, setImageError] = useState(false);
  const isVideo = item.media_type === 'video';
  const isYouTube = isYouTubeUrl(item.embed_url);
  const isDrive = isGoogleDriveUrl(item.embed_url);
  
  // Get optimized thumbnail URL
  const thumbnailUrl = getOptimizedThumbnail(item.embed_url, item.media_type, 600);

  // Preload full-resolution image on hover for instant lightbox display
  const handleMouseEnter = () => {
    if (item.media_type === 'photo') {
      const fullUrl = item.full_url || item.embed_url;
      const img = new Image();
      img.src = fullUrl;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer bg-muted shadow-md hover:shadow-2xl transition-all duration-300"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
    >
      {/* Thumbnail Image - Always use optimized image for photos and videos */}
      {(isYouTube || isDrive) && !imageError ? (
        <img
          src={thumbnailUrl}
          alt={item.title || 'Gallery item'}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      ) : !imageError && !isYouTube && !isDrive ? (
        /* Fallback to iframe for other sources */
        <div className="w-full h-full overflow-hidden">
          <iframe
            src={thumbnailUrl}
            title={item.title || 'Gallery item'}
            className="w-full h-full scale-150 object-cover pointer-events-none"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      ) : (
        /* Error fallback */
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Preview unavailable</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted animate-pulse" />
      )}

      {/* Video Play Overlay */}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/95 backdrop-blur-sm flex items-center justify-center group-hover:scale-125 transition-transform duration-300 shadow-2xl">
            <Play className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Hover Overlay with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

      {/* Corner Decorations */}
      <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-tr-lg" />
      <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-bl-lg" />

      {/* Title */}
      {item.title && (
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-foreground text-sm font-medium line-clamp-2 drop-shadow-lg">
            {item.title}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default CategoryGallery;
