-- Add full_url column to portfolio_items table
-- This column stores the direct image URL for full-screen viewing
-- Only applicable to photos (not videos which use embed_url)
ALTER TABLE public.portfolio_items 
ADD COLUMN full_url TEXT;

-- Add comment to clarify usage
COMMENT ON COLUMN public.portfolio_items.full_url IS 'Direct image URL for full-screen viewing (photos only). For videos, use embed_url.';

-- Rename embed_url to thumbnail_url for clarity (keeping backward compatibility)
-- We'll keep embed_url as-is and use it as thumbnail_url in the code
COMMENT ON COLUMN public.portfolio_items.embed_url IS 'Thumbnail/preview URL for grid display and video embeds';
