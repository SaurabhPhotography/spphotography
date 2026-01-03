import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, Download, ZoomIn } from 'lucide-react';
import { PortfolioItem } from '@/hooks/usePortfolioItems';
import { getEmbedUrl, getOptimizedThumbnail, getFullScreenUrl, isYouTubeUrl, isGoogleDriveUrl } from '@/lib/embedUtils';

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
  const [fullImageLoaded, setFullImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  
  const currentItem = items[currentIndex];
  const isVideo = currentItem.media_type === 'video';
  const isYouTube = isYouTubeUrl(currentItem.embed_url);
  const isDrive = isGoogleDriveUrl(currentItem.embed_url);
  const embedUrl = getEmbedUrl(currentItem.embed_url);
  const thumbnailUrl = getOptimizedThumbnail(currentItem.embed_url, currentItem.media_type, 800);
  const fullScreenUrl = getFullScreenUrl(currentItem);
  
  // Debug log to check URLs
  console.log('Lightbox URLs:', {
    embed_url: currentItem.embed_url,
    full_url: currentItem.full_url,
    thumbnailUrl,
    fullScreenUrl,
    isVideo,
    isDrive
  });

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

  // Reset state when item changes
  useEffect(() => {
    setIsPlaying(false);
    setFullImageLoaded(false);
    setImageError(false);
    setIsZoomed(false);
    
    // Preload current and adjacent full-resolution images
    const preloadImages = () => {
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      
      // Preload current image first, then adjacent
      [currentIndex, prevIndex, nextIndex].forEach((idx, priority) => {
        const item = items[idx];
        if (item && item.media_type === 'photo') {
          const img = new Image();
          img.src = getFullScreenUrl(item);
          
          // Set loaded state only for current image
          if (idx === currentIndex) {
            img.onload = () => {
              if (idx === currentIndex) {
                setFullImageLoaded(true);
              }
            };
            img.onerror = () => {
              if (idx === currentIndex) {
                setImageError(true);
                console.error('Failed to load full-screen image:', img.src);
              }
            };
          }
        }
      });
    };
    
    preloadImages();
  }, [currentIndex, items]);

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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-7xl"
          >
            {/* Video Content */}
            {isVideo && (
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/20">
                {isPlaying ? (
                  <iframe
                    src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <img
                      src={thumbnailUrl}
                      alt={currentItem.title || 'Video thumbnail'}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={handlePlayVideo}
                      className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background/60 via-background/20 to-transparent hover:from-background/40 transition-all duration-300"
                    >
                      <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-primary backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-2xl ring-4 ring-primary/20">
                        <Play className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground ml-1.5" fill="currentColor" />
                      </div>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Photo Content */}
            {!isVideo && (
              <div className="relative w-full max-h-[85vh] flex items-center justify-center">
                {/* Use img tag for photos instead of iframe for better full-screen viewing */}
                <div className={`relative w-full max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/20 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}>
                  {/* Show thumbnail immediately for instant feedback */}
                  <img
                    src={thumbnailUrl}
                    alt={currentItem.title || 'Gallery image'}
                    className={`w-full h-full object-contain transition-all duration-300 ${
                      fullImageLoaded ? 'opacity-0 absolute' : 'opacity-100'
                    }`}
                    style={{ maxHeight: '85vh' }}
                  />
                  
                  {/* Load full-resolution image in background */}
                  <img
                    src={fullScreenUrl}
                    alt={currentItem.title || 'Gallery image'}
                    className={`w-full h-full object-contain transition-all duration-500 ${
                      fullImageLoaded && !imageError ? 'opacity-100' : 'opacity-0 absolute'
                    } ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
                    style={{ maxHeight: '85vh' }}
                    onLoad={() => setFullImageLoaded(true)}
                    onError={() => setImageError(true)}
                    onClick={() => !imageError && setIsZoomed(!isZoomed)}
                  />
                  
                  {/* Error state - show message with URL info */}
                  {imageError && (
                    <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center p-8 text-center">
                      <div className="text-destructive text-lg mb-4">Failed to load image</div>
                      <div className="text-muted-foreground text-sm space-y-2 max-w-lg">
                        <p>The image could not be loaded from Google Drive.</p>
                        <p className="text-xs">Please ensure:</p>
                        <ul className="text-xs list-disc list-inside space-y-1">
                          <li>The file is set to "Anyone with the link"</li>
                          <li>Sharing permissions are enabled</li>
                          <li>The file ID is correct</li>
                        </ul>
                        <div className="mt-4 p-2 bg-muted rounded text-xs break-all">
                          Full URL: {fullScreenUrl}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Item Info */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute -bottom-20 left-0 right-0 text-center px-4"
            >
              {currentItem.title && (
                <h3 className="text-foreground font-serif text-lg md:text-2xl mb-2 drop-shadow-lg">
                  {currentItem.title}
                </h3>
              )}
              <div className="flex items-center justify-center gap-3 text-muted-foreground text-sm">
                <span className="px-3 py-1 rounded-full bg-card/60 backdrop-blur-sm">
                  {currentIndex + 1} / {items.length}
                </span>
                {!isVideo && (
                  <span className="px-3 py-1 rounded-full bg-card/60 backdrop-blur-sm flex items-center gap-1.5">
                    <ZoomIn size={14} />
                    Click to zoom
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile Navigation Dots */}
        <div className="md:hidden absolute bottom-6 left-0 right-0 flex justify-center items-center gap-2 px-4">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-background/80 backdrop-blur-md shadow-lg">
            {items.slice(0, 10).map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = idx;
                  if (newIndex > currentIndex) {
                    for (let i = 0; i < newIndex - currentIndex; i++) {
                      onNavigate('next');
                    }
                  } else if (newIndex < currentIndex) {
                    for (let i = 0; i < currentIndex - newIndex; i++) {
                      onNavigate('prev');
                    }
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex 
                    ? 'bg-primary w-6' 
                    : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
                }`}
              />
            ))}
            {items.length > 10 && (
              <span className="text-muted-foreground text-xs ml-1 font-medium">+{items.length - 10}</span>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
