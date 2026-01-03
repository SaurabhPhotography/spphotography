import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, LogOut, Image, Video, X, Save, FolderOpen, ImageIcon } from 'lucide-react';
import { z } from 'zod';
import { getEmbedUrl, getYouTubeThumbnail, isYouTubeUrl, getOptimizedThumbnail } from '@/lib/embedUtils';

type MediaType = 'photo' | 'video';
type PortfolioCategory = 'wedding' | 'pre-wedding' | 'baby-shower-maternity' | 'birthdays-family' | 'drone' | 'model-candid';

interface PortfolioItem {
  id: string;
  media_type: MediaType;
  category: PortfolioCategory;
  embed_url: string;
  full_url: string | null;
  title: string | null;
  created_at: string;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  display_label: string;
  thumbnail_url: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const categoryLabels: Record<PortfolioCategory, string> = {
  'wedding': 'Wedding',
  'pre-wedding': 'Pre-Wedding',
  'baby-shower-maternity': 'Baby Shower & Maternity',
  'birthdays-family': 'Birthdays & Family',
  'drone': 'Drone Shoot',
  'model-candid': 'Model & Candid',
};

const portfolioItemSchema = z.object({
  media_type: z.enum(['photo', 'video']),
  category: z.enum(['wedding', 'pre-wedding', 'baby-shower-maternity', 'birthdays-family', 'drone', 'model-candid']),
  embed_url: z.string().url('Please enter a valid URL'),
  title: z.string().optional(),
});

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Portfolio Items State
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  
  // Portfolio Items Form State
  const [mediaType, setMediaType] = useState<MediaType>('photo');
  const [category, setCategory] = useState<PortfolioCategory>('wedding');
  const [embedUrl, setEmbedUrl] = useState('');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Categories State
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  
  // Category Form State
  const [categoryThumbnailUrl, setCategoryThumbnailUrl] = useState('');
  const [categoryDisplayLabel, setCategoryDisplayLabel] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchItems();
      fetchCategories();
    }
  }, [user, isAdmin]);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    const { data, error } = await supabase
      .from('portfolio_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setCategories(data || []);
    }
    setIsLoadingCategories(false);
  };

  const fetchItems = async () => {
    setIsLoadingItems(true);
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load portfolio items',
        variant: 'destructive',
      });
    } else {
      setItems(data || []);
    }
    setIsLoadingItems(false);
  };

  const resetForm = () => {
    console.log('Resetting form');
    setEditingItem(null);
    setMediaType('photo');
    setCategory('wedding');
    setEmbedUrl('');
    setTitle('');
    setShowForm(false);
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryThumbnailUrl('');
    setCategoryDisplayLabel('');
    setShowCategoryForm(false);
  };

  const handleEdit = (item: PortfolioItem) => {    console.log('Editing item:', item.id);    setEditingItem(item);
    setMediaType(item.media_type);
    setCategory(item.category);
    setEmbedUrl(item.embed_url);
    setTitle(item.title || '');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const { error } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Deleted',
        description: 'Portfolio item deleted successfully',
      });
      fetchItems();
    }
  };

  // Category Management Functions
  const handleEditCategory = (category: CategoryItem) => {
    setEditingCategory(category);
    setCategoryThumbnailUrl(category.thumbnail_url);
    setCategoryDisplayLabel(category.display_label);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    const { error } = await supabase
      .from('portfolio_categories')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Deleted',
        description: 'Category deleted successfully',
      });
      fetchCategories();
    }
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCategory(true);

    const categoryData = {
      thumbnail_url: categoryThumbnailUrl,
      display_label: categoryDisplayLabel,
    };

    let error;

    if (editingCategory) {
      // Update existing category
      const result = await supabase
        .from('portfolio_categories')
        .update(categoryData)
        .eq('id', editingCategory.id);
      error = result.error;
    } else {
      toast({
        title: 'Error',
        description: 'Cannot add new categories. Only existing categories can be edited.',
        variant: 'destructive',
      });
      setIsSavingCategory(false);
      return;
    }

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Category updated successfully',
      });
      resetCategoryForm();
      fetchCategories();
    }

    setIsSavingCategory(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = portfolioItemSchema.safeParse({
      media_type: mediaType,
      category,
      embed_url: embedUrl,
      title: title || undefined,
    });

    if (!validation.success) {
      toast({
        title: 'Validation Error',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    // Convert URL to embed format before saving
    const convertedEmbedUrl = getEmbedUrl(embedUrl);
    
    const itemData = {
      media_type: mediaType,
      category,
      embed_url: convertedEmbedUrl,
      title: title || null,
    };

    let error;
    const isEditing = editingItem !== null;

    if (isEditing) {
      console.log('Updating item:', editingItem.id);
      ({ error } = await supabase
        .from('portfolio_items')
        .update(itemData)
        .eq('id', editingItem.id));
    } else {
      console.log('Inserting new item');
      ({ error } = await supabase
        .from('portfolio_items')
        .insert(itemData));
    }

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: isEditing ? 'Item updated successfully' : 'Item added successfully',
      });
      resetForm();
      fetchItems();
    }

    setIsSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl text-foreground">Saurabh Photography</span>
            <span className="text-muted-foreground text-sm">/ Admin</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'items' | 'categories')}>
          {/* Tabs List */}
          <TabsList className="mb-8">
            <TabsTrigger value="items" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Portfolio Items
              <span className="ml-1 px-2 py-0.5 rounded-full bg-background/20 text-xs font-semibold">
                {items.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Categories
              <span className="ml-1 px-2 py-0.5 rounded-full bg-background/20 text-xs font-semibold">
                {categories.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Portfolio Items Tab */}
          <TabsContent value="items">
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-serif text-2xl text-foreground">Portfolio Items</h1>
              <Button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-6"
              onClick={(e) => e.target === e.currentTarget && resetForm()}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-lg bg-card border border-border rounded-xl p-6 shadow-elegant max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl text-foreground">
                    {editingItem ? 'Edit Item' : 'Add New Item'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Media Type */}
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Media Type</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setMediaType('photo')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
                          mediaType === 'photo'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        <Image className="w-4 h-4" />
                        Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setMediaType('video')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
                          mediaType === 'video'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        <Video className="w-4 h-4" />
                        Video
                      </button>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as PortfolioCategory)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Embed URL */}
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      {mediaType === 'photo' ? 'Google Drive Link' : 'YouTube Link'}
                    </label>
                    <Input
                      type="url"
                      value={embedUrl}
                      onChange={(e) => setEmbedUrl(e.target.value)}
                      placeholder={mediaType === 'photo' 
                        ? 'https://drive.google.com/file/d/.../view'
                        : 'https://youtu.be/... or https://youtube.com/watch?v=...'
                      }
                      className="bg-background border-border"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      {mediaType === 'photo' 
                        ? 'Paste your Google Drive share link - high-res version will be auto-generated for full-screen'
                        : 'Paste any YouTube link - it will be converted automatically'
                      }
                    </p>
                    {/* Live Preview */}
                    {embedUrl && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-border aspect-video bg-muted">
                        {isYouTubeUrl(embedUrl) ? (
                          <img 
                            src={getYouTubeThumbnail(embedUrl) || ''} 
                            alt="Video thumbnail"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <iframe
                            src={getEmbedUrl(embedUrl)}
                            className="w-full h-full"
                            allow="autoplay"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Title (Optional)</label>
                    <Input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Beautiful Wedding Moment"
                      className="bg-background border-border"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={resetForm}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : editingItem ? 'Update' : 'Add'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items Grid */}
        {isLoadingItems ? (
          <div className="text-center py-12 text-muted-foreground">Loading items...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No portfolio items yet</p>
            <Button onClick={() => setShowForm(true)} variant="outline">
              Add Your First Item
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl overflow-hidden group"
              >
                {/* Preview */}
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {item.media_type === 'video' && isYouTubeUrl(item.embed_url) ? (
                    <img 
                      src={getYouTubeThumbnail(item.embed_url) || ''} 
                      alt={item.title || 'Video thumbnail'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <iframe
                      src={getEmbedUrl(item.embed_url)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {item.media_type === 'photo' ? (
                      <Image className="w-4 h-4 text-primary" />
                    ) : (
                      <Video className="w-4 h-4 text-primary" />
                    )}
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {categoryLabels[item.category]}
                    </span>
                  </div>
                  {item.title && (
                    <h3 className="text-foreground font-medium truncate">{item.title}</h3>
                  )}
                  
                  {/* Actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="flex-1"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-serif text-2xl text-foreground">Portfolio Categories</h1>
            </div>

            {/* Category Form Modal */}
            <AnimatePresence>
              {showCategoryForm && editingCategory && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-6"
                  onClick={(e) => e.target === e.currentTarget && resetCategoryForm()}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-lg bg-card border border-border rounded-xl p-6 shadow-elegant max-h-[90vh] overflow-y-auto"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-serif text-xl text-foreground">Edit Category</h2>
                      <button
                        onClick={resetCategoryForm}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmitCategory} className="space-y-6">
                      {/* Display Label */}
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Display Label</label>
                        <Input
                          type="text"
                          value={categoryDisplayLabel}
                          onChange={(e) => setCategoryDisplayLabel(e.target.value)}
                          placeholder="Wedding"
                          required
                        />
                      </div>

                      {/* Thumbnail URL */}
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">
                          Thumbnail URL
                          <span className="text-xs block mt-1 opacity-70">
                            Google Drive or YouTube link
                          </span>
                        </label>
                        <Input
                          type="url"
                          value={categoryThumbnailUrl}
                          onChange={(e) => setCategoryThumbnailUrl(e.target.value)}
                          placeholder="https://drive.google.com/..."
                          required
                        />
                      </div>

                      {/* Preview */}
                      {categoryThumbnailUrl && (
                        <div className="space-y-2">
                          <label className="text-sm text-muted-foreground">Preview</label>
                          <div className="aspect-[4/5] bg-muted rounded-lg overflow-hidden">
                            <img
                              src={getOptimizedThumbnail(categoryThumbnailUrl, 'photo', 600)}
                              alt="Category preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EPreview Error%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          onClick={resetCategoryForm}
                          variant="outline"
                          className="flex-1"
                          disabled={isSavingCategory}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSavingCategory}
                          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isSavingCategory ? 'Saving...' : 'Update'}
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Categories Grid */}
            {isLoadingCategories ? (
              <div className="text-center py-12 text-muted-foreground">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No categories found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl overflow-hidden group"
                  >
                    {/* Preview */}
                    <div className="aspect-[4/5] bg-muted relative overflow-hidden">
                      {cat.thumbnail_url ? (
                        <img
                          src={getOptimizedThumbnail(cat.thumbnail_url, 'photo', 600)}
                          alt={cat.display_label}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%23ddd" width="400" height="500"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-muted-foreground">No thumbnail</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-medium text-foreground mb-1">{cat.display_label}</h3>
                      <p className="text-xs text-muted-foreground mb-2">Slug: {cat.slug}</p>
                      <p className="text-xs text-muted-foreground mb-4">Order: {cat.display_order}</p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCategory(cat)}
                          className="flex-1"
                          disabled={cat.slug === 'all'}
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={cat.slug === 'all'}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
