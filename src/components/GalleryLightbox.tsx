import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { PortfolioItem } from '@/hooks/usePortfolioItems';
import { getEmbedUrl, getYouTubeThumbnail, isYouTubeUrl } from '@/lib/embedUtils';

interface GalleryLightboxProps {
  items: PortfolioItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export const GalleryLightbox = ({
  items,
  currentIndex,
  onClose,
  onNavigate,
}: GalleryLightboxProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  const currentItem = items[currentIndex];
  const isVideo = currentItem.media_type === 'video';
  const isYouTube = isYouTubeUrl(currentItem.embed_url);
  const embedUrl = getEmbedUrl(currentItem.embed_url);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onNavigate('prev');
    if (e.key === 'ArrowRight') onNavigate('next');
  }, [onClose, onNavigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  // Reset playing state when item changes
  useEffect(() => {
    setIsPlaying(false);
  }, [currentIndex]);

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        onNavigate('next');
      } else {
        onNavigate('prev');
      }
    }
    
    setTouchStart(null);
  };

  const handlePlayVideo = () => {
    setIsPlaying(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 bg-background/98 backdrop-blur-2xl"
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-50 w-12 h-12 rounded-full bg-card/80 border border-border/50 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
        >
          <X size={24} />
        </button>

        {/* Navigation Arrows - Desktop */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('prev');
          }}
          className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-card/80 border border-border/50 items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
        >
          <ChevronLeft size={28} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('next');
          }}
          className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-card/80 border border-border/50 items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
        >
          <ChevronRight size={28} />
        </button>

        {/* Main Content */}
        <div 
          className="flex items-center justify-center w-full h-full px-4 md:px-20 lg:px-32 py-20"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            key={currentItem.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-6xl"
          >
            {/* Video Content */}
            {isVideo && (
              <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-2xl">
                {isPlaying ? (
                  <iframe
                    src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    {isYouTube && (
                      <img
                        src={getYouTubeThumbnail(currentItem.embed_url, 'maxres') || ''}
                        alt={currentItem.title || 'Video thumbnail'}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      onClick={handlePlayVideo}
                      className="absolute inset-0 flex items-center justify-center bg-background/30 hover:bg-background/20 transition-colors duration-300"
                    >
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Play className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground ml-1" fill="currentColor" />
                      </div>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Photo Content */}
            {!isVideo && (
              <div className="relative w-full max-h-[80vh] flex items-center justify-center">
                <iframe
                  src={embedUrl}
                  className="w-full aspect-[4/3] max-h-[80vh] rounded-lg shadow-2xl"
                  allow="autoplay"
                />
              </div>
            )}

            {/* Item Info */}
            <div className="absolute -bottom-16 left-0 right-0 text-center">
              {currentItem.title && (
                <h3 className="text-foreground font-serif text-xl md:text-2xl">
                  {currentItem.title}
                </h3>
              )}
              <p className="text-muted-foreground text-sm mt-2">
                {currentIndex + 1} / {items.length}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Mobile Navigation Dots */}
        <div className="md:hidden absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {items.slice(0, 10).map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                idx === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
          {items.length > 10 && (
            <span className="text-muted-foreground text-xs ml-1">+{items.length - 10}</span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
