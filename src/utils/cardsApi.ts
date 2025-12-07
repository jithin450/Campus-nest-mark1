import { supabase } from '@/integrations/supabase/client';

export type CardCategory = 'hostel' | 'restaurant' | 'place' | 'community';

export interface CardRecord {
  id: string;
  title: string;
  description: string;
  category: CardCategory;
  location: string;
  image_url: string | null;
  meta: Record<string, unknown>;
  created_at: string;
}

export async function fetchCards(category: CardCategory, location: string, search?: string, from = 0, to = 11) {
  const normalizedLocation = location.trim();
  let query = supabase
    .from('cards')
    .select('*')
    .eq('category', category)
    .eq('location', normalizedLocation)
    .range(from, to);

  if (search && search.trim()) {
    const s = search.trim();
    query = query.ilike('title', `%${s}%`);
  }

  const { data, error } = await query.returns<CardRecord[]>();
  if (error) throw error;
  return data ?? [];
}

export async function fetchCardsByLocation(location: string, from = 0, to = 47) {
  const normalizedLocation = location.trim();
  const { data, error } = await supabase
    .from('cards')
    .select('id, title, category, location, image_url, description')
    .eq('location', normalizedLocation)
    .order('category', { ascending: true })
    .range(from, to)
    .returns<CardRecord[]>();
  if (error) throw error;
  return data ?? [];
}
