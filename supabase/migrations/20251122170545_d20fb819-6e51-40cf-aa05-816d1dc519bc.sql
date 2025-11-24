-- Create food_items table for storing food database
CREATE TABLE IF NOT EXISTS public.food_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  food_name text NOT NULL,
  food_code text,
  calories text,
  carbohydrate text,
  protein text,
  fat text,
  vitamin_a text,
  thiamine text,
  riboflavin text,
  vitamin_c text,
  calcium text,
  iron text,
  serving_size text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Food items are viewable by everyone"
  ON public.food_items
  FOR SELECT
  USING (true);

-- Create index for food name search using pg_trgm
CREATE INDEX IF NOT EXISTS idx_food_items_name_trgm ON public.food_items USING gin (food_name gin_trgm_ops);