/**
 * Converts various YouTube and Google Drive URL formats to embeddable URLs
 */

/**
 * Convert YouTube URL to embed format
 * Supports: youtu.be, youtube.com/watch, youtube.com/embed, youtube.com/v
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  return null;
}

/**
 * Convert Google Drive URL to embed/preview format
 * Supports: drive.google.com/file/d/.../view, drive.google.com/file/d/.../preview
 */
export function getGoogleDriveEmbedUrl(url: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)(?:\/view|\/preview)?/,
    /(?:https?:\/\/)?drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }
  return null;
}

/**
 * Convert any supported URL to its embeddable version
 */
export function getEmbedUrl(url: string): string {
  // Check if it's already an embed URL
  if (url.includes('youtube.com/embed/') || url.includes('drive.google.com/file/d/') && url.includes('/preview')) {
    return url;
  }

  // Try YouTube conversion
  const youtubeEmbed = getYouTubeEmbedUrl(url);
  if (youtubeEmbed) return youtubeEmbed;

  // Try Google Drive conversion
  const driveEmbed = getGoogleDriveEmbedUrl(url);
  if (driveEmbed) return driveEmbed;

  // Return original if no conversion possible
  return url;
}

/**
 * Check if URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

/**
 * Check if URL is a Google Drive URL
 */
export function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com');
}

/**
 * Get thumbnail URL for YouTube video
 */
export function getYouTubeThumbnail(url: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'): string | null {
  const embedUrl = getYouTubeEmbedUrl(url);
  if (!embedUrl) return null;
  
  const videoId = embedUrl.split('/').pop();
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault',
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Get optimized thumbnail URL for Google Drive images
 * Adds size parameter for faster loading
 */
export function getGoogleDriveThumbnail(url: string, size: number = 400): string | null {
  const patterns = [
    /(?:https?:\/\/)?drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)(?:\/view|\/preview)?/,
    /(?:https?:\/\/)?drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w${size}`;
    }
  }
  return null;
}

/**
 * Get optimized thumbnail for any media type
 */
export function getOptimizedThumbnail(url: string, mediaType: 'photo' | 'video', size: number = 400): string {
  if (isYouTubeUrl(url)) {
    return getYouTubeThumbnail(url, 'high') || url;
  }
  
  if (isGoogleDriveUrl(url) && mediaType === 'photo') {
    return getGoogleDriveThumbnail(url, size) || url;
  }
  
  return url;
}

/**
 * Get direct Google Drive image URL for full-screen viewing
 * Converts Google Drive file URLs to high-resolution thumbnail URLs
 * Note: Google Drive blocks direct image hotlinking, so we use thumbnail API with large size
 */
export function getGoogleDriveDirectUrl(url: string, size: number = 4000): string | null {
  const patterns = [
    /(?:https?:\/\/)?drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)(?:\/view|\/preview)?/,
    /(?:https?:\/\/)?drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      // Use thumbnail API with large size for high-quality full-screen viewing
      // This is the most reliable method for Google Drive images
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w${size}`;
    }
  }
  
  // If already a thumbnail URL, return as is
  if (url.includes('drive.google.com/thumbnail')) {
    return url;
  }
  
  return null;
}

/**
 * Get the appropriate URL for full-screen viewing
 * For photos: uses full_url if available, otherwise converts embed_url to high-res thumbnail
 * For videos: uses embed_url
 */
export function getFullScreenUrl(item: { 
  media_type: 'photo' | 'video'; 
  embed_url: string; 
  full_url?: string | null 
}): string {
  if (item.media_type === 'video') {
    return getEmbedUrl(item.embed_url);
  }
  
  // For photos, prefer full_url if provided
  if (item.full_url) {
    return item.full_url;
  }
  
  // Fallback: use high-resolution thumbnail (4000px) for full-screen viewing
  // This is the most reliable method for Google Drive images
  if (isGoogleDriveUrl(item.embed_url)) {
    return getGoogleDriveDirectUrl(item.embed_url, 4000) || getEmbedUrl(item.embed_url);
  }
  
  return getEmbedUrl(item.embed_url);
}
