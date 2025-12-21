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
