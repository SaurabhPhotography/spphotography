# Admin Guide - Portfolio Management

## Adding Photos with Google Drive

When adding a photo to the portfolio, you only need to provide **one URL** (the thumbnail/preview URL). The system will automatically generate a high-resolution version for full-screen viewing.

### 1. Thumbnail URL (Required)
- **Purpose**: Used for grid/preview display and automatically scaled for full-screen
- **Format**: Any Google Drive share link
- **Example**: `https://drive.google.com/file/d/FILE_ID/view`

### 2. Full-Screen URL (Optional)
- **Purpose**: Only needed if you want to use a custom high-resolution source
- **Format**: Can be any direct image URL or external hosting
- **Example**: If hosting elsewhere or using a CDN

**Note:** Google Drive blocks direct image hotlinking, so the system uses Google Drive's thumbnail API with high resolution (4000px) for full-screen viewing. This provides excellent quality for most displays.

## How to Get the URLs

### Getting the File ID:
1. Right-click your image in Google Drive
2. Click "Get link" or "Share"
3. Make sure it's set to "Anyone with the link"
4. Copy the link - it looks like: `https://drive.google.com/file/d/1ABC123xyz/view?usp=sharing`
5. The `FILE_ID` is the part between `/d/` and `/view` (e.g., `1ABC123xyz`)

### Creating the URLs:

**Thumbnail/Preview URL** (this is all you need): 
```
https://drive.google.com/file/d/FILE_ID/view
```

**Example:**
- If your share link is: `https://drive.google.com/file/d/1FhEawZ2Ki7MMxU7u2vWbGw5epKyWyPsu/view?usp=drive_link`
- Just paste it as-is into the Thumbnail URL field
- The system automatically creates high-res version for full-screen (4000px width)

**Alternative: Using External Hosting (Optional)**
If you want even higher quality or faster loading:
1. Upload image to Imgur, Cloudinary, or similar
2. Paste the direct image URL in the "Full-Screen URL" field
3. This will override the auto-generated high-res thumbnail

## Adding Videos

For videos (YouTube):
- Only need one URL (the YouTube link)
- Paste any YouTube URL format (share link, watch link, etc.)
- It will be automatically converted

## Migration Note

The database migration `20251221000000_add_full_url_column.sql` needs to be applied to Supabase:

```sql
ALTER TABLE public.portfolio_items 
ADD COLUMN full_url TEXT;
```

After migration, existing photos will work but won't have full-screen URLs until edited.

## Benefits

✅ **Fast Loading**: Thumbnails load quickly in the grid
✅ **High Quality**: Full-screen images show in maximum resolution
✅ **Better UX**: Smooth transitions with proper image display
✅ **Flexible**: Works with any Google Drive image
