import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type MediaType = 'photo' | 'video';
type PortfolioCategory = 'wedding' | 'pre-wedding' | 'baby-shower-maternity' | 'birthdays-family' | 'drone' | 'model-candid';

export interface PortfolioItem {
  id: string;
  media_type: MediaType;
  category: PortfolioCategory;
  embed_url: string;
  full_url: string | null;
  title: string | null;
  created_at: string;
}

const categoryMapping: Record<PortfolioCategory, string> = {
  'wedding': 'Wedding',
  'pre-wedding': 'Pre-Wedding',
  'baby-shower-maternity': 'Baby Shower & Maternity',
  'birthdays-family': 'Birthdays & Family',
  'drone': 'Drone Shoot',
  'model-candid': 'Model & Candid',
};

export const getCategoryLabel = (category: PortfolioCategory): string => {
  return categoryMapping[category] || category;
};

export const usePortfolioItems = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setItems(data || []);
      }
      setLoading(false);
    };

    fetchItems();
  }, []);

  return { items, loading, error };
};
